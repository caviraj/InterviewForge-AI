import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const SYSTEM_PROMPT = `You are InterviewForge, an expert AI interview coach helping students crack real job interviews. Always respond with valid JSON only. No markdown, no explanation outside the JSON.`;

// We'll iterate through these models if one returns a 404 (not found).
const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-pro", "gemini-1.5-pro"];

export async function callGemini(userPrompt) {
  const fullPrompt = `${SYSTEM_PROMPT}\n\n${userPrompt}`;

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(fullPrompt);
      let text = result.response.text();

      // Strip markdown JSON fences
      text = text.replace(/```json/gi, "").replace(/```/g, "").trim();

      return JSON.parse(text);
    } catch (error) {
      // If the error explicitly mentions that the model is unavailable or 404, we continue to the next
      if (error.message?.includes("404") || error.message?.includes("not found")) {
        console.warn(`Model ${modelName} returned a 404. Falling back to the next model...`);
        continue;
      }
      // For any other error (like quota exceeded, invalid API key, etc.), throw immediately.
      console.error(`Gemini API Error with ${modelName}:`, error);
      throw error;
    }
  }

  throw new Error("Could not find a valid Gemini model for this API key.");
}
