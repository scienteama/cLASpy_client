<template>
  <div class="row justify-center items-center q-pa-md" style="min-height: 80vh">
    <div class="col-12 col-sm-10 col-md-6 col-lg-3">
      <q-card bordered class="inset-shadow-down bg-shadow-box">
        <div class="row justify-center items-center">
          <div class="col-12 text-center q-my-md">
            <q-card-section>
              <div class="text-h6 bg-shadow-box text-white rounded-borders q-pa-sm">Bonjour et bienvenue sur CLASPY_T !</div>
            </q-card-section>

            <q-card-section class="q-pa-none">
              <q-avatar size="150px">
                <img :src="imgLogin" alt="Login Image" />
              </q-avatar>
            </q-card-section>
            <q-card-section>
              <div class="row items-start justify-start bg-shadow-box text-white rounded-borders q-pa-sm">
                <div class="col-auto">
                  <q-icon :name="mdiInformationOutline" color="white" size="2em" />
                </div>
                <div class="col text-left q-ml-sm">En tant que premier utilisateur du système, vous serez désigné comme administrateur et pourrez créer d'autres utilisateurs.</div>
              </div>
            </q-card-section>
          </div>

          <div class="col-12">
            <q-form ref="firstUserForm" @submit.prevent="submitForm">
              <q-card-section>
                <!-- Prénom -->
                <div class="q-mb-md">
                  <q-input rounded bg-color="white" outlined v-model="form.firstname" label="Prénom" :rules="[formUserRules.required('Prénom')]" label-color="black" dense hide-bottom-space>
                    <template v-slot:prepend>
                      <q-icon :name="mdiFormTextbox" color="black" />
                    </template>
                  </q-input>
                </div>

                <!-- Nom -->
                <div class="q-mb-md">
                  <q-input rounded bg-color="white" outlined v-model="form.lastname" label="Nom" :rules="[formUserRules.required('Nom')]" label-color="black" dense hide-bottom-space>
                    <template v-slot:prepend>
                      <q-icon :name="mdiFormTextbox" color="black" />
                    </template>
                  </q-input>
                </div>

                <!-- Email -->
                <div class="q-mb-md">
                  <q-input rounded bg-color="white" outlined v-model="form.email" label="Adresse email" type="email" label-color="black" dense hide-bottom-space>
                    <template v-slot:prepend>
                      <q-icon :name="matMail" color="black" />
                    </template>
                  </q-input>
                </div>

                <!-- Mot de passe -->
                <div class="q-mb-md">
                  <q-input
                    rounded
                    bg-color="white"
                    outlined
                    v-model="password"
                    :type="isPwd ? 'password' : 'text'"
                    label-color="black"
                    label="Mot de passe"
                    dense
                    hide-bottom-space
                    :rules="checkPasswordRules()"
                  >
                    <template v-slot:prepend>
                      <q-icon :name="matLock" color="black" />
                    </template>
                    <template v-slot:append>
                      <q-icon :name="isPwd ? matVisibilityOff : matVisibility" class="cursor-pointer" color="black" @click="isPwd = !isPwd" />
                    </template>
                  </q-input>
                </div>

                <!-- Confirmer le mot de passe -->
                <div class="q-mb-md">
                  <q-input
                    rounded
                    bg-color="white"
                    outlined
                    v-model="checkPassword"
                    :type="isPwd ? 'password' : 'text'"
                    label-color="black"
                    label="Confirmer le mot de passe"
                    dense
                    :rules="[formUserRules.passwordMatch(password)]"
                    hide-bottom-space
                  >
                    <template v-slot:prepend>
                      <q-icon :name="matLock" color="black" />
                    </template>
                    <template v-slot:append>
                      <q-icon :name="isPwd ? matVisibilityOff : matVisibility" class="cursor-pointer" color="black" @click="isPwd = !isPwd" />
                    </template>
                  </q-input>
                </div>
              </q-card-section>

              <q-card-actions class="q-mx-md q-mb-md">
                <q-btn size="lg" class="full-width glossy bg-claspy-dark1" label="Continuer" type="submit" />
              </q-card-actions>
            </q-form>
          </div>
        </div>
      </q-card>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useQuasar } from 'quasar';
import imgLogin from '@/assets/pythie_alpha_hd_miroir_resized.png';
import { formUserRules } from '@/helpers/validation/rules';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { matLock, matMail, matVisibility, matVisibilityOff } from '@quasar/extras/material-icons';
import { mdiFormTextbox, mdiInformationOutline } from '@quasar/extras/mdi-v7';
import type { User, UserIn } from '@/models/types/users.type';
import { UserRoleEnum } from '@/models/enums/roles';
import { useUserStore } from '@/stores/users-store';
import { useConfigStore } from '@/stores/config-store';

const isPwd = ref(true);
const $q = useQuasar();
const router = useRouter();
const userStore = useUserStore();
const config = useConfigStore();

const form = ref<Partial<User>>({
  role_id: Number(UserRoleEnum.ADMIN),
});

const password = ref('');
const checkPassword = ref('');

function checkPasswordRules() {
  return [formUserRules.required('Mot de passe'), formUserRules.password];
}

async function submitForm() {
  if (!form.value.firstname || !form.value.lastname || !form.value.email || !password.value) {
    return;
  }

  const firstUser: UserIn = {
    firstname: form.value.firstname,
    lastname: form.value.lastname,
    email: form.value.email,
    password: password.value,
    role_id: Number(UserRoleEnum.ADMIN),
  };

  const res = await userStore.createFirstUser(firstUser);

  if (res.isOk) {
    await config.getSetupStatus();
    $q.dialog({
      title: 'Succès',
      message: 'Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.',
      ok: { label: 'OK', color: 'claspy-dark1' },
    }).onOk(() => {
      void router.push({ name: 'login', query: { email: form.value.email } });
    });
  }
}
</script>
