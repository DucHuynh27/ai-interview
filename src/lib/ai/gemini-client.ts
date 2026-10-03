import { GoogleGenAI } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY environment variable. Please check your .env.local file.");
}

export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});
