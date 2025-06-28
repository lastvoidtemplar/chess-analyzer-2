import { spawn } from "node:child_process";
import Valkey from "iovalkey";

type FensMessage = {
  type: "fens";
  state: {
    gameId: string;
  };
  payload: {
    moves: string[];
  };
};

type ScoresMessage = {
  type: "scores";
  state: {
    gameId: string;
  };
  payload: {
    fens: string[];
  };
};

type Message = FensMessage | ScoresMessage;

const valkey = new Valkey({
  host: "127.0.0.1",
  port: 6379,
});

const responseQueue = "responses";

async function readTasks(queue: string) {
  while (true) {
    try {
      const result = await valkey.blpop(queue, 0);

      if (result) {
        const [, message] = result;
        const parsed: Message = JSON.parse(message);
        console.log(`Valkey >> Messeage: ${parsed.type}`);
        switch (parsed.type) {
          case "fens":
            const fens = await handleMovesMessage(parsed.payload);
            response(parsed.type, parsed.state, { fens: fens });
            break;
          case "scores":
            const scores = await handleScoresMessage(parsed.payload);
            response(parsed.type, parsed.state, { scores: scores });
            break;
        }
      }
    } catch (err) {
      console.error("Queue read error:", err);
      break;
    }
  }
}

const stockfish = spawn(
  "/home/deyan/build_from_source/Stockfish/src/stockfish"
);

function send(cmd: string) {
  console.log(`Stockfish << ${cmd}`);
  stockfish.stdin.write(cmd + "\n");
}

async function response(type: string, state: any, payload: any) {
  const message = JSON.stringify({
    type: type,
    state: state,
    payload: payload,
  });
  await valkey.rpush(responseQueue, message);
  console.log(`Valkey << ${message}`);
}

function handleMovesMessage(payload: FensMessage["payload"]) {
  return new Promise((resolve: (value: string[]) => void) => {
    let moveInd = 0;
    const moves = payload.moves;
    const fens: string[] = [];
    const handler = (data: any) => {
      const lines: string[] = data.toString().split("\n");
      lines.forEach((line) => {
        if (line.length > 3 && line.substring(0, 3) === "Fen") {
          console.log(`Stockfish >> ${line}`);

          const fen = line.substring(5);
          fens.push(fen);

          if (moveInd === moves.length) {
            stockfish.stdout.removeListener("data", handler);
            resolve(fens);
            return
          }

          send(`position fen ${fen} moves ${moves[moveInd]}`);
          send("d");
          moveInd++;
        }
      });
    };

    stockfish.stdout.on("data", handler);

    send("position startpos");
    send("d");
  });
}

type Score = {
  unit: "cp" | "mate";
  score: number;
};

function handleScoresMessage(payload: ScoresMessage["payload"]) {
  return new Promise((resolve: (value: Score[]) => void) => {
    let fensInd = 1;
    const fens = payload.fens;
    const scores: Score[] = [];
    const handler = (data: any) => {
      const lines: string[] = data.toString().split("\n");
      lines.forEach((line) => {
        if (line.length > 3 && line.substring(0, 22) === "info depth 20 seldepth") {
          console.log(`Stockfish >> ${line}`);

          const splited = line.split(" ");
          const scoreInd = splited.findIndex((curr) => curr === "score");
          scores.push({
            unit: splited[scoreInd + 1] as Score["unit"],
            score: parseInt(splited[scoreInd + 2]),
          });

          if (fensInd === fens.length) {
            stockfish.stdout.removeListener("data", handler);
            resolve(scores);
            return
          }

          send(`position fen ${fens[fensInd]}`);
          send("go depth 20");
          fensInd++;
        }
      });
    };
    if (fens.length > 0) {
      stockfish.stdout.on("data", handler);

      send(`position fen ${fens[0]}`);
      send("go depth 20");
    }
  });
}

send("uci");
send("setoption name Threads value 4");
readTasks("tasks");
