export type Tool =
  | "select"
  | "pan"
  | "draw"
  | "rectangle"
  | "circle"
  | "line"
  | "arrow"
  | "text"
  | "image";

export interface Point {
  x: number;
  y: number;
}

export interface BaseElement {
  id: string;
  type: string;
  x: number;
  y: number;
  rotation: number;
  opacity: number;
  visible: boolean;
}

export interface DrawElement extends BaseElement {
  type: "draw";
  points: number[][];
  strokeColor: string;
  strokeWidth: number;
}

export interface RectangleElement extends BaseElement {
  type: "rectangle";
  width: number;
  height: number;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
}

export interface CircleElement extends BaseElement {
  type: "circle";
  radiusX: number;
  radiusY: number;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
}

export interface LineElement extends BaseElement {
  type: "line";
  points: number[];
  strokeColor: string;
  strokeWidth: number;
}

export interface ArrowElement extends BaseElement {
  type: "arrow";
  points: number[];
  strokeColor: string;
  strokeWidth: number;
}

export interface TextElement extends BaseElement {
  type: "text";
  text: string;
  fontSize: number;
  fontFamily: string;
  fillColor: string;
  width: number;
}

export interface ImageElement extends BaseElement {
  type: "image";
  src: string;
  width: number;
  height: number;
}

export type CanvasElement =
  | DrawElement
  | RectangleElement
  | CircleElement
  | LineElement
  | ArrowElement
  | TextElement
  | ImageElement;

export interface StageConfig {
  x: number;
  y: number;
  scale: number;
}
