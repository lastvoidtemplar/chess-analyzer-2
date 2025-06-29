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

type LinesMessage = {
  type: "lines";
  state: {
    gameId: string;
    gameTurn: number;
  };
  payload: {
    fen: string;
  };
};

type Message = FensMessage | ScoresMessage | LinesMessage;

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
          case "lines":
            await handleLinesMessage(parsed.state, parsed.payload);
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
            return;
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
        if (
          line.length > 3 &&
          line.substring(0, 22) === "info depth 20 seldepth"
        ) {
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
            return;
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

type LinePosition = {
  lan: string;
  fen: string;
  score: Score;
};
type Line = {
  line: number;
  score: Score
  positions: LinePosition[];
};

function handleLinesMessage(
  state: LinesMessage["state"],
  payload: LinesMessage["payload"]
) {
  return new Promise((resolve) => {
    let lineInd1 = 0;
    let lineInd2 = 0;
    let lansInd = 0;
    let fens: string[] = [];
    const fen = payload.fen;
    const scores: Score[] = [];
    const lans: string[][] = [];
    const positions: LinePosition[][] = [];
    const handler = (data: any) => {
      const lines: string[] = data.toString().split("\n");
      lines.forEach((line) => {
        if (
          lineInd1 < 3 &&
          line.length > 22 &&
          line.substring(0, 22) === "info depth 20 seldepth"
        ) {
          console.log(`Stockfish >> ${line}`);

          const splited = line.split(" ");

          const scoreInd = splited.findIndex((curr) => curr === "score");
          scores.push({
            unit: splited[scoreInd + 1] as Score["unit"],
            score: parseInt(splited[scoreInd + 2]),
          });

          const pvInd = splited.findIndex((curr) => curr === "pv");
          const l = splited.filter((_, ind) => {
            return ind > pvInd;
          });
          lans.push(l);
          
          lineInd1++;

          if (lineInd1 === 3) {
            positions.push([]);
            send("setoption name MultiPV value 1");
            send(`position fen ${fen} moves ${lans[0][0]}`);
            send("d");
          }
        } else if (
          fens.length === lansInd &&
          line.length > 3 &&
          line.substring(0, 3) === "Fen"
        ) {
          console.log(`Stockfish >> ${line}`);

          const fen = line.substring(5);
          fens.push(fen);

          send(`position fen ${fen}`);
          send("go depth 20");
        } else if (
          line.length > 3 &&
          line.substring(0, 22) === "info depth 20 seldepth"
        ) {
          console.log(`Stockfish >> ${line}`);

          const splited = line.split(" ");
          const scoreInd = splited.findIndex((curr) => curr === "score");

          positions[lineInd2].push({
            lan: lans[lineInd2][lansInd],
            fen: fens[lansInd],
            score: {
              unit: splited[scoreInd + 1] as Score["unit"],
              score: parseInt(splited[scoreInd + 2]),
            },
          });

          lansInd++;

          if (lansInd === lans[lineInd2].length) {
            lansInd = 0;
            fens = [];
            lineInd2++;
            positions.push([]);

            if (lineInd2 === 3) {
              const line: Line = {
                line: lineInd2,
                score: scores[lineInd2-1],
                positions: positions[lineInd2 - 1],
              };
              response("lines", state, {line:line}).then(() => {
               stockfish.stdout.removeListener("data", handler);
                resolve(0)
              });
            } else {
              const line: Line = {
                line: lineInd2,
                score: scores[lineInd2-1],
                positions: positions[lineInd2 - 1],
              };
              response("lines", state, {line:line}).then(() => {
                send(`position fen ${fen} moves ${lans[lineInd2][0]}`);
                send("d");
              });
            }
          } else {
            send(`position fen ${fens[lansInd - 1]}`);
            send("d");
          }
        }
      });
    };
    stockfish.stdout.on("data", handler);

    send("setoption name MultiPV value 3");
    send(`position fen ${fen}`);
    send("go depth 20");
  });
}

send("uci");
send("setoption name Threads value 4");
readTasks("tasks");
