import { api } from 'src/boot/axios';
import type { ApiSettings, WorkDone } from 'src/models/types/api.type';
import { transformToCamelCase } from 'src/helpers/global-utils';

/**
 * Centralise les appels API pour la gestion de la configuration
 *
 */
class ConfigService {
  async getConfig(): Promise<WorkDone<ApiSettings>> {
    const { data: workDone } = await api.get<WorkDone<ApiSettings>>('/settings/load');
    return {
      ...workDone,
      data: transformToCamelCase(workDone.data),
    };
  }
}

export const configService = new ConfigService();
