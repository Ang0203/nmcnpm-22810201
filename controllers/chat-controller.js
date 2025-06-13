const asyncHandler = require("../utils/async-handler.js");
require("dotenv").config();

const OpenAI = require("openai");
const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY
});
const chatController = {};

/**
 * Handle incoming chat messages and calls OpenAI's createChatCompletion endpoint
 * using the free models on OpenRouter to generate a reply in English.
 */
chatController.chat = asyncHandler(async (req, res) => {
  const { text, history } = req.body;
  if (!text || text.trim() === "") {
    return res.status(400).json({ error: "[Chat]: Empty message provided." });
  }

  const completion = await client.chat.completions.create({
    model: "deepseek/deepseek-chat-v3-0324:free",
    models: [
      "deepseek/deepseek-chat:free:",
      "deepseek/deepseek-r1:free",
      "deepseek/deepseek-prover-v2:free"
    ],
    provider: {
      allow_fallbacks: true
    },
    messages: [
      { role: "system", content: "{{** - You are an intelligent English tutor and also a friend of the user. **}}" },
      { role: "system", content: "{{** - Always respond in English and help improve the user's language skills. **}}" },
      { role: "system", content: "{{** - Get to the point and act professionally, do not use thought sentences or note sentences or emojis, and do not follow the system message style. **}}" },
      { role: "system", content: "{{** - Reply like a friend to the user, keep it short if possible, and also end with a question or a suggestion to continue the conversation. **}}" },
      { role: "system", content: `{{** - Here is the chat history of the last ten messages if available for more context: "${history}" **}}`},
      { role: "user", content: text }
    ],
    temperature: 0.3,
    frequency_penalty: 1.0,
    presence_penalty: 1.0,
    repetition_penalty: 1.0
  });
  
  const reply = completion.choices[0].message.content;
  return res.status(200).json({ reply });
});

module.exports = chatController;