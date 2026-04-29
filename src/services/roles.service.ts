import { api } from 'src/boot/axios';
import { type WorkDone } from 'src/models/types/api.type';
import { type Role } from 'src/models/types/users.type';

/**
 * Gestion des roles
 *
 */

class RoleService {
  async getAllRoles(): Promise<WorkDone<Role[]>> {
    const roles = await api.get<WorkDone<Role[]>>('/roles/all');
    return roles.data;
  }
}

export const roleService = new RoleService();
