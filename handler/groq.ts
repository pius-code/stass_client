import { AIclient } from "../core/groq";
import WAWebJS from "whatsapp-web.js";
import { SYSTEM_PROMPT } from "../prompts/sys_pro";
import {
  getRedisUserHistory,
  addNewMessageAndUpdateHistory,
} from "../utils/redis";
import { groq_model } from "../model/model";

export const Groq_LLMHandler = async (query: WAWebJS.Message) => {
  const msg = await query.getChat();
  await msg.sendStateTyping();

  try {
    const userId = query.from;
    const userHistory = await getRedisUserHistory(userId);
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...userHistory,
      { role: "user", content: query.body },
    ];
    const response = await AIclient.responses.create({
      input: messages,
      model: groq_model,
      temperature: 1,
      top_p: 1,
      stream: false,
      reasoning: {
        effort: "medium",
      },
      tool_choice: "auto",
      tools: [
        {
          type: "mcp",
          server_label: "Stass",
          server_url: "https://8053-154-161-171-59.ngrok-free.app/mcp",
        },
      ],
    });

    const content = response;
    console.log("LLM Response:", JSON.stringify(content, null, 2));

    query.reply(content.output_text);
    msg.clearState();
    await addNewMessageAndUpdateHistory(
      userId,
      query.body,
      content.output_text,
      "assistant",
    );
  } catch (error) {
    query.reply("An error occurred while processing your request.");
    console.error("Error in LLMHandler:", error);
  }
};
