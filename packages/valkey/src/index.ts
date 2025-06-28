import { createPositions, createScores, DB } from "@repo/db";
import Valkey from "iovalkey";

type FensMessage = {
  type: "fens";
  state: {
    gameId: string;
  };
  payload: {
    fens: string[];
  };
};

type Score = {
  unit: "cp" | "mate";
  score: number;
};

type ScoresMessage = {
  type: "scores";
  state: {
    gameId: string;
  };
  payload: {
    scores: Score[];
  };
};

type Messeage = FensMessage | ScoresMessage;

const responseQueue = "responses";

export async function listenResponseQueue(db: DB, valkey: Valkey) {
  while (true) {
    try {
      const result = await valkey.blpop(responseQueue, 0);
      if (result) {
        const [, message] = result;
        const parsed: Messeage = JSON.parse(message);
        console.log(`Valkey >> Messeage: ${parsed.type}`);
        switch (parsed.type) {
          case "fens":
            await handleFensMessage(db, parsed.state, parsed.payload);
            await publishScoresTask(valkey, parsed.state.gameId, parsed.payload.fens)
            break;
          case "scores":
            await handleScoresMessage(db, parsed.state, parsed.payload)
        }
      }
    } catch (err) {
      console.error(err);
      break;
    }
  }
}

async function handleFensMessage(
  db: DB,
  state: FensMessage["state"],
  payload: FensMessage["payload"]
) {
  const gameId = state.gameId;
  const fens = payload.fens;
  try {
    await createPositions(db, gameId, fens);
  } catch (err) {
    console.error(err);
  }
}

async function handleScoresMessage(
  db: DB,
  state: ScoresMessage["state"],
  payload: ScoresMessage["payload"]
) {
  const gameId = state.gameId;
  const scores = payload.scores;
  try {
    await createScores(db, gameId, scores);
  } catch (err) {
    console.error(err);
  }
}

const tasksQueue = "tasks"
export async function publishScoresTask(valkey: Valkey,gameId: string ,fens: string[]) {
    const message = {
        type: "scores",
        state: {
            gameId: gameId
        },
        payload: {
            fens: fens
        }
    }

    await valkey.lpush(tasksQueue, JSON.stringify(message))
}