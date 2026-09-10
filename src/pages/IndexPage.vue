<template>
  <q-page class="row items-center justify-evenly">
    <q-card class="my-card">
      <q-card-section>
        <div class="text-h6">Bienvenue sur ClasPy_T</div>
        <div class="text-subtitle2">Le logiciel de classification automatique des nuages de points</div>
      </q-card-section>

      <q-card-section>
        <ExampleComponent />
      </q-card-section>

      <q-separator />

      <q-card-actions align="right">
        <q-btn flat label="Commencer" color="primary" to="/projects" />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import ExampleComponent from '@/components/ExampleComponent.vue';
</script>
