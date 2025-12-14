import { GoogleGenAI, Type } from "@google/genai";
import { Recipe } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateAlbionRecipes = async (promptContext: string): Promise<Recipe[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate 5 valid Albion Online recipes for ${promptContext}. Return them in a strict JSON structure.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Name of the food or potion" },
              type: { type: Type.STRING, enum: ["Food", "Potion"] },
              ingredients: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING, description: "Name of the raw ingredient" },
                    quantity: { type: Type.NUMBER, description: "Quantity required per craft" }
                  },
                  required: ["name", "quantity"]
                }
              }
            },
            required: ["name", "type", "ingredients"]
          }
        }
      }
    });

    if (response.text) {
      const parsedData = JSON.parse(response.text);
      // Map to ensure IDs are present
      return parsedData.map((r: any) => ({
        ...r,
        id: crypto.randomUUID()
      }));
    }
    return [];
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};