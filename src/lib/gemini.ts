import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in the environment variables.");
}

export const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

/**
 * Generates content using the Gemini API.
 * @param {object} payload - The payload containing content generation parameters.
 * @returns {Promise<string>} The generated content.
 */
export async function generateContentWithGemini(payload: {
  model: string;
  contents: string;
}): Promise<string> {
  try {
    const response = await ai.models.generateContent(payload);
    return response.text || "No content generated.";
  } catch (error) {
    console.error("Error generating content with Gemini API:", error);
    throw new Error("Failed to generate content.");
  }
}
