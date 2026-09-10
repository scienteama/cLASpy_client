<template>
  <q-card flat bordered class="q-mb-sm bg-transparent">
    <q-card-section class="q-pb-sm">
      <div class="row items-center no-wrap q-mb-sm">
        <q-spinner-gears v-if="!isDone" :color="progressColor" size="1.25rem" class="q-mr-sm" />
        <q-icon v-else name="check_circle" color="positive" size="sm" class="q-mr-sm" />
        <div class="col ellipsis text-weight-medium" :title="bar.label">{{ bar.label }}</div>
        <q-badge :color="progressColor" :label="`${bar.percent}%`" />
      </div>

      <q-linear-progress rounded stripe size="8px" :value="progressValue" :color="progressColor" track-color="grey-3" />
    </q-card-section>

    <q-card-section class="row items-center q-gutter-x-md q-pt-none text-caption text-white">
      <div class="row items-center">
        <q-icon :name="mdiDotsGrid" size="sm" class="q-mr-xs" />
        {{ formatCount(bar.current) }} / {{ formatCount(bar.total) }}
      </div>
      <div class="row items-center">
        <q-icon name="schedule" size="sm" class="q-mr-xs" />
        {{ bar.elapsed }} &lt; {{ bar.eta }}
      </div>
      <q-space />
      <div class="row items-center text-light-blue-6">
        <q-icon :name="mdiSpeedometer" size="sm" class="q-mr-xs" />
        {{ formatSpeed(bar.speed) }}
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import type { ComputeProgress } from '@/stores/console.store';
import { mdiDotsGrid, mdiSpeedometer } from '@quasar/extras/mdi-v7';
import { computed } from 'vue';

const props = defineProps<{ bar: ComputeProgress }>();

const progressValue = computed(() => Math.min(Math.max(props.bar.percent, 0), 100) / 100);

const isDone = computed(() => props.bar.percent >= 100);

const progressColor = computed(() => {
  if (props.bar.percent < 30) return 'negative';
  if (props.bar.percent < 70) return 'warning';
  if (props.bar.percent < 100) return 'positive';
  return 'positive';
});

function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M pts';
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'k pts';
  return n + ' pts';
}

function formatSpeed(speed: string): string {
  // "64454.85points/s" → "64 454 pts/s"
  const m = speed.match(/([\d.]+)points\/s/);
  if (!m) return speed;
  const val = parseFloat(m[1]!);
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(val) + ' pts/s';
}
</script>
