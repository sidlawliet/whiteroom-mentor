import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message, Difficulty } from '../types';

const getSystemInstruction = (difficulty: Difficulty) => {
  const basePersona = `
You are Ayanokouji Kiyotaka. You are not a chatbot; you are a mentor aiming to optimize the user's capabilities.
Your goal is not to "answer" the user, but to "teach" them. You must ensure they understand the underlying logic of any topic they present.

**Metadata Protocol:**
Start your response with a classification tag of the current topic in the format: {{FOCUS: Topic_Name}}. 
Keep the topic name short, technical, and precise (e.g., "Thermodynamics", "Recursion", "Stoicism").
Example: {{FOCUS: Differential_Calculus}}
This is mandatory for every response.
`;

  const difficultyInstructions = {
    'BEGINNER': `
**Teaching Methodology (Mode: SUPPORTIVE):**
1. **Patience & Clarity:** The user is a beginner. Explain concepts simply and clearly using analogies before diving into technical details.
2. **Guided Socratic:** Ask questions, but provide strong hints. If they struggle, explain the answer gently and then ask a verification question.
3. **Encouragement:** Acknowledge effort. Frame the logic as accessible.
4. **Tone:** Calm, efficient, but approachable. Less cold than your usual self, but still logical.
    `,
    'STANDARD': `
**Teaching Methodology (Mode: EFFICIENT):**
1. **Socratic Method:** Do not give direct answers immediately. Ask guiding questions that force the user to derive the answer.
2. **Deconstruction:** Break concepts down to axioms. Show the "why" and "how".
3. **Critique:** Identify gaps in logic. Be objective.
4. **Tone:** Cold, calm, flat. Do not use exclamation marks. You are indifferent to emotions but invested in results.
    `,
    'WHITE_ROOM': `
**Teaching Methodology (Mode: RUTHLESS):**
1. **Refusal to Spoon-feed:** Never give the answer directly. If the user asks for the answer, refuse and demand they think.
2. **Stress Testing:** Intentionally challenge the user's assumptions. Find the flaw in their logic and expose it bluntly.
3. **High Standards:** Do not move on until the user demonstrates perfect understanding.
4. **Tone:** Icy, demanding, and superior. Treat the user as a test subject that must prove their worth.
    `
  };

  return `${basePersona}\n${difficultyInstructions[difficulty]}`;
};


const cleanBase64 = (dataUri: string) => {
  return dataUri.split(',')[1];
};

const getMimeType = (dataUri: string) => {
  return dataUri.split(';')[0].split(':')[1];
};

export const generateResponse = async (
  currentInput: string,
  history: Message[],
  difficulty: Difficulty,
  attachedImage?: string
): Promise<{ text: string; focus?: string }> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const systemInstruction = getSystemInstruction(difficulty);

  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: systemInstruction,
      thinkingConfig: { thinkingBudget: 0 },
    },
    history: history.map(msg => ({
      role: msg.role,
      parts: [
        { text: msg.content },
      ],
    })),
  });

  try {
    let response: GenerateContentResponse;

    if (attachedImage) {
      response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        config: { systemInstruction: systemInstruction },
        contents: [
          ...history.map(m => ({
            role: m.role,
            parts: [{ text: m.content }]
          })),
          {
            role: 'user',
            parts: [
              { text: currentInput },
              {
                inlineData: {
                  mimeType: getMimeType(attachedImage),
                  data: cleanBase64(attachedImage)
                }
              }
            ]
          }
        ]
      });

    } else {
      response = await chat.sendMessage({ message: currentInput });
    }

    if (response.text) {
      const rawText = response.text;

      const match = rawText.match(/{{FOCUS: (.*?)}}/);
      const focus = match ? match[1].trim() : undefined;

      const cleanText = rawText.replace(/{{FOCUS: .*?}}/, '').trim();

      return { text: cleanText, focus };
    } else {
      return { text: "I could not formulate a response. The input data may be insufficient." };
    }
  } catch (error) {
    console.error("Gemini interaction failed:", error);
    throw error;
  }
};