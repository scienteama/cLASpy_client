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

export interface Metrics {
  cpu: Processor;
  ram: Memory;
  disk: Disk;
}

export interface MetricPoint {
  t: number;
  v: number;
}

export interface Memory {
  total: number;
  used: number;
  available: number;
  percent: number;
  free: number;
}

export interface Disk {
  total: number;
  used: number;
  percent: number;
  free: number;
}

export interface Processor {
  percent: number;
}
