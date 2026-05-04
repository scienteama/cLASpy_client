export interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
  role_id: number;
  storage: UserStorage;
}

export interface UserStorage {
  id: number;
  userId: number;
  storage_used_bytes: number;
  created_at: string;
  updated_at: string;
}

export interface UserIn {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  role_id: number;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  maxSpace: number;
  created_at: string;
  updated_at: string;
}
