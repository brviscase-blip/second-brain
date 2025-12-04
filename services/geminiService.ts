import { GoogleGenAI } from "@google/genai";
import { Habit } from "../types";

export const getKaizenAdvice = async (habits: Habit[]): Promise<string> => {
  // Ensure we are using process.env.API_KEY directly as per @google/genai guidelines.
  // The environment variable is assumed to be pre-configured and valid.
  if (!process.env.API_KEY) {
      console.warn("API Key not found in process.env.API_KEY");
      return "Sistema Offline. Configure a API Key para análise tática.";
  }

  try {
    // Initialize ON DEMAND.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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