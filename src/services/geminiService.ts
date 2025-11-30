import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { SYSTEM_INSTRUCTION_BASE } from '../constants';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const createChatSession = (systemInstructionOverride?: string): Chat => {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: systemInstructionOverride || SYSTEM_INSTRUCTION_BASE,
    },
  });
};

export const generateJournalSummary = async (entry: string): Promise<string> => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `请将以下日记内容总结为一句温暖且富有洞察力的话，送给这位同学。关注潜在的情绪。请用中文回答。日记内容: "${entry}"`,
    });
    return response.text || "暂时无法生成总结。";
  } catch (error) {
    console.error("Error generating summary:", error);
    return "暂时无法连接到 AI。";
  }
};

/**
 * Converts a Blob to a Base64 string suitable for the Google GenAI API.
 */
export const blobToB64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result as string;
      // Remove data URL prefix (e.g., "data:audio/webm;base64,")
      const base64Content = base64data.split(',')[1];
      resolve(base64Content);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Sends an audio blob to the chat session.
 */
export const sendAudioMessage = async (chat: Chat, audioBlob: Blob): Promise<string> => {
  try {
    const base64Audio = await blobToB64(audioBlob);
    
    // Construct a multimodal message part
    const audioPart = {
      inlineData: {
        mimeType: audioBlob.type, 
        data: base64Audio
      }
    };

    // The chat.sendMessage method accepts a string or an array of parts.
    // For multimodal, we usually pass the parts directly to the contents structure if using models.generateContent,
    // but for chat history, we pass the message payload.
    // @google/genai SDK chat.sendMessage argument structure: { message: ... }
    const response: GenerateContentResponse = await chat.sendMessage({
        message: [audioPart] // Send as an array of parts
    });
    
    return response.text || "我好像没听清，可以再说一遍吗？";
  } catch (error) {
    console.error("Error sending audio message:", error);
    return "语音连接似乎中断了，请尝试文字输入。";
  }
};