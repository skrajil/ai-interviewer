const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { generateNextQuestion } = require('./services/ai.service');
// 1. Import the AI SDK and dotenv
const { GoogleGenerativeAI } = require('@google/generative-ai');

// 2. Initialize the AI with your secret key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ... then your app.post('/api/evaluate' ... route goes down here!

const app = express();
const PORT = process.env.PORT || 5000;
const cors = require('cors');

// 🚨 THE BOUNCER: Only allow requests from these specific websites
const allowedOrigins = [
  'http://localhost:5173', // Your local React app for testing
  'https://your-future-domain.vercel.app' // We will change this to your real URL later!
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
app.use(express.json());

app.post('/api/interview/next', async (req, res) => {
  
  try {
    const { role, resumeText = "", currentQuestion = "", userAnswer = "", questionCount = 0, difficulty = "Mid-Level" } = req.body;

    if (typeof role !== 'string' || role.length > 100) {
      return res.status(400).json({ error: "Invalid Role data." });
    }
    if (typeof resumeText !== 'string' || resumeText.length > 15000) {
      return res.status(400).json({ error: "Resume is too long." });
    }

    // // console.log("✅ 3. Validation passed. Calling Gemini AI now... (This might take a few seconds)");

    const aiResponse = await generateNextQuestion(role, resumeText, currentQuestion, userAnswer, questionCount, difficulty);
    
    // console.log("🎉 4. Gemini responded successfully!");
    // console.log(aiResponse); // See exactly what the AI generated!
    
    res.status(200).json(aiResponse);

  } catch (error) {
    console.error("❌ 5. SERVER CRASHED:", error);
    res.status(500).json({ error: 'Failed to process AI request.' });
  }
});
// Add this route to your backend server file (e.g., index.js)

app.post('/api/evaluate', async (req, res) => {
  try {
    const { role, transcript } = req.body;

    // 1. Format the transcript so Gemini can read it easily
    const formattedTranscript = transcript.map(t => 
      `Interviewer: ${t.question}\nCandidate: ${t.answer}`
    ).join('\n\n');

    // 2. The Master Prompt for Gemini
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

    // 3. Call Gemini (Assuming you have initialized the GoogleGenerativeAI client as 'genAI')
    // const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });
    
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // 4. Parse the JSON and send it back to the React frontend
    // (We use a regex to strip out any potential markdown code blocks Gemini might add)
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const evaluation = JSON.parse(cleanJson);

    res.json(evaluation);

  } catch (error) {
    console.error("Evaluation Error:", error);
    res.status(500).json({ error: "Failed to evaluate interview" });
  }
});

app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));