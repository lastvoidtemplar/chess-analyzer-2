import { create } from "zustand";

export type Position = {
  san: string | null;
  lan: string | null;
  fen: string | null;
  scoreUnit: "cp" | "mate" | null;
  scoreValue: number | null;
};

type GameState =
  | {
      status: "loaded";
      gameId: string;
      name: string;
      currTurn: number;
      positions: Position[];
      white: string;
      black: string;
      whiteElo: number;
      blackElo: number;
    }
  | {
      status: "loading";
      gameId: string;
      name: string;
      white: string;
      black: string;
      whiteElo: number;
      blackElo: number;
    };

type GameStore = {
  games: GameState[];
  addGame: (
    gameId: string,
    name: string,
    white?: string,
    black?: string,
    whiteElo?: number,
    blackElo?: number
  ) => void;
  setGame: (
    gameId: string,
    name: string,
    white: string,
    black: string,
    whiteElo: number,
    blackElo: number,
    positions: Position[]
  ) => void;
  updateName: (gameId: string, name: string) => void;
  removeGame: (gameId: string) => void;
  getPositions: (gameId: string) => Position[];
  getCurrTurn: (gameId: string) => number;
  firstTurn: (gameId: string) => void;
  pervTurn: (gameId: string) => void;
  nextTurn: (gameId: string) => void;
  lastTurn: (gameId: string) => void;
  setTurn: (gameId: string, turn: number) => void;
  getCurrPosition: (gameId: string) => string;
  getCurrScoreUnit: (gameId: string) => "cp" | "mate" | null;
  getCurrScoreValue: (gameId: string) => number | null;
  getWhite: (gameId: string) => string;
  getBlack: (gameId: string) => string;
  getWhiteElo: (gameId: string) => number;
  getBlackElo: (gameId: string) => number;
};

export const useGameStore = create<GameStore>((set, get) => ({
  games: [],
  addGame: (
    gameId: string,
    name: string,
    white: string = "Player 1",
    black: string = "Player 2",
    whiteElo: number = 1400,
    blackElo: number = 1400
  ) => {
    set((prev) => {
      const ind = prev.games.findIndex((curr) => curr.gameId === gameId);
      if (ind !== -1) {
        return prev;
      }

      return {
        games: [
          ...prev.games,
          {
            status: "loading",
            gameId: gameId,
            name: name,
            white,
            black,
            whiteElo,
            blackElo,
          },
        ],
      };
    });
  },
  setGame: (
    gameId: string,
    name: string,
    white: string,
    black: string,
    whiteElo: number,
    blackElo: number,
    positions: Position[]
  ) => {
    set((prev) => {
      const ind = prev.games.findIndex((curr) => curr.gameId === gameId);
      if (ind === -1) {
        return {
          games: [
            ...prev.games,
            {
              status: "loaded",
              gameId: gameId,
              name: name,
              currTurn: 0,
              positions: positions,
              white,
              black,
              whiteElo,
              blackElo,
            },
          ],
        };
      } else {
        const game = prev.games[ind];

        if (game.status === "loaded") {
          return prev;
        }

        prev.games[ind] = {
          status: "loaded",
          gameId: gameId,
          name: game.name,
          currTurn: 0,
          positions: positions,
          white,
          black,
          whiteElo,
          blackElo,
        };
      }
      return {
        games: [...prev.games],
      };
    });
  },
  updateName: (gameId: string, name: string) => {
    set((prev) => {
      const ind = prev.games.findIndex((curr) => curr.gameId === gameId);
      if (ind === -1) {
        return prev;
      }
      prev.games[ind].name = name;
      return {
        games: [...prev.games],
      };
    });
  },
  removeGame: (gameId: string) => {
    set((prev) => ({
      games: prev.games.filter((curr) => curr.gameId !== gameId),
    }));
  },
  getPositions: (gameId: string) => {
    const game = get().games.find((curr) => curr.gameId === gameId);
    if (!game || game.status === "loading") {
      return [];
    }
    return game.positions;
  },
  getCurrTurn: (gameId: string) => {
    const game = get().games.find((curr) => curr.gameId === gameId);
    if (!game || game.status === "loading") {
      return -1;
    }
    return game.currTurn;
  },
  firstTurn: (gameId: string) => {
    set((prev) => {
      const game = prev.games.find((curr) => curr.gameId === gameId);
      if (!game || game.status === "loading") {
        return prev;
      }
      game.currTurn = 0;
      return {
        games: [...prev.games],
      };
    });
  },
  pervTurn: (gameId: string) => {
    set((prev) => {
      const game = prev.games.find((curr) => curr.gameId === gameId);
      if (!game || game.status === "loading") {
        return prev;
      }
      if (game.currTurn > 0) {
        game.currTurn--;
      }
      return {
        games: [...prev.games],
      };
    });
  },
  nextTurn: (gameId: string) => {
    set((prev) => {
      const game = prev.games.find((curr) => curr.gameId === gameId);
      if (!game || game.status === "loading") {
        return prev;
      }
      if (game.currTurn < game.positions.length - 1) {
        game.currTurn++;
      }
      return {
        games: [...prev.games],
      };
    });
  },
  lastTurn: (gameId: string) => {
    set((prev) => {
      const game = prev.games.find((curr) => curr.gameId === gameId);
      if (!game || game.status === "loading") {
        return prev;
      }
      game.currTurn = game.positions.length - 1;
      return {
        games: [...prev.games],
      };
    });
  },
  setTurn: (gameId: string, turn: number) => {
    set((prev) => {
      const game = prev.games.find((curr) => curr.gameId === gameId);
      if (
        !game ||
        game.status === "loading" ||
        turn < 0 ||
        turn > game.positions.length - 1
      ) {
        return prev;
      }
      game.currTurn = turn;
      return {
        games: [...prev.games],
      };
    });
  },
  getCurrPosition: (gameId: string) => {
    const game = get().games.find((curr) => curr.gameId === gameId);
    if (!game || game.status === "loading") {
      return "";
    }
    return game.positions[game.currTurn].fen ?? "";
  },
  getCurrScoreUnit: (gameId: string) => {
    const game = get().games.find((curr) => curr.gameId === gameId);
    if (!game || game.status === "loading") {
      return null;
    }
    return game.positions[game.currTurn].scoreUnit;
  },
  getCurrScoreValue: (gameId: string) => {
    const game = get().games.find((curr) => curr.gameId === gameId);
    if (!game || game.status === "loading") {
      return null;
    }
    return game.positions[game.currTurn].scoreValue;
  }, 
  getWhite: (gameId: string) => {
    const game = get().games.find((curr) => curr.gameId === gameId);
    if (!game) {
      return "";
    }
    return game.white;
  }, 
   getBlack: (gameId: string) => {
    const game = get().games.find((curr) => curr.gameId === gameId);
    if (!game) {
      return "";
    }
    return game.black;
  }, 
   getWhiteElo: (gameId: string) => {
    const game = get().games.find((curr) => curr.gameId === gameId);
    if (!game) {
      return 0;
    }
    return game.whiteElo;
  }, 
   getBlackElo: (gameId: string) => {
    const game = get().games.find((curr) => curr.gameId === gameId);
    if (!game) {
      return 0;
    }
    return game.blackElo;
  },
}));
