import { GoogleGenAI } from "@google/genai";
import { Habit } from "../types";

// Safety check for process.env to prevent runtime crashes in browser environments
const getApiKey = () => {
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
        return process.env.API_KEY;
    }
    return '';
};

const apiKey = getApiKey();
// Only initialize if we have a key, though we can instantiate, calls will fail safely
const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key' });

export const getKaizenAdvice = async (habits: Habit[]): Promise<string> => {
  if (!apiKey) return "API Key missing. AI Systems Offline.";

  try {
    const habitSummary = habits.map(h => 
      `PROTOCOL: ${h.title} | STREAK: ${h.streak} | STATUS: ${h.completedDates.includes(new Date().toISOString().split('T')[0]) ? 'EXECUTED' : 'PENDING'}`
    ).join('\n');

    const prompt = `
      You are the "Second Brain" AI, a ruthless high-performance strategist. 
      Your tone is professional, analytical, concise, and business-oriented. No fluff, no emotion.
      
      Analyze the following user protocols (habits) and execution status:
      ${habitSummary}

      Output a single strategic insight or directive (max 2 sentences) in Portuguese (Brazil).
      Focus on efficiency, system optimization, and discipline.
      If performance is low, demand immediate correction. If high, acknowledge efficiency.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Systems nominal. Continue execution.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Connection failed. Focus on manual execution.";
  }
};