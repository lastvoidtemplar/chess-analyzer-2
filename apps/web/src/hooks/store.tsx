import { create } from "zustand";

export type Position = {
  san: string | null;
  lan: string | null;
  fen: string | null;
};

type GameState =
  | {
      status: "loaded";
      gameId: string;
      name: string;
      currTurn: number;
      positions: Position[];
    }
  | {
      status: "loading";
      gameId: string;
      name: string;
    };

type GameStore = {
  games: GameState[];
  addGame: (gameId: string, name: string) => void;
  setGame: (gameId: string, name: string, positions: Position[]) => void;
  updateName: (gameId: string, name: string) => void;
  removeGame: (gameId: string) => void;
  getPositions: (gameId: string) => Position[];
  getCurrTurn: (gameId: string) => number;
  firstTurn: (gameId: string) => void;
  pervTurn: (gameId: string) => void;
  nextTurn: (gameId: string) => void;
  lastTurn: (gameId: string) => void;
  setTurn: (gameId:string, turn: number) =>void
};

export const useGameStore = create<GameStore>((set, get) => ({
  games: [],
  addGame: (gameId: string, name: string) => {
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
          },
        ],
      };
    });
  },
  setGame: (gameId: string, name: string, positions: Position[]) => {
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
            },
          ],
        };
      } else {
        const game = prev.games[ind];
        prev.games[ind] = {
          status: "loaded",
          gameId: gameId,
          name: game.name,
          currTurn: 0,
          positions: positions,
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
      if (!game || game.status === "loading" || turn < 0 || turn > game.positions.length - 1) {
        return prev;
      }
      game.currTurn = turn;
      return {
        games: [...prev.games],
      };
    });
  },
}));
