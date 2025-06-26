import { Chess } from "chess.js";

type PGNHeaders = Record<string, string>;

type ParsedPGN = {
  headers: PGNHeaders;
  moves: string[];
  result: string;
};

export function parsePGN(pgn: string): ParsedPGN {
  const chess = new Chess();
  chess.loadPgn(pgn)

  const headers = chess.getHeaders()
  const sanMoves= chess.history()
  const lanMoves = convertToLAN(sanMoves)
  const result = headers.Result
  return {
    headers: headers,
    moves: lanMoves,
    result: result
  }
}

// before I find chess.js
function parsePGNHeaders(pgn: string): [Map<string, string>, string] {
  const headers = new Map();

  while (true) {
    pgn = pgn.trimStart();
    if (pgn.length === 0 || pgn[0] !== "[") {
      break;
    }

    if (pgn.length === 1) {
      console.log(pgn);
      throw new Error("Syntax Error");
    }
    pgn = pgn.substring(1).trimStart();

    let ind = 0;
    while (ind < pgn.length && isWordCharacter(pgn[ind])) {
      ind++;
    }

    const key = pgn.substring(0, ind);

    if (ind === pgn.length) {
      console.log(key, pgn);
      throw new Error("Syntax Error");
    }

    pgn = pgn.substring(ind).trimStart();
    if (pgn.length === 0 && pgn[0] !== `"`) {
      console.log(key, pgn);
      throw new Error("Syntax Error");
    }

    ind = 1;
    while (ind < pgn.length && pgn[ind] !== `"`) {
      ind++;
    }

    if (ind === pgn.length) {
      console.log(key, pgn);
      throw new Error("Syntax Error");
    }

    const val = pgn.substring(1, ind);
    pgn = pgn.substring(ind + 1).trimStart();

    if (pgn.length === 1 || pgn[0] !== "]") {
      console.log(key, pgn);
      throw new Error("Syntax Error");
    }

    pgn = pgn.substring(1);

    headers.set(key, val);
  }

  return [headers, pgn];
}

// before I find chess.js
function parsePGNBody(pgn: string): [string[], string] {
  const moves: string[] = [];
  while (true) {
    pgn = pgn.trimStart();

    let ind = 0;
    while (ind < pgn.length && isNumberSymbol(pgn[ind])) {
      ind++;
    }

    if (ind === pgn.length || (pgn[ind] !== "-" && pgn[ind] !== ".")) {
      console.log(moves, pgn);
      throw new Error("Syntax Error");
    }

    if (pgn[ind] === "-") {
      ind++;
      while (ind < pgn.length && isNumberSymbol(pgn[ind])) {
        ind++;
      }
      const result = pgn.substring(0, ind);
      return [moves, result];
    }

    if (pgn[ind] === ".") {
      pgn = pgn.substring(ind + 1).trimStart();

      ind = 0;
      while (ind < pgn.length && isNotationSymbol(pgn[ind])) {
        ind++;
      }

      if (ind === pgn.length) {
        throw new Error("Syntax Error");
      }
      moves.push(pgn.substring(0, ind));

      pgn = pgn.substring(ind + 1).trimStart();
      ind = 0;
      while (ind < pgn.length && isNotationSymbol(pgn[ind])) {
        ind++;
      }

      if (ind === pgn.length) {
        throw new Error("Syntax Error");
      }
      moves.push(pgn.substring(0, ind));
      pgn = pgn.substring(ind + 1).trimStart();
    }
  }
}

function isNumberSymbol(ch: string) {
  return ("0" <= ch && ch <= "9") || ch === "/";
}

const notationSymbol = "KQRBNabcdefgh12345678x=+#O-";

function isNotationSymbol(ch: string) {
  return notationSymbol.includes(ch);
}

function isWordCharacter(ch: string) {
  return (
    ("a" <= ch && ch <= "z") ||
    ("A" <= ch && ch <= "Z") ||
    ("0" <= ch && ch <= "9") ||
    ch === "_"
  );
}

// Long Algebraic Notation
function convertToLAN(sanMoves: string[]) {
  const chess = new Chess();
  const lanMoves: string[] = [];

  for (const sanMove of sanMoves) {
    const move = chess.move(sanMove);
    
    if (!move) {
      throw new Error(`Invalid move in sequence: ${sanMove}`);
    }

    const lan = move.from + move.to + (move.promotion || '');
    lanMoves.push(lan);
  }
  
  return lanMoves;
}
