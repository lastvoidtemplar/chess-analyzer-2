import { create } from "zustand";

type Positions = {
  san: string;
  lan: string;
  fen: string;
};

type GameState =
  | {
      status: "loaded";
      gameId: string;
      name: string;
      currTurn: number;
      positions: Positions[];
    }
  | {
      status: "loading";
      gameId: string;
      name: string;
    };

type GameStore = {
  games: GameState[];
  addGame: (gameId: string, name: string) => void;
  updateName: (gameId: string, name: string) => void;
  removeGame: (gameId: string) => void;
};

export const useGameStore = create<GameStore>((set) => ({
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
  removeGame: (gameId:string)=>{
    set(prev=>({
        games: prev.games.filter((curr)=>curr.gameId!==gameId)
    }))
  }
  //   getGameState: (gameId) => get().games[gameId],
}));
