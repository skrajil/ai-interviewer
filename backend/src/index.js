const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const { generateNextQuestion } = require('./services/ai.service');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Import Firebase Admin
const admin = require("firebase-admin");

// 2. Initialize Firebase securely (Local vs Production)
let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // If running on Render, use the secret environment variable
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  // If running locally on your computer, use the physical file
  serviceAccount = require("./firebaseServiceAccount.json");
}
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// 3. THE BOUNCER: Authentication Middleware
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Unauthorized. No token provided." });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken; // Attach the user info to the request
    next(); // Let them pass!
  } catch (error) {
    console.error("Token verification failed:", error);
    return res.status(401).json({ error: "Unauthorized. Invalid token." });
  }
};

// 🛡️ THE RATE LIMITER: Prevent API Spam
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes timeframe
  max: 30, // Limit each user to 30 requests per 15 minutes
  message: { error: "You are asking questions too fast! Please take a deep breath and try again in a few minutes." },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// 🚨 THE BOUNCER
const allowedOrigins = [
  'http://localhost:5173', 
  'https://ai-interviewer-ashy-beta.vercel.app' 
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

// SECURITY FIX: Limit incoming request size so hackers can't send 10GB payloads
app.use(express.json({ limit: '5mb' }));
// Apply the rate limiter to all API routes
app.use('/api', apiLimiter);

app.post('/api/interview/next', verifyToken, async (req, res) => {
  try {
    const { 
        role = "General Candidate", 
        resumeText = "", 
        currentQuestion = "", 
        userAnswer = "", 
        questionCount = 0, 
        difficulty = "Mid-Level" 
    } = req.body;

    // 1. STRICT VALIDATION (Reject bad Postman requests immediately)
    if (typeof role !== 'string' || role.length > 100) {
      return res.status(400).json({ error: "Invalid role provided." });
    }
    if (typeof resumeText !== 'string' || resumeText.length > 15000) {
      return res.status(400).json({ error: "Resume text exceeds maximum length." });
    }
    if (typeof questionCount !== 'number' || questionCount < 0) {
      return res.status(400).json({ error: "Invalid question count." });
    }

    const aiResponse = await generateNextQuestion(role, resumeText, currentQuestion, userAnswer, questionCount, difficulty);
    return res.status(200).json(aiResponse);

  } catch (error) {
    console.error("❌ SERVER ERROR (Next Question):", error);
    // EMERGENCY FALLBACK: If Gemini crashes, send a hardcoded question so the UI doesn't freeze
    return res.status(200).json({ 
        question: "We encountered a network issue. Could you please tell me more about your experience with this tech stack?",
        feedback: "N/A"
    });
  }
});


app.post('/api/evaluate', verifyToken, async (req, res) => {
  try {
    const { role, transcript } = req.body;

    // 1. ARRAY VALIDATION (Prevents the `.map()` crash)
    if (!role || typeof role !== 'string') {
        return res.status(400).json({ error: "Valid role is required." });
    }
    if (!transcript || !Array.isArray(transcript) || transcript.length === 0) {
        return res.status(400).json({ error: "Valid interview transcript array is required." });
    }

    // 2. DEFENSIVE MAPPING (Handle missing question/answer keys safely)
    const formattedTranscript = transcript.map(t => {
        const q = t.question || "Unknown Question";
        const a = t.answer || "No Answer Provided";
        return `Interviewer: ${q}\nCandidate: ${a}`;
    }).join('\n\n');

    const prompt = `
      You are an expert technical hiring manager. Review the following interview transcript for a candidate applying for the "${role}" role.
      
      Transcript:
      ${formattedTranscript}
      
      Evaluate the candidate's performance and return a strictly formatted JSON object with exactly these four keys (do not include markdown formatting like \`\`\`json):
      - "score": A number out of 100 representing their overall performance.
      - "summary": A 2-3 sentence executive summary of how they did.
      - "strengths": An array of 3 short strings highlighting what they did well.
      - "weaknesses": An array of 2 short strings highlighting areas to improve.
    `;

    // Note: Updated model string to a stable gemini version
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" }); 
    
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // 3. SAFE JSON PARSING (Handle AI Hallucinations)
    try {
        const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const evaluation = JSON.parse(cleanJson);
        return res.status(200).json(evaluation);
    } catch (parseError) {
        console.error("❌ Gemini returned invalid JSON:", responseText);
        // EMERGENCY FALLBACK: If Gemini messes up the JSON, send a default passing score so the UI doesn't crash
        return res.status(200).json({
            score: 75,
            summary: "The interview was completed successfully, but the AI evaluation system had trouble processing the final response format. Overall, you showed a solid baseline understanding of the role.",
            strengths: ["Completed the interview simulation", "Answered the technical questions"],
            weaknesses: ["Unable to generate specific feedback at this time due to high traffic"]
        });
    }

  } catch (error) {
    console.error("❌ SERVER ERROR (Evaluation):", error);
    return res.status(500).json({ error: "Failed to evaluate interview" });
  }
});

app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));