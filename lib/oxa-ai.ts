import { db } from "./db";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

const OXA_BOT_ID = 1;

export async function getOXAResponseAndReply({
  message,
  postId,
}: {
  message: string;
  postId: number;
}) {
  try {
    const response = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: `You are OXA AI, a helpful assistant that provides very short answers (1-5 sentences max). 
            Respond concisely and practically. 
            For steps use numbers. Never write more than 100 words.`,
        },
        {
          role: "user",
          content: message,
        },
      ],
      max_tokens: 50,
      temperature: 0.3,
    });

    const aiContent =
      response.choices[0]?.message?.content ||
      "OXA AI: Sorry, I couldn't process that.";

    const aiReply = await db.post.create({
      data: {
        content: aiContent,
        ai_bot_id: OXA_BOT_ID,
        parent_id: postId,
      },
    });

    return aiReply;
  } catch (error) {
    console.error("OXA AI Error:", error);
    return null;
  }
}
