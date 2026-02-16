<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide" persistent>
    <q-card class="q-dialog-plugin">
      <q-card-section class="row items-center justify-center">
        <q-icon :name="icon" :color="iconColor" size="2rem" />
        <div class="text-h6 q-ml-sm">{{ title }}</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <div v-html="message" class="text-center"></div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat :label="cancelLabel" color="negative" @click="onCancelClick" />
        <q-btn flat :label="confirmLabel" color="primary" @click="onOKClick" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { matWarning } from '@quasar/extras/material-icons';
import { useDialogPluginComponent } from 'quasar';

defineProps({
  title: { type: String, default: 'Confirmation' },
  message: { type: String, default: 'Êtes-vous sûr ?' },
  confirmLabel: { type: String, default: 'Confirmer' },
  cancelLabel: { type: String, default: 'Annuler' },
  icon: { type: String, default: matWarning },
  iconColor: { type: String, default: 'warning' },
});

defineEmits([...useDialogPluginComponent.emits]);

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();

function onOKClick() {
  onDialogOK();
}

const onCancelClick = onDialogCancel;
</script>
