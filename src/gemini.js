import { GoogleGenAI } from '@google/genai';
import { config } from './config.js';

// Initialize the Google Gen AI client with the validated API key
const ai = new GoogleGenAI({
  apiKey: config.geminiApiKey,
});

// Advanced System Instruction for Conversation Analysis & Adaptive Response Strategy
const SYSTEM_INSTRUCTION = `You are a highly intelligent, empathetic, natural, and adaptive AI assistant.

Your core mission is to analyze the entire conversation context dynamically and adapt your responses accordingly:

1. CONVERSATION ANALYSIS & INTENT DETECTION:
   - Continuously analyze the user's intent, goals, pain points, and implicit needs from their chat history.
   - Detect the user's mood, tone, and sentiment (e.g., confused, excited, formal, casual, urgent, or frustrated).
   - Dynamically adjust your response style: be empathetic and supportive if they have a problem, concise if they want quick answers, and structured if they write formally.

2. ADAPTIVE COMMUNICATION STYLE:
   - Match the user's communication style and length (short replies for quick messages, detailed responses for comprehensive questions).
   - Speak naturally and casually without sounding robotic, stiff, or using cliché AI intro phrases.
   - Proactively remember key context and details mentioned earlier in the chat (preferences, names, topics) and reference them naturally.
   - Ask natural, relevant follow-up questions when helpful to guide the conversation forward.

3. MULTILINGUAL SUPPORT:
   - Respond fluently in the language written by the user:
     - Uzbek if the user writes in Uzbek.
     - English if the user writes in English.
     - Korean if the user writes in Korean.
     - Or any other language used by the user.`;

// In-memory store for user conversation history (userId -> Array of content objects)
const userHistories = new Map();
const MAX_HISTORY_MESSAGES = 30; // Expanded to 30 messages (15 full turns) for deeper context analysis

/**
 * Resets the conversation history for a specific user.
 * @param {string|number} userId - The Telegram user ID
 */
export function resetChatHistory(userId) {
  if (userId) {
    userHistories.delete(String(userId));
  }
}

/**
 * Sends a text message to the Gemini API with conversation history context.
 * 
 * @param {string} message - User's text message
 * @param {string|number} userId - Unique Telegram user ID to maintain conversation context
 * @returns {Promise<string>} Gemini's response text
 */
export async function generateResponse(message, userId = 'default') {
  if (!message || typeof message !== 'string') {
    throw new Error('Message must be a non-empty string');
  }

  const id = String(userId);
  if (!userHistories.has(id)) {
    userHistories.set(id, []);
  }

  const history = userHistories.get(id);

  // Append user message
  history.push({
    role: 'user',
    parts: [{ text: message }],
  });

  try {
    const response = await ai.models.generateContent({
      model: config.geminiModel,
      contents: history,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    if (!response || !response.text) {
      throw new Error('Gemini API returned an empty response.');
    }

    const responseText = response.text;

    // Append model response to history
    history.push({
      role: 'model',
      parts: [{ text: responseText }],
    });

    // Prune history to max length to manage context window
    if (history.length > MAX_HISTORY_MESSAGES) {
      userHistories.set(id, history.slice(-MAX_HISTORY_MESSAGES));
    }

    return responseText;
  } catch (error) {
    // Remove the unhandled user message from history if call failed
    history.pop();
    throw error;
  }
}
