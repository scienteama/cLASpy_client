import type { AlgoParamValue } from "./algorithms.types";

export interface TrainParameters {
    fileId: string;
    folderId: string;
    samples: number;
    trainingRatio: number;
    scaler: string;
    scorer: string,
    nJobsCv: number,
    pca: number,
    randomState: number,
    algorithm: string | null,
    pngFeatures: boolean,
    parameters: Record<string, AlgoParamValue> | null;
    featureNames: string[];
    fillnan: string;
}