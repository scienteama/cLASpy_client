<template>
  <q-linear-progress stripe rounded :size="props.size ?? '20px'" :value="props.value" :color="props.color ?? 'green'" class="q-mt-sm">
    <div class="absolute-full flex flex-center">
      <q-badge color="white" :text-color="props.color" :label="label" />
    </div>
  </q-linear-progress>
</template>
<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  size?: string;
  color?: string;
  stripe?: boolean;
  value: number;
  unit?: string;
}>();

const label = computed(() => (props.value * 100).toFixed(2) + props.unit);
</script>
