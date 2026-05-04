import { api } from 'src/boot/axios';
import type { AuthResponse, WorkDone } from 'src/models/types/api.type';

/**
 * Centralise les appels API pour la gestion de l'authentification
 *
 */
class AuthService {
  async login(credentials: URLSearchParams): Promise<WorkDone<string>> {
    const response = await api.post<WorkDone<string>>('/auth/login', credentials);
    return response.data;
  }

  async logout(): Promise<WorkDone<string>> {
    const response = await api.post<WorkDone<string>>('auth/logout');
    return response.data;
  }

  async checkSession(): Promise<WorkDone<AuthResponse>> {
    const response = await api.get<WorkDone<AuthResponse>>('auth/check-session');
    return response.data;
  }
}

export const authService = new AuthService();
