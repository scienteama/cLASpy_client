import { defineStore, storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';
import { userService } from '@/services/users.service';
import { type UserIn, type User, type Role } from '@/models/types/users.type';
import { ref, computed } from 'vue';
import { MapUserRoleEnum, UserRoleEnum } from '@/models/enums/roles';
import { roleService } from '@/services/roles.service';
import { useMetricsStore } from './metrics-store';

export const useUserStore = defineStore(
  'user',
  () => {
    const $q = useQuasar();
    const currentUser = ref<User | null>(null);
    const currentRole = computed(() => roles.value.find((f) => f.id == currentUser.value?.role_id));
    const metricStore = useMetricsStore();
    const { metrics } = storeToRefs(metricStore);

    const maxDiskSpace = computed(() => {
      if (!currentRole.value) return 0;

      const ADMIN_ID = Number(UserRoleEnum.ADMIN);
      if (currentRole.value.id !== ADMIN_ID) {
        return currentRole.value.maxSpace;
      }

      const totalDisk = metrics.value.disk.free;
      if (totalDisk > 0) return totalDisk;

      return Infinity;
    });

    const spaceDiskUsed = computed(() => {
      if (!currentUser.value) return 0;
      return currentUser.value.storage.storage_used_bytes;
    });

    const usersCount = computed(() => users.value.length);
    const users = ref<User[]>([]);
    const roles = ref<Role[]>([]);
    const isLoggedIn = computed(() => !!currentUser.value);

    const isAdmin = computed(() => currentUser.value?.role_id == UserRoleEnum.ADMIN);
    const powerUser = computed(() => currentUser.value?.role_id == UserRoleEnum.POWER_USER);
    const standardUser = computed(() => currentUser.value?.role_id == UserRoleEnum.STANDARD_USER);
    const readOnly = computed(() => currentUser.value?.role_id == UserRoleEnum.READ_ONLY);

    /**
     * Utilisateurs privilégiés :
     * - ADMIN : accès complet
     * - POWER_USER : accès avancé (édition, gestion restreinte)
     */
    const isPrivileged = computed(() => [UserRoleEnum.ADMIN, UserRoleEnum.POWER_USER].includes(currentUser.value?.role_id ?? 0));

    async function init() {
      await getAllRoles();
    }

    async function updateUser(userId: number, partial: Partial<User>) {
      if (!isAdmin.value) {
        $q.notify({
          type: 'negative',
          message: "Seul un admin peut modifier d'autres utilisateurs",
        });
        return;
      }
      const res = await userService.updateUser(userId, partial);
      if (res.isOk) {
        const idx = users.value.findIndex((u) => u.id === userId);
        if (idx !== -1) users.value[idx] = res.data;
        if (currentUser.value?.id === userId) currentUser.value = res.data;
        $q.notify({ type: 'positive', message: res.result || 'Données mise à jour avec succès' });
      }
    }

    async function addUser(user: UserIn) {
      if (!isAdmin.value) {
        $q.notify({ type: 'negative', message: 'Seul un admin peut ajouter un utilisateur' });
        return;
      }
      const res = await userService.addUser(user);
      if (res.isOk) {
        users.value.push(res.data);
        $q.notify({ type: 'positive', message: res.result || 'Utilisateur créé avec succès' });
      }
    }

    async function createFirstUser(user: UserIn) {
      const res = await userService.createFirstUser(user);
      return res;
    }

    async function deleteUser(userId: number) {
      if (!isAdmin.value) {
        $q.notify({ type: 'negative', message: 'Seul un admin peut supprimer un utilisateur' });
        return;
      }
      const res = await userService.removeUser(userId);
      if (res.isOk) {
        users.value = users.value.filter((u) => u.id !== userId);
        $q.notify({ type: 'positive', message: res.result || 'Utilisateur supprimé avec succès' });
      }
    }

    async function getAllUsers() {
      const res = await userService.getAllUsers();
      if (res.isOk) users.value = res.data;
    }

    async function getAllRoles() {
      const res = await roleService.getAllRoles();
      if (res.isOk) roles.value = res.data;
    }

    async function getById(userId: number) {
      const res = await userService.getUserById(userId);
      if (res.isOk) return res.data;
    }

    async function getByEmail(email: string) {
      const res = await userService.getUserByEmail(email);
      if (res.isOk) return res.data;
    }

    async function getMe() {
      const res = await userService.getCurrentUser();
      if (res.isOk) {
        currentUser.value = res.data;
        return currentUser.value;
      } else {
        return null;
      }
    }

    function clearUser() {
      currentUser.value = null;
    }

    const getAllowedRoles = computed(() => {
      const role = currentUser.value?.role_id;
      const roles: { id: number; name: string }[] = [];

      const addRole = (roleId: number) => {
        const name = MapUserRoleEnum.get(roleId);
        if (name) roles.push({ id: roleId, name });
      };

      switch (role) {
        case UserRoleEnum.ADMIN:
          addRole(UserRoleEnum.ADMIN);
          addRole(UserRoleEnum.POWER_USER);
          addRole(UserRoleEnum.STANDARD_USER);
          addRole(UserRoleEnum.READ_ONLY);
          break;
        case UserRoleEnum.POWER_USER:
          addRole(UserRoleEnum.STANDARD_USER);
          addRole(UserRoleEnum.READ_ONLY);
          break;
        case UserRoleEnum.STANDARD_USER:
          addRole(UserRoleEnum.READ_ONLY);
          break;
      }

      return roles;
    });

    return {
      currentUser,
      currentRole,
      roles,
      users,
      usersCount,
      isLoggedIn,
      isAdmin,
      powerUser,
      standardUser,
      readOnly,
      isPrivileged,
      getAllowedRoles,
      maxDiskSpace,
      spaceDiskUsed,
      createFirstUser,
      updateUser,
      addUser,
      deleteUser,
      getById,
      getByEmail,
      getAllUsers,
      getMe,
      clearUser,
      init,
    };
  },
  {
    persist: {
      pick: ['currentUser'],
    },
  }
);
