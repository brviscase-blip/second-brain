import { GoogleGenAI } from "@google/genai";
import { Habit } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const getKaizenAdvice = async (habits: Habit[]): Promise<string> => {
  if (!apiKey) return "Configure sua API Key para receber conselhos personalizados.";

  try {
    const habitSummary = habits.map(h => 
      `- ${h.title}: Ofensiva de ${h.streak} dias. ${h.completedDates.includes(new Date().toISOString().split('T')[0]) ? 'Feito hoje.' : 'Pendente hoje.'}`
    ).join('\n');

    const prompt = `
      Atue como um mentor experiente na filosofia Kaizen (melhoria contínua).
      Analise os seguintes hábitos e o desempenho atual do usuário:
      ${habitSummary}

      Forneça um conselho curto, motivacional e prático (máximo de 2 frases) focado em consistência e pequenos passos.
      Se o usuário estiver indo bem, elogie a disciplina. Se estiver falhando, sugira uma micro-mudança.
      Fale em Português do Brasil.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Continue com o bom trabalho! A consistência é a chave.";
  } catch (error) {
    console.error("Erro ao chamar Gemini:", error);
    return "O foco hoje é apenas ser 1% melhor que ontem.";
  }
};