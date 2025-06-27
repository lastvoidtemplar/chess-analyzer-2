import React from "react";
import useWindowSize from "../hooks/windowSize";



function BoardWithPlayers() {
  return (
    <div className="flex gap-2">
      <EvaluationBar />
      <div className="flex flex-col gap-2">
        <PlayerInfo playeName="Player1" playerElo={1400} />
        <Board />
        <PlayerInfo playeName="Player2" playerElo={1400} />
      </div>
    </div>
  );
}

type TileProps = {
  color: string;
  size: number;
};

function Tile({ color, size }: TileProps) {
  return (
    <React.Fragment>
      {color === "white" ? (
        <div
          style={{
            minWidth: size,
            minHeight: size,
          }}
          className="bg-white border-1 border-neutral-900"
        ></div>
      ) : (
        <div
          style={{
            minWidth: size,
            minHeight: size,
          }}
          className="bg-neutral-900"
        ></div>
      )}
    </React.Fragment>
  );
}

function Board() {
  const { width, height } = useWindowSize();

  const tileSize = React.useMemo(() => {
    if (width > height) {
      return height / 10;
    }
    return width / 10;
  }, [width, height]);

  return (
    <div>
      {[...Array(8)].map((_, row) => {
        return (
          <div key={`row-${row}`} className="flex">
            {[...Array(8)].map((_, col) => {
              return (
                <Tile
                  key={`tile-${row}-${col}`}
                  color={(row + col) % 2 == 0 ? "white" : "black"}
                  size={tileSize}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}                    

function EvaluationBar() {
  return (
    <div className="w-8  border-2">
      <div className="w-full h-1/2 bg-white"></div>
      <div className="w-full h-1/2 bg-black"></div>
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
      <div className="text-2xl">
        {playeName}
      </div>
      <div className="rounded-lg border-2 text-2xl py-1 px-4">
        {playerElo}
      </div>
    </div>
  );
}


export default BoardWithPlayers
