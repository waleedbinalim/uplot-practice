import { useClickPluginStore, useDeviceDataControlsStore } from "@/state";
import uPlot from "uplot";

function addCommonDartStyles(dart: HTMLDivElement, seriesIdx: number) {
  dart.style.display = "block";
  dart.style.width = "10px";
  dart.style.height = "10px";
  dart.style.borderRadius = "50%";
  dart.style.outline = `3px solid blue`;
  dart.style.background = "blue";
  dart.style.outlineOffset = `2px`;
  dart.style.position = "absolute";
  dart.style.transform = "translate(-50% , -50%)";
}

function redrawDarts(u: uPlot) {
  const xRange = u.series[0].idxs!;
  const state = useClickPluginStore.getState();

  state.selectedDarts.forEach((dart: string, index: number) => {
    const myDart: HTMLElement | null = document.querySelector("." + dart);

    const splitClass = dart.split("-");

    const dartSeriesIdx = +splitClass?.[1];

    const timeVal = +splitClass?.[3];

    // NEED THIS SINCE INDEXES UPDATE WHENEVER NEW GRAPH TOGGLED
    const updatedIndex = u.data[0].findIndex((valuee) => valuee === timeVal);

    // TEST BLOCK
    const plots = uPlot.sync("metric-data").plots;

    plots.forEach((p) => {
      // TO FIGURE WHAT DOT IS ON WHAT GRAPH WE CAN USE THE CONDITION BELOW

      if (updatedIndex >= xRange[0] && updatedIndex <= xRange[1]) {
        const lft = p.valToPos(p.data[0][updatedIndex], "x");
        const top = p.valToPos(p.data[dartSeriesIdx][updatedIndex]!, "y");

        const offsetLeft = parseFloat(p.over.style.left);
        const offsetTop = parseFloat(p.over.style.top);

        if (!myDart) {
          const newDart = document.createElement("div");
          p?.root?.querySelector(".u-wrap")?.appendChild(newDart);

          newDart.className = dart;

          addCommonDartStyles(newDart, dartSeriesIdx);
          newDart.style.top = offsetTop + +top + "px";
          newDart.style.left = offsetLeft + +lft + "px";

          newDart.addEventListener("click", (e: MouseEvent) => {
            const { className } = e.target as HTMLElement;
            const foundItem = useClickPluginStore
              .getState()
              .selectedDarts.find((item) => item === className);
            state.actions.toggleSelectedDarts(foundItem!);
            newDart.remove();
          });
        } else {
          myDart.style.display = "block";
          myDart.style.left = offsetLeft + +lft + "px";
          myDart.style.top = offsetTop + +top + "px";
        }
      } else {
        if (!myDart) return;
        myDart.style.display = "none";
      }
    });

    return;
  });
}

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

          const plots = uPlot.sync("metric-data").plots;

          plots.forEach((p) => {
            p.batch(() => p.setScale("x", { min: nxMin, max: nxMax }));
            // redrawDarts(u);
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

export const selectPointPlugin = () => {
  let dataIdx: null | number = null;
  let seriesIdx: null | number = null;

  function init(u: uPlot) {
    const over = u.over;

    over.addEventListener("click", () => {
      console.log("OVER");

      if (seriesIdx !== null && dataIdx !== null) {
        console.log(seriesIdx, dataIdx);
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

          // TO PREVENT EXCEEDING RIGHT IF LAST POINT IS PRESENT
          const newMaxX = scXMax0 - dx;
          const outOfBoundsRight =
            newMaxX > Math.max(...u.data[0]) && Math.sign(dx) === -1;
          if (outOfBoundsRight) return;

          // TO PREVENT EXCEEDING LEFT IF FIRST POINT IS PRESENT
          const newMinX = scXMin0 - dx;
          const outOfBoundsLeft =
            Math.sign(dx) === 1 && newMinX < Math.min(...u.data[0]);
          if (outOfBoundsLeft) return;

          const plots = uPlot.sync("metric-data").plots;

          plots.forEach((p) => {
            p.setScale("x", { min: scXMin0 - dx, max: scXMax0 - dx });
          });
          redrawDarts(u);

          // u.setScale("x", { min: scXMin0 - dx, max: scXMax0 - dx });
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

  const addDart = (u: uPlot, over: HTMLDivElement) => {
    const limitReached = false;
    if (limitReached) return;

    const dart = document.createElement("div");
    // `darty-${seriesIdx}-${dataIdx}-${val}`;
    const timeVal = u.data[0][dataIdx!];
    const val = u.data[seriesIdx!][dataIdx!];

    dart.className = `darty-${seriesIdx}-${dataIdx}-${timeVal}-${val}`;

    // ADD TO READY FOR EXFIL POINT

    const state = useClickPluginStore.getState();

    let copy = [...(u.data[seriesIdx!] as (number | string)[])];
    copy[dataIdx!] = "FOUND VALUE";
    copy = copy.filter((val) => val !== null);

    const containerClassname = "." + u.root.className.split(" ").join(" .");
    dart.dataset.info = containerClassname;

    if (state.selectedDarts.includes(dart.className) === true || limitReached)
      return;

    state.actions.toggleSelectedDarts(dart.className);

    addCommonDartStyles(dart, seriesIdx!);

    dart.addEventListener("click", (e: MouseEvent) => {
      const { className } = e.target as HTMLElement;
      const foundItem = useClickPluginStore
        .getState()
        .selectedDarts.find((item) => item === className);
      useClickPluginStore.getState().actions.toggleSelectedDarts(foundItem!);
      dart.remove();
    });

    over.style.cursor = "pointer";

    const top = u.valToPos(u.data[seriesIdx!][dataIdx!]!, "y");
    const lft = u.valToPos(u.data[0][dataIdx!], "x");

    const offsetLeft = parseFloat(over.style.left);
    const offsetTop = parseFloat(over.style.top);

    dart.style.top = offsetTop + top + "px";
    dart.style.left = offsetLeft + lft + "px";

    u?.root?.querySelector(".u-wrap")?.appendChild(dart);
  };

  return {
    hooks: {
      init,
      ready: [
        (u: uPlot) => {
          const over = u.over;

          over.addEventListener("click", () => {
            if (dataIdx != null && seriesIdx != null) addDart(u, over);
          });
        },
      ],
      setCursor: [
        (u: uPlot) => {
          const c = u.cursor;
          if (dataIdx != c.idx) dataIdx = c.idx as number | null;
        },
      ],
      setSeries: [
        //@ts-ignore
        (u: uPlot, sidx: number | null) => {
          if (seriesIdx != sidx) seriesIdx = sidx;
        },
      ],
      setScale: [
        (u: uPlot, key: string) => {
          if (key == "x") redrawDarts(u);
        },
      ],
    },
  };
};
