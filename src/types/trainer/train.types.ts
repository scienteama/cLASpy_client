import type { AlgoParameters } from './algorithms.types';

export interface TrainParameters {
  fileId: string;
  folderId: string;
  createdAt: string;
  samples: number;
  trainingRatio: number;
  scaler: string;
  scorer: string;
  nJobsCv: number;
  pca: number;
  randomState: number;
  algorithm: string | null;
  pngFeatures: boolean;
  parameters: AlgoParameters | null;
  featureNames: string[];
  fillnan: string;
  disableTaskRunner?: boolean;
}
