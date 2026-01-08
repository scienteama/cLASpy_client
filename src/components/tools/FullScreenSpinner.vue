<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide" persistent no-backdrop-dismiss>
    <q-card class="q-pa-lg flex flex-center column items-center">
      <component :is="spinnerComponent" :color="color" :size="size" />
      <div class="text-subtitle1 q-mt-md">{{ message }}</div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { QSpinnerFacebook, QSpinnerGears, QSpinnerHourglass, useDialogPluginComponent } from 'quasar';

// Liste de spinners disponibles
const spinnersMap = {
  gears: QSpinnerGears,
  facebook: QSpinnerFacebook,
  hourglass: QSpinnerHourglass,
} as const;

const props = defineProps({
  message: { type: String, default: 'Chargement en cours...' },
  color: { type: String, default: 'cyan' },
  size: { type: String, default: '50px' },
  spinner: { type: String as () => keyof typeof spinnersMap, default: 'gears' },
});

const spinnerComponent = spinnersMap[props.spinner];

const { dialogRef, onDialogHide } = useDialogPluginComponent();

defineEmits([...useDialogPluginComponent.emits]);
</script>
