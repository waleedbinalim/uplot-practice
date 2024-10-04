import { useDeviceDataControlsStore, useGraphThreeStore } from "@/state";
import uPlot from "uplot";
import { chartThreeKey } from "./chart-three.constants";
import { addSeconds, intervalToDuration } from "date-fns";

const line1Class = "line1";
const limitLineClass = "limitLine";
const handle1Class = "handle1";
const line2Class = "line2";
const handle2Class = "handle2";
const timerDivClass = "timerDiv";
let TIME_LIMIT_SECONDS = 900;

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

export const timeSliderPlugin = () => {
  type LineStyleArgs = {
    line: HTMLDivElement;
    className: string;
    color?: string;
  };
  function addLineStyles({ line, className, color }: LineStyleArgs) {
    line.className = className;
    line.style.width = "3px";
    line.style.background = color ?? "#373737";
    line.style.position = "absolute";
    line.style.cursor = "pointer";
    line.style.display = "flex";
    line.style.justifyContent = "center";
    line.style.alignItems = "center";
  }

  type HandleFuncArgs = {
    handle: HTMLDivElement;
    color?: string;
    className: string;
  };
  function addCommonHandleStyles({ handle, color, className }: HandleFuncArgs) {
    handle.className = className;
    handle.style.width = "12px";
    handle.style.height = "32px";
    handle.style.border = "2px solid #373737";
    handle.style.background = color ?? "#373737";
    handle.style.position = "absolute";
    handle.style.borderRadius = "8px";
  }

  function makeTimerDiv({
    distance1,
    distance2,
  }: {
    distance1: number;
    distance2: number;
  }) {
    document?.querySelectorAll("." + timerDivClass).forEach((div) => {
      div?.remove();
    });

    document?.querySelectorAll("." + line1Class)?.forEach((line) => {
      const timerDiv = document.createElement("div");
      timerDiv.className = timerDivClass;

      timerDiv.style.position = "absolute";
      timerDiv.style.top = "0px";
      timerDiv.style.left = "0px";
      timerDiv.style.background = "#373737";
      timerDiv.style.width = distance2 - distance1 + "px";
      timerDiv.style.height = 24 + "px";
      timerDiv.style.color = "#fff";
      timerDiv.style.verticalAlign = "middle";
      timerDiv.style.lineHeight = "24px";
      timerDiv.style.fontSize = "10px";
      timerDiv.style.textAlign = "center";
      timerDiv.style.borderTopRightRadius = "2px";
      timerDiv.style.borderTopLeftRadius = "2px";
      line.appendChild(timerDiv);
      return timerDiv;
    });
  }

  type TimeTextArgs = { startDate: number; endDate: number };
  function generateTimeSpanText({ startDate, endDate }: TimeTextArgs) {
    const { minutes, seconds } = intervalToDuration({
      start: new Date(startDate),
      end: new Date(endDate),
    });

    console.log(
      intervalToDuration({
        start: new Date(startDate),
        end: new Date(endDate),
      })
    );

    const mins = `${minutes ?? 0}`.padStart(2, "0");
    const secs = `${seconds}`.padStart(2, "0");

    const isExceeded = minutes! * 60 + seconds! > TIME_LIMIT_SECONDS;

    return { text: `${mins}:${secs}`, isExceeded };
  }

  function setStartEndTimes(u: uPlot) {
    const plotLeft = u.over.getBoundingClientRect().left;

    const line1 = document.querySelector<HTMLElement>("." + line1Class)!;
    const { left: line1Left, width: line1Width } =
      line1.getBoundingClientRect();
    const line1middleOfDiv = line1Left + line1Width;
    const line1xPos = line1middleOfDiv - plotLeft;

    const line2 = document.querySelector<HTMLElement>("." + line2Class)!;
    const { left: line2Left, width: line2Width } =
      line2.getBoundingClientRect();
    const line2middleOfDiv = line2Left + line2Width;
    const line2xPos = line2middleOfDiv - plotLeft;

    const t1 = `${u.posToVal(line1xPos, "x")}`;
    const t2 = `${u.posToVal(line2xPos, "x")}`;

    useGraphThreeStore.setState((state) => ({ ...state, t1, t2 }));
  }

  function readyFunc(u: uPlot) {
    const offsetTop = parseFloat(u.over.style.top);
    const offsetLeft = parseFloat(u.over.style.left);
    const plotHeight = u.over.clientHeight;

    const startLine = document.createElement("div");
    addLineStyles({ line: startLine, className: line1Class });
    startLine.style.top = 0 + offsetTop + "px";
    startLine.style.left = 0 + offsetLeft + "px";
    startLine.style.height = plotHeight + "px";

    const handle1 = document.createElement("div");
    addCommonHandleStyles({ handle: handle1, className: handle1Class });

    const endLine = document.createElement("div");
    addLineStyles({ line: endLine, color: "#373737", className: line2Class });
    endLine.style.top = 0 + offsetTop + "px";
    endLine.style.left = 0 + offsetLeft + 50 + "px";
    endLine.style.height = plotHeight + "px";

    const handle2 = document.createElement("div");
    addCommonHandleStyles({
      handle: handle2,
      color: "white",
      className: handle2Class,
    });

    // DOM APPENDING ==========================================
    startLine.appendChild(handle1);
    endLine.appendChild(handle2);

    u?.root?.querySelector(".u-wrap")?.appendChild(startLine);
    u?.root?.querySelector(".u-wrap")?.appendChild(endLine);
    // ========================================================

    startLine.addEventListener("mousedown", (e: MouseEvent) => {
      const oldLine1Distance = +startLine.style.left.split("px")[0];
      const oldLine2Distance = +endLine.style.left.split("px")[0];

      const OldLimitLineDist = +document
        ?.querySelector("." + limitLineClass)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        ?.style?.left.split("px")[0];

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

          const newPos = left1 - left0;
          const newLine1Pos = oldLine1Distance + newPos;
          const newLine2Pos = oldLine2Distance + newPos;

          const { text, isExceeded } = generateTimeSpanText({
            startDate: u.posToVal(newLine1Pos, "x") * 1000,
            endDate: u.posToVal(newLine2Pos, "x") * 1000,
          });

          makeTimerDiv({
            distance1: oldLine1Distance,
            distance2: oldLine2Distance,
          });

          document
            ?.querySelectorAll<HTMLElement>("." + timerDivClass)
            ?.forEach((div) => {
              div.innerText = text;
            });
          if (isExceeded) {
            document
              ?.querySelectorAll<HTMLElement>("." + timerDivClass)
              ?.forEach((div) => {
                div.style.background = "#D83020";
              });
            // yourTimerDiv.style.background = "#D83020";
          }
          // BOOLEANS ==========================================
          const leftMove = Math.sign(dx) === -1;
          const rightMove = Math.sign(dx) === 1;
          const leftLimit = u.valToPos(scXMin0, "x") + offsetLeft;
          const rightLimit = u.valToPos(scXMax0, "x") + offsetLeft;
          // ===================================================

          function changeLimitLinePos() {
            if (isExceeded && OldLimitLineDist) {
              const limitLine: HTMLElement = document.querySelector(
                "." + limitLineClass
              )!;
              limitLine.style.left = +OldLimitLineDist + newPos + "px";
            }
          }

          if (leftMove && newLine1Pos > leftLimit) {
            document
              ?.querySelectorAll<HTMLElement>(`.${line1Class}`)
              .forEach((line) => {
                line.style.left = newLine1Pos + "px";
              });
            document
              ?.querySelectorAll<HTMLElement>(`.${line2Class}`)
              .forEach((line) => {
                line.style.left = newLine2Pos + "px";
                changeLimitLinePos();
              });

            // DO NOT REMOVE CODE BELOW MOVES ONE LINE ON MULTI GRAPHS
            // startLine.style.left = newLine1Pos + "px";
            // endLine.style.left = newLine2Pos + "px";
            // changeLimitLinePos();
          }

          if (
            rightMove &&
            newLine1Pos < rightLimit &&
            newLine2Pos < rightLimit
          ) {
            document
              ?.querySelectorAll<HTMLElement>(`.${line1Class}`)
              .forEach((line) => {
                line.style.left = newLine1Pos + "px";
              });
            document
              ?.querySelectorAll<HTMLElement>(`.${line2Class}`)
              .forEach((line) => {
                line.style.left = newLine2Pos + "px";
                changeLimitLinePos();
              });

            // DO NOT REMOVE CODE BELOW MOVES ONE LINE ON MULTI GRAPHS
            // startLine.style.left = newLine1Pos + "px";
            // endLine.style.left = newLine2Pos + "px";
            // changeLimitLinePos();
          }
        }

        // eslint-disable-next-line no-inner-declarations
        function onup() {
          setStartEndTimes(u);
          document.removeEventListener("mousemove", onmove);
          document.removeEventListener("mouseup", onup);
        }

        document.addEventListener("mousemove", onmove);
        document.addEventListener("mouseup", onup);
      }
    });

    endLine.addEventListener("mousedown", (e: MouseEvent) => {
      const oldLine1Distance = +startLine.style.left.split("px")[0];
      const oldLine2Distance = +endLine.style.left.split("px")[0];

      if (e.button == 0) {
        e.preventDefault();
        const left0 = e.clientX;
        // const scXMin0 = u.scales.x.min!; //DO NOT REMOVE
        const scXMax0 = u.scales.x.max!;

        const xUnitsPerPx = u.posToVal(1, "x") - u.posToVal(0, "x");

        // eslint-disable-next-line no-inner-declarations
        function onmove(e: MouseEvent) {
          e.preventDefault();
          const left1 = e.clientX;
          const dx = xUnitsPerPx * (left1 - left0);

          const newPos = left1 - left0;
          // const newLine1Pos = oldLine1Distance + newPos; //DO NOT REMOVE
          const newLine2Pos = oldLine2Distance + newPos;

          // BOOLEANS ==========================================
          const leftMove = Math.sign(dx) === -1;
          const rightMove = Math.sign(dx) === 1;
          // const leftLimit = u.valToPos(scXMin0, "x") + offsetLeft; // DO NOT REMOVE
          const rightLimit = u.valToPos(scXMax0, "x") + offsetLeft;
          // ===================================================

          const timerDivWidthHelper =
            newLine2Pos < rightLimit ? newLine2Pos : rightLimit;

          const readjustBox = () => {
            const { text, isExceeded } = generateTimeSpanText({
              startDate: u.posToVal(oldLine1Distance, "x") * 1000,
              endDate: u.posToVal(newLine2Pos, "x") * 1000,
            });

            makeTimerDiv({
              distance1: oldLine1Distance,
              distance2: timerDivWidthHelper,
            });

            document
              ?.querySelectorAll<HTMLElement>("." + timerDivClass)
              ?.forEach((div) => {
                div.innerText = text;
              });
            if (isExceeded) {
              document
                ?.querySelectorAll<HTMLElement>("." + timerDivClass)
                ?.forEach((div) => {
                  div.style.background = "#D83020";
                });
            }
            // yourTimerDiv.style.background = "#D83020";

            //
            //
            if (!isExceeded)
              document?.querySelector("." + limitLineClass)?.remove();
            if (isExceeded && !document?.querySelector("." + limitLineClass)) {
              const limitLine = document.createElement("div");
              addLineStyles({
                line: limitLine,
                className: "limitLine",
                color: "blue",
              });

              const line1Val = new Date(
                u.posToVal(oldLine1Distance, "x") * 1000
              );

              const distLft = u.valToPos(
                addSeconds(line1Val, TIME_LIMIT_SECONDS).getTime() / 1000,
                "x"
              );

              u?.root?.querySelector(".u-wrap")?.appendChild(limitLine);
              limitLine.style.left = distLft + "px";
              limitLine.style.top = 0 + 24 + offsetTop + "px";
              limitLine.style.height = plotHeight - 24 + "px";
              limitLine.style.opacity = "50%";

              const handleLimit = document.createElement("div");
              addCommonHandleStyles({
                handle: handleLimit,
                className: "handleLimit",
                color: "#fff",
              });
              handleLimit.style.transform = "translateY(-12px)";

              limitLine.append(handleLimit);
            }
            //
            //
            //
          };

          if (leftMove && newLine2Pos > oldLine1Distance) {
            // endLine.style.left = newLine2Pos + "px"; // <== THIS WAS USED WHEN EACH RANGE DRAG WAS UNIQUE
            document
              ?.querySelectorAll<HTMLElement>(`.${line2Class}`)
              ?.forEach((line) => {
                line.style.left = newLine2Pos + "px";
                readjustBox();
              });
          }

          if (rightMove && newLine2Pos < rightLimit) {
            // endLine.style.left = newLine2Pos + "px";
            document
              ?.querySelectorAll<HTMLElement>(`.${line2Class}`)
              ?.forEach((line) => {
                line.style.left = newLine2Pos + "px";
                readjustBox();
              });
          }
        }

        // eslint-disable-next-line no-inner-declarations
        function onup() {
          setStartEndTimes(u);
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
      ready: [
        (u: uPlot) => {
          const removeAllByClass = (className: string) => {
            document?.querySelectorAll("." + className)?.forEach((instance) => {
              instance?.remove();
            });
          };

          useDeviceDataControlsStore.subscribe((state) => {
            if (state.graphControl !== "timeRange") {
              removeAllByClass(limitLineClass);
              removeAllByClass(timerDivClass);
              removeAllByClass(line1Class);
              removeAllByClass(line2Class);
              return;
            }
            readyFunc(u);
          });
        },
      ],
    },
  };
};
