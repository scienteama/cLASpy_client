import { api } from 'src/boot/axios';
import type { WorkDone } from 'src/types/api.type';
import type { Plugin } from 'src/types/plugins.types';

class PluginService {
  async getPlugins(): Promise<WorkDone<Plugin[]>> {
    const response = await api.get<WorkDone<Plugin[]>>('/modules/list/claspy-modules');
    return response.data;
  }

  async installPlugin(pluginName: string): Promise<WorkDone<string>> {
    const res = await api.post<WorkDone<string>>(`/modules/load/${pluginName}`);
    return res.data;
  }

  async uninstallPlugin(pluginName: string): Promise<WorkDone<string>> {
    const res = await api.delete<WorkDone<string>>(`/modules/unload/${pluginName}`);
    return res.data;
  }
}

export const pluginService = new PluginService();
