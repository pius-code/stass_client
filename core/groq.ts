import openAI from "openai";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

export const AIclient = new openAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export const AIclient2 = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});
