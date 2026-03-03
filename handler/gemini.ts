import { AIclient2 } from "../core/groq";
import WAWebJS from "whatsapp-web.js";
import { SYSTEM_PROMPT } from "../prompts/sys_pro";
import {
  getRedisUserHistory,
  addNewMessageAndUpdateHistory,
} from "../utils/redis";
import { Gemini_model } from "../model/model";

export const Gemini_LLMHandler = async (query: WAWebJS.Message) => {
  const msg = await query.getChat();
  await msg.sendStateTyping();

  try {
    const userId = query.from;
    const userHistory = await getRedisUserHistory(userId);
    const messages = [
      { role: "model", content: SYSTEM_PROMPT },
      ...userHistory,
      { role: "user", content: query.body },
    ];
    const response = await AIclient2.interactions.create({
      input: messages,
      model: Gemini_model,
      stream: false,
      tools: [
        {
          type: "mcp_server",
          name: "Stass",
          url: "https://8053-154-161-171-59.ngrok-free.app/mcp",
        },
      ],
    });
    msg.clearState();
    const content = response;
    console.log("LLM Response:", JSON.stringify(content, null, 2));

    // Add proper type checking for content outputs
    if (content.outputs && content.outputs.length > 0) {
      const lastOutput = content.outputs[content.outputs.length - 1];

      // Check if the output has text content
      let responseText = "No response text available";
      if ("text" in lastOutput && lastOutput.text) {
        responseText = lastOutput.text;
      } else if (
        "content" in lastOutput &&
        typeof lastOutput.content === "string"
      ) {
        responseText = lastOutput.content;
      }

      query.reply(responseText);
      await addNewMessageAndUpdateHistory(
        userId,
        query.body,
        responseText,
        "model",
      );
    } else {
      query.reply("No response received from the model.");
      console.warn("No outputs received from the model");
    }
  } catch (error) {
    query.reply("An error occurred while processing your request.");
    console.error("Error in LLMHandler:", error);
  }
};
