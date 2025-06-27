import React from "react";
import Ollama from "../assets/ollama.png";
import Graph from "../assets/graph.png";
import { useGameStore, type Position } from "../hooks/store";
import {
  ArrowLeft,
  ArrowLeftToLine,
  ArrowRight,
  ArrowRightToLine,
} from "lucide-react";
import clsx from "clsx";

type AnalyzePanelProps = {
  gameId: string;
};

function AnalyzePanel({ gameId }: AnalyzePanelProps) {
  const [tab, setTab] = React.useState(() => 0);

  return (
    <div className="border-2 w-lg h-11/12 flex flex-col">
      <div className="flex w-full">
        <button
          className={`border-b-2 grow text-center text-3xl ${
            tab === 0 ? "bg-gray-600" : ""
          }`}
          onClick={() => setTab(0)}
        >
          Game
        </button>
        <button
          className={`border-b-2 border-l-2 grow text-center text-3xl ${
            tab === 1 ? "bg-gray-600" : ""
          }`}
          onClick={() => setTab(1)}
        >
          Lines
        </button>
      </div>
      {tab === 0 ? (
        <PositionsAnalyzePanel gameId={gameId} />
      ) : tab === 1 ? (
        <LinesAnalyzePanel />
      ) : undefined}
    </div>
  );
}

function PositionsAnalyzePanel({ gameId }: AnalyzePanelProps) {
  const { getPositions } = useGameStore();
  const [positions, setPosition] = React.useState<Position[]>([]);

  React.useEffect(() => {
    setPosition(getPositions(gameId));
  }, [gameId, getPositions]);

  return (
    <React.Fragment>
      <MoveExplanationSection />
      <GameHistory gameId={gameId} positions={positions} />
      <ReviewControlPanel gameId={gameId} />
    </React.Fragment>
  );
}

function LinesAnalyzePanel() {
  return <div></div>;
  // return     <React.Fragment>
  //   <MoveExplanationSection />
  //   <LinesSection />
  //   <PgnDisplay>
  //     1. e4 e5 2. Nf3 Nc6 3. Nc3 Bc5 4. Qe2 d6 5. a4 Nf6 6. Ng5 O-O 7. g4 Bxg4
  //     8. Qe3 Bxe3 9. fxe3 Qd7 10. Rg1 Be6 11. Nb5 d5 12. exd5 Qxd5 13. Rg4
  //     Bxg4 14. Bd3 g6 15. Ne4 Nxe
  //   </PgnDisplay>
  //   <LinesControlPanel />
  // </React.Fragment>
}

function MoveExplanationSection() {
  return (
    <div className="mx-4 mt-4">
      <div className="relative p-4 rounded-lg border-2">
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Explicabo,
        amet natus? Esse sapiente incidunt corrupti architecto assumenda atque,
        debitis minima minus soluta voluptates voluptatum culpa earum harum hic
        ex maxime!
        <div
          className="absolute -bottom-2 left-4 w-0 h-0 
              border-l-8 border-l-transparent 
              border-r-8 border-r-transparent 
              border-t-8 border-t-black"
        ></div>
      </div>
      <img src={Ollama} className="w-12 pl-1" />
    </div>
  );
}

type GameHistoryProps = {
  gameId: string;
  positions: Position[];
};

function GameHistory({ gameId, positions }: GameHistoryProps) {
  const currTurn = useGameStore((state) => state.getCurrTurn(gameId));
  const { setTurn } = useGameStore();

  const groupByTurns = React.useMemo(() => {
    const arr: { num: number; white: string; black?: string }[] = [];
    for (let ind = 1; ind < positions.length; ind += 2) {
      const white = positions[ind].san!;
      const black =
        ind + 1 < positions.length ? positions[ind + 1].san! : undefined;
      arr.push({ num: arr.length + 1, white, black });
    }
    return arr;
  }, [positions]);

  return (
    <div className="m-4 border-2 text-lg grow overflow-y-scroll grid grid-cols-3">
      <span className="px-1 text-lg text-center">{0}.</span>
      <span
        className={clsx(
          "col-span-2 px-1 text-lg text-center",
          currTurn === 0 ? "border-1" : ""
        )}
        onClick={()=>setTurn(gameId, 0)}
      >
        Starting position
      </span>
      {groupByTurns.map((turn) => {
        return (
          <React.Fragment key={`turn-${turn.num}`}>
            <span className="px-1 text-lg text-center">{turn.num}.</span>
            <button
              className={clsx(
                "px-1 text-lg text-center",
                currTurn === 2 * turn.num - 1 ? "border-1" : ""
              )}
              onClick={() => setTurn(gameId, 2 * turn.num - 1)}
            >
              {turn.white}
            </button>
            {turn.black ? (
              <button
                className={clsx(
                  "px-1 text-lg text-center",
                  currTurn === 2 * turn.num ? "border-1" : ""
                )}
                onClick={() => setTurn(gameId, 2 * turn.num)}
              >
                {turn.black}
              </button>
            ) : null}
          </React.Fragment>
        );
      })}
    </div>
  );
}

type ReviewControlPanelType = {
  gameId: string;
};

const ButtonSize: number = 56;
function ReviewControlPanel({ gameId }: ReviewControlPanelType) {
  const { firstTurn, pervTurn, nextTurn, lastTurn } = useGameStore();

  return (
    <div className="mx-4 mb-2 flex flex-col items-center">
      <img src={Graph} className="h-28 mb-2" />
      <div className="flex justify-evenly w-full my-2">
        <button className="border-2 px-4" onClick={() => firstTurn(gameId)}>
          <ArrowLeftToLine color="black" size={ButtonSize} />
        </button>
        <button className="border-2 px-4" onClick={() => pervTurn(gameId)}>
          <ArrowLeft color="black" size={ButtonSize} />
        </button>
        <button className="border-2 px-4" onClick={() => nextTurn(gameId)}>
          <ArrowRight color="black" size={ButtonSize} />
        </button>
        <button className="border-2 px-4" onClick={() => lastTurn(gameId)}>
          <ArrowRightToLine color="black" size={ButtonSize} />
        </button>
      </div>
    </div>
  );
}

export default AnalyzePanel;
