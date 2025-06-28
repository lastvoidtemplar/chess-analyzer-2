import { useParams } from "react-router-dom";
import { trpc } from "../hooks/trpc";
import BoardWithPlayers from "./BoardWithPlayers";
import { useGameStore } from "../hooks/store";
import React from "react";
import AnalyzePanel from "./AnanyzePanel";

function Analyze() {
  const { gameId } = useParams();
  const { addGame,  setGame } = useGameStore();
  const { isLoading, error, data } = trpc.getPositions.useQuery({
    gameId: gameId ?? "",
  });

  React.useEffect(() => {
    if (gameId && data&& data.status==="ready") {
      setGame(gameId, data.name, data.positions);
    }
    if (gameId && data && data.status==="generating"){
      addGame(gameId, data.name)
    }
  }, [gameId, data, setGame, addGame]);

  if (isLoading || !gameId) {
    return <div>Loading</div>;
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  if (data && data.status === 'generating'){
    return <div>Still Generating Analyze</div>
  }

  return (
    <div className="h-full w-full flex items-center justify-center gap-12">
      <BoardWithPlayers gameId={gameId}/>
      <AnalyzePanel gameId={gameId} />
    </div>
  );
}

export default Analyze;
