import React from "react";
import { useGameStore, type Position } from "../hooks/store";
import {
  ArrowLeft,
  ArrowLeftToLine,
  ArrowRight,
  ArrowRightToLine,
  TextSearch,
  View,
} from "lucide-react";
import clsx from "clsx";
import Form from "./Form";
import Button from "./Button";
import TextArea, { type TextAreaHandle } from "./TextArea";
import { trpc } from "../hooks/trpc";
import { ResponsiveContainer, AreaChart, Area } from "recharts";
import type { CategoricalChartFunc } from "recharts/types/chart/types";

type AnalyzePanelProps = {
  gameId: string;
};

function AnalyzePanel({ gameId }: AnalyzePanelProps) {
  const [panel, setPanel] = React.useState<"positions" | "lines">("positions");
  const { getPositions } = useGameStore();
  const [positions, setPosition] = React.useState<Position[]>([]);

  React.useEffect(() => {
    setPosition(getPositions(gameId));
  }, [gameId, getPositions]);

  return (
    <div className="border-2 w-lg h-11/12 flex flex-col">
      <PositionNoteMenu gameId={gameId} />
      <hr className="mx-4" />
      {panel === "positions" ? (
        <React.Fragment>
          <GameHistory gameId={gameId} positions={positions} />
          <ScoresChart gameId={gameId} />
          <ReviewControlPanel gameId={gameId} setPanel={setPanel} />
        </React.Fragment>
      ) : (
        <React.Fragment>
          <LinesHistory gameId={gameId} />
          <LinesControlPanel gameId={gameId} setPanel={setPanel} />
        </React.Fragment>
      )}
    </div>
  );
}

// type PositionsAnalyzePanelProps = {
//   gameId: string;
//   setPanel: React.Dispatch<React.SetStateAction<"positions" | "lines">>;
// };

// function PositionsAnalyzePanel({
//   gameId,
//   setPanel,
// }: PositionsAnalyzePanelProps) {
//   const { getPositions } = useGameStore();
//   const [positions, setPosition] = React.useState<Position[]>([]);

//   React.useEffect(() => {
//     setPosition(getPositions(gameId));
//   }, [gameId, getPositions]);

//   return (
//     <React.Fragment>
//       <PositionNoteMenu gameId={gameId} />
//       <hr className="mx-4" />
//       <GameHistory gameId={gameId} positions={positions} />
//       <ReviewControlPanel gameId={gameId} setPanel={setPanel} />
//     </React.Fragment>
//   );
// }

// type LinesAnalyzePanelProps = {
//   gameId: string;
//   setPanel: React.Dispatch<React.SetStateAction<"positions" | "lines">>;
// };

// function LinesAnalyzePanel({ gameId, setPanel }: LinesAnalyzePanelProps) {
//   return (
//     <React.Fragment>
//       <PositionNoteMenu gameId={gameId} />
//       <hr className="mx-4" />
//       <LinesHistory gameId={gameId} />
//       <LinesControlPanel gameId={gameId} setPanel={setPanel} />
//     </React.Fragment>
//   );
// }

type PositionNoteMenuProps = {
  gameId: string;
};

