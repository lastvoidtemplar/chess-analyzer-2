import React from "react";
import AnalyzerTabs from "./AnalyzerTabs";
import Logo from "./Logo";
import Navbar from "./Navbar";
import UserBar from "./UserBar";
import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";

function Sidebar() {
  const [open, setOpen] = React.useState<boolean>(true);
  return (
    <div className="h-full flex items-center">
      <div
        className={clsx(
          open ? "shrink-0" : "shrink",
          "h-full flex flex-col items-center justify-between border-r-2"
        )}
      >
        {open && (
          <React.Fragment>
            <Logo />
            <Navbar />
            <hr className="w-5/6 my-2" />
            <AnalyzerTabs />
            <UserBar />
          </React.Fragment>
        )}
      </div>
      <button
        className={clsx(
          "w-8 h-16 border-2 z-10 bg-white flex flex-col justify-center",
          open ? "transform -translate-x-1/2" : "transform -translate-x-0.5"
        )}
        onClick={() => setOpen((st) => !st)}
      >
        {open ? (
          <ChevronLeft
            width="2rem"
            height="2rem"
            className="transform -translate-x-0.5"
          />
        ) : (
          <ChevronRight
            width="2rem"
            height="2rem"
            className="transform -translate-x-0.5"
          />
        )}
      </button>
    </div>
  );
}

export default Sidebar;
