import { db } from "./db";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

const OXA_BOT_ID = 1;

async function getParentPosts(postId: number, depth = 0): Promise<any[]> {
  if (depth >= 10) return [];

  const post = await db.post.findUnique({
    where: { id: postId },
    select: {
      id: true,
      content: true,
      created_at: true,
      user_id: true,
      ai_bot_id: true,
      parent_id: true,
    },
  });

  if (!post) return [];

  const parentMessages = post.parent_id
    ? await getParentPosts(post.parent_id, depth + 1)
    : [];

  let role = "user";
  if (post.ai_bot_id !== null) {
    role = "assistant";
  } else if (post.user_id !== null) {
    role = "user";
  }

  return [
    ...parentMessages,
    {
      role,
      content: post.content,
    },
  ];
}

export async function getOXAResponseAndReply({ postId }: { postId: number }) {
  try {
    const chatHistory = await getParentPosts(postId);

    const response = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: `You are OXA AI, the built-in assistant for NesaHub, a social media platform. Help users with social features, content, and questions. Keep replies short (1-5 sentences), friendly, and useful.`,
        },
        ...chatHistory,
      ],
      max_tokens: 200,
      temperature: 1.3,
    });

    const aiContent =
      response.choices[0]?.message?.content ||
      "Sorry, I couldn't process that.";

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
