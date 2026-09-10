import { api } from '@/boot/axios';
import type { WorkDone } from '@/models/types/api.type';
import type { ModelFile, PointCloudFile, UploadFileParams } from '@/models/types/files.type';
import type { SklearnAlgorithmName, SklearnAlgorithmParams } from '@/models/types/ml/algorithms.types';
import type { PredictParameters } from '@/models/types/ml/predict.types';
import type { FeatureComputationParams, TrainParameters } from '@/models/types/ml/train.types';

/**
 * Claspy Trainer Service
 */

class MLService {
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

  async getModelFileInfos(fileId: string): Promise<WorkDone<ModelFile>> {
    const response = await api.get<WorkDone<ModelFile>>(`/claspy_ml/models/${fileId}`);
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

  async runTrainWithConfig(params: TrainParameters): Promise<WorkDone<string>> {
    const response = await api.post<WorkDone<string>>('/claspy_ml/run-train', params);
    return response.data;
  }

  async runPrediction(params: PredictParameters): Promise<WorkDone<string>> {
    const response = await api.post<WorkDone<string>>('/claspy_ml/run-prediction', params);
    return response.data;
  }

  async computeFeatures(params: FeatureComputationParams): Promise<WorkDone<string>> {
    const response = await api.post<WorkDone<string>>('/claspy_ml/compute-features', params);
    return response.data;
  }
}

export const mlService = new MLService();
