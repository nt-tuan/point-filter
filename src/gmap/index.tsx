import {
  GoogleMap,
  Circle,
  Polygon,
  useJsApiLoader,
} from "@react-google-maps/api";
import React, { useCallback, useState } from "react";
import { CSSProperties } from "react";

import Drawer from "../Drawer";
import { MapCoor, MapCorner, Point } from "./types";
import usePropertyFilter from "./usePropertyFilter";

const MAP_HEIGHT = 500;
const MAP_WIDTH = 700;
const BUTTON_GROUP_HEIGHT = 58;

const containerStyle = {
  height: MAP_HEIGHT,
  width: MAP_WIDTH,
};

const drawerOuterStyle: CSSProperties = {
  zIndex: 2,
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
};

const polygonOptions = {
  fillColor: "transparent",
  fillOpacity: 1,
  strokeColor: "#FF7700",
  strokeOpacity: 1,
  strokeWeight: 2,
  clickable: false,
  draggable: false,
  editable: false,
  geodesic: false,
  zIndex: 1,
};

const initCoordinates = {
  lat: 33.747171,
  lng: -117.862764,
};

function MyGmap() {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyANaeBkrgp0C5otvGdhz3R1iFyrDE5JrI8",
  });

  const [map, setMap] = useState<google.maps.Map>();
  const [mapCorner, setMapCorner] = useState<MapCorner>();
  const [polyPoints, setPolyPoints] = useState<Point[]>([]);
  const { coordinatesPath, markers } = usePropertyFilter({
    mapCorner,
    polyPoints,
    mapPixelSize: { width: MAP_WIDTH, height: MAP_HEIGHT },
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onDrawing = useCallback(() => {
    if (map == null) return;
    const bounds = map.getBounds();
    if (bounds == null) return;
    const rightTopCorner = bounds.getNorthEast();
    const leftBottom = bounds.getSouthWest();
    const center = map.getCenter();
    if (center == null) return;
    setMapCorner({
      center: { lat: center.lat(), lng: center.lng() },
      leftTop: { lat: rightTopCorner.lat(), lng: leftBottom.lng() }, // A: TAY BAC
      rightTop: { lat: rightTopCorner.lat(), lng: rightTopCorner.lng() }, // B: DONG BAC
      leftBot: { lat: leftBottom.lat(), lng: leftBottom.lng() }, // C: TAY NAM
      rightBot: { lat: leftBottom.lat(), lng: rightTopCorner.lng() }, // D: DONG NAM
    });
    setPolyPoints([]);
  }, [map]);

  const onDrawEnded = useCallback((canvasPoints: Point[]) => {
    const shortPoints = canvasPoints.filter((p, i) => i % 2 === 0);
    setPolyPoints(shortPoints);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(undefined);
  }, []);

  const clear = () => {
    setPolyPoints([]);
  };

  if (!isLoaded) return <span>Loading map...</span>;
  return (
    <div className="relative mx-10" style={{ width: MAP_WIDTH }}>
      <div style={drawerOuterStyle}>
        <Drawer
          onClear={clear}
          onDrawing={onDrawing}
          onDrawEnded={onDrawEnded}
          canvasHeight={MAP_HEIGHT}
          canvasWidth={MAP_WIDTH}
        />
      </div>
      <div
        style={{ position: "absolute", left: "0px", top: BUTTON_GROUP_HEIGHT }}
      >
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={initCoordinates}
          zoom={12}
          onLoad={onLoad}
          onUnmount={onUnmount}
        >
          {coordinatesPath.length > 0 && (
            <Polygon
              path={coordinatesPath}
              options={{ ...polygonOptions, paths: coordinatesPath }}
            />
          )}
          {markers.map((marker) => (
            <Circle
              key={`${marker.position.lng}_${marker.position.lat}}`}
              radius={100}
              center={marker.position}
              options={{
                fillColor: "#243c04",
                fillOpacity: 1,
                strokeColor: "#7f9b22",
                strokeOpacity: 1,
              }}
            />
          ))}
        </GoogleMap>
      </div>
    </div>
  );
}

export default React.memo(MyGmap);
