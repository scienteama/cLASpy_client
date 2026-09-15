<template>
  <div class="row justify-center items-center q-pa-md" style="min-height: 80vh">
    <div class="col-12 col-sm-10 col-md-6 col-lg-3">
      <q-card bordered class="inset-shadow-down bg-shadow-box">
        <div class="row justify-center items-center">
          <div class="col-12 text-center q-my-md">
            <q-card-section>
              <q-avatar size="200px" font-size="52px">
                <img :src="imgLogin" alt="Login Image" />
              </q-avatar>
            </q-card-section>
          </div>

          <div class="col-12">
            <q-form @submit.prevent="onLogin">
              <q-card-section>
                <!-- Email -->
                <div class="row items-center q-col-gutter-md q-mb-md">
                  <div class="col">
                    <q-input rounded bg-color="white" outlined v-model="loginForm.email" type="email" name="email" label="Email" label-color="black" dense>
                      <template v-slot:prepend>
                        <q-icon :name="matMail" color="black" />
                      </template>
                    </q-input>
                  </div>
                </div>

                <!-- Mot de passe -->
                <div class="row items-center q-col-gutter-md q-mb-md">
                  <div class="col">
                    <q-input rounded bg-color="white" outlined v-model="loginForm.password" :type="isPwd ? 'password' : 'text'" label-color="black" label="Mot de passe" dense>
                      <template v-slot:prepend>
                        <q-icon :name="matLock" color="black" />
                      </template>
                      <template v-slot:append>
                        <q-icon :name="isPwd ? matVisibilityOff : matVisibility" class="cursor-pointer" color="black" @click="isPwd = !isPwd" />
                      </template>
                    </q-input>
                  </div>
                </div>
              </q-card-section>

              <q-card-actions class="q-mx-md q-mb-md">
                <q-btn size="lg" class="full-width glossy bg-claspy-dark1" label="Login" type="submit" />
              </q-card-actions>

              <q-card-section>
                <div class="text-center">
                  <q-chip clickable class="glossy" color="claspy-dark1" text-color="white" :icon="matLockReset" @click="onReset()"> Mot de passe oublié ? </q-chip>
                </div>
              </q-card-section>
            </q-form>
          </div>
        </div>
      </q-card>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { LoginDto } from '@/models/types/auth.type';
import { useQuasar } from 'quasar';
import imgLogin from '@/assets/pythie_alpha_hd_miroir_resized.png';
import ConfirmDialog from '@/components/tools/ConfirmDialog.vue';
import { formUserRules } from '@/helpers/validation/rules';
import { useAuth } from '@/stores/auth-store';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { matLock, matLockReset, matMail, matVisibility, matVisibilityOff } from '@quasar/extras/material-icons';

const $q = useQuasar();
const auth = useAuth();
const router = useRouter();
const route = useRoute();

const email = ref((route.query.email as string) || '');
const loginForm = ref<LoginDto>({ email: email.value, password: '' });
const isPwd = ref(true);

async function onLogin() {
  const result = await auth.userLogin(loginForm.value);
  if (result) {
    $q.notify({ type: 'positive', message: `Bienvenue ${result.firstname}` });
    await router.push('/');
  }
}

function onReset() {
  if (formUserRules.email(loginForm.value.email) === true) {
    $q.dialog({
      component: ConfirmDialog,
      componentProps: {
        title: "Confirmer l'action",
        message: 'Êtes-vous sûr de vouloir réinitialiser le mot de passe ?',
        confirmLabel: 'Confirmer',
        cancelLabel: 'Annuler',
      },
    }).onOk(() => {
      void router.push({
        name: 'reset-password',
        query: { email: loginForm.value.email },
      });
    });
  } else {
    $q.notify({ type: 'negative', message: 'Veuillez saisir une adresse mail valide.' });
  }
}
</script>
