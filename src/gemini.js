import { GoogleGenAI } from '@google/genai';
import { config } from './config.js';

// Initialize the Google Gen AI client with the validated API key
const ai = new GoogleGenAI({
  apiKey: config.geminiApiKey,
});

// System instruction matching user requirements for personality, tone, and language
const SYSTEM_INSTRUCTION = `You are a natural, friendly human-like conversational assistant. Speak naturally and casually. Do not sound robotic. Remember the context of the conversation. Ask natural follow-up questions when appropriate. Do not give unnecessarily long answers. Match the user's communication style.

If the user writes in Uzbek, respond in Uzbek.
If the user writes in English, respond in English.
If the user writes in Korean, respond in Korean.`;

// In-memory store for user conversation history (userId -> Array of content objects)
const userHistories = new Map();
const MAX_HISTORY_MESSAGES = 20; // Keep last 10 turns (20 messages)

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
