import clsx from "clsx";
import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/auth";

const games = [
  {
    gameId: "1",
    gameName: "Game 1",
  },
  {
    gameId: "2",
    gameName: "Game 2",
  },
  {
    gameId: "3",
    gameName: "Game 3",
  },
];

function AnalyzerTabs() {
  const {loggedIn} = useAuth()

  return (
    <div className="flex flex-col text-xl basis-md w-3/4">
      {loggedIn && games.map((game) => {
        return (
          <NavLink
            key={game.gameId}
            className={({ isActive }) =>
              clsx("py-1 text-center", isActive ? "bg-gray-600" : "")
            }
            to={`/analyze/${game.gameId}`}
          >
            {game.gameName}
          </NavLink>
        );
      })}
    </div>
  );
}

export default AnalyzerTabs;
