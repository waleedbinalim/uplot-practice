import { ChartComponent, GraphControlComponent } from "./components";

function App() {
  return (
    <>
      <div>uPlot Demo Repo</div>

      <div>
        controls
        <div>
          <GraphControlComponent />
        </div>
      </div>

      <div className="my-8">
        <ChartComponent />
      </div>
    </>
  );
}

export default App;
