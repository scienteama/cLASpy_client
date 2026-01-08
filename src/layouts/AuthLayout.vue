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

        <q-btn dense flat round icon="fa-brands fa-github" size="md" />
        <q-btn dense flat round icon="menu" class="q-ml-sm" size="md" />
      </q-toolbar>
    </q-header>

    <q-page-container class="page-container">
      <AnimatedBackground :num-points="200" :line-width="0.2" :theme="'forest'" class="background-component" />
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
</template>

<script setup lang="ts">
import AnimatedBackground from 'src/components/animations/AnimatedBackground.vue';
import pythie from 'src/assets/pythie_alpha_hd_miroir_resized.png';
const appVersion = '0.1.0';
</script>

<style lang="scss" scoped>
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
