import { ChatWarpper } from "@/components/messages/chat-wrapper";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ conversationId: number }>;
}) {
  const { conversationId } = await params;
  return <ChatWarpper conversationId={conversationId} />;
}
