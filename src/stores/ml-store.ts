/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AxiosError, AxiosProgressEvent } from 'axios';
import { type ErrorResponse, isAxiosErrorResponse } from '@/models/types/api.type';
import type { FileModel, ModelFile, PointCloudFile } from '@/models/types/files.type';
import { defineStore, storeToRefs } from 'pinia';
import { mlService } from '@/services/ml.service';
import { computed, ref, watch } from 'vue';
import { useFilesStore } from './files-store';
import { useQuasar } from 'quasar';
import type { TrainParameters } from '@/models/types/ml/train.types';
import { useNotifier } from '@/composables/notifier';
import FullScreenSpinner from '@/components/tools/FullScreenSpinner.vue';
import ConfirmDialog from '@/components/tools/ConfirmDialog.vue';
import { useUserStore } from './users-store';
import { checkFileSize } from '@/helpers/files-utils';
import type { PredictParameters } from '@/models/types/ml/predict.types';
import { farFile } from '@quasar/extras/fontawesome-v7';

export const useMLStore = defineStore('ml', () => {
  /* Stores */
  const $q = useQuasar();
  const $n = useNotifier();
  const filesStore = useFilesStore();
  const userStore = useUserStore();
  const { fileUploadProgress, currentFolder } = storeToRefs(filesStore);

  /* State */
  const pointCloudFile = ref<PointCloudFile>();
  const fileToUpload = ref<File | null>(null);
  const existingFile = ref<FileModel | null>(null);
  const uploadedFileName = ref<string | null>(null);

  const modelFile = ref<ModelFile>();
  const modelToUpload = ref<File | null>(null);
  const existingModel = ref<FileModel | null>(null);
  const uploadedModelName = ref<string | null>(null);

  const uploadIsDone = ref(false);
  const trainConfig = ref<TrainParameters>();
  const selectedFeatures = ref<Set<string>>(new Set());
  const step = ref(1);

  /* Computed */
  const folderId = computed(() => currentFolder.value?.id ?? 'root');

  /* Methods */
  const loadPointCloudFileInfos = async (fileId: string) => {
    const res = await mlService.getPointCloudFileInfos(fileId);
    if (res.isOk && res.data) {
      pointCloudFile.value = res.data;
    }
  };

  const loadModelFileInfos = async (fileId: string) => {
    const res = await mlService.getModelFileInfos(fileId);
    if (res.isOk && res.data) {
      modelFile.value = res.data;
      selectedFeatures.value = new Set(res.data.featuresList);
    }
  };

  const markUploadDone = () => {
    uploadIsDone.value = true;
  };

  /**
   * Si pointsNumber > 1_000_000 alors numberOfSamples = 1_000_000
   * Sinon sinon numberOfSamples = pointsNumber
   */
  function getNumberOfSamples() {
    return Math.min(pointCloudFile.value?.pointsNumber ?? 0, 1_000_000) / 1_000_000;
  }

  async function runTrainAsync() {
    const config = trainConfig.value;
    if (!config) return;

    const loading = $q.dialog({
      component: FullScreenSpinner,
      componentProps: {
        message: 'Entraînement en cours...',
        color: 'cyan',
        size: '60px',
      },
    });

    try {
      const res = await mlService.runTrainWithConfig(config);
      loading.hide();
      if (res.isOk) {
        $n.notifySuccess(res.result);
        resetStore();
        await filesStore.reloadRoot();
      }
    } catch (err: any) {
      loading.hide();

      if (err.status === 503) {
        $q.dialog({
          component: ConfirmDialog,
          componentProps: {
            title: 'Une erreur est survenue :',
            message: `Il semblerait que le plugin Taskrunner ait rencontré une erreur. 
                  Pour lancer l'entraînement sans le plugin, cliquez sur Continuer.`,
            confirmLabel: 'Continuer',
          },
          persistent: true,
        }).onOk(() => {
          void (async () => {
            config.noWorker = true;

            const newSpinner = $q.dialog({
              component: FullScreenSpinner,
              componentProps: { message: 'Entraînement en cours...', color: 'cyan', size: '60px' },
            });

            try {
              const trainRes = await mlService.runTrainWithConfig(config);
              if (trainRes.isOk) {
                $n.notifySuccess(trainRes.result);
                await filesStore.reloadRoot();
                resetStore();
              }
            } catch (err: any) {
              $n.notifyError(err?.message);
            } finally {
              newSpinner.hide();
            }
          })();
        });
      } else {
        $n.notifyError(err?.message);
      }
    }
  }

  async function runPredictAsync(predictConfig: PredictParameters): Promise<boolean> {
    const loading = $q.dialog({
      component: FullScreenSpinner,
      componentProps: {
        message: 'Prédiction en cours...',
        color: 'cyan',
        size: '60px',
      },
    });
    try {
      const res = await mlService.runPrediction(predictConfig);
      loading.hide();
      if (res.isOk) {
        $n.notifySuccess(res.result);
        resetStore();
        await filesStore.reloadRoot();
        return true;
      }
      return false;
    } catch (err: any) {
      loading.hide();
      $n.notifyError(err?.message);
      return false;
    }
  }

  async function uploadPointCloudFile(): Promise<void> {
    if (!fileToUpload.value) return;

    if (!checkFileSize(fileToUpload.value)) return;

    fileUploadProgress.value = {
      percent: 0,
      color: 'green-2',
      error: false,
      icon: farFile,
      uploading: true,
      speed: 0,
    };

    const formData = new FormData();
    formData.append('file', fileToUpload.value);
    formData.append('folderId', folderId.value);

    let lastLoaded = 0;
    let lastTime = Date.now();

    try {
      const res = await mlService.loadPointCloudFile({
        data: formData,
        onUploadProgress: (progressEvent?: AxiosProgressEvent) => {
          if (progressEvent?.total && progressEvent.loaded) {
            const now = Date.now();
            const deltaTime = now - lastTime;
            const deltaBytes = progressEvent.loaded - lastLoaded;

            if (deltaTime > 0 && deltaBytes > 0) {
              const bytesPerSecond = (deltaBytes / deltaTime) * 1000;
              const megaPerSecond = bytesPerSecond / (1024 * 1024);
              fileUploadProgress.value.speed = parseFloat(megaPerSecond.toFixed(2));
            }

            lastLoaded = progressEvent.loaded;
            lastTime = now;

            const percent = progressEvent.loaded / progressEvent.total;
            fileUploadProgress.value.percent = percent;
            fileUploadProgress.value.color = percent < 1 ? 'green-2' : 'green-4';
          }
        },
      });

      fileUploadProgress.value.uploading = false;
      fileUploadProgress.value.speed = 0;

      if (res.isOk) {
        fileUploadProgress.value.percent = 1;
        fileUploadProgress.value.color = 'green-4';
        $q.notify({ type: 'positive', message: `Fichier ${res.data.name} uploadé avec succès.` });
        pointCloudFile.value = res.data;
        uploadedFileName.value = res.data.name;
        markUploadDone();
        await filesStore.refreshCurrentFolder();
        await userStore.getMe();
      } else {
        throw new Error(res.result || 'Erreur upload.');
      }
    } catch (err) {
      fileUploadProgress.value.error = true;
      fileUploadProgress.value.color = 'red-4';
      fileUploadProgress.value.uploading = false;
      fileUploadProgress.value.speed = 0;

      let msg = 'Erreur lors du téléversement';
      if ((err as AxiosError)?.response?.data && isAxiosErrorResponse((err as AxiosError).response?.data)) {
        const data = (err as AxiosError).response?.data as ErrorResponse;
        msg = data.data?.detail || data.result || msg;
      } else if (err instanceof Error) {
        msg = err.message;
      }

      $q.notify({ type: 'negative', message: msg });
      throw err;
    }
  }

  function resetStore() {
    pointCloudFile.value = undefined;
    fileToUpload.value = null;
    existingFile.value = null;
    uploadedFileName.value = null;

    modelFile.value = undefined;
    modelToUpload.value = null;
    existingModel.value = null;
    uploadedModelName.value = null;

    uploadIsDone.value = false;
    trainConfig.value = undefined;
    selectedFeatures.value = new Set();
    step.value = 1;
  }

  /* Watchers */
  watch(existingFile, async (newVal) => {
    if (newVal?.id) {
      await loadPointCloudFileInfos(newVal.id);
    } else {
      pointCloudFile.value = undefined;
    }
  });

  watch(existingModel, async (newVal) => {
    if (newVal?.id) {
      await loadModelFileInfos(newVal.id);
    } else {
      modelFile.value = undefined;
    }
  });

  watch(uploadIsDone, (done) => {
    if (done) {
      fileToUpload.value = null;
      modelToUpload.value = null;
      uploadIsDone.value = false;
    }
  });

  return {
    pointCloudFile,
    fileToUpload,
    modelToUpload,
    existingFile,
    existingModel,
    uploadedModelName,
    modelFile,
    uploadedFileName,
    uploadIsDone,
    folderId,
    trainConfig,
    selectedFeatures,
    step,
    runTrainAsync,
    runPredictAsync,
    markUploadDone,
    uploadPointCloudFile,
    getNumberOfSamples,
  };
});
