import { api } from 'src/boot/axios';
import type { Plugin } from 'src/types/plugins.types';

class PluginService {
  async getPlugins(): Promise<Plugin[]> {
    const response = await api.get<Plugin[]>('/modules/list/claspy-modules');
    return response.data;
  }

  async installPlugin(pluginName: string): Promise<boolean> {
    const res = await api.post<boolean>(`/modules/load/${pluginName}`);
    return res.data;
  }

  async uninstallPlugin(pluginName: string): Promise<boolean> {
    const res = await api.delete<boolean>(`/modules/unload/${pluginName}`);
    return res.data;
  }
}

export const pluginService = new PluginService();
