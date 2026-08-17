# Telegram AI Chatbot Using Gemini API

A beginner-friendly, production-ready Telegram AI Chatbot built using **Node.js**, **`grammy`**, and the official **Gemini API** (`@google/genai`).

Whenever a user sends a text message to your Telegram bot, the bot forwards the prompt to Gemini, receives the AI response, and automatically replies to the user on Telegram.

---

## 🏗 Project Architecture

```text
Telegram User
      ↓
Telegram Bot
      ↓
Node.js Application
      ↓
Gemini API (@google/genai)
      ↓
Gemini Response
      ↓
Node.js Application
      ↓
Telegram Bot (grammy)
      ↓
Telegram User
```

---

## 📁 Project Structure

```text
telegram-gemini-bot/
│
├── src/
│   ├── index.js             # Entry point & bot startup logic
│   ├── bot.js               # Telegram bot handlers (grammy)
│   ├── gemini.js            # Gemini API client integration (@google/genai)
│   ├── config.js            # Environment variable validation & config loading
│   └── utils/
│       └── splitMessage.js  # Smart message splitter for Telegram's 4096-char limit
│
├── test/
│   └── splitMessage.test.js # Unit tests for message splitter
│
├── .env                     # Real API keys & secrets (gitignored)
├── .env.example             # Template for required environment variables
├── .gitignore               # Ignores secrets and node_modules/
├── package.json             # NPM package specification & dependencies
└── README.md                # Project documentation
```

---

## 📋 Requirements

Before running the application, make sure you have:

1. **Node.js** (v18.0.0 or higher) & **npm** installed.
2. **Telegram Account** & a Telegram Bot Token:
   - Create a new bot by messaging [@BotFather](https://t.me/BotFather) on Telegram and copy your API Token.
3. **Gemini API Key**:
   - Obtain a free API key from [Google AI Studio](https://aistudio.google.com/).

---

## 🚀 Quick Start

### 1. Clone & Install Dependencies

```bash
git clone <your-repository-url>
cd telegram-gemini-bot
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Open `.env` and fill in your credentials:

```env
TELEGRAM_BOT_TOKEN=123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ
GEMINI_API_KEY=AIzaSyYourGeminiApiKeyHere
GEMINI_MODEL=gemini-2.5-flash
```

> ⚠️ **Security Warning**: Never commit your `.env` file or expose your API keys in public repositories!

### 3. Run the Bot

#### Production Mode
```bash
npm start
```

#### Development Mode (Auto-reloads on file changes)
```bash
npm run dev
```

---

## 🧪 Testing

Run the automated test suite using Node.js native test runner:

```bash
npm test
```

### Manual Testing Scenarios

1. **/start command**: Send `/start` to the bot.
   - **Expected**: `Hello! 👋 I'm an AI chatbot powered by Gemini. Ask me anything!`
2. **Text conversation**: Send `What is JavaScript?`
   - **Expected**: Bot displays "typing...", queries Gemini, and replies with a concise answer.
3. **Uzbek message**: Send `Salom! Ahvollaringiz qanday?`
   - **Expected**: Gemini replies in Uzbek.
4. **Korean message**: Send `안녕하세요! 반가워요.`
   - **Expected**: Gemini replies in Korean.
5. **Unsupported media**: Send a photo, voice message, sticker, or document.
   - **Expected**: `Sorry, I currently support text messages only.`
6. **Long messages**: Send a prompt asking for a 3000-word essay.
   - **Expected**: Bot automatically splits the long AI response into multiple sequential Telegram messages without cutting words or losing content.

---

## 🔧 Troubleshooting

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| `❌ CONFIGURATION ERROR` | Missing `.env` or missing keys in `.env` | Ensure `.env` exists and contains valid `TELEGRAM_BOT_TOKEN` and `GEMINI_API_KEY`. |
| `GrammyError: 401: Unauthorized` | Invalid `TELEGRAM_BOT_TOKEN` | Check that your Telegram token was correctly copied from @BotFather. |
| `GoogleGenAIError: 400 / 403` | Invalid or restricted `GEMINI_API_KEY` | Verify your API key at [Google AI Studio](https://aistudio.google.com/). |
| Bot not responding to Telegram messages | Bot process is not running or wrong token used | Ensure `npm start` is running in your terminal and shows `Telegram bot started successfully`. |

---

## 📜 License

ISC
