import { GoogleGenAI } from "@google/genai";
import { Habit } from "../types";

// Helper to safely get API Key without crashing
const getApiKey = () => {
    try {
        // @ts-ignore - process might be undefined in browser
        if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
            // @ts-ignore
            return process.env.API_KEY;
        }
        // Fallback for polyfilled window.process
        // @ts-ignore
        if (typeof window !== 'undefined' && window.process && window.process.env && window.process.env.API_KEY) {
             // @ts-ignore
            return window.process.env.API_KEY;
        }
    } catch (e) {
        return '';
    }
    return '';
};

export const getKaizenAdvice = async (habits: Habit[]): Promise<string> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
      console.warn("API Key not found. Please configure process.env.API_KEY");
      return "Sistema Offline. Configure a API Key para análise tática.";
  }

  try {
    // Initialize ON DEMAND, not at app startup. This prevents white-screen crashes.
    const ai = new GoogleGenAI({ apiKey: apiKey });

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

    return response.text || "Sistemas nominais. Continue a execução.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Falha na conexão neural. Foque na execução manual.";
  }
};