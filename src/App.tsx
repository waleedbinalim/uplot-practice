import { Route, Routes, Link } from "react-router-dom";
import {
  ChartComponent,
  ChartTwoComponent,
  GraphControlComponent,
  TableComponent,
} from "./components";
import { appRoutes } from "./utils";

function App() {
  return (
    <section className="flex gap-2">
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

      <Routes>
        <Route path="/" element={<>hello</>} />
        <Route
          path={appRoutes.chartOne}
          element={
            <>
              <div>
                <GraphControlComponent />
              </div>
              <div className="my-8">
                <ChartComponent />
              </div>
            </>
          }
        />

        <Route
          path={appRoutes.chartTwo}
          element={
            <>
              <div>
                <GraphControlComponent />
              </div>
              <div className="my-8">
                <ChartTwoComponent />
              </div>
            </>
          }
        />

        <Route
          path={appRoutes.table}
          element={
            <>
              <div className="my-2 pb-8">
                <TableComponent />
              </div>
            </>
          }
        />
      </Routes>
    </section>
  );
}

export default App;