function PositionNoteMenu({ gameId }: PositionNoteMenuProps) {
  const currTurn = useGameStore((state) => state.getCurrTurn(gameId));
  const { isLoading, error, data } = trpc.getPositionNote.useQuery({
    gameId: gameId ?? "",
    turn: currTurn,
  });

  const updatePositionNote = trpc.updatePositionNote.useMutation();
  const noteRef = React.useRef<TextAreaHandle>(null);

  const onSubmit = React.useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (noteRef.current) {
        updatePositionNote.mutate({
          gameId: gameId,
          turn: currTurn,
          note: noteRef.current.getValue(),
        });
      }
    },
    [updatePositionNote, gameId, currTurn]
  );

  return (
    <div className="mx-4 my-2">
      <Form className="flex flex-col gap-2" onSubmit={onSubmit}>
        <TextArea
          rows={5}
          fieldName="note"
          ref={noteRef}
          value={
            isLoading
              ? "Loading..."
              : error
                ? error.message
                : (data?.note ?? "")
          }
        />
        <Button>Update Note</Button>
      </Form>
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
    <div className="m-4 my-2 border-2 text-lg grow overflow-y-scroll grid grid-cols-3">
      <span className="px-1 text-lg text-center">{0}.</span>
      <span
        className={clsx(
          "col-span-2 px-1 text-lg text-center",
          currTurn === 0 ? "border-1" : ""
        )}
        onClick={() => setTurn(gameId, 0)}
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

type ReviewControlPanelProps = {
  gameId: string;
  setPanel: React.Dispatch<React.SetStateAction<"positions" | "lines">>;
};

const ButtonSize: number = 56;
function ReviewControlPanel({ gameId, setPanel }: ReviewControlPanelProps) {
  const { firstTurn, pervTurn, nextTurn, lastTurn } = useGameStore();

  return (
    <div className="mx-4 flex flex-col items-center">
      <div className="flex justify-evenly w-full my-2">
        <button className="border-2 px-4" onClick={() => firstTurn(gameId)}>
          <ArrowLeftToLine color="black" size={ButtonSize} />
        </button>
        <button className="border-2 px-4" onClick={() => pervTurn(gameId)}>
          <ArrowLeft color="black" size={ButtonSize} />
        </button>
        <button className="border-2 px-4">
          <TextSearch
            color="black"
            size={ButtonSize}
            onClick={() => setPanel("lines")}
          />
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

type LinesControlPanelProps = {
  gameId: string;
  setPanel: React.Dispatch<React.SetStateAction<"positions" | "lines">>;
};

function LinesControlPanel({ setPanel }: LinesControlPanelProps) {
  return (
    <div className="mx-4 flex-col items-center">
      <div className="flex justify-evenly w-full my-2">
        <button className="border-2 px-4">
          <ArrowLeftToLine color="black" size={ButtonSize} />
        </button>
        <button className="border-2 px-4">
          <ArrowLeft color="black" size={ButtonSize} />
        </button>

        <button className="border-2 px-4">
          <View
            color="black"
            size={ButtonSize}
            onClick={() => setPanel("positions")}
          />
        </button>

        <button className="border-2 px-4">
          <ArrowRight color="black" size={ButtonSize} />
        </button>
        <button className="border-2 px-4">
          <ArrowRightToLine color="black" size={ButtonSize} />
        </button>
      </div>
    </div>
  );
}

type ScoreChartType = {
  gameId: string;
};

const ScoresChart = React.memo(({ gameId }: ScoreChartType) => {
  const { getPositionsScores, setTurn } = useGameStore();
  const [data, setData] = React.useState<ReturnType<typeof getPositionsScores>>(
    []
  );

  React.useEffect(() => {
    setData(getPositionsScores(gameId));
  }, [gameId, getPositionsScores]);

  const onClick = React.useCallback<CategoricalChartFunc>(
    (e) => {
      // type bug in the library
      const turn: number = e.activeLabel as unknown as number;
      setTurn(gameId, turn);
    },
    [gameId, setTurn]
  );

  return (
    <div className="mx-4 flex flex-col items-center">
      <div className="w-full h-28 border-2 no-focus-outline">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            onClick={onClick}
          >
            <Area
              type="monotone"
              dataKey={() => 100}
              stroke="none"
              fill="#222222"
              fillOpacity={0.95}
              isAnimationActive={false}
            />

            <Area
              type="monotone"
              dataKey="percent"
              stroke="#000000"
              fill="#eeeeee"
              fillOpacity={0.95}
              strokeWidth={0}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

type LinesHistoryProps = {
  gameId: string;
};

function LinesHistory({ gameId }: LinesHistoryProps) {
  return (
    <div className="mx-4 mt-2 border-2 text-lg grow overflow-y-scroll grid grid-cols-3">
      {gameId}
    </div>
  );
}

export default AnalyzePanel;
