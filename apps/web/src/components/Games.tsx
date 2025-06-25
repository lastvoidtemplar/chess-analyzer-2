import React from "react";
import Button from "./Button";
import Form, { type FormHandle } from "./Form";
import TextArea, { type TextAreaHandle } from "./TextArea";
import { trpc } from "../hooks/trpc";

function Games() {
  const ref = React.useRef<HTMLDialogElement>(null);

  const openDialog = React.useCallback(() => {
    if (ref.current) {
      ref.current.showModal();
    }
  }, []);

  return (
    <div className="w-full h-full pr-8 py-2 flex flex-col items-center gap-2">
      <h1 className="text-4xl">Games</h1>
      <hr className="w-full" />
      <div className="grow w-full">
        <div className="flex justify-around items-center">
          <dialog
            className="absolute top-1/2 left-1/2 -translate-1/2"
            ref={ref}
          >
            <AddGameForm callback={() => ref.current?.close()} />
          </dialog>

          <h2 className="text-2xl">Library of games</h2>
          <Button onClick={openDialog}>
            <p className="text-center">Add a game</p>
          </Button>
        </div>
      </div>
    </div>
  );
}

type AddGameFormProps = {
  callback?: () => void;
};

function AddGameForm({ callback }: AddGameFormProps) {
  const postGame = trpc.postGame.useMutation({
    onSuccess() {
      if (errorRef.current) {
        errorRef.current.innerText = "";
      }
      textareaRef.current?.clear();
      if (callback) {
        callback();
      }
    },
    onError(error) {
      if (errorRef.current) {
        errorRef.current.innerText = error.message;
      }
    },
  });

  const formRef = React.useRef<FormHandle>(null);
  const textareaRef = React.useRef<TextAreaHandle>(null);
  const errorRef = React.useRef<HTMLParagraphElement>(null);

  const onSubmit = React.useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (formRef.current) {
        postGame.mutate(formRef.current.getValue() as { pgn: string });
      }
    },
    [postGame]
  );

  return (
    <Form
      className="min-w-96 border-2 flex flex-col p-2 gap-2"
      ref={formRef}
      onSubmit={onSubmit}
    >
      <h1 className="text-2xl text-center">Add Game Form</h1>
      <TextArea labelText="PGN" fieldName="pgn" ref={textareaRef} />
      <p className="text-center text-red-600 text-lg" ref={errorRef}></p>
      <Button>
        <p className="text-2xl">Add</p>
      </Button>
    </Form>
  );
}

export default Games;
