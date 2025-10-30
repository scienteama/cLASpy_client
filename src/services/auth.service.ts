import { api } from 'src/boot/axios';
import type { Dictionnary, WorkDone } from 'src/types/api.type';

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

  async checkSession(): Promise<WorkDone<Dictionnary<boolean>>> {
    const response = await api.get<WorkDone<Dictionnary<boolean>>>('auth/check-session');
    return response.data;
  }
}

export const authService = new AuthService();
