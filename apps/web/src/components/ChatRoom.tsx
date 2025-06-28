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

  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      <h1 className="text-6xl">
        {result.status}-{result.error?.message}
      </h1>
      {messages.map((msg) => {
        return (
          <div key={msg.id}>
            {msg.username}-{msg.message}
          </div>
        );
      })}
      <Form className="flex flex-col" onSubmit={onSubmit}>
        <TextArea fieldName="message" ref={messageRef} />
        <Button>Send Message</Button>
      </Form>
    </div>
  );
}

export default ChatRoom;
