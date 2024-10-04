import { useDeviceDataControlsStore } from "@/state";
import uPlot from "uplot";
import { chartThreeKey } from "./chart-three.constants";

export const clickZoomPlugin = () => {
  let dataIdx: null | number = null;
  let seriesIdx: null | number = null;

  const factor = 0.75;

  let xMin: number, xMax: number, xRange: number;

  function clamp(
    nRange: number,
    nMin: number,
    nMax: number,
    fRange: number,
    fMin: number,
    fMax: number
  ) {
    if (nRange > fRange) {
      nMin = fMin;
      nMax = fMax;
    } else if (nMin < fMin) {
      nMin = fMin;
      nMax = fMin + nRange;
    } else if (nMax > fMax) {
      nMax = fMax;
      nMin = fMax - nRange;
    }

    return [nMin, nMax];
  }

  return {
    hooks: {
      ready: (u: uPlot) => {
        xMin = u.scales.x.min!;
        xMax = u.scales.x.max!;

        xRange = xMax - xMin;

        const over = u.over;
        const rect = over.getBoundingClientRect();

        // wheel scroll zoom
        over.addEventListener("click", (e: MouseEvent) => {
          if (seriesIdx && dataIdx) return;
          e.preventDefault();

          const { left } = u.cursor as { left: number };

          const leftPct = left / rect.width;
          const xVal = u.posToVal(left, "x");
          const oxRange = u.scales.x.max! - u.scales.x.min!;

          /* zoomIn zoomOut moveGraph zoomSection */
          const graphControlOption =
            useDeviceDataControlsStore.getState().graphControl;

          if (
            graphControlOption !== "zoomIn" &&
            graphControlOption !== "zoomOut"
          )
            return;

          // No need to assign to zero though
          let nxRange: number;

          if (graphControlOption === "zoomIn") nxRange = oxRange * factor;
          if (graphControlOption === "zoomOut") nxRange = oxRange / factor;

          let nxMin = xVal - leftPct * nxRange!;
          let nxMax = nxMin + nxRange!;
          [nxMin, nxMax] = clamp(nxRange!, nxMin, nxMax, xRange, xMin, xMax);

          const plots = uPlot.sync(chartThreeKey).plots;

          plots.forEach((p) => {
            p.batch(() => p.setScale("x", { min: nxMin, max: nxMax }));
          });
        });
      },
      setCursor: [
        (u: uPlot) => {
          const c = u.cursor;
          const graphControlOption =
            useDeviceDataControlsStore.getState().graphControl;

          // CONDITIONALS ====================================
          const dragNotUndefined = u.cursor.drag !== undefined;
          const isZoomSection = graphControlOption === "zoomSection";
          // =================================================

          if (dataIdx != c.idx) dataIdx = c.idx as number | null;

          if (isZoomSection && dragNotUndefined) u.cursor.drag!.x = true;
          if (!isZoomSection && dragNotUndefined) u.cursor.drag!.x = false;
        },
      ],
      setSeries: [
        //@ts-ignore
        (u: uPlot, sidx: number | null) => {
          if (seriesIdx != sidx) seriesIdx = sidx;
        },
      ],
    },
  };
};

export const panGraphPlugin = () => {
  let dataIdx: null | number = null;
  let seriesIdx: null | number = null;

  function init(u: uPlot) {
    const over = u.over;

    over.addEventListener("click", () => {
      if (seriesIdx !== null && dataIdx !== null) {
        // console.log(dataIdx, seriesIdx);
      }
    });

    over.addEventListener("mousedown", (e) => {
      const graphControlOption =
        useDeviceDataControlsStore.getState().graphControl;

      if (graphControlOption !== "moveGraph") return;

      if (e.button == 0) {
        e.preventDefault();

        const left0 = e.clientX;

        const scXMin0 = u.scales.x.min!;
        const scXMax0 = u.scales.x.max!;

        const xUnitsPerPx = u.posToVal(1, "x") - u.posToVal(0, "x");

        // eslint-disable-next-line no-inner-declarations
        function onmove(e: MouseEvent) {
          e.preventDefault();
          const left1 = e.clientX;
          const dx = xUnitsPerPx * (left1 - left0);

          const newMaxX = scXMax0 - dx;
          const outOfBoundsRight =
            newMaxX >= Math.max(...u.data[0]) && Math.sign(dx) === -1;
          if (outOfBoundsRight) return; // TO PREVENT EXCEEDING RIGHT IF LAST POINT IS PRESENT

          const newMinX = scXMin0 - dx;
          const outOfBoundsLeft =
            Math.sign(dx) === 1 && newMinX <= Math.min(...u.data[0]); // In some cases the sign might need to be reversed based on a project i worked on, maybe if graph is ordinal

          if (outOfBoundsLeft) return; // TO PREVENT EXCEEDING LEFT IF FIRST POINT IS PRESENT

          const plots = uPlot.sync(chartThreeKey).plots;
          plots.forEach((p) => {
            p.setScale("x", { min: scXMin0 - dx, max: scXMax0 - dx });
          });

          // u.setScale("x", { min: scXMin0 - dx, max: scXMax0 - dx }); // FOR SINGULAR DRAG
        }

        // eslint-disable-next-line no-inner-declarations
        function onup() {
          document.removeEventListener("mousemove", onmove);
          document.removeEventListener("mouseup", onup);
        }

        document.addEventListener("mousemove", onmove);
        document.addEventListener("mouseup", onup);
      }
    });
  }

  return {
    hooks: {
      init,
      ready: [
        (u: uPlot) => {
          const over = u.over;

          over.addEventListener("click", () => {
            if (dataIdx != null && seriesIdx != null) {
              //
            }
          });
        },
      ],
      setCursor: [(_u: uPlot) => {}],
      setSeries: [(_u: uPlot, _sidx: number | null) => {}],
      setScale: [(_u: uPlot, _key: string) => {}],
    },
  };
};
