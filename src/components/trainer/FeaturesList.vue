<template>
  <q-card style="width: 95vw">
    <q-toolbar class="bg-blue-1 text-primary shadow-2">
      <q-toolbar-title>Attributs :</q-toolbar-title>
    </q-toolbar>

    <q-list bordered padding dense style="max-height: 50vh; overflow-y: auto">
      <q-item v-for="(feat, index) in features" :key="index" clickable @click="selectItem(feat)">
        <q-item-section avatar>
          <q-icon color="accent" name="mdi-cube-outline" size="sm" />
        </q-item-section>
        <q-item-section>{{ feat.toUpperCase() }}</q-item-section>
      </q-item>
    </q-list>

    <q-card-actions align="right">
      <q-btn flat outlined label="Fermer" v-close-popup />
    </q-card-actions>
  </q-card>
</template>
<script setup lang="ts">
defineProps({
  features: { type: Array as () => string[], default: (): string[] => [] },
});

const emit = defineEmits<{
  (e: 'close', value: boolean): void;
  (e: 'select:feature', item: string): void;
}>();

function selectItem(feat: string) {
  console.log(feat);
  emit('select:feature', feat);
}
</script>
