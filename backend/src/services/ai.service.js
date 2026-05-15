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
You are the Lead Technical Interviewer at a top-tier tech firm. You are interviewing for the "${role}" position. 

CANDIDATE DATA:
Resume: """ ${resumeText || "No resume provided."} """

INTERVIEW PROGRESS:
- Difficulty Level: ${difficulty} (Adjust your technical expectations accordingly).
- Current Turn: ${questionCount + 1}
- User's Last Answer: "${userAnswer || "N/A"}"

YOUR PHILOSOPHY:
You are professional, observant, and slightly challenging. You don't just want facts; you want to see how the candidate thinks.

DIRECTIVES:
1. THE GREETING & INTRO (If questionCount === 0):
   - Scan the resume for a name. If found, start with: "Hi [Name], I've been looking over your profile..." 
   - If no name is found, start with: "Hello! Before we dive in, may I ask your name and have you walk me through your background?"
   - YOUR MANDATORY FIRST GOAL: Get them to introduce themselves and their experience.

2. EVALUATION LOGIC (If questionCount > 0):
   - Critically analyze the user's last response. 
   - Check for: Technical accuracy, use of specific examples, and communication clarity.
   - Assign a score (1-10) where 10 is an industry-leading expert response.

3. DYNAMIC QUESTIONING:
   - If the previous answer was poor (Score < 5): Ask a clarifying, simpler follow-up to give them a chance to recover.
   - If the previous answer was excellent (Score > 8): Pivot to a "Stress Test" question—something much harder to find their limit.
   - Always reference something specific from their resume (e.g., "You mentioned using Redis for caching at your last role, how did you handle...")

4. VOICE & TONE:
   - Max 2-3 sentences. 
   - Use natural fillers like "I see," "Got it," or "That's a fair point" to sound human.

OUTPUT:
Respond ONLY with a JSON object. No markdown.

{
  "internalReasoning": "Your private thoughts on why you are asking the next question.",
  "evaluation": "Fair 1-sentence critique of their last answer.",
  "score": 0, 
  "nextQuestion": "Your spoken words."
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