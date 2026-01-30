<template>
  <q-page padding>
    <q-toolbar class="q-mb-md glossy rounded-borders bg-orange-3 inset-shadow-down">
      <q-toolbar-title class="text-wrap">
        Gestion des utilisateurs :
        <q-badge rounded color="red" align="middle" :label="numberOfUsers" />
      </q-toolbar-title>

      <q-btn label="Ajouter" color="claspy-dark1" icon="add" @click="openCreateDialog" class="q-ma-sm" />
    </q-toolbar>

    <div class="q-pa-sm">
      <!-- Table desktop -->
      <q-table v-if="!$q.screen.lt.md" flat bordered :rows="users" :columns="columns" :rows-per-page-options="[0, 5, 10, 20]" row-key="id" class="responsive-table">
        <template v-slot:body="props">
          <q-tr
            :props="props"
            :class="{
              'bg-blue-1 text-blue-10': props.row.id === userStore.currentUser?.id,
            }"
          >
            <q-td v-for="col in props.cols" :key="col.name" :props="props" class="q-px-sm">
              <template v-if="col.name === 'actions'">
                <div class="row no-wrap items-center q-gutter-sm">
                  <q-btn v-if="userStore.isPrivileged" flat icon="edit" color="primary" @click="openEditDialog(props.row)" dense size="sm" />
                  <q-btn v-if="userStore.isAdmin" flat icon="delete" color="negative" @click="confirmDelete(props.row)" :disabled="props.row.id === userStore.currentUser?.id" dense size="sm">
                    <q-tooltip v-if="props.row.id === userStore.currentUser?.id" transition-show="flip-right" transition-hide="flip-left"> Action indisponible </q-tooltip>
                  </q-btn>
                </div>
              </template>

              <template v-else-if="col.name === 'created_at' || col.name === 'updated_at'">
                {{ new Date(props.row[col.name]).toLocaleString() }}
              </template>

              <template v-else>
                {{ col.value }}
              </template>
            </q-td>
          </q-tr>
        </template>
      </q-table>

      <!-- Modale Créer/Modifier un utilisateur -->
      <q-dialog v-model="createCard" persistent>
        <q-card style="width: 95vw; max-width: 500px">
          <q-form @submit.prevent="submitUserForm" @reset.prevent="resetUserForm">
            <q-card-section>
              <div class="text-h6">{{ editingUser ? 'Modifier' : 'Créer' }} un utilisateur</div>
            </q-card-section>

            <q-card-section class="q-gutter-md">
              <q-input v-model="formUser.firstname" label="Prénom" dense :rules="[formUserRules.required('Prénom')]" />
              <q-input v-model="formUser.lastname" label="Nom" dense :rules="[formUserRules.required('Nom')]" />
              <q-input v-model="formUser.email" label="Email" type="email" dense autocomplete="off" lazy-rules :rules="[formUserRules.required('Email'), formUserRules.email]" />

              <!-- Bouton d’édition du mot de passe -->
              <div class="q-mb-md">
                <q-btn v-if="editingUser" flat dense :label="!passwordChanged ? 'Modifier le mot de passe' : 'Annuler'" color="primary" @click="passwordChanged = !passwordChanged" />
              </div>

              <q-input
                v-if="!editingUser || passwordChanged"
                v-model="newPassword"
                filled
                :type="isPwd ? 'password' : 'text'"
                autocomplete="new-password"
                label="Mot de passe"
                dense
                placeholder="**************"
                :rules="getPasswordRules()"
              >
                <template v-slot:append>
                  <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="isPwd = !isPwd" />
                </template>
              </q-input>

              <q-select
                dense
                filled
                label="Rôle"
                :options="getAllowedRoles"
                :model-value="formUser.role_id"
                @update:model-value="(val) => (formUser.role_id = val)"
                option-value="id"
                option-label="name"
                emit-value
                map-options
              />
            </q-card-section>

            <q-card-actions align="right">
              <q-btn flat label="Annuler" v-close-popup type="reset" />
              <q-btn flat label="Enregistrer" color="primary" type="submit" />
            </q-card-actions>
          </q-form>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import type { QTableColumn } from 'quasar';
