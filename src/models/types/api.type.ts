export interface WorkDone<T> {
  isOk: boolean;
  result: string;
  data: T;
}

export interface Dictionnary<T> {
  [key: string]: T;
}

export interface TokenData {
  id: number;
  email: string;
  roleId: number;
}

export interface AuthResponse {
  isAuthenticated: boolean;
  exp: number;
  sessionUserData?: TokenData;
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

export interface ApiSettings {
  appName: string;
  env: string;
  port: number;
  host: string;
  allowedOrigins: string[];
  accessTokenExpireMinutes: number;
  tempDir: string;
  uploadDir: string;
  trashDir: string;
  recoveryDir: string;
  defaultOutputDir: string;
}
