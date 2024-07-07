import React, { useMemo } from "react";
import uPlot from "uplot";
import UplotReact from "uplot-react";
import "uplot/dist/uPlot.min.css";
import { clickZoomPlugin } from "./plot-plugin-one";

const ChartComponent: React.FC = () => {
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
        sync: { key: "metric-data" },
      },
      plugins: [clickZoomPlugin()],
      // plugins: [clickZoomPlugin(), customPlugin()],
      axes: [{ font: "9px Arial", space: 50 }, { font: "10px Arial" }],
    }),
    []
  );

  return (
    <>
      <UplotReact
        options={options}
        data={[
          [0, 1, 2, 3, 4, 5, 6],
          [6, 5, 4, 3, 2, 1],
        ]}
      />
    </>
  );
};

export default ChartComponent;
