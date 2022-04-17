import "./index.css";

import CanvasDraw from "react-canvas-draw";
import React from "react";
import cl from "classnames";

const brushRadius = 2;
const brushColor = "#c3c3c3";

interface Props {
  onDrawing: () => void;
  onDrawEnded: (points: { x: number; y: number }[]) => void;
  onClear: () => void;
  canvasHeight: number;
  canvasWidth: number;
}
// Drawer to allow user draw the boundary
const Drawer = ({
  onDrawing,
  onDrawEnded,
  onClear,
  canvasHeight,
  canvasWidth,
}: Props) => {
  const [actionType, setActionType] = React.useState("NONE");
  const isDrawing = actionType === "DRAWING";

  const ref = React.useRef<CanvasDraw>(null);
  const clear = () => {
    ref.current?.clear();
    onClear();
  };

  const toggleDraw = () => {
    drawPoints();
    if (actionType === "DRAWING") {
      setActionType("NONE");
      return;
    }
    setActionType("DRAWING");
    onDrawing();
    if (ref.current) ref.current.clear();
  };

  const drawPoints = React.useCallback(async () => {
    if (!ref.current) return;
    const drawData = JSON.parse(ref.current.getSaveData());
    const polyPoints = drawData?.lines[0]?.points ?? [];
    // on drawended
    onDrawEnded(polyPoints);
  }, [onDrawEnded]);

  const drawChange = React.useCallback(() => {
    drawPoints();
    setActionType("NONE");
  }, [drawPoints]);

  const getToogleClass = (isToggled: boolean) => {
    return cl("p-2 border mr-2 rounded", {
      "text-white": isToggled,
      "bg-blue-500": isToggled,
      "text-grey-700": !isToggled,
      "bg-grey-100": !isToggled,
    });
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="flex flex-row items-center justify-center gap-4 py-2 w-full">
        <button className="p-2 border mr-2 rounded" onClick={clear}>
          Clear
        </button>
        <button className={getToogleClass(isDrawing)} onClick={toggleDraw}>
          Draw
        </button>
      </div>
      {actionType !== "NONE" && (
        <div
          className="canvas-draw relative"
          style={{ position: "relative", width: canvasWidth, opacity: 0.5 }}
        >
          <CanvasDraw
            gridColor="transparent"
            onChange={drawChange}
            ref={ref}
            lazyRadius={0}
            disabled={!isDrawing}
            brushColor={brushColor}
            canvasHeight={canvasHeight}
            canvasWidth={canvasWidth}
            brushRadius={brushRadius}
          />
        </div>
      )}
    </div>
  );
};
export default Drawer;
