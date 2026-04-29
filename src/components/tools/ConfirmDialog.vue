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

      <q-card-section v-if="typeToConfirm" class="q-pt-none row items-center justify-center">
        <q-input
          v-model="confirmText"
          :placeholder="`${expectedConfirmText.toUpperCase()}`"
          autofocus
          outlined
          color="negative"
          class="col q-pa-md"
          input-class="text-center text-bold text-negative"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat :label="cancelLabel" color="negative" @click="onCancelClick" />
        <q-btn flat :label="confirmLabel" color="primary" @click="onOKClick" :disable="typeToConfirm && !isValid" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { matWarning } from '@quasar/extras/material-icons';
import { useDialogPluginComponent } from 'quasar';
import { computed, ref, watch } from 'vue';

const confirmText = ref('');

const props = defineProps({
  title: { type: String, default: 'Confirmation' },
  message: { type: String, default: 'Êtes-vous sûr ?' },
  confirmLabel: { type: String, default: 'Confirmer' },
  cancelLabel: { type: String, default: 'Annuler' },
  icon: { type: String, default: matWarning },
  typeToConfirm: { type: Boolean, default: false },
  expectedConfirmText: { type: String, default: '' },
  iconColor: { type: String, default: 'warning' },
});

defineEmits([...useDialogPluginComponent.emits]);

const isValid = computed(() => {
  if (!props.typeToConfirm) return true;
  return confirmText.value.toLowerCase() === props.expectedConfirmText.toLowerCase();
});

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();

function onOKClick() {
  if (props.typeToConfirm && !isValid.value) return;

  onDialogOK(props.typeToConfirm ? confirmText.value : true);
}

const onCancelClick = onDialogCancel;

watch(dialogRef, (val) => {
  if (val) confirmText.value = '';
});
</script>
