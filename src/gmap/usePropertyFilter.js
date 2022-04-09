import { useCallback, useEffect, useMemo, useState } from "react";

import React from "react";
import { isInsidePolylines } from "../util";
import { getProperties } from "../service";

// getCoordinates extract coordinates from properties
const getCoordinates = (properties) => {
  const a = [];
  for (const prop of properties) {
    a.push(...prop);
  }
  return a.map((prop) => ({
    x: prop.Coordinates[0],
    y: prop.Coordinates[1],
  }));
};

// usePropertyFilter returns polilines on the map and markers of filtered coordinates
const usePropertyFilter = ({ polyPoints, mapCorner, mapPixelSize }) => {
  const [properyCoordinates, setProperyCoordinates] = React.useState([]);
  const { height, width } = mapPixelSize;
  const [markers, setMarkers] = React.useState([]);
  const { leftTop, rightTop, leftBot } = mapCorner || {};
  const [coordinatesPath, setCoordinatesPath] = useState([]);

  const scaleRatio = useMemo(() => {
    const horizontal = (rightTop?.lng - leftTop?.lng) / width;
    const vertical = (leftBot?.lat - leftTop?.lat) / height;
    return { horizontal, vertical };
  }, [leftTop, rightTop, leftBot, width, height]);

  const convertPixelToCoordinate = useCallback(
    (canvasX, canvasY) => {
      const x = leftTop.lng + canvasX * scaleRatio.horizontal;
      const y = leftTop.lat + canvasY * scaleRatio.vertical;
      return { x, y };
    },
    [scaleRatio, leftTop]
  );
  useEffect(() => {
    getProperties().then((properties) => {
      const coordinates = getCoordinates(properties);
      setProperyCoordinates(coordinates);
    });
  }, []);

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
  }, [
    polyPoints,
    properyCoordinates,
    scaleRatio,
    convertPixelToCoordinate,
    rightTop,
    leftBot,
  ]);

  return { coordinatesPath, markers };
};

export default usePropertyFilter;