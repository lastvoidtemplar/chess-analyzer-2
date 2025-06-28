import React from "react";
import { trpc } from "../hooks/trpc";
import type { RouterOutputs } from "@repo/trpc";
import Form from "./Form";
import TextArea, { type TextAreaHandle } from "./TextArea";
import Button from "./Button";

type ExtractYieldedType<T> = T extends AsyncIterable<infer U> ? U : never;
type ChatMessage = ExtractYieldedType<RouterOutputs["onChatMessage"]>["data"];

function ChatRoom() {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const { isLoading, data, error } = trpc.getChatMessages.useQuery({
    limit: 50,
  });
  const sendChatMessage = trpc.sendChatMessage.useMutation();
  const result = trpc.onChatMessage.useSubscription(undefined, {
    onData: (message) => {
      console.log(message);

      setMessages((prev) => [...prev, message.data]);
    },
  });

  const messageRef = React.useRef<TextAreaHandle>(null);
  const onSubmit = React.useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      sendChatMessage.mutate({
        message: messageRef.current?.getValue() ?? "",
      });
    },
    [sendChatMessage]
  );

  React.useEffect(() => {
    if (data) {
      setMessages(data);
    }
  }, [data]);

  if (isLoading) {
    <div className="w-full h-full flex flex-col justify-center items-center">
      Loading...
    </div>;
  }
  if (error) {
    <div className="w-full h-full flex flex-col justify-center items-center">
      {error.message}
    </div>;
  }
  if (result.error) {
    <div className="w-full h-full flex flex-col justify-center items-center">
      {result.error.message}
    </div>;
  }

  return (
    <div className="w-full h-full pr-8 py-2 flex flex-col items-center gap-2">
      <h1 className="text-6xl">Chat</h1>
      <hr className="w-full" />
      <div className="w-1/2 h-11/12 p-2 border-2 flex flex-col items-center gap-4">
        <div className="grow w-full pr-2 flex-1 overflow-y-scroll flex flex-col gap-2 ">
          {messages.map((msg) => {
            return <Message key={msg.id} message={msg} />;
          })}
        </div>
        <hr className="w-full" />
        <Form className="w-full flex flex-col gap-2" onSubmit={onSubmit}>
          <TextArea rows={3} fieldName="message" ref={messageRef} />
          <Button>Send Message</Button>
        </Form>
      </div>
    </div>
  );
}

type MessageProps = {
  message: ChatMessage;
};

function Message({ message }: MessageProps) {
  return (
    <div className="w-full px-2 border-2">
      <div className="p-2 flex justify-between items-center">
        <span className="flex items-center gap-2">
          <img src={message.userPicture} alt="Profile Picture" className="w-16 rounded-full" />
          <span className="text-xl">{message.username}</span>
        </span>
        <span className="text-lg">{new Date(message.timestamp).toDateString()}</span>
      </div>
      <hr />
      <p className="p-2 text-lg">{message.message}</p>
    </div>
  );
}

export default ChatRoom;
