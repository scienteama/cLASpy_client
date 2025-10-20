<template>
  <div class="q-pa-md">
    <q-card flat bordered>
      <q-card-section class="text-h6">
        Explorateur de fichiers
      </q-card-section>

      <q-separator />

      <!-- Barre de navigation -->
      <q-card-section class="row items-center justify-between">
        <q-btn flat dense icon="home" color="primary" @click="goToHome">
          <q-tooltip>Accueil</q-tooltip>
        </q-btn>
        <q-btn flat dense icon="refresh" color="secondary" @click="reloadRoot">
          <q-tooltip>Rafraîchir</q-tooltip>
        </q-btn>
        <q-btn flat dense icon="arrow_back" color="negative" @click="goBack" :disable="!canGoBack" class="q-mr-sm">
          <q-tooltip>Retour</q-tooltip>
        </q-btn>

        <div class="text-caption text-black text-ellipsis text-weight-bolder">
          <strong>{{ path }}</strong>
        </div>

        <InputFile class="q-ml-auto" :current-path="currentPathDisplay" />
      </q-card-section>

      <!-- Table de fichiers -->
      <q-card-section>
        <q-table :rows="rows" :columns="columns" row-key="id" flat bordered :loading="loading"
          @row-dblclick="onRowDblClick" virtual-scroll v-model:pagination="pagination" :rows-per-page-options="[0]">

          <template v-slot:header-cell-actions>
            <q-th class="q-pa-none flex justify-end items-center">
              <q-btn color="secondary" icon="add" dense outline @click=startCreateDir()>
                <q-tooltip>Créer un dossier</q-tooltip>
              </q-btn>
            </q-th>
          </template>

          <template v-slot:body-cell-name="props">
            <q-td :props="props">
              <q-icon :name="iconForItem(props.row)" :color="colorForItem(props.row)" size="sm" class="q-mr-sm" />
              <span>{{ props.row.name }}</span>
            </q-td>
          </template>

          <template v-slot:body-cell-type="props">
            <q-td :props="props">
              <span v-if="props.row.type === 'file'">{{ convertMimeType(props.row.mimeType) }}</span>
              <span v-else>Folder</span>
            </q-td>
          </template>

          <template v-slot:body-cell-size="props">
            <q-td :props="props" class="text-right">
              <span v-if="props.row.type === 'file'">{{ formatFileSize(props.row.size_bytes) }}</span>
              <span v-else>{{ computeFolderSize(props.row) }}</span>
            </q-td>
          </template>

          <template v-slot:body-cell-modified_at="props">
            <q-td :props="props">
              <span>{{ new Date(props.row.modified_at).toLocaleString() }}</span>
            </q-td>
          </template>

          <template v-slot:body-cell-created_at="props">
            <q-td :props="props">
              <span>{{ new Date(props.row.created_at).toLocaleString() }}</span>
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props" class="text-right">
              <q-btn flat dense round icon="more_vert" size="sm">
                <q-menu>
                  <q-list style="min-width: 150px">
                    <q-item clickable @click="startRename(props.row)">
                      <q-item-section>Renommer</q-item-section>
                    </q-item>
                    <q-item clickable @click="removeItem(props.row)">
                      <q-item-section>Supprimer</q-item-section>
                    </q-item>
                    <q-item clickable @click="downloadItem(props.row.id)">
                      <q-item-section>Télécharger</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Dialog rename -->
    <q-dialog v-model="renameDialog.show">
      <q-card style="min-width: 400px; max-width: 90vw; width: auto;">
        <q-card-section>
          <div class="text-h6 q-my-md q-mx-lg text-center">
            Renommer le {{ renameDialog.item?.type == 'file' ? ' fichier ' : ' dossier ' }}:
          </div>
          <div class="q-mt-sm text-center text-italic text-caption text-accent">"{{ renameDialog.item?.name }}"</div>
          <q-input v-model="renameDialog.baseName" dense autofocus class="q-mt-sm" :suffix="renameDialog.extension"
            filled width="auto">
            <template v-slot:before>
              <q-icon name="chevron_right" color="primary" />
            </template>
          </q-input>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Annuler" v-close-popup @click="renameDialog.show = false" color="negative" />
          <q-btn flat label="Valider" @click="confirmRename" color="primary" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Create folder -->
    <q-dialog v-model="createFolderDialog.show">
      <q-card style="min-width: 400px; max-width: 90vw; width: auto;">
        <q-card-section>
          <div class="text-h6 q-my-md q-mx-lg text-center">
            Créer un nouveau dossier :
          </div>
          <q-input v-model="createFolderDialog.folderName" dense autofocus class="q-mt-sm" filled width="auto">
            <template v-slot:before>
              <q-icon name="chevron_right" color="primary" />
            </template>
          </q-input>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Annuler" v-close-popup @click="createFolderDialog.show = false" color="negative" />
          <q-btn flat label="Valider" color="primary" @click="confirmFolderCreation" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useFilesStore } from 'src/stores/files-store'
import InputFile from 'src/components/files/InputFile.vue'
import { iconForFile, colorForFile, iconForFolder, formatFileSize, computeFolderSize, convertMimeType, splitFileName } from 'src/utils'
import { useQuasar, type QTableColumn } from 'quasar'
import type { FileModel, FolderModel } from 'src/types/files.type'

