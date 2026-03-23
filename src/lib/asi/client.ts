import OpenAI from "openai";

let clientInstance: OpenAI | null = null;

export function getASIClient(): OpenAI {
  if (clientInstance) return clientInstance;

  const apiKey = process.env.ASI_API_KEY;
  if (!apiKey) {
    throw new Error("ASI_API_KEY environment variable is required");
  }

  clientInstance = new OpenAI({
    apiKey,
    baseURL: process.env.ASI_BASE_URL || "https://api.asi1.ai/v1",
  });

  return clientInstance;
}

export const ASI_MODEL = process.env.ASI_MODEL || "asi1-mini";
