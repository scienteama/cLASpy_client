<template>
  <div class="q-pa-md self-center">
    <q-table flat bordered :rows="taskrunner?.workers ?? []" :columns="columns" color="primary" row-key="name" :loading="loading" :rows-per-page-options="[0]">
      <template v-slot:loading>
        <q-inner-loading showing color="primary" />
      </template>
      <template v-slot:no-data>
        <div class="full-width row flex-center text-accent q-gutter-sm">
          <q-icon size="2em" :name="mdiCogOffOutline" />
          <span> Aucun worker n'est actuellement actif... </span>
          <q-icon size="2em" :name="matWarning" />
        </div>
      </template>
      <template v-slot:header-cell-reload>
        <q-th class="q-pa-none justify-center items-center">
          <q-btn color="primary" flat dense :icon="matRefresh" @click="refreshData()"> </q-btn>
        </q-th>
      </template>
    </q-table>
  </div>
</template>
<script setup lang="ts">
import { matRefresh, matWarning } from '@quasar/extras/material-icons';
import { mdiCogOffOutline } from '@quasar/extras/mdi-v7';
import type { QTableColumn } from 'quasar';
import { pluginService } from 'src/services/plugins.service';
import type { TaskRunner } from 'src/models/types/plugins.types';
import { onMounted, ref } from 'vue';

const loading = ref(true);
const taskrunner = ref<TaskRunner>();
const columns: QTableColumn[] = [
  {
    name: 'worker',
    required: true,
    label: 'Workers',
    align: 'left',
    field: (row) => row.name,
    format: (val) => `${val}`,
    sortable: true,
  },
  { name: 'pid', align: 'left', label: 'Processus', field: 'pid', sortable: true },
  { name: 'reload', align: 'right', label: '', field: 'reload', sortable: false },
];

async function refreshData() {
  loading.value = true;
  await fetchData();
}

async function fetchData() {
  const res = await pluginService.listWorkers();
  if (res.isOk && res.data) {
    taskrunner.value = res.data;
    loading.value = false;
  }
}

onMounted(async () => {
  await fetchData();
});
</script>
