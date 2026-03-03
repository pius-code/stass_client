import { initializeWhatsApp } from "./whatsapp.js";
import client from "./core/whatsapp";
import { Groq_LLMHandler } from "./handler/groq.js";
import { Gemini_LLMHandler } from "./handler/gemini.js";
import { clearUserHistory } from "./utils/redis.js";
import { sendMedia } from "./utils/whatsapp.js";

initializeWhatsApp();

client.on("message", async (message) => {
  // change thse number to your  whatsapp number
  if (message.from === "233536287642@c.us") {
    if (message.body.toLowerCase() === "clear") {
      await clearUserHistory(message.from);
      message.reply("Your conversation history has been cleared.");
      return;
    }
    console.log("Received message from specified number:", message.body);
    const response = Groq_LLMHandler(message);
    // const response = Gemini_LLMHandler(message);
  }
});
