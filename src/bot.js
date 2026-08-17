import { Bot } from 'grammy';
import { config } from './config.js';
import { generateResponse, resetChatHistory } from './gemini.js';
import { splitMessage } from './utils/splitMessage.js';

// Create Telegram bot instance
export const bot = new Bot(config.telegramBotToken);

// Cache mapping business_connection_id -> business owner user ID
const businessOwnerCache = new Map();

/**
 * Retrieves and caches the business owner's Telegram user ID for a connection.
 */
async function getBusinessOwnerId(ctx, connectionId) {
  if (!connectionId) return null;
  if (businessOwnerCache.has(connectionId)) {
    return businessOwnerCache.get(connectionId);
  }

  try {
    const connection = await ctx.api.getBusinessConnection(connectionId);
    if (connection && connection.user) {
      const ownerId = connection.user.id;
      businessOwnerCache.set(connectionId, ownerId);
      return ownerId;
    }
  } catch (error) {
    console.error('Failed to get business connection details:', error.message || error);
  }
  return null;
}

// Track connection status updates to auto-populate business owner cache
bot.on('business_connection', (ctx) => {
  const conn = ctx.businessConnection;
  if (conn && conn.user) {
    businessOwnerCache.set(conn.id, conn.user.id);
    console.log(`Business connection registered for owner ID: ${conn.user.id}`);
  }
});

// Handle /start command (direct bot chats)
bot.command('start', async (ctx) => {
  const userId = ctx.from?.id || 'unknown';
  resetChatHistory(userId); // Reset conversation context on /start

  const welcomeMessage = "Hello! 👋\n\nI'm an AI chatbot powered by Gemini.\n\nAsk me anything!";
  await ctx.reply(welcomeMessage);
});

// Handle text messages (both standard chats and Telegram Business chats)
bot.on(['message:text', 'business_message:text'], async (ctx) => {
  const isBusinessMessage = Boolean(ctx.businessMessage);
  const senderId = ctx.from?.id;
  const userText = ctx.message?.text || ctx.businessMessage?.text;

  // Filter outgoing business messages sent by the business owner
  if (isBusinessMessage) {
    const connectionId = ctx.businessMessage.business_connection_id;
    const ownerId = await getBusinessOwnerId(ctx, connectionId);

    if (ownerId && senderId === ownerId) {
      console.log(`Ignoring outgoing message sent by business owner (${senderId})`);
      return; // Do NOT reply to messages sent by the business owner
    }
  }

  console.log(`Incoming message received from user: ${senderId}`);

  try {
    // Show typing indicator in Telegram
    await ctx.replyWithChatAction('typing');

    console.log('Sending request to Gemini...');
    const responseText = await generateResponse(userText, senderId);
    console.log('Gemini response received.');

    // Split response into chunks if it exceeds Telegram length limits
    const chunks = splitMessage(responseText);

    for (const chunk of chunks) {
      await ctx.reply(chunk);
    }

    console.log('Response sent successfully.');
  } catch (error) {
    console.error('Error processing Gemini request:', error.message || error);
    
    // Friendly fallback error message for Telegram user
    try {
      await ctx.reply(
        'Sorry, something went wrong while generating a response. Please try again later.'
      );
    } catch (replyError) {
      console.error('Failed to send error message to user:', replyError.message || replyError);
    }
  }
});

// Handle all other unsupported message types (photos, videos, audio, documents, stickers, voice)
bot.on(['message', 'business_message'], async (ctx) => {
  const isBusinessMessage = Boolean(ctx.businessMessage);
  const senderId = ctx.from?.id;

  if (isBusinessMessage) {
    const connectionId = ctx.businessMessage.business_connection_id;
    const ownerId = await getBusinessOwnerId(ctx, connectionId);

    if (ownerId && senderId === ownerId) {
      return; // Ignore outgoing media from owner
    }
  }

  await ctx.reply('Sorry, I currently support text messages only.');
});

// Bot-level error handler to catch Telegram API errors without crashing process
bot.catch((err) => {
  console.error('Telegram bot error:', err.error || err);
});
