import http from 'node:http';
import { config } from './config.js';
import { bot } from './bot.js';

// HTTP health check server bound to 0.0.0.0 for Render Web Service port scanning
const port = process.env.PORT || 10000;
const host = '0.0.0.0';

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Telegram Gemini Bot is active and running!');
});

server.listen(port, host, () => {
  console.log(`Health check server listening on http://${host}:${port}`);
});

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
  server.close();
  bot.stop();
});

process.once('SIGTERM', () => {
  console.log('\nStopping bot...');
  server.close();
  bot.stop();
});

main();
