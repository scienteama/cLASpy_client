<template>
  <div v-if="props.isRealTime && isAdmin" class="q-px-md" style="width: 400px">
    <div class="metric-card">
      <div class="metric-label">CPU</div>
      <div class="bar" style="background: #ffecb3">
        <div class="fill cpu" :style="{ width: metrics.cpu.percent + '%' }"></div>
      </div>
      <div class="value">{{ metrics.cpu.percent.toFixed(0) }}%</div>
    </div>

    <div class="metric-card">
      <div class="metric-label">RAM</div>
      <div class="bar" style="background: #e1f5fe">
        <div class="fill ram" :style="{ width: metrics.ram.percent + '%' }"></div>
      </div>
      <div class="value">{{ metrics.ram.percent.toFixed(0) }}%</div>
    </div>

    <div class="metric-card">
      <div class="metric-label">DISQUE</div>
      <div class="bar" style="background: #b2dfdb">
        <div class="fill disk" :style="{ width: metrics.disk.percent + '%' }"></div>
      </div>
      <div class="value">{{ metrics.disk.percent.toFixed(0) }}%</div>
    </div>
  </div>
  <div v-else class="q-px-md">
    <div class="row items-center justify-start q-gutter-md q-mb-sm">
      <SmallGraph class="col-auto" label="CPU :" unit="%" :data="cpuHistory" />
      <SmallGraph class="col-auto" :label="'RAM :'" unit="%" :data="memoryHistory" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useMetricsStore } from '@/stores/metrics-store';
import { onMounted, onUnmounted } from 'vue';
import { useUserStore } from '@/stores/users-store';
import SmallGraph from '../tools/SmallGraph.vue';

const metricStore = useMetricsStore();
const { cpuHistory, memoryHistory, metrics } = storeToRefs(metricStore);

const userStore = useUserStore();
const { isAdmin } = storeToRefs(userStore);

const props = defineProps<{
  isRealTime: boolean;
  autoRefreshTime?: number;
}>();

onMounted(async () => {
  await metricStore.refreshMetricStore();
});

metricStore.startAutoRefresh(props.autoRefreshTime);
onUnmounted(() => {
  metricStore.stopAutoRefresh();
});
</script>
<style scoped lang="scss">
.metric-card {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.metric-label {
  width: 50px;
  font-weight: bold;
}

.bar {
  flex: 1;
  height: 10px;
  border-radius: 5px;
  overflow: hidden;
}

.fill {
  height: 100%;
  transition: width 0.3s ease;
}

.cpu {
  background: #ffca28;
}
.ram {
  background: #29b6f6;
}
.disk {
  background: #26a69a;
}

.value {
  width: 50px;
  text-align: right;
}
</style>
