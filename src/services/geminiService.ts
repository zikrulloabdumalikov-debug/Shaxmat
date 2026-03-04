import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getGeminiMove(fen: string, history: string[]): Promise<string | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a Grandmaster chess player. 
      Current board position (FEN): ${fen}
      Move history: ${history.join(", ")}
      
      Analyze the position and provide the best next move in Standard Algebraic Notation (SAN) or UCI format (e.g., "e4", "Nf3", "e2e4").
      Only return the move string, nothing else.`,
      config: {
        temperature: 0.1,
        responseMimeType: "text/plain",
      },
    });

    const move = response.text?.trim();
    return move || null;
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return null;
  }
}
