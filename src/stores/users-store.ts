import { defineStore } from 'pinia';
import { useQuasar } from 'quasar';
import { userService } from 'src/services/users.service';
import { type UserIn, UserRoleEnum, type User } from 'src/types/users.type';
import { ref, computed } from 'vue';

export const useUserStore = defineStore(
  'user',
  () => {
    const $q = useQuasar();
    const currentUser = ref<User | null>(null);
    const users = ref<User[]>([]);
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
    const isPrivileged = computed(() =>
      [UserRoleEnum.ADMIN, UserRoleEnum.POWER_USER].includes(currentUser.value?.role_id ?? 0),
    );

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

      switch (role) {
        case UserRoleEnum.ADMIN:
          return [
            UserRoleEnum.ADMIN,
            UserRoleEnum.POWER_USER,
            UserRoleEnum.STANDARD_USER,
            UserRoleEnum.READ_ONLY,
          ];
        case UserRoleEnum.POWER_USER:
          return [UserRoleEnum.STANDARD_USER, UserRoleEnum.READ_ONLY];
        case UserRoleEnum.STANDARD_USER:
          return [UserRoleEnum.READ_ONLY];
        default:
          return [];
      }
    });

    return {
      currentUser,
      users,
      isLoggedIn,
      isAdmin,
      powerUser,
      standardUser,
      readOnly,
      isPrivileged,
      getAllowedRoles,
      updateUser,
      addUser,
      deleteUser,
      getById,
      getByEmail,
      getAllUsers,
      getMe,
      clearUser,
    };
  },
  {
    persist: {
      pick: ['currentUser'],
    },
  },
);
