import React, { useMemo } from "react";
import uPlot from "uplot";
import UplotReact from "uplot-react";
import "uplot/dist/uPlot.min.css";
import { clickZoomPlugin, panGraphPlugin } from "./plot-plugin-three";
import { chartThreeKey, chartThreeMockData } from "./chart-three.constants";

const ChartThreeComponent: React.FC = () => {
  const fmt = uPlot.fmtDate("{HH}:{mm}");

  const options = useMemo<uPlot.Options>(
    () => ({
      width: 800,
      height: 500,
      // class: metricKey,
      fmtDate: () => fmt,
      series: [
        {},
        {
          label: `one`,
          width: 3,
          stroke: "blue",
          spanGaps: true,
          points: { show: true, size: 8 },
        },
      ],
      legend: { show: false },
      focus: { alpha: 0.3 },
      scales: { y: { auto: true }, x: { auto: true } },
      cursor: {
        drag: { x: false, y: false },
        focus: { prox: 20 },
        bind: { dblclick: () => null },
        sync: { key: chartThreeKey },
      },
      plugins: [clickZoomPlugin(), panGraphPlugin()],

      axes: [{ font: "9px Arial", space: 50 }, { font: "10px Arial" }],
    }),
    []
  );

  return (
    <>
      <h1 className="font-bold text-xl">Click Plugin Demo</h1>
      <p className="opacity-80 text-sm">
        clicking on any point in the graph will draw an outline/tooltip around
        it
      </p>

      <div className="opacity-80 text-sm">
        Pending work:
        <ul>
          <li>Correct tooltip color with the graph color</li>
        </ul>
      </div>

      <div className="grid place-content-center ">
        <div className="w-[800px] overflow-hidden">
          <UplotReact
            options={options}
            data={chartThreeMockData as uPlot.AlignedData}
          />
        </div>
      </div>
    </>
  );
};

export default ChartThreeComponent;
