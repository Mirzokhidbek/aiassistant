import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const missingVars = [];

if (!process.env.TELEGRAM_BOT_TOKEN) {
  missingVars.push('TELEGRAM_BOT_TOKEN');
}

if (!process.env.GEMINI_API_KEY) {
  missingVars.push('GEMINI_API_KEY');
}

if (missingVars.length > 0) {
  console.error('\n❌ CONFIGURATION ERROR: Missing required environment variable(s):');
  missingVars.forEach((varName) => {
    console.error(`   - ${varName}`);
  });
  console.error('\nPlease copy .env.example to .env and set your API keys before starting.\n');
  process.exit(1);
}

/**
 * Validated application configuration
 */
export const config = Object.freeze({
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiModel: process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
});
