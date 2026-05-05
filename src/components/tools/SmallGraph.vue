<template>
  <q-card flat bordered :class="average >= 80 ? 'bg-red-1' : 'bg-grey-2'" class="mini-chart-card text-black">
    <q-card-section class="q-pa-sm">
      <div class="chart-label row items-center justify-between">
        <div class="col-auto">{{ label }}</div>
        <div v-if="data && data.length > 0" :class="average >= 80 ? 'text-negative' : ''" class="chart-value col-auto">
          <span class="q-mr-sm">{{ average }}</span
          ><span class="q-mr-xs">{{ unit }}</span>
        </div>
      </div>

      <svg :width="width" :height="height" class="chart-sparkline">
        <path :d="areaPath" :fill="average >= 80 ? '#ffcdd2 ' : '#bbdefb '" stroke="none" />
        <path :d="d" fill="none" :stroke="average >= 80 ? '#c10015' : '#42a5f5   '" />
      </svg>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export interface MetricPoint {
  t: number;
  v: number;
}

const props = defineProps<{
  data?: MetricPoint[];
  label: string;
  unit?: string;
}>();

const width = 160;
const height = 60;

const average = computed(() => {
  const data = props.data;

  if (!data?.length) return 0;

  const sum = data.reduce((acc, p) => acc + p.v, 0);

  return Math.round(sum / data.length);
});

const d = computed(() => {
  const data = props.data;

  if (!Array.isArray(data) || data.length < 2) {
    return '';
  }

  const vals = data.map((p) => p.v);

  const min = 0;
  const max = 100;
  const range = max - min;

  const scaleX = (width - 10) / (data.length - 1);
  const scaleY = (height - 10) / range;

  let path = '';

  vals.forEach((v, i) => {
    const x = i * scaleX + 5;
    const y = height - 5 - (v - min) * scaleY;

    path += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
  });

  return path;
});

const areaPath = computed(() => {
  const data = props.data;
  if (!Array.isArray(data) || data.length < 2) return '';

  const vals = data.map((p) => p.v);

  const min = 0;
  const max = 100;
  const range = max - min;

  const scaleX = (width - 10) / (data.length - 1);
  const scaleY = (height - 10) / range;

  let d = '';

  vals.forEach((v, i) => {
    const x = i * scaleX + 5;
    const y = height - 5 - (v - min) * scaleY;

    d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
  });

  // fermeture vers le bas
  const lastX = (data.length - 1) * scaleX + 5;
  const firstX = 5;
  const bottomY = height - 5;

  return `${d} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
});
</script>

<style scoped lang="scss">
.mini-chart-card {
  width: 180px;
  border-radius: 12px;
}

.chart-label {
  opacity: 0.6;
}

.chart-value {
  font-size: 20px;
  font-weight: 600;
}

.chart-sparkline {
  display: block;
}
</style>
