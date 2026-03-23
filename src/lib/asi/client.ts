import OpenAI from "openai";

export function getASIClient(): OpenAI {
  const apiKey = process.env.ASI_API_KEY;
  if (!apiKey) {
    throw new Error("ASI_API_KEY environment variable is required");
  }

  return new OpenAI({
    apiKey,
    baseURL: process.env.ASI_BASE_URL || "https://api.asi1.ai/v1",
  });
}

export const ASI_MODEL = process.env.ASI_MODEL || "asi1-mini";
