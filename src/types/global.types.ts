export type AppEvents = {
  data: { message: string; timestamp: number };
  error: Error;
  finished: void;
};
