import clsx from "clsx";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/auth";

function Layout() {
  const {loggedIn, logout} = useAuth()
  return (
    <div className="w-full h-full flex flex-col">
      <nav className="flex justify-around border-b-2">
        <div className="grow flex justify-around">
          <NavLink
            className={({ isActive }) => {
              return clsx("px-2 py-1", isActive ? "bg-amber-700" : "");
            }}
            to="/"
          >
            Home
          </NavLink>
          <NavLink
            className={({ isActive }) => {
              return clsx("px-2 py-1", isActive ? "bg-amber-700" : "");
            }}
            to="/protected"
          >
            Protected
          </NavLink>
        </div>
        {loggedIn&&<button className="px-2 py-1" onClick={()=>logout()}>Logout</button>}
      </nav>
      <main className="grow flex justify-center items-center">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
