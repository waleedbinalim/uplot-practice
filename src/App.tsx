import { Route, Routes } from "react-router-dom";
import {
  ChartComponent,
  ChartThreeComponent,
  ChartTwoComponent,
  GraphControlComponent,
  Sidebar,
  TableComponent,
} from "./components";
import { appRoutes } from "./utils";

function App() {
  return (
    <section className="flex gap-2">
      <Sidebar />

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
          path={appRoutes.chartThree}
          element={
            <>
              <div>
                <GraphControlComponent />
              </div>
              <div className="my-8">
                <ChartThreeComponent />
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
