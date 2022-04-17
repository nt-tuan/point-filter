export interface Point {
  x: number;
  y: number;
}
export interface MapCoor {
  lat: number;
  lng: number;
}
export interface Marker {
  position: MapCoor;
}
export interface MapCorner {
  center: MapCoor;
  leftTop: MapCoor;
  rightTop: MapCoor;
  leftBot: MapCoor;
  rightBot: MapCoor;
}
