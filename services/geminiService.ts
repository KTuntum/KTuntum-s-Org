import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Transaction } from "../types";

// Helper to convert File to Base64
const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const analyzeStatement = async (file: File): Promise<Transaction[]> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const model = "gemini-3-pro-preview";
  
  const filePart = await fileToGenerativePart(file);

  const prompt = `
    Analyze this bank statement document.
    Extract ALL transactions into a structured list.
    
    Rules:
    1. Date: Format as YYYY-MM-DD.
    2. Amount: Use negative numbers for expenses/withdrawals, positive numbers for deposits/income.
    3. Description: Clean up the text (remove unnecessary codes if possible, but keep identifying info).
    4. Category: Auto-detect the category based on the description (e.g., Groceries, Dining, Transport, Salary, Utilities, Transfer, Shopping, Bills).
    5. Notes: Any additional reference numbers or relevant details.
    6. SKIP: Headers, footers, page numbers, running balances, and summary lines. Only extract actual transactions.
    
    If there are multiple pages, extract transactions from all pages.
  `;

  const responseSchema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        date: { type: Type.STRING, description: "Transaction date in YYYY-MM-DD format" },
        description: { type: Type.STRING, description: "Cleaned transaction description" },
        amount: { type: Type.NUMBER, description: "Transaction amount (negative for expense, positive for income)" },
        category: { type: Type.STRING, description: "Categorized type of transaction" },
        notes: { type: Type.STRING, description: "Any extra notes or reference numbers" },
      },
      required: ["date", "description", "amount", "category"],
    },
  };

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [filePart, { text: prompt }],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.1, // Low temperature for more deterministic extraction
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from Gemini.");
    }

    const data = JSON.parse(text);
    return data as Transaction[];
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};