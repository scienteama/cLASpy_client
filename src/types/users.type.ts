export interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  roleId: number;
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
  createdAt: string;
  updatedAt: string;
}

export enum UserRoleEnum {
  ADMIN = 1, // Accès complet
  POWER_USER = 2, // Utilisateur avancé
  STANDARD_USER = 3, // Utilisateur normal
  READ_ONLY = 4, // Consultation uniquement
}
