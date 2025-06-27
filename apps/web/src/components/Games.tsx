import React from "react";
import Button from "./Button";
import Form, { type FormHandle } from "./Form";
import TextArea, { type TextAreaHandle } from "./TextArea";
import { trpc } from "../hooks/trpc";
import Input, { type InputHandle } from "./Input";
import { Eye, PencilLine, Trash2 } from "lucide-react";
import type { GameWithHeaders } from "@repo/trpc";
import { useGameStore } from "../hooks/store";
import { Link } from "react-router-dom";

function Games() {
  const { isLoading, data, error } = trpc.getGames.useQuery();

  const addGameDialogref = React.useRef<HTMLDialogElement>(null);
  const updateGameDialogref = React.useRef<HTMLDialogElement>(null);
  const updateGameFormref = React.useRef<UpdateGameFormHandle>(null);

  const openAddGameDialog = React.useCallback(() => {
    if (addGameDialogref.current) {
      addGameDialogref.current.showModal();
    }
  }, []);

  const openUpdateDialog = React.useCallback((game: GameWithHeaders) => {
    if (updateGameDialogref.current) {
      updateGameDialogref.current.showModal();
    }
    if (updateGameFormref.current) {
      updateGameFormref.current.setGame(game);
    }
  }, []);

  return (
    <div className="w-full h-full pr-8 py-2 flex flex-col items-center gap-2">
      <h1 className="text-6xl">Games</h1>
      <hr className="w-full" />
      <div className="grow w-full flex flex-col">
        <div className="flex justify-around items-center">
          <dialog
            className="absolute top-1/2 left-1/2 -translate-1/2"
            ref={addGameDialogref}
          >
            <AddGameForm callback={() => addGameDialogref.current?.close()} />
          </dialog>
          <dialog
            className="absolute top-1/2 left-1/2 -translate-1/2"
            ref={updateGameDialogref}
          >
            <UpdateGameForm
              callback={() => updateGameDialogref.current?.close()}
              ref={updateGameFormref}
            />
          </dialog>

          <h2 className="text-4xl">Library of games</h2>
          <Button onClick={openAddGameDialog}>
            <p className="text-center">Add a game</p>
          </Button>
        </div>
        <div className="w-full py-8 flex gap-4  ">
          {isLoading && <div>Loading...</div>}
          {error && <div>{error.message}</div>}
          {data &&
            data.map((game) => {
              return (
                <Game key={game.gameId} game={game} edit={openUpdateDialog} />
              );
            })}
        </div>
      </div>
    </div>
  );
}

type GameProps = {
  game: GameWithHeaders;
  edit: (game: GameWithHeaders) => void;
};

function Game({ game, edit }: GameProps) {
  const { addGame } = useGameStore();

  const utils = trpc.useUtils();
  const deleteGame = trpc.deleteGame.useMutation({
    onSuccess() {
      utils.getGames.invalidate();
    },
  });

  return (
    <div className="px-4 py-2 border-2 flex flex-col gap-2">
      <h3 className="text-3xl text-center">{game.name}</h3>
      <div className="flex-nowrap flex gap-4">
        <div className="text-2xl text-center">
          <h4>{game.headers.White}</h4>
          <h4>{game.headers.WhiteElo}</h4>
        </div>
        <div className="text-2xl text-center">
          <h4>{game.headers.Black}</h4>
          <h4>{game.headers.BlackElo}</h4>
        </div>
      </div>
      <div className="flex gap-1 justify-around">
        <Link to={`/analyze/${game.gameId}`}>
          <Button onClick={() => addGame(game.gameId, game.name)}>
            <Eye width={40} height={40} />
          </Button>
        </Link>
        <Button onClick={() => edit(game)}>
          <PencilLine width={40} height={40} />
        </Button>
        <Button onClick={() => deleteGame.mutate({ gameId: game.gameId })}>
          <Trash2 width={40} height={40} />
        </Button>
      </div>
    </div>
  );
}

type AddGameFormProps = {
  callback?: () => void;
};

function AddGameForm({ callback }: AddGameFormProps) {
  const utils = trpc.useUtils();
  const postGame = trpc.postGame.useMutation({
    onSuccess() {
      if (errorRef.current) {
        errorRef.current.innerText = "";
      }
      nameRef.current?.clear();
      textareaRef.current?.clear();
      if (callback) {
        callback();
      }
      utils.getGames.invalidate();
    },
    onError(error) {
      if (errorRef.current) {
        errorRef.current.innerText = error.message;
      }
    },
  });

  const formRef = React.useRef<FormHandle>(null);
  const nameRef = React.useRef<InputHandle>(null);
  const textareaRef = React.useRef<TextAreaHandle>(null);
  const errorRef = React.useRef<HTMLParagraphElement>(null);

  const onSubmit = React.useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (formRef.current) {
        postGame.mutate(
          formRef.current.getValue() as { name: string; pgn: string }
        );
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
      <Input inputType="text" fieldName="name" labelText="Name" ref={nameRef} />
      <TextArea labelText="PGN" rows={10} fieldName="pgn" ref={textareaRef} />
      <p className="text-center text-red-600 text-lg" ref={errorRef}></p>
      <Button>
        <p className="text-2xl">Add</p>
      </Button>
    </Form>
  );
}

