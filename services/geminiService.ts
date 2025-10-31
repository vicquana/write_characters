import { GoogleGenAI, Type } from "@google/genai";
import { FeedbackResponse } from '../types';

// FIX: Initialized GoogleGenAI directly with process.env.API_KEY as per the guidelines, which state to assume the key is always present.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    identifiedCharacter: {
      type: Type.STRING,
      description: "The Chinese character that the user most likely tried to write.",
    },
    isCorrect: {
      type: Type.BOOLEAN,
      description: "True if the identified character matches the target character.",
    },
    score: {
      type: Type.INTEGER,
      description: "A score from 0 to 100 representing the quality of the writing, considering stroke order, proportion, and accuracy.",
    },
    feedback: {
      type: Type.STRING,
      description: "One concise sentence of constructive feedback for the student. Be encouraging.",
    },
  },
  required: ['identifiedCharacter', 'isCorrect', 'score', 'feedback'],
};

export const evaluateCharacter = async (imageDataBase64: string, character: string): Promise<FeedbackResponse> => {
  const imagePart = {
    inlineData: {
      data: imageDataBase64,
      mimeType: 'image/png',
    },
  };

  const textPart = {
    text: `Analyze the user's attempt to write the Chinese character "${character}". Compare it to the correct form. Determine if they wrote the correct character. Provide a score from 0 to 100 on accuracy, stroke order, and proportion. Give one concise sentence of constructive feedback. If the character is completely wrong, identify what they might have been trying to write, if possible.`
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [imagePart, textPart] },
    config: {
      systemInstruction: "You are a helpful and encouraging Chinese calligraphy teacher evaluating a student's handwriting.",
      responseMimeType: 'application/json',
      responseSchema: responseSchema,
      temperature: 0.3,
    }
  });

  const jsonText = response.text.trim();
  try {
    // Gemini may wrap the JSON in markdown backticks
    const cleanedJsonText = jsonText.replace(/^```json\s*|```$/g, '');
    const parsed = JSON.parse(cleanedJsonText);
    
    // Validate the response structure
    if (
      typeof parsed.identifiedCharacter !== 'string' ||
      typeof parsed.isCorrect !== 'boolean' ||
      typeof parsed.score !== 'number' ||
      typeof parsed.feedback !== 'string'
    ) {
      throw new Error("Invalid response structure from API");
    }
    
    return parsed;
  } catch (e) {
    console.error("Failed to parse JSON response:", jsonText);
    throw new Error("The API returned an unexpected response format.");
  }
};