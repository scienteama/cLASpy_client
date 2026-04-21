<template>
  <div ref="featsCard">
    <q-card>
      <q-toolbar v-if="showTitle" class="bg-blue-1 text-primary shadow-2">
        <q-toolbar-title>Attributs :</q-toolbar-title>
      </q-toolbar>

      <q-list bordered padding dense style="max-height: 40vh; overflow-y: auto" @mouseup="onMouseUp">
        <q-item
          v-for="(feat, index) in features"
          :key="index"
          :clickable="itemClickable"
          :active="selectedFeatures.has(feat)"
          active-class="bg-blue-1 text-primary"
          @mousedown.prevent="onMouseDown(feat)"
          @mouseenter="onMouseMove(feat)"
        >
          <q-item-section avatar>
            <q-icon color="accent" :name="mdiCubeOutline" size="sm" />
          </q-item-section>
          <q-item-section>{{ feat.toUpperCase() }}</q-item-section>
        </q-item>
      </q-list>

      <q-card-actions align="right">
        <q-btn flat outlined label="Fermer" @click="close()" />
      </q-card-actions>
    </q-card>
  </div>
</template>
<script setup lang="ts">
import { mdiCubeOutline } from '@quasar/extras/mdi-v7';
import { storeToRefs } from 'pinia';
import { useMLStore } from 'src/stores/ml-store';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

const featsCard = ref<HTMLElement | null>(null);

const props = defineProps({
  showTitle: { type: Boolean, default: true },
  itemClickable: { type: Boolean, default: true },
});

const mlStore = useMLStore();
const { pointCloudFile, selectedFeatures } = storeToRefs(mlStore);

const features = computed(() => pointCloudFile.value?.featuresList);
const isDragging = ref(false);

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'select:features', items: string[]): void;
}>();

function onMouseDown(feat: string) {
  if (props.itemClickable) {
    isDragging.value = true;
    selectItems(feat);
  }
}

function onMouseMove(feat: string) {
  if (props.itemClickable) {
    if (isDragging.value) {
      selectItems(feat);
    }
  }
}

function onMouseUp() {
  if (props.itemClickable) {
    isDragging.value = false;
  }
}

function onKeyDown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
    e.preventDefault();
    selectAll();
  }
}

function onRightClickGlobal(e: MouseEvent) {
  e.preventDefault();
  unSelectAll();
}

function selectAll() {
  selectedFeatures.value = new Set(features.value ?? []);
  emit('select:features', Array.from(selectedFeatures.value));
}

function unSelectAll() {
  selectedFeatures.value.clear();
  emit('select:features', []);
}

function selectItems(feat: string) {
  if (selectedFeatures.value.has(feat)) {
    selectedFeatures.value.delete(feat);
  } else {
    selectedFeatures.value.add(feat);
  }
  emit('select:features', Array.from(selectedFeatures.value));
}

function close() {
  emit('close');
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown);
  if (featsCard.value) {
    featsCard.value.addEventListener('contextmenu', onRightClickGlobal);
    featsCard.value.tabIndex = 0;
  }
});

/* Clear listeners for this component */
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown);
  featsCard.value?.removeEventListener('contextmenu', onRightClickGlobal);
});
</script>
