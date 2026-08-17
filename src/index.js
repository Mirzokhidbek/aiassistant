import { config } from './config.js';
import { bot } from './bot.js';

async function main() {
  console.log('Starting Telegram bot...');

  try {
    // Start long polling for Telegram bot including Telegram Business updates
    await bot.start({
      allowed_updates: ['message', 'business_message', 'business_connection'],
      onStart: (botInfo) => {
        console.log(`Telegram bot started successfully as @${botInfo.username}`);
        console.log(`Using Gemini Model: ${config.geminiModel}`);
        console.log('Telegram Business support enabled.');
      },
    });
  } catch (error) {
    console.error('Fatal startup error:', error.message || error);
    process.exit(1);
  }
}

// Handle termination signals gracefully
process.once('SIGINT', () => {
  console.log('\nStopping bot...');
  bot.stop();
});

process.once('SIGTERM', () => {
  console.log('\nStopping bot...');
  bot.stop();
});

main();
