
import { GoogleGenAI, Type } from "@google/genai";
import { ChatMessage, MeetingAnalysis } from "../types";

// Initialize the GoogleGenAI client using the API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "A concise summary of the conversation.",
    },
    keyPoints: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Main objectives discussed.",
    },
    tasks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          task: { type: Type.STRING },
          assignee: { type: Type.STRING },
        },
        required: ["task", "assignee"],
      },
      description: "Action items with specific assignees.",
    },
    problemSolvingSuggestions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Strategic advice for the manager to help team members overcome issues or friction.",
    },
  },
  required: ["summary", "keyPoints", "tasks", "problemSolvingSuggestions"],
};

export const analyzeChatHistory = async (messages: ChatMessage[]): Promise<MeetingAnalysis | null> => {
  if (messages.length === 0) return null;

  const chatTranscript = messages
    .map((m) => `${m.senderName} (${m.senderRole}): ${m.text}`)
    .join("\n");

  const prompt = `You are a high-level management consultant AI. Analyze this internal team chat transcript. 
  Focus on identifying:
  1. Any "daily blockers" or "employee friction points".
  2. Concrete tasks mentioned or implied.
  3. Strategic suggestions for the Manager to improve team velocity or resolve the mentioned issues.
  
  Transcript:
  ${chatTranscript}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
      },
    });

    return JSON.parse(response.text.trim()) as MeetingAnalysis;
  } catch (error) {
    console.error("Gemini analysis error:", error);
    return null;
  }
};
