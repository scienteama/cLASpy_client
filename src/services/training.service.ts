import { api } from 'src/boot/axios';
import type { WorkDone } from 'src/types/api.type';
import type { PointCloudFile, UploadFileParams } from 'src/types/files.type';
import type { SklearnAlgorithmName, SklearnAlgorithmParams } from 'src/types/trainer/algorithms.types';
import type { TrainParameters } from 'src/types/trainer/train.types';

/**
 * Claspy Trainer Service
 */

class TrainerService {
  async loadPointCloudFile(params: UploadFileParams): Promise<WorkDone<PointCloudFile>> {
    const response = await api.post<WorkDone<PointCloudFile>>('/claspy_ml/load-data', params.data, {
      onUploadProgress: params.onUploadProgress ?? (() => {}),
    });
    return response.data;
  }

  async getPointCloudFileInfos(fileId: string): Promise<WorkDone<PointCloudFile>> {
    const response = await api.get<WorkDone<PointCloudFile>>(`/claspy_ml/load-file/${fileId}`);
    return response.data;
  }

  async getCoreVersion(): Promise<WorkDone<string>> {
    const response = await api.get<WorkDone<string>>('/claspy_ml/core_version');
    return response.data;
  }

  async getAllAlgorithms(): Promise<WorkDone<string[]>> {
    const response = await api.get<WorkDone<string[]>>('claspy_ml/algorithms');
    return response.data;
  }

  async getAlgoParamsByName<T extends SklearnAlgorithmName>(name: T): Promise<WorkDone<SklearnAlgorithmParams[T]>> {
    const response = await api.get<WorkDone<SklearnAlgorithmParams[T]>>(`/claspy_ml/algorithms/${name}/params`);
    return response.data;
  }

  async runTrainWithConfig(params : TrainParameters): Promise<WorkDone<string>> {
    const response = await api.post<WorkDone<string>>('/claspy_ml/run-train', params);
    return response.data;
  }
}

export const trainerService = new TrainerService();