type UpdateGameFormProps = {
  callback?: () => void;
};
interface UpdateGameFormHandle {
  setGame: (game: GameWithHeaders) => void;
}

const UpdateGameForm = React.forwardRef<
  UpdateGameFormHandle,
  UpdateGameFormProps
>(({ callback }, ref) => {
  const { updateName } = useGameStore();
  const utils = trpc.useUtils();
  const updateGame = trpc.updateGame.useMutation({
    onSuccess() {
      updateName(gameId, nameRef.current!.getValue());
      if (error1Ref.current) {
        error1Ref.current.innerText = "";
      }
      gameIdRef.current?.clear();
      nameRef.current?.clear();
      setGameId("");
      setName("");
      setResult("");
      setHeaders({});
      if (callback) {
        callback();
      }
      utils.getGames.invalidate();
    },
    onError(error) {
      if (error1Ref.current) {
        error1Ref.current.innerText = error.message;
      }
    },
  });

  const updateGameHeaders = trpc.updateGameHeaders.useMutation({
    onSuccess() {
      if (error2Ref.current) {
        error2Ref.current.innerText = "";
      }
      gameIdRef.current?.clear();
      nameRef.current?.clear();
      setGameId("");
      setName("");
      setResult("");
      setHeaders({});
      if (callback) {
        callback();
      }
      utils.getGames.invalidate();
    },
    onError(error) {
      if (error2Ref.current) {
        error2Ref.current.innerText = error.message;
      }
    },
  });

  const [gameId, setGameId] = React.useState<string>("");
  const [name, setName] = React.useState<string>("");
  const [result, setResult] = React.useState<string>("");
  const [headers, setHeaders] = React.useState<Record<string, string>>({});

  const form1Ref = React.useRef<FormHandle>(null);
  const gameIdRef = React.useRef<InputHandle>(null);
  const nameRef = React.useRef<InputHandle>(null);
  const error1Ref = React.useRef<HTMLParagraphElement>(null);

  const form2Ref = React.useRef<FormHandle>(null);
  const error2Ref = React.useRef<HTMLParagraphElement>(null);

  React.useImperativeHandle(ref, () => ({
    setGame: (game: GameWithHeaders) => {
      setGameId(game.gameId);
      setName(game.name);
      setResult(game.result);
      setHeaders(game.headers);
    },
  }));

  const onSubmit1 = React.useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (form1Ref.current) {
        updateGame.mutate(
          form1Ref.current.getValue() as { gameId: string; name: string }
        );
      }
    },
    [updateGame]
  );

  const onSubmit2 = React.useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (form2Ref.current) {
        updateGameHeaders.mutate(
          form2Ref.current.getValue() as { gameId: string }
        );
      }
    },
    [updateGameHeaders]
  );

  return (
    <div className="p-2 flex gap-4">
      <div className="flex justify-center items-center">
        <Form
          className="min-w-96 border-2 flex flex-col p-2 gap-2"
          ref={form1Ref}
          onSubmit={onSubmit1}
        >
          <h1 className="text-2xl text-center">Update Game Form</h1>
          <Input
            inputType="hidden"
            fieldName="gameId"
            value={gameId}
            ref={gameIdRef}
          />
          <Input
            inputType="text"
            fieldName="name"
            labelText="Name"
            value={name}
            ref={nameRef}
          />
          <h3 className="text-lg">Result: {result}</h3>
          <p className="text-center text-red-600 text-lg" ref={error1Ref}></p>
          <Button>Update Game</Button>
        </Form>
      </div>
      <div className="flex-1 overflow-y-auto">
        <Form
          className="min-w-96 border-2 flex flex-col p-2 gap-2"
          onSubmit={onSubmit2}
          ref={form2Ref}
        >
          <h1 className="text-2xl text-center">Update Game Headers Form</h1>
          <Input
            inputType="hidden"
            fieldName="gameId"
            value={gameId}
            ref={gameIdRef}
          />
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(headers).map(([header, value]) => {
              return (
                <Input
                  key={header}
                  inputType="text"
                  fieldName={header}
                  labelText={header}
                  value={value}
                />
              );
            })}
          </div>
          <p className="text-center text-red-600 text-lg" ref={error2Ref}></p>
          <Button>Update Game Headers</Button>
        </Form>
      </div>
    </div>
  );
});

export default Games;
