export interface WorkDone<T> {
  isOk: boolean;
  result: string;
  data: T;
}

export interface ErrorResponse {
  isOk: boolean;
  result: string;
  data: {
    detail: string;
    code: number;
  };
}

export function isAxiosErrorResponse(err: unknown): err is ErrorResponse {
  if (typeof err !== 'object' || err === null) return false;
  const maybe = err as Partial<ErrorResponse>;
  return maybe.isOk === false && typeof maybe.data === 'object';
}
