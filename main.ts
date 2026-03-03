import { initializeWhatsApp } from "./whatsapp.js";
import client from "./core/whatsapp";
import { Groq_LLMHandler } from "./handler/groq.js";
import { Gemini_LLMHandler } from "./handler/gemini.js";
import { clearUserHistory } from "./utils/redis.js";
import { sendMedia } from "./utils/whatsapp.js";

initializeWhatsApp();

client.on("message", async (message) => {
  console.log(message.from);
  // change thse number to your  whatsapp number
  if (
    message.from ===
    "your_test_number or group id, remove from if loop if you want to apply to all numbers "
  ) {
    if (message.body.toLowerCase() === "clear") {
      await clearUserHistory(message.from);
      message.reply("Your conversation history has been cleared.");
      return;
    }
    console.log("Received message from specified number:", message.body);
    const response = Groq_LLMHandler(message);
    // uncomment if you prefer using gemini, but make sure to update the system prompt in prompts/sys_pro.ts to be more suitable for a general assistant rather than an academic one(use a paid gemini version, the free ones doesnt work well)
    // const response = Gemini_LLMHandler(message);
  }
});
