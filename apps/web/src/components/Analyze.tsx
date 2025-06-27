import { useParams } from "react-router-dom";
import { trpc } from "../hooks/trpc";
import BoardWithPlayers from "./BoardWithPlayers";
import { useGameStore } from "../hooks/store";
import React from "react";
import AnalyzePanel from "./AnanyzePanel";

function Analyze() {
  const { gameId } = useParams();
  const { setGame } = useGameStore();
  const { isLoading, error, data } = trpc.getPositions.useQuery({
    gameId: gameId ?? "",
  });

  React.useEffect(() => {
    if (gameId && data) {
      setGame(gameId, data.name, data.positions);
    }
  }, [gameId, data, setGame]);

  if (isLoading || !gameId) {
    return <div>Loading</div>;
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  return (
    <div className="h-full w-full flex items-center justify-center gap-12">
      <BoardWithPlayers />
      <AnalyzePanel gameId={gameId} />
    </div>
  );
}

export default Analyze;
