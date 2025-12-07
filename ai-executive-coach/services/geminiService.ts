import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message } from "../types";

// Initialize the client
// API Key is strictly from process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are an AI Executive Coach (AI 高管教练). 
Your role is to help business leaders and professionals clarify their thinking, make better decisions, and navigate complex business challenges.
You are concise, professional, yet empathetic. You use the Socratic method when appropriate to guide users to their own answers.
Respond in Chinese unless the user speaks another language.
Keep responses formatted nicely with paragraphs or bullet points for readability on mobile devices.
`;

export const sendMessageToGemini = async (
  history: Message[],
  newMessage: string,
  customSystemInstruction?: string
): Promise<string> => {
  try {
    // We use gemini-2.5-flash for fast, responsive text chat
    const model = 'gemini-2.5-flash';

    // Construct the chat history for the API
    // Note: The API expects 'user' and 'model' roles.
    // We limit history to the last 10 messages to keep context relevant and save tokens, 
    // though 2.5 flash has a large context window.
    const recentHistory = history.slice(-10).map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    const instruction = customSystemInstruction || SYSTEM_INSTRUCTION;

    const chat = ai.chats.create({
      model: model,
      config: {
        systemInstruction: instruction,
      },
      history: recentHistory,
    });

    const result: GenerateContentResponse = await chat.sendMessage({
      message: newMessage
    });

    return result.text || "抱歉，我现在无法回答，请稍后再试。";

  } catch (error) {
    console.error("Error communicating with Gemini:", error);
    return "网络连接出现问题，请检查您的设置或稍后再试。";
  }
};