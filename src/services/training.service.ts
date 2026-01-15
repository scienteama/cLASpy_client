import { api } from 'src/boot/axios';
import type { WorkDone } from 'src/types/api.type';
import type { UploadFileParams } from 'src/types/files.type';

/**
 * Claspy Trainer Service
 */

class TrainerService {
  async loadPointCloudFile(params: UploadFileParams): Promise<WorkDone<Record<string, string>>> {
    const response = await api.post<WorkDone<Record<string, string>>>('/claspy_ml/load-data', params.data, {
      onUploadProgress: params.onUploadProgress ?? (() => {}),
    });
    return response.data;
  }

  async getCoreVersion(): Promise<WorkDone<string>> {
    const response = await api.get<WorkDone<string>>('/claspy_ml/core_version');
    return response.data;
  }
}

export const trainerService = new TrainerService();
