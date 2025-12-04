import { Habit } from "../types";

// Service stubbed out to prevent import errors with @google/genai on static hosts
// The user requested to remove AI features, so this file is now just a placeholder
// to prevent breaking existing imports if any remain.

export const getKaizenAdvice = async (habits: Habit[]): Promise<string> => {
  return "Módulo de IA desativado. Foco na execução manual.";
};