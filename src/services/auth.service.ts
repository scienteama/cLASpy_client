import { api } from '@/boot/axios';
import type { AuthResponse, WorkDone } from '@/models/types/api.type';
import { type LoginResponseDto } from '@/models/types/auth.type';

/**
 * Centralise les appels API pour la gestion de l'authentification
 *
 */
class AuthService {
  async login(credentials: URLSearchParams): Promise<WorkDone<LoginResponseDto>> {
    const response = await api.post<WorkDone<LoginResponseDto>>('/auth/login', credentials);
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
