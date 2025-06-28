import React from "react";
import useWindowSize from "../hooks/windowSize";
import WhitePawn from "../assets/white_pawn.png";
import BlackPawn from "../assets/black_pawn.png";
import WhiteRook from "../assets/white_rook.png";
import BlackRook from "../assets/black_rook.png";
import WhiteKnight from "../assets/white_knight.png";
import BlackKnight from "../assets/black_knight.png";
import WhiteBishop from "../assets/white_bishop.png";
import BlackBishop from "../assets/black_bishop.png";
import WhiteQueen from "../assets/white_queen.png";
import BlackQueen from "../assets/black_queen.png";
import WhiteKing from "../assets/white_king.png";
import BlackKing from "../assets/black_king.png";
import { useGameStore } from "../hooks/store";

type BoardWithPlayersProps = {
  gameId: string;
};

function BoardWithPlayers({ gameId }: BoardWithPlayersProps) {
  const white = useGameStore((state) => state.getWhite(gameId));
  const black = useGameStore((state) => state.getBlack(gameId));
  const whiteElo = useGameStore((state) => state.getWhiteElo(gameId));
  const blackElo = useGameStore((state) => state.getBlackElo(gameId));

  return (
    <div className="flex gap-2">
      <EvaluationBar gameId={gameId} />
      <div className="flex flex-col gap-2">
        <PlayerInfo playeName={black} playerElo={blackElo} />
        <Board gameId={gameId} />
        <PlayerInfo playeName={white} playerElo={whiteElo} />
      </div>
    </div>
  );
}

type Piece =
  | ""
  | "P"
  | "R"
  | "N"
  | "B"
  | "Q"
  | "K"
  | "p"
  | "r"
  | "n"
  | "b"
  | "q"
  | "k";

type TileProps = {
  color: string;
  size: number;
  piece: Piece;
};

function Tile({ color, size, piece }: TileProps) {
  const src = React.useMemo(() => {
    let res = "";

    switch (piece) {
      case "":
        res = "";
        break;
      case "P":
        res = WhitePawn;
        break;
      case "R":
        res = WhiteRook;
        break;
      case "N":
        res = WhiteKnight;
        break;
      case "B":
        res = WhiteBishop;
        break;
      case "Q":
        res = WhiteQueen;
        break;
      case "K":
        res = WhiteKing;
        break;
      case "p":
        res = BlackPawn;
        break;
      case "r":
        res = BlackRook;
        break;
      case "n":
        res = BlackKnight;
        break;
      case "b":
        res = BlackBishop;
        break;
      case "q":
        res = BlackQueen;
        break;
      case "k":
        res = BlackKing;
        break;
    }

    return res;
  }, [piece]);
  return (
    <div
      style={{
        minWidth: size,
        minHeight: size,
      }}
      className={
        color === "white"
          ? "bg-white border-1 border-neutral-900"
          : "bg-neutral-900"
      }
    >
      {src !== "" && (
        <img src={src} alt={piece} width={size - 2} height={size - 2} />
      )}
    </div>
  );
}

type BoardProps = {
  gameId: string;
};

function Board({ gameId }: BoardProps) {
  const fen = useGameStore((state) => state.getCurrPosition(gameId));
  const matrix = React.useMemo(() => {
    const pieces = fen.split(" ")[0];
    const rows = pieces.split("/");
    const m: string[][] = [];
    for (let ind = 0; ind < rows.length; ind++) {
      const row = rows[ind];
      m.push([]);
      for (const ch of row) {
        if ("1" <= ch && ch <= "8") {
          const n = parseInt(ch);
          for (let j = 0; j < n; j++) {
            m[ind].push("");
          }
        } else {
          m[ind].push(ch);
        }
      }
    }
    return m;
  }, [fen]);

  const { width, height } = useWindowSize();

  const tileSize = React.useMemo(() => {
    if (width > height) {
      return height / 10;
    }
    return width / 10;
  }, [width, height]);

  return (
    <div>
      {matrix.map((row, r) => {
        return (
          <div key={`row-${r}`} className="flex">
            {row.map((ch, col) => {
              return (
                <Tile
                  key={`tile-${row}-${col}`}
                  color={(r + col) % 2 == 0 ? "white" : "black"}
                  size={tileSize}
                  piece={ch as Piece}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

type EvaluationBarProps = {
  gameId: string;
};

function EvaluationBar({ gameId }: EvaluationBarProps) {
  const scoreUnit = useGameStore((state) => state.getCurrScoreUnit(gameId));
  const scoreValue = useGameStore((state) => state.getCurrScoreValue(gameId));

  const percent = React.useMemo(() => {
    if (!scoreUnit || !scoreValue) {
      return 50;
    }

    if (scoreUnit === "mate") {
      return scoreValue > 0 ? 100 : 0;
    }

    const capped = Math.max(-1000, Math.min(1000, scoreValue));
    return 50 - capped / 20;
  }, [scoreUnit, scoreValue]);

  return (
    <div className="w-14 border-2 flex flex-col">
      <div
        style={{
          height: `${percent}%`,
        }}
        className="relative w-full bg-white transition-all duration-700 ease-in-out"
      >
        {percent == 100 && (
          <p className="text-black text-center absolute bottom-0 left-1/2 -translate-x-1/2">
            {scoreUnit === "mate" ? `${scoreValue}M` : `${scoreValue! / 100}`}
          </p>
        )}
      </div>
      <div className="w-full grow bg-black">
        {percent !== 100 && (
          <p className="text-white text-center">
            {scoreUnit === "mate" ? `${scoreValue}M` : `${scoreValue! / 100}`}
          </p>
        )}
      </div>
    </div>
  );
}

type PlayerInfoProps = {
  playeName: string;
  playerElo: number;
};

function PlayerInfo({ playeName, playerElo }: PlayerInfoProps) {
  return (
    <div className="flex justify-between items-center">
      <div className="text-2xl">{playeName}</div>
      <div className="rounded-lg border-2 text-2xl py-1 px-4">{playerElo}</div>
    </div>
  );
}

export default BoardWithPlayers;
