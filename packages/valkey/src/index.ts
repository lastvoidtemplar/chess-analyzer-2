import { createPositions, DB } from "@repo/db";
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

type Messeage = FensMessage;

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
            break;
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