const filesStore = useFilesStore();
const $q = useQuasar();

const { rows, loading, currentPathDisplay, canGoBack } = storeToRefs(filesStore);
const { reloadRoot,
  goBack,
  goToFolder,
  renameItem,
  deleteItem,
  goToHome,
  createFolder
} = filesStore;

const pagination = ref({ rowsPerPage: 0 });
const createFolderDialog = ref<{ show: boolean; folderName: string }>({ show: false, folderName: '' });
const path = computed(() => currentPathDisplay.value.replaceAll('/', ' / '));
const renameDialog = ref<{
  show: boolean
  item: { id: string; name: string; type: string } | null
  baseName: string
  extension: string
}>(
  {
    show: false,
    item: null,
    baseName: '',
    extension: ''
  });

const columns: QTableColumn[] = [
  { name: 'name', label: 'Nom', field: 'name', align: 'left', sortable: true },
  { name: 'type', label: 'Type', field: 'mimeType', align: 'left', sortable: true },
  { name: 'size', label: 'Taille', field: 'size_bytes', align: 'right', sortable: true },
  { name: 'modified_at', label: 'Modifié le', field: 'modified_at', align: 'left', sortable: true },
  { name: 'created_at', label: 'Créé le', field: 'created_at', align: 'left', sortable: true },
  { name: 'actions', label: '', field: 'actions', align: 'right' }
]

// --- Icon / couleur dynamique ---
function iconForItem(item: { type: string; mimeType?: string }) {
  return item.type === 'folder' ? iconForFolder(true) : iconForFile(item.mimeType || '')
};

function colorForItem(item: { type: string; mimeType?: string }) {
  return item.type === 'folder' ? 'primary' : colorForFile(item.mimeType || '')
};

function onRowDblClick(evt: Event, row: FileModel | FolderModel) {
  if ((row as FolderModel).type === 'folder') {
    goToFolder(row.name)
  };
};

function startRename(item: { id: string; name: string; type: string }) {
  if (item.type === 'folder') {
    renameDialog.value = {
      show: true,
      item,
      baseName: item.name,
      extension: ''
    };
  } else {
    const { base, ext } = splitFileName(item.name)
    renameDialog.value = {
      show: true,
      item,
      baseName: base,
      extension: ext
    };
  };
};

function startCreateDir() {
  createFolderDialog.value = {
    show: true,
    folderName: ''
  };
};

function confirmRename() {
  const it = renameDialog.value.item
  if (!it) {
    renameDialog.value.show = false
    return
  };
  const newName = renameDialog.value.baseName + renameDialog.value.extension;

  $q.dialog({
    title: 'Confirmer l\'action :',
    html: true,
    message: `Voulez-vous renommer :<br><br><strong>"${it.name}"</strong> en <strong>"${newName}"</strong> ?`,
    cancel: {
      label: 'Annuler',
      color: 'negative',
      flat: true
    },
    ok: {
      label: 'Valider',
      color: 'primary',
      flat: true
    },
    persistent: true
  }).onOk(() => {
    renameItem(it.id, newName).catch((err: unknown) => {
      $q.notify({
        type: 'negative',
        message: err instanceof Error ? err.message : 'Erreur lors du renommage.'
      });
    })
  }).onCancel(() => {
  });

  renameDialog.value.show = false;
}

function confirmFolderCreation() {
  const dir = createFolderDialog.value.folderName
  const path = currentPathDisplay.value
  if (!dir || dir.trim() === '') {
    createFolderDialog.value.show = false
    return
  }

  const message = `Voulez-vous créer ce dossier :<br><br><strong>${path === '/' ? `${path}${dir}` : `${path}/${dir}`}</strong> ?`;

  $q.dialog({
    title: 'Confirmer l\'action :',
    message: message,
    html: true,
    cancel: { label: 'Annuler', color: 'negative', flat: true },
    ok: { label: 'Valider', color: 'primary', flat: true },
    persistent: true
  }).onOk(() => {
    createFolder(dir, path).catch((err: unknown) => {
      $q.notify({
        type: 'negative',
        message: err instanceof Error ? err.message : 'Erreur création dossier.'
      })
    })
  })
};

function downloadItem(id: string) {
  console.log('Download item id:', id);
  alert('Not implemented yet!');
};

function removeItem(item: { id: string; name: string; type: string }) {

  const message = item.type === 'folder'
    ? `Voulez-vous vraiment supprimer le dossier :<br><br><strong>"${item.name}</strong>" et tout son contenu ?`
    : `Voulez-vous vraiment supprimer le fichier :<br><br><strong>"${item.name}</strong>" ?`;

  $q.dialog({
    title: 'Confirmer l\'action :',
    html: true,
    message: message,
    cancel: {
      label: 'Annuler',
      color: 'negative',
      flat: true
    },
    ok: {
      label: 'Valider',
      color: 'primary',
      flat: true
    },
    persistent: true
  }).onOk(() => {
    deleteItem(item.id).catch((err: unknown) => {
      $q.notify({
        type: 'negative',
        message: err instanceof Error ? err.message : 'Erreur lors du renommage.'
      });
    })
  }).onCancel(() => {
  });
}

onMounted(async () => {
  await reloadRoot()
})
</script>
