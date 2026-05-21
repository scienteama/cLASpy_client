import { defineStore } from 'pinia';
import { ref } from 'vue';
import { type MetricPoint, type Metrics } from 'src/models/types/global.types';
import { metricsService } from 'src/services/metrics.service';

export const useMetricsStore = defineStore('metrics', () => {
  const lastUpdate = ref(0);

  const metrics = ref<Metrics>({
    cpu: { percent: 0 },
    ram: {
      total: 0,
      used: 0,
      available: 0,
      percent: 0,
      free: 0,
    },
    disk: {
      total: 0,
      used: 0,
      percent: 0,
      free: 0,
    },
  });

  const cpuHistory = ref<MetricPoint[]>([]);
  const memoryHistory = ref<MetricPoint[]>([]);

  let intervalId: ReturnType<typeof setInterval> | null = null;

  function setMetrics(data: { cpu_percent: number; disk_percent: number; ram_used: number; ram_percent: number }) {
    metrics.value.cpu.percent = data.cpu_percent;
    metrics.value.disk.percent = data.disk_percent;
    metrics.value.ram.used = data.ram_used;
    metrics.value.ram.percent = data.ram_percent;
    lastUpdate.value = Date.now();
  }

  async function getCpuHistory() {
    const res = await metricsService.getCpuHistory();
    if (res.isOk && res.data) {
      cpuHistory.value = res.data;
    }
  }

  async function getDiskInfos() {
    const res = await metricsService.getDiskInfos();
    if (res.isOk && res.data) {
      metrics.value.disk.total = res.data.total;
      metrics.value.disk.used = res.data.used;
      metrics.value.disk.free = res.data.free;
    }
  }

  async function getMemoryHistory() {
    const res = await metricsService.getMemoryHistory();
    if (res.isOk && res.data) {
      memoryHistory.value = res.data;
    }
  }

  async function refreshMetricStore() {
    await Promise.all([getCpuHistory(), getMemoryHistory(), getDiskInfos()]);
  }

  function startAutoRefresh(intervalMs = 300000) {
    if (intervalId) return;

    intervalId = setInterval(() => {
      void refreshMetricStore();
    }, intervalMs);
  }

  function stopAutoRefresh() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  return {
    metrics,
    cpuHistory,
    memoryHistory,
    lastUpdate,
    setMetrics,
    getCpuHistory,
    getMemoryHistory,
    refreshMetricStore,
    startAutoRefresh,
    stopAutoRefresh,
  };
});
