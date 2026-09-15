export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  access_token: string;
  token_type: string;
}

export interface RecoveryCodes {
  warning: string;
  formatted_codes: string[];
}
