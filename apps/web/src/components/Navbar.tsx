import { NavLink } from "react-router-dom";
import cslx from "clsx"
import { useAuth } from "../hooks/auth";

function Navbar() {
  const {loggedIn} = useAuth()
  return (
    <div className="flex flex-col justify-center gap-1 text-2xl w-3/4">
      <NavLink className={({isActive}) =>cslx("py-0.5 text-center",isActive ? "bg-gray-600" : "")} to="/">Home</NavLink>
      {loggedIn && <NavLink className={({isActive}) =>cslx("py-0.5 text-center",isActive ? "bg-gray-600" : "")} to="/games">Games</NavLink>}
      {loggedIn && <NavLink className={({isActive}) =>cslx("py-0.5 text-center",isActive ? "bg-gray-600" : "")} to="/profile">Profile</NavLink>}
    </div>
  );
}

export default Navbar;