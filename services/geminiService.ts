import { GoogleGenAI, Type } from "@google/genai";
import { FactData, FactComplexity, DOMAINS } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelName = "gemini-2.5-flash";

const systemInstruction = `
You are a science educator for children aged 3-10.
Your goal is to provide scientifically accurate, interesting facts that fit an early childhood science curriculum.
Use clear, simple, and direct language.
Do NOT use metaphors, personification, or baby talk (e.g., do NOT say "the moon is Earth's best friend" or "clouds are crying").
Instead, state the scientific reality simply (e.g., "The Moon orbits around the Earth" or "Rain falls from clouds when they get heavy").
All facts must be 1-2 sentences long.
Use bright, positive emojis. 
For background colors, suggest a tailwind CSS class like 'bg-blue-100', 'bg-green-100', 'bg-yellow-100', 'bg-purple-100', 'bg-orange-100', or 'bg-rose-100' matching the domain.
`;

export const fetchFact = async (
  targetDomain: string | null,
  complexity: FactComplexity
): Promise<FactData> => {
  try {
    const domainToUse = targetDomain || DOMAINS[Math.floor(Math.random() * DOMAINS.length)];
    
    let prompt = "";
    
    if (complexity === FactComplexity.COMPLEX) {
      prompt = `Tell me a specific, scientifically accurate fact about ${domainToUse} suitable for an elementary school student. 
      It must be exactly one sentence long. 
      It should explain a clear concept or function without being overly technical.`;
    } else {
      prompt = `Tell me a simple, true, scientifically accurate one-sentence fact about ${domainToUse}. 
      It should be a basic observation or definition suitable for a preschooler.`;
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fact: { type: Type.STRING, description: "The interesting fact text (strictly one sentence, scientifically accurate)." },
            domain: { type: Type.STRING, description: "The category of the fact." },
            emoji: { type: Type.STRING, description: "A single emoji representing the topic." },
            backgroundColor: { type: Type.STRING, description: "A Tailwind CSS background color class." }
          },
          required: ["fact", "domain", "emoji", "backgroundColor"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No data received from Gemini");

    return JSON.parse(text) as FactData;

  } catch (error) {
    console.error("Error fetching fact:", error);
    // Fallback in case of API error to keep the kid engaged
    return {
      fact: "The Earth spins around once every day, which causes day and night.",
      domain: "Space",
      emoji: "🌍",
      backgroundColor: "bg-indigo-100"
    };
  }
};