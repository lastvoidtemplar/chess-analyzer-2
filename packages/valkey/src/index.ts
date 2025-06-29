import {
  createLine,
  createPositions,
  createScores,
  DB,
  getPositionFen,
  getPositionScore,
} from "@repo/db";
import { Chess } from "chess.js";
import Valkey from "iovalkey";
import  EventEmitter  from "events";

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

type LinePosition = {
  lan: string;
  fen: string;
  score: Score;
};
type Line = {
  line: number;
  score: Score;
  positions: LinePosition[];
};

type LinesMessage = {
  type: "lines";
  state: {
    gameId: string;
    gameTurn: number;
  };
  payload: {
    line: Line;
  };
};

type Messeage = FensMessage | ScoresMessage | LinesMessage;

const responseQueue = "responses";

type OutputLine = {
  gameId: string;
  gameTurn: number;
  line: number;
  scoreUnit: "cp" | "mate" | null;
  scoreValue: number | null;
  positions: {
    san: string | null;
    lan: string | null;
    fen: string;
    scoreUnit: "cp" | "mate" | null;
    scoreValue: number | null;
  }[];
};

export async function listenResponseQueue(db: DB, valkey: Valkey, ee: EventEmitter) {
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
            await publishScoresTask(
              valkey,
              parsed.state.gameId,
              parsed.payload.fens
            );
            break;
          case "scores":
            await handleScoresMessage(db, parsed.state, parsed.payload);
            break;
          case "lines":
            await handleLinesMessage(db, parsed.state, parsed.payload,ee);
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

async function handleLinesMessage(
  db: DB,
  state: LinesMessage["state"],
  payload: LinesMessage["payload"],
  ee: EventEmitter
) {
  const gameId = state.gameId;
  const gameTurn = state.gameTurn;
  const line = payload.line.line;
  const lineScore = payload.line.score;
  const linePositions = payload.line.positions;

  try {
    const fen = await getPositionFen(db, gameId, gameTurn);
    const score = await getPositionScore(db, gameId, gameTurn);
    if (!fen || !score) {
      throw new Error(`Not found game position ${gameId}  ${gameTurn}`);
    }
    const chess = new Chess(fen);
    const linePositions = [
      {
        lan: undefined,
        fen: fen,
        score: {
          unit: score.scoreUnit,
          score: score.scoreValue,
        },
      },
      ...payload.line.positions,
    ].map((pos, lineTurn) => {
      if (pos.lan) {
        const san = chess.move(pos.lan).san;
        return {
          gameId: gameId,
          gameTurn: gameTurn,
          line: line,
          lineTurn: lineTurn,
          san: san,
          lan: pos.lan,
          fen: pos.fen,
          scoreUnit: pos.score.unit,
          scoreValue: Math.pow(-1, lineTurn) * pos.score.score,
        };
      }

      return {
        gameId: gameId,
        gameTurn: gameTurn,
        line: line,
        lineTurn: lineTurn,
        san: undefined,
        lan: undefined,
        fen: pos.fen,
        scoreUnit: pos.score.unit as "cp" | "mate",
        scoreValue: Math.pow(-1, lineTurn) * (pos.score.score ?? 0),
      };
    });
    createLine(db, gameId, gameTurn, line, lineScore, linePositions);
    const proj:OutputLine = {
      gameId,
      gameTurn,
      line,
      scoreUnit: lineScore.unit,
      scoreValue: lineScore.score,
      positions: linePositions.map(pos=>{
        return {
          san: pos.san??null,
          lan: pos.lan??null,
          fen: pos.fen,
          scoreUnit: pos.scoreUnit,
          scoreValue: pos.scoreValue
        }
      })
    }
    ee.emit(`line-${gameId}-${gameTurn}`, proj)
  } catch (err) {
    console.error(err);
  }
}

const tasksQueue = "tasks";
export async function publishScoresTask(
  valkey: Valkey,
  gameId: string,
  fens: string[]
) {
  const message = {
    type: "scores",
    state: {
      gameId: gameId,
    },
    payload: {
      fens: fens,
    },
  };

  await valkey.lpush(tasksQueue, JSON.stringify(message));
}
