import { GoogleGenAI, Type, Modality } from "@google/genai";
import { FactData, FactComplexity, DOMAINS, HistoryItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelName = "gemini-2.5-flash";
const ttsModelName = "gemini-2.5-flash-preview-tts";

const systemInstruction = `
You are a science educator for children aged 3-10.
Your goal is to provide scientifically accurate, interesting facts that fit an early childhood science curriculum.
Use clear, simple, and direct language.
Do NOT use metaphors, personification, or baby talk.
State scientific reality simply.
All facts must be 1-2 sentences long.
Use bright, positive emojis.
For background colors, suggest a tailwind CSS class like 'bg-blue-100', 'bg-green-100', 'bg-yellow-100', 'bg-purple-100', 'bg-orange-100', or 'bg-rose-100'.
CRITICAL: You will be provided with a history of facts already told to the child. NEVER repeat a fact or an emoji from the history.
`;

export const fetchFact = async (
  targetDomain: string,
  complexity: FactComplexity,
  history: HistoryItem[]
): Promise<FactData> => {
  try {
    // Construct history context string
    let historyContext = "";
    if (history.length > 0) {
      historyContext = "SESSION HISTORY (Do NOT repeat these facts or emojis):\n";
      history.forEach((h, i) => {
        historyContext += `${i + 1}. [${h.domain}] "${h.fact}" - Child's feedback: ${h.userKnewIt ? "ALREADY KNEW THIS" : "DID NOT KNOW"}.\n`;
      });
    }

    // Determine specific prompt based on complexity and history
    let prompt = `${historyContext}\n\n`;
    
    // Check the last item in history to see if we are continuing a topic
    const lastItem = history.length > 0 ? history[history.length - 1] : null;
    const isContinuingTopic = lastItem && lastItem.domain === targetDomain;

    if (complexity === FactComplexity.COMPLEX) {
      prompt += `The child wants to know MORE about ${targetDomain}. `;
      if (isContinuingTopic && lastItem?.userKnewIt) {
         prompt += `The child ALREADY KNEW the last fact ("${lastItem.fact}"). Therefore, provide a significantly more detailed, "deeper dive" scientific fact about ${targetDomain}. `;
      } else {
         prompt += `Provide a slightly more detailed scientific fact about ${targetDomain}. `;
      }
      prompt += `It must be exactly one sentence long. Explain a clear concept.`;
    } else {
      if (isContinuingTopic) {
        prompt += `The child wants another fact about ${targetDomain}. Provide a new, distinct simple fact. `;
      } else {
        prompt += `The child wants to start a NEW topic: ${targetDomain}. `;
      }
      prompt += `Tell me a simple, true, scientifically accurate one-sentence fact about ${targetDomain}. Suitable for a preschooler.`;
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
    // Fallback
    return {
      fact: "Gravity is the invisible force that pulls everything down towards the ground.",
      domain: targetDomain,
      emoji: "🍎",
      backgroundColor: "bg-indigo-100"
    };
  }
};

export const generateSpeech = async (text: string): Promise<string | undefined> => {
  try {
    const response = await ai.models.generateContent({
      model: ttsModelName,
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Puck' },
          },
        },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (error) {
    console.error("Error generating speech:", error);
    return undefined;
  }
};