import type { User, UserIn } from 'src/types/users.type';
import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';
import { computed, onMounted, ref } from 'vue';
import { useUserStore } from 'src/stores/users-store';
import { formUserRules } from 'src/helpers/validation/rules';
import ConfirmDialog from 'src/components/tools/ConfirmDialog.vue';

const $q = useQuasar();
const userStore = useUserStore();
const { users, getAllowedRoles } = storeToRefs(userStore);

const numberOfUsers = computed(() => users.value.length);

const createCard = ref(false);
const editingUser = ref(false);
const passwordChanged = ref(false);
const newPassword = ref('');
const isPwd = ref(true);

const formUser = ref<Partial<User>>({
  firstname: '',
  lastname: '',
  email: '',
  role_id: 3,
});

const columns: QTableColumn[] = [
  { name: 'firstname', label: 'Prénom :', field: 'firstname', sortable: true, align: 'left' },
  { name: 'lastname', label: 'Nom :', field: 'lastname', sortable: true, align: 'left' },
  { name: 'email', label: 'Email :', field: 'email', sortable: true, align: 'left' },
  { name: 'created_at', label: 'Créé le :', field: 'created_at', sortable: true, align: 'left' },
  { name: 'updated_at', label: 'Modifié le :', field: 'updated_at', sortable: true, align: 'left' },
  { name: 'actions', label: 'Actions', field: 'actions', sortable: false, align: 'center' },
];

function getPasswordRules() {
  if (!editingUser.value || passwordChanged.value) {
    return [formUserRules.required('Mot de passe'), formUserRules.password];
  }
  return [];
}

function openCreateDialog() {
  resetUserForm();
  editingUser.value = false;
  createCard.value = true;
}

function openEditDialog(user: User) {
  formUser.value = { ...user };
  editingUser.value = true;
  createCard.value = true;
}

async function submitUserForm() {
  if (editingUser.value && formUser.value.id) {
    const userData = formUser.value as UserIn;
    if (passwordChanged.value && newPassword.value) {
      userData.password = newPassword.value;
    }
    $q.dialog({
      component: ConfirmDialog,
      componentProps: {
        title: 'Modification utilisateur',
        message: 'Êtes-vous sûr de vouloir modifier cet utilisateur ?',
        confirmLabel: 'Confirmer',
        cancelLabel: 'Annuler',
      },
      persistent: true,
    }).onOk(() => {
      void (async () => {
        await userStore.updateUser(formUser.value.id!, userData);
      })();
    });
  } else {
    const newUser = formUser.value as UserIn;
    newUser.password = newPassword.value;
    $q.dialog({
      component: ConfirmDialog,
      componentProps: {
        title: 'Création utilisateur',
        message: 'Êtes-vous sûr de vouloir créer cet utilisateur ?',
        confirmLabel: 'Confirmer',
        cancelLabel: 'Annuler',
      },
      persistent: true,
    }).onOk(() => {
      void (async () => {
        await userStore.addUser(newUser);
      })();
    });
  }
  createCard.value = false;
  await userStore.getAllUsers();
}

function resetUserForm() {
  formUser.value = {
    firstname: '',
    lastname: '',
    email: '',
    role_id: 3,
  };
  passwordChanged.value = false;
  newPassword.value = '';
}

function confirmDelete(user: User) {
  $q.dialog({
    component: ConfirmDialog,
    componentProps: {
      title: 'Confirmer Suppression',
      message: 'Êtes-vous sûr de vouloir supprimer cet utilisateur ?',
      confirmLabel: 'Confirmer',
      cancelLabel: 'Annuler',
    },
    persistent: true,
  }).onOk(() => {
    void (async () => {
      await userStore.deleteUser(user.id);
    })();
  });
}

onMounted(async () => {
  await userStore.getAllUsers();
});
</script>
