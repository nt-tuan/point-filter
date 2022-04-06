import React from "react";

import CanvasDraw from "react-canvas-draw";
import { isInsidePolylines } from "./util";
import cl from "classnames";

const canvasHeight = 400;
const canvasWidth = 400;
const brushRadius = 12;
const brushColor = "#c3c3c3";
const Drawer = () => {
  const [cursorPointer, setCursorPointer] = React.useState({});
  const [actionType, setActionType] = React.useState("NONE");
  const isDrawing = actionType === "DRAWING";
  const isPointing = actionType === "POINTING";

  const [points, setPoints] = React.useState([]);
  const ref = React.useRef();
  const pointRef = React.useRef();
  const clear = () => {
    ref.current.clear();
    setPoints([]);
  };
  const toggleDraw = () => {
    drawPoints(points);
    if (actionType === "DRAWING") {
      setActionType("NONE");
      return;
    }
    setActionType("DRAWING");
    ref.current.clear();
  };
  const togglePoint = () => {
    if (actionType === "POINTING") {
      setActionType("NONE");
      return;
    }
    setActionType("POINTING");
  };

  const drawPoints = React.useCallback(async (points) => {
    const ctx = pointRef.current.getContext("2d");
    const drawCircle = (x, y, color = "black") => {
      ctx.beginPath();
      ctx.arc(x, y, brushRadius, 0, 2 * Math.PI);
      ctx.strokeStyle = color;
      ctx.stroke();
    };
    ctx.clearRect(0, 0, pointRef.current.width, pointRef.current.height);
    const drawData = JSON.parse(ref.current.getSaveData());
    const polyPoints = drawData?.lines[0]?.points ?? [];
    const insidePoints = isInsidePolylines(polyPoints, points);
    for (const { x, y } of points) {
      drawCircle(x, y);
    }
    for (const { x, y } of insidePoints) {
      drawCircle(x, y, "red");
    }
  }, []);

  React.useEffect(() => {
    if (pointRef.current == null) return;
    drawPoints(points);
  }, [points, drawPoints]);
  const handleMouseDown = (event) => {
    if (!isPointing) {
      return;
    }
    const rect = pointRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setPoints((points) => [...points, { x, y }]);
  };
  const handleMouseMove = (event) => {
    const { left, right, top, bottom } = event.target.getBoundingClientRect();
    let x = event.clientX - brushRadius / 2;
    let y = event.clientY - brushRadius / 2;
    if (y < top) {
      y = top;
    }
    if (y > bottom) {
      y = bottom;
    }
    if (x < left) x = left;
    if (x > right) x = right;
    setCursorPointer({
      x,
      y,
    });
  };
  const drawChange = React.useCallback(() => {
    drawPoints(points);
    setActionType("NONE");
  }, [points, drawPoints]);

  const getToogleClass = (isToggled) => {
    return cl("p-2 border mr-2 rounded", {
      "text-white": isToggled,
      "bg-blue-500": isToggled,
      "text-grey-700": !isToggled,
      "bg-grey-100": !isToggled,
    });
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex flex-row gap-4 py-2">
        <button className="p-2 border mr-2 rounded" onClick={clear}>
          Clear
        </button>
        <button className={getToogleClass(isDrawing)} onClick={toggleDraw}>
          Draw
        </button>
        <button onClick={togglePoint} className={getToogleClass(isPointing)}>
          Point
        </button>
      </div>
      <div
        className="relative border"
        style={{ position: "relative", width: canvasWidth }}
        onMouseMove={handleMouseMove}
      >
        <CanvasDraw
          onChange={drawChange}
          ref={ref}
          hideInterface={true}
          disabled={!isDrawing}
          brushColor={brushColor}
          canvasHeight={canvasHeight}
          canvasWidth={canvasWidth}
          brushRadius={brushRadius}
        />

        <>
          {isPointing && (
            <div
              style={{
                borderRadius: "50%",
                position: "fixed",
                width: brushRadius,
                height: brushRadius,
                backgroundColor: brushColor,
                left: cursorPointer.x,
                top: cursorPointer.y,
              }}
            ></div>
          )}
          <div
            style={{
              position: "absolute",
              display: isPointing ? "block" : "hidden",
              inset: 0,
              backgroundColor: "transparent",
              width: canvasWidth,
              height: canvasHeight,
              pointerEvents: isPointing ? undefined : "none",
            }}
          >
            <canvas
              width={canvasWidth}
              height={canvasHeight}
              ref={pointRef}
              onMouseDown={handleMouseDown}
            />
          </div>
        </>
      </div>
    </div>
  );
};
export default Drawer;
