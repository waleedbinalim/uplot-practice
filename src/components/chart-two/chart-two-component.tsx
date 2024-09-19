import React, { useMemo } from "react";
import uPlot from "uplot";
import UplotReact from "uplot-react";
import "uplot/dist/uPlot.min.css";
import { clickZoomPlugin, selectPointPlugin } from "./plot-plugin-two";

const ChartTwoComponent: React.FC = () => {
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
        {
          label: `two`,
          width: 3,
          stroke: "red",
          spanGaps: true,
          points: { show: true, size: 8 },
        },
        {
          label: `three`,
          width: 3,
          stroke: "green",
          spanGaps: true,
          points: { show: true, size: 8 },
        },
        {
          label: `four`,
          width: 3,
          stroke: "yellow",
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
        sync: { key: "metric-data" },
      },
      plugins: [clickZoomPlugin(), selectPointPlugin()],

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

      <p className="opacity-80 text-sm">
        Pending work:
        <ul>
          <li>Correct tooltip color with the graph color</li>
        </ul>
      </p>

      <div className="grid place-content-center ">
        <div className="w-[800px] overflow-hidden">
          <UplotReact
            options={options}
            data={[
              [0, 1, 2, 3, 4, 5, 6],
              [6, 5, 4, 3, 2, 1],
              [6, 4, 5, 10, 11, 0].reverse(),
              [11, 11, 11, 11, 11, 11].reverse(),
              [0, 0, 0, 0, 0, 0].reverse(),
            ]}
          />
        </div>
      </div>
    </>
  );
};

export default ChartTwoComponent;
