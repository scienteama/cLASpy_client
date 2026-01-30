<template>
  <q-layout view="lHh lpR fFf" class="auth-layout">
    <q-header class="bg-claspy-dark1 glossy text-white q-pa-md">
      <q-toolbar>
        <q-toolbar-title>
          <q-avatar color="grey" rounded size="lg">
            <q-img :src="pythie" />
          </q-avatar>
          cLASpy_Client
        </q-toolbar-title>
        <q-btn dense flat round icon="mdi-palette-outline" size="md" @click="chooseColor = true" />
        <q-btn dense flat round icon="mdi-palette-advanced" outline size="md" class="q-ml-sm" @click="chooseTheme = true" />
        <q-btn dense flat round icon="fa-brands fa-github" class="q-ml-sm" size="md" />
        <q-btn dense flat round icon="menu" class="q-ml-sm" size="md" />
      </q-toolbar>
    </q-header>

    <q-page-container class="page-container">
      <AnimatedBackground :num-points="200" :line-width="0.2" class="background-component" />
      <div class="router-view-wrapper">
        <router-view />
      </div>
    </q-page-container>

    <q-footer>
      <q-toolbar class="glossy bg-claspy-dark1">
        <q-toolbar-title class="q-pa-md">
          <div class="row items-center">
            <q-btn flat label="À propos" icon="info" class="text-white" to="/about" />
          </div>
        </q-toolbar-title>

        <div class="text-caption text-grey-4 q-pr-sm q-pb-xs">
          <q-badge outline align="middle" color="white"> v{{ appVersion }} </q-badge>
        </div>
      </q-toolbar>
    </q-footer>
  </q-layout>

  <q-dialog v-model="chooseColor" class="choose-theme-dialog" backdrop-filter="blur(4px) saturate(150%)">
    <q-card class="choose-theme-dialog-pos">
      <q-card-section>
        <q-color v-model="hex" no-header no-footer flat />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Fermer" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="chooseTheme" class="choose-theme-dialog" backdrop-filter="blur(4px) saturate(150%)">
    <q-card class="choose-theme-dialog-pos">
      <q-card-section>
        <q-select outlined v-model="selectedTheme" label="Thème :" :options="themeList" dense>
          <template v-slot:prepend>
            <q-icon name="mdi-format-list-bulleted-square" color="primary" />
          </template>
        </q-select>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Fermer" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import AnimatedBackground from 'src/components/animations/AnimatedBackground.vue';
import pythie from 'src/assets/pythie_alpha_hd_miroir_resized.png';
import { computed, onMounted, ref, watch } from 'vue';
import { useConfigStore } from 'src/stores/config-store';
import { storeToRefs } from 'pinia';
import { generatePalette } from 'src/utils';

const configStore = useConfigStore();
const { defaultThemes, currentTheme } = storeToRefs(configStore);

const appVersion = '0.1.0';
const chooseColor = ref(false);
const chooseTheme = ref(false);
const hex = ref('');
const baseTheme = ref(defaultThemes.value.forest);
const selectedTheme = ref('');
const themeList = Object.keys(defaultThemes.value);
const themePal = computed(() => defaultThemes.value[selectedTheme.value]);

watch(hex, (newVal) => {
  if (newVal) baseTheme.value = [];
  currentTheme.value = generatePalette(newVal, 8);
});

watch(themePal, () => {
  if (themePal.value) {
    currentTheme.value = themePal.value;
  }
});

onMounted(() => {
  if (baseTheme.value && currentTheme.value.length == 0) {
    currentTheme.value = baseTheme.value;
  }
});
</script>

<style lang="scss" scoped>
.choose-theme-dialog {
  .q-dialog__inner {
    align-items: flex-start;
    justify-content: flex-start;
  }
}

.choose-theme-dialog-pos {
  position: fixed;
  top: 16px;
  right: 16px;
  min-width: 250px;
}

.auth-layout {
  overflow: hidden !important;

  .page-container {
    padding: 4vw;

    .background-component {
      position: absolute;
      top: -5%;
      left: -5%;
      width: 110%;
      height: 110%;
      z-index: 0;
    }

    .router-view-wrapper {
      z-index: 1;
    }
  }
}
</style>
