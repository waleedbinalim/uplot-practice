import { appRoutes } from "@/utils";
import React from "react";
import { Link } from "react-router-dom";

const Sidebar: React.FC = () => {
  return (
    <nav className="w-1/6 bg-blue-300 min-h-screen">
      <p className="font-bold text-center">uPlot Demos</p>

      <ul>
        <Link
          className="mt-2 hover:bg-blue-400 px-4 py-2 mx-1 rounded-md block"
          to={appRoutes.chartOne}
        >
          Chart one
        </Link>

        <Link
          className="mt-2 hover:bg-blue-400 px-4 py-2 mx-1 rounded-md block"
          to={appRoutes.chartTwo}
        >
          Chart two
        </Link>

        <Link
          className="mt-2 hover:bg-blue-400 px-4 py-2 mx-1 rounded-md block"
          to={appRoutes.table}
        >
          Table
        </Link>
      </ul>
    </nav>
  );
};

export default Sidebar;
