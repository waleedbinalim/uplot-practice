import {
  ChartComponent,
  GraphControlComponent,
  TableComponent,
} from "./components";

function App() {
  return (
    <div className="p-4">
      <h1 className="font-bold text-2xl text-center mb-2">uPlot Demo Repo</h1>

      <div>
        <GraphControlComponent />
      </div>

      <div className="my-8">
        <ChartComponent />
      </div>

      <div className="my-2 pb-8">
        <TableComponent />
      </div>
    </div>
  );
}

export default App;
