
// import { NavLink, Outlet } from "react-router-dom";
// import { useAuth } from "../hooks/auth";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

function Layout() {
  // const { loggedIn, logout } = useAuth();
  return (
    <div className="w-full h-full flex items-center">
      <Sidebar />
      <main className="grow flex justify-center items-center">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
