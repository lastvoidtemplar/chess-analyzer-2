import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

function Layout() {
  return (
    <div className="w-full h-full flex items-center">
      <Sidebar />
      <main className="grow h-full">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
