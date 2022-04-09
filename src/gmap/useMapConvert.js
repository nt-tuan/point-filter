import { useCallback, useEffect, useMemo, useState } from "react";

import React from "react";
import { isInsidePolylines } from "../util";
import properties from "../data/properties.json";

const formatP = () => {
  const a = [];
  for (const prop of properties) {
    a.push(...prop);
  }
  return a.map((prop) => ({
    x: prop.Coordinates[0],
    y: prop.Coordinates[1],
  }));
};
const properyCoordinates = formatP();
const useMapConvert = ({ polyPoints, mapCorner, mapPixelSize }) => {
  const { height, width } = mapPixelSize;
  const [markers, setMarkers] = React.useState([]);
  const { leftTop, rightTop, leftBot } = mapCorner || {};
  const [coordinatesPath, setCoordinatesPath] = useState([]);

  const scaleRadio = useMemo(() => {
    const horizontal = (rightTop?.lng - leftTop?.lng) / width;
    const vertical = (leftBot?.lat - leftTop?.lat) / height;
    return { horizontal, vertical };
  }, [leftTop, rightTop, leftBot, width, height]);

  const convertPixelToCoordinate = useCallback(
    (canvasX, canvasY) => {
      const x = leftTop.lng + canvasX * scaleRadio.horizontal;
      const y = leftTop.lat + canvasY * scaleRadio.vertical;
      return { x, y };
    },
    [scaleRadio, leftTop]
  );

  useEffect(() => {
    // convert canvas coordinates to google-map coordinates
    const actualPoints = polyPoints.map(({ x, y }) =>
      convertPixelToCoordinate(x, y)
    );

    const points = isInsidePolylines(actualPoints, properyCoordinates);

    const newMarkers = points.map((point) => ({
      position: {
        lat: point.y,
        lng: point.x,
      },
      title: point.BuildingName,
    }));

    setMarkers([...newMarkers]);
    setCoordinatesPath(
      actualPoints.map(({ x: lng, y: lat }) => ({ lng, lat }))
    );
  }, [polyPoints, scaleRadio, convertPixelToCoordinate, rightTop, leftBot]);

  return { coordinatesPath, markers };
};

export default useMapConvert;
