export type AppEvents = {
  data: { message: string; timestamp: number };
  error: Error;
  finished: void;
};

export type HSL = { h: number; s: number; l: number };

export interface Point {
  x: number;
  y: number;
  dx?: number;
  dy?: number;
  fixed?: boolean;
}
