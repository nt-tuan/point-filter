import { Point } from "./gmap/types";

const getBestPoint = (
  points: Point[],
  compareFn: (point: Point, current: Point) => boolean
) => {
  if (points.length === 0) return;
  let best: Point = points[0];
  for (const point of points) {
    if (compareFn(point, best)) {
      best = point;
    }
  }
  return best;
};

interface Line {
  from: Point;
  to: Point;
}
interface Config {
  precision: number;
}

const isIntersect = (y: number, line: Line) => {
  const min = Math.min(line.from.y, line.to.y);
  const max = Math.max(line.from.y, line.to.y);
  return y >= min && y <= max;
};
const getIntersectionPoint = (y: number, line: Line) => {
  const directionVector = {
    x: line.to.x - line.from.x,
    y: line.to.y - line.from.y,
  };
  if (directionVector.y === 0) {
    return null;
  }
  const t = (y - line.from.y) / directionVector.y;
  const intersectionX = line.from.x + t * directionVector.x;
  return {
    x: intersectionX,
    y,
  };
};
const getSegments = (y: number, lines: Line[]) => {
  const intersectedLines = lines.filter((line) => isIntersect(y, line));
  const intersectionPoints = [];
  for (const line of intersectedLines) {
    const point = getIntersectionPoint(y, line);
    if (point != null) {
      intersectionPoints.push(point);
    }
  }
  const sortedPoints = intersectionPoints.sort(
    (pointA, pointB) => pointA.x - pointB.x
  );
  const segments = [];
  for (let i = 1; i < sortedPoints.length; i += 2) {
    const from = sortedPoints[i - 1];
    const to = sortedPoints[i];
    segments.push({ from, to });
  }
  return segments;
};

const isIn2DBoundary = (
  value: number,
  a: number,
  b: number,
  config: Config
) => {
  const min = Math.min(a, b);
  const max = Math.max(a, b);
  return value + config.precision >= min && value - config.precision <= max;
};
const getDistance = (point: Point, line: Line) => {
  const directionVector = {
    x: line.to.x - line.from.x,
    y: line.to.y - line.from.y,
  };
  return (
    (point.x * directionVector.x +
      point.y * directionVector.y -
      line.to.x * directionVector.x -
      line.to.y * directionVector.y) /
    Math.sqrt(
      directionVector.x * directionVector.x +
        directionVector.y * directionVector.y
    )
  );
};
const isPointInSegment = (point: Point, segment: Line, config: Config) => {
  const isInBoundary =
    isIn2DBoundary(point.x, segment.from.x, segment.to.x, config) &&
    isIn2DBoundary(point.y, segment.from.y, segment.to.y, config);
  if (!isInBoundary) return false;
  const distance = getDistance(point, segment);
  return distance <= config.precision;
};

const isPointInSegments = (point: Point, segments: Line[], config: Config) => {
  for (const segment of segments) {
    const isValid = isPointInSegment(point, segment, config);
    if (isValid) return true;
  }
  return false;
};

// isInsidePolylines return points which is in polygons
export const isInsidePolylines = (polygonPoints: Point[], points: Point[]) => {
  const lines = [];
  if (polygonPoints.length === 0 || points.length === 0) return [];
  for (let i = 0; i < polygonPoints.length; i++) {
    const point = polygonPoints[i];
    const nextPoint = polygonPoints[(i + 1) % polygonPoints.length];
    lines.push({
      from: {
        x: point.x,
        y: point.y,
      },
      to: {
        x: nextPoint.x,
        y: nextPoint.y,
      },
    });
  }

  const maxYPoint = getBestPoint(
    polygonPoints,
    (pointA, pointB) => pointA.y > pointB.y
  )?.y;
  const minYPoint = getBestPoint(
    polygonPoints,
    (pointA, pointB) => pointA.y < pointB.y
  )?.y;
  if (maxYPoint == null || minYPoint == null) return [];
  const precision = (maxYPoint - minYPoint) / 1000;

  const config = { precision: precision === 0 ? 0.00001 : precision };

  const segmentsList = [];
  for (let y = minYPoint; y <= maxYPoint; y += config.precision) {
    segmentsList.push(getSegments(y, lines));
    if (y + config.precision > maxYPoint) {
      segmentsList.push(getSegments(y + config.precision, lines));
    }
  }

  const validPoints = [];
  for (const point of points) {
    for (const segments of segmentsList) {
      if (isPointInSegments(point, segments, config)) {
        validPoints.push(point);
        break;
      }
    }
  }
  return validPoints;
};
