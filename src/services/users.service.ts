import { api } from 'src/boot/axios';
import type { WorkDone } from 'src/types/api.type';
import type { User, UserIn } from 'src/types/users.type';

/**
 * Gestion des utilisateurs
 *
 */
class UserService {
  async getAllUsers(): Promise<WorkDone<User[]>> {
    const users = await api.get<WorkDone<User[]>>('/users/all');
    return users.data;
  }

  async getUserById(userId: number): Promise<WorkDone<User>> {
    const user = await api.get<WorkDone<User>>(`/users/get-by-id/${userId}`);
    return user.data;
  }

  async getUserByEmail(email: string): Promise<WorkDone<User>> {
    const user = await api.get<WorkDone<User>>('/users/get-by-email', { params: { email } });
    return user.data;
  }

  async getCurrentUser(): Promise<WorkDone<User>> {
    const user = await api.get<WorkDone<User>>('/users/me');
    return user.data;
  }

  async addUser(newUser: UserIn): Promise<WorkDone<User>> {
    const createdUser = await api.post<WorkDone<User>>('/users/add', newUser);
    return createdUser.data;
  }

  async updateUser(userId: number, data: Partial<User>): Promise<WorkDone<User>> {
    const updatedUser = await api.patch<WorkDone<User>>(`/users/update/${userId}`, data);
    return updatedUser.data;
  }

  async removeUser(userId: number): Promise<WorkDone<string>> {
    const result = await api.delete<WorkDone<string>>(`/users/delete/${userId}`);
    return result.data;
  }
}

export const userService = new UserService();
