import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const getGeminiMove = async (fen: string, history: string[]): Promise<string | null> => {
  if (!apiKey) {
    console.warn('Gemini API key is missing');
    return null;
  }

  try {
    const prompt = `
      You are a chess grandmaster engine. 
      Current FEN: ${fen}
      Move History: ${history.join(' ')}
      
      Analyze the position and provide the best move for the current player in Standard Algebraic Notation (SAN).
      Only return the move string (e.g., "e4", "Nf3", "O-O"). Do not provide explanation.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    const move = response.text?.trim();
    // Basic validation: should be a short string
    if (move && move.length < 10) {
      return move;
    }
    return null;
  } catch (error) {
    console.error('Error fetching Gemini move:', error);
    return null;
  }
};
