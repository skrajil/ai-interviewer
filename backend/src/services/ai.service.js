const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// FIX 1: Use the universally available 1.0 model and REMOVE the generationConfig
const model = genAI.getGenerativeModel({ 
  model: 'gemini-3.1-flash-lite',
  generationConfig: {
    responseMimeType: 'application/json',
  }
});

const generateNextQuestion = async (role, resumeText, currentQuestion, userAnswer, questionCount, difficulty) => {
  const systemPrompt = `
    You are the Lead Technical Interviewer at a top-tier tech firm. You are interviewing a candidate for the "${role}" position. 

    CANDIDATE DATA:
    Resume: """ ${resumeText || "No resume provided."} """

    INTERVIEW PROGRESS:
    - Difficulty Level: ${difficulty}
    - Current Turn: ${questionCount + 1}
    - Your Previous Question: "${currentQuestion || "N/A"}"
    - Candidate's Last Answer: "${userAnswer || "N/A"}"

    YOUR PHILOSOPHY:
    You are professional, observant, and slightly challenging. You don't just want facts; you want to see how the candidate thinks. You speak naturally like a human on a Zoom call.

    DIRECTIVES:

    1. STAGE 1: THE INTRODUCTION (If Current Turn === 1)
      - Scan the Resume text for a name. 
      - If found, start with: "Hi [Name], it's great to meet you. I've been looking over your profile..." 
      - If no name is found, start with: "Hello! Thanks for taking the time to chat. To kick things off, could you tell me your name and walk me through your background?"
      - YOUR MANDATORY GOAL: Get them to introduce themselves.

    2. STAGE 2: THE INTERVIEW (If Current Turn > 1)
      - First, evaluate their previous answer. 
      - EXCEPTION: If they are just introducing themselves and giving their name, give them an automatic score of 10 and do not critique it. Acknowledge their name warmly (e.g., "Nice to meet you, [Name]!") before moving on.
      - For technical answers: Assign a score (1-10) based on accuracy, depth, and clarity.
      - If Score < 5: Ask a clarifying, simpler follow-up to give them a chance to recover.
      - If Score >= 8: Pivot to a harder "Stress Test" question to find their technical limit.
      - Always try to ground your next question in a specific detail from their resume.

    3. VOICE & TONE:
      - Max 2-3 sentences. Keep it conversational.
      - Use natural transitions like "I see," "Makes sense," or "That's an interesting approach" before asking the next question.

    OUTPUT:
    Respond ONLY with a valid JSON object. Do not include markdown formatting like \`\`\`json.

    {
      "internalReasoning": "Your private thoughts on why you are asking the next question.",
      "evaluation": "Fair 1-sentence critique of their last answer (or 'Great intro' if they just introduced themselves).",
      "score": 0, 
      "nextQuestion": "Your exact spoken words."
    }
    `;


  try {
    const result = await model.generateContent(systemPrompt);
    let responseText = result.response.text();
    
    // SAFETY NET: Sometimes Gemini wraps JSON in markdown (e.g., ```json ... ```)
    // This regex strips that out so JSON.parse doesn't crash your server.
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    return JSON.parse(responseText);
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback question so the frontend doesn't break if the AI fails
    return {
      evaluation: "System error occurred.",
      score: 5,
      nextQuestion: "I'm having a slight connection issue on my end. Could you tell me a bit more about your previous experience?"
    };
  }
};

module.exports = { generateNextQuestion };