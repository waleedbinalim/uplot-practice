import React from "react";
import {
  ZoomInIcon,
  ZoomOutIcon,
  MoveGraphIcon,
  ZoomSectionIcon,
} from "@/assets";
import {
  useDeviceDataControlActions,
  useDeviceDataControlState,
} from "@/state";

const graphControlsBtns = [
  { value: "zoomIn", icon: <ZoomInIcon /> },
  { value: "zoomOut", icon: <ZoomOutIcon /> },
  { value: "moveGraph", icon: <MoveGraphIcon /> },
  { value: "zoomSection", icon: <ZoomSectionIcon /> },
];

const GraphControlComponent: React.FC = () => {
  const { setGraphControl } = useDeviceDataControlActions();
  const { graphControl } = useDeviceDataControlState();
  return (
    <>
      <div className="flex gap-1 justify-center">
        {graphControlsBtns.map(({ value, icon }) => {
          return (
            <button
              className={`p-4  rounded-md border-2 hover:bg-slate-200 [&_svg]:w-4 [&_svg]:h-4
                ${graphControl === value ? "bg-slate-300" : "bg-slate-100"}
                `}
              onClick={() => setGraphControl(value)}
              key={value}
            >
              {icon}
            </button>
          );
        })}
      </div>
    </>
  );
};

export default GraphControlComponent;
