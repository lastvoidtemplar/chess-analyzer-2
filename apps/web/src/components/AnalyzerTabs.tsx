import clsx from "clsx";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/auth";
import { useGameStore } from "../hooks/store";
import { X } from "lucide-react";

function AnalyzerTabs() {
  const { loggedIn } = useAuth();
  const { games, removeGame } = useGameStore();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col text-xl basis-md w-3/4">
      {loggedIn &&
        games.map((game) => {
          return (
            <NavLink
              key={game.gameId}
              className={({ isActive }) =>
                clsx("py-1 text-center", isActive ? "bg-gray-600" : "")
              }
              to={`/analyze/${game.gameId}`}
            >
              <div className="flex justify-around">
                <p>{game.name}</p>
                <button
                  onClick={ (e:React.MouseEvent) => {
                    e.preventDefault()
                    e.stopPropagation()
                    removeGame(game.gameId);
                    navigate("/", {replace:true});
                  }}
                >
                  <X width={20} height={20} />
                </button>
              </div>
            </NavLink>
          );
        })}
    </div>
  );
}

export default AnalyzerTabs;
