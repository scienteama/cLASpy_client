import { api } from 'src/boot/axios';
import type { WorkDone } from 'src/models/types/api.type';
import { type Disk, type MetricPoint } from 'src/models/types/global.types';

class MetricsService {
  async getCpuHistory(): Promise<WorkDone<MetricPoint[]>> {
    const result = await api.get<WorkDone<MetricPoint[]>>('/metrics/cpu/history');
    return result.data;
  }

  async getDiskInfos(): Promise<WorkDone<Disk>> {
    const result = await api.get<WorkDone<Disk>>('/metrics/disk/infos');
    return result.data;
  }

  async getMemoryHistory(): Promise<WorkDone<MetricPoint[]>> {
    const result = await api.get<WorkDone<MetricPoint[]>>('/metrics/memory/history');
    return result.data;
  }
}

export const metricsService = new MetricsService();
