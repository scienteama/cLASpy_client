<template>
  <div class="row justify-center items-center q-pa-md" style="min-height: 80vh">
    <div class="col-12 col-sm-10 col-md-6 col-lg-3">
      <q-card bordered class="inset-shadow-down bg-shadow-box">
        <div class="row justify-center items-center">
          <div class="col-12 text-center q-my-md">
            <q-card-section class="q-pa-none">
              <q-avatar size="150px">
                <img :src="imgLogin" alt="Login Image" />
              </q-avatar>
            </q-card-section>
          </div>

          <div class="col-12">
            <q-form ref="resetPasswordForm" autocomplete="off" @submit.prevent="onResetPassword">
              <!-- Email -->
              <q-card-section>
                <q-input
                  rounded
                  bg-color="white"
                  outlined
                  v-model="email"
                  label="Adresse email"
                  type="email"
                  label-color="black"
                  hide-bottom-space
                  :rules="[formUserRules.required('Adresse email'), formUserRules.email]"
                >
                  <template v-slot:prepend>
                    <q-icon :name="matMail" color="black" />
                  </template>
                </q-input>
              </q-card-section>

              <!-- Code de récupération -->
              <q-card-section>
                <q-input
                  v-model="recoveryCode"
                  label="Code de récupération"
                  hint="Entrez un code de récupération"
                  placeholder="ABCD-EFGH-IJKL"
                  bg-color="white"
                  outlined
                  rounded
                  label-color="black"
                  hide-bottom-space
                  autocomplete="off"
                  mask="XXXX-XXXX-XXXX"
                  :mask-tokens="recoveryCodeTokens"
                  :rules="[(val) => !!val || 'Code de récupération requis', (val) => isValidRecoveryCode(val) || 'Code de récupération invalide']"
                >
                  <template #prepend>
                    <q-icon :name="matKey" color="black" />
                  </template>
                </q-input>
              </q-card-section>

              <q-card-section>
                <!-- Nouveau mot de passe -->
                <div class="q-mb-md">
                  <q-input
                    rounded
                    bg-color="white"
                    outlined
                    v-model="newPassword"
                    :type="isPwd ? 'password' : 'text'"
                    label-color="black"
                    label="Mot de passe"
                    hide-bottom-space
                    :rules="[formUserRules.required('Mot de passe'), formUserRules.password]"
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
                    :rules="[formUserRules.passwordMatch(newPassword)]"
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
                <q-btn size="lg" class="full-width glossy bg-claspy-dark1" label="Continuer" type="submit" :disable="isSubmitDisabled" :loading="isLoading" />
              </q-card-actions>
            </q-form>
          </div>
        </div>
      </q-card>
    </div>
  </div>
</template>
<script setup lang="ts">
import imgLogin from '@/assets/pythie_alpha_hd_miroir_resized.png';
import { formUserRules, isValidRecoveryCode, recoveryCodeTokens } from '@/helpers/validation/rules';
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { matKey, matLock, matMail, matVisibility, matVisibilityOff } from '@quasar/extras/material-icons';
import { authService } from '@/services/auth.service';
import { useNotifier } from '@/composables/notifier';

const isPwd = ref(true);
const $n = useNotifier();
const router = useRouter();
const route = useRoute();

const email = ref((route.query.email as string) || '');
const recoveryCode = ref('');
const newPassword = ref('');
const checkPassword = ref('');
const isLoading = ref(false);

const isSubmitDisabled = computed(() => {
  return !newPassword.value || !checkPassword.value || !recoveryCode.value || !isValidRecoveryCode(recoveryCode.value);
});

async function onResetPassword() {
  if (!isSubmitDisabled.value) {
    isLoading.value = true;

    const response = await authService.resetPassword({
      recoveryCode: recoveryCode.value,
      newPassword: newPassword.value,
      email: email.value,
    });

    if (response.isOk) {
      $n.notifySuccess(response.data);
      void router.push({ name: 'login' });
    } else {
      $n.notifyError(response.result);
    }

    isLoading.value = false;
    return;
  }
}
</script>
