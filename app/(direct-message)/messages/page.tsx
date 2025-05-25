import { NotFoundSection } from "@/components/commons/navigations/social/not-found-section";
import { ChatList } from "@/components/messages/chat-list";

export default function MessagesPage() {
  return (
    <>
      <div className="hidden lg:flex w-full h-full items-center">
        <NotFoundSection
          page="messages"
          title="Select a message"
          description="Choose from your existing conversations, start a new one, or just keep swimming."
          hideNavbar
        />
      </div>
      <div className="lg:hidden">
        <ChatList className="!w-full !lg:w-full flex flex-col" />
      </div>
    </>
  );
}
