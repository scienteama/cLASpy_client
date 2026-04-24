<template>
  <q-card class="column fit" flat>
    <div v-if="showTitle">
      <q-card-section class="text-h6">{{ titleName }}</q-card-section>
      <q-separator />
    </div>

    <!-- Barre de navigation -->
    <q-card-section :class="'row items-center' + (showInput ? ' justify-between' : ' justify-start bg-grey-3 glossy text-white')" style="position: sticky; top: 0; z-index: 2">
      <q-btn flat dense :icon="matHome" color="primary" @click="goToHome">
        <q-tooltip>Accueil</q-tooltip>
      </q-btn>
      <q-btn flat dense :icon="matRefresh" color="secondary" @click="refreshCurrentFolder">
        <q-tooltip>Rafraîchir</q-tooltip>
      </q-btn>
      <q-btn flat dense :icon="matArrowBack" color="negative" @click="goBack" :disable="!canGoBack" class="q-mr-sm">
        <q-tooltip>Retour</q-tooltip>
      </q-btn>

      <template v-if="currentFolder">
        <div class="text-caption text-black text-ellipsis text-weight-bolder flex items-center">
          <span class="cursor-pointer" style="white-space: pre" @click="goToHome">
            <strong v-if="currentFolder?.name === 'root'">/</strong>
          </span>

          <template v-for="segment in breadcrumbPath" :key="segment.id">
            <span class="cursor-pointer" style="white-space: pre" @click="goToFolder(segment)">
              <strong
                >/ <span class="nav-path">{{ segment.name }}</span></strong
              >
            </span>
          </template>
        </div>
      </template>

      <template v-else>
        <span style="white-space: pre"><strong>/</strong></span>
      </template>

      <!-- Composant upload -->
      <InputFile v-if="showInput" class="q-ml-auto" :current-path="currentFolderPath" />
    </q-card-section>

    <!-- Table de fichiers -->
    <q-card-section :style="computedStyle.background">
      <q-table class="file-explorer-table q-mx-md" :rows="rows" :columns="computedColumns" row-key="id" flat bordered :loading="loading" @row-dblclick="onRowDblClick" virtual-scroll>
        <template v-slot:header-cell-actions>
          <q-th class="q-pa-none justify-center items-center">
            <q-btn color="secondary" :icon="matAdd" dense outline @click="startCreateDir()">
              <q-tooltip>Créer un dossier</q-tooltip>
            </q-btn>
          </q-th>
        </template>

        <template v-slot:header-cell-delete>
          <q-th class="q-pa-none justify-center items-center">
            <q-btn color="negative" :icon="mdiTrashCanOutline" :disable="!selectedItems.length" dense outline @click="removeItems()">
              <q-tooltip>Supprimer les éléments sélectionnés</q-tooltip>
            </q-btn>
          </q-th>
        </template>

        <template v-slot:body-cell-delete="scope">
          <q-td align="center" auto-width>
            <q-checkbox :model-value="itemIsSelected(scope.row)" @update:model-value="toggleItemSelection(scope.row)" />
          </q-td>
        </template>

        <template v-slot:header-cell-select v-if="trainMode || predictMode">
          <q-th class="q-pa-none justify-center items-center">
            <q-btn v-if="trainMode && !fileToUpload" color="primary" :icon="mdiFormatListChecks" dense outline>
              <q-tooltip>Sélectionner un fichier</q-tooltip>
            </q-btn>
            <q-btn v-else-if="predictMode && !modelToUpload" color="primary" :icon="mdiFormatListChecks" dense outline>
              <q-tooltip>Sélectionner un modèle</q-tooltip>
            </q-btn>
          </q-th>
        </template>

        <template v-if="trainMode && !fileToUpload" v-slot:body-cell-select="scope">
          <q-td align="center" auto-width>
            <div v-if="trainMode && scope.row.type === 'file' && ['application/las', 'text/csv'].includes(scope.row.mimeType)">
              <q-toggle :model-value="isSelected(scope.row)" @update:model-value="toggleSelection(scope.row)" />
            </div>
          </q-td>
        </template>
        <template v-else-if="predictMode && !modelToUpload" v-slot:body-cell-select="scope">
          <q-td align="center" auto-width>
            <div v-if="predictMode && scope.row.type === 'file' && ['application/model'].includes(scope.row.mimeType)">
              <q-toggle :model-value="isSelected(scope.row)" @update:model-value="toggleSelection(scope.row)" />
            </div>
          </q-td>
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
            <span v-else>Dossier</span>
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

        <template v-slot:body-cell-user_id="props">
          <q-td :props="props">
            <span v-if="props.row.user_id == currentUser?.id">Vous</span>
            <span v-else>{{ props.row.user_id }}</span>
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props" align="center" auto-width class="text-center">
            <q-btn flat dense round :icon="matMoreVert" size="sm">
              <q-menu>
                <q-list style="min-width: 150px">
                  <q-item clickable @click="startRename(props.row)">
                    <q-item-section>Renommer</q-item-section>
                  </q-item>
                  <q-item clickable @click="removeItem(props.row)">
                    <q-item-section>Supprimer</q-item-section>
                  </q-item>
                  <template v-if="props.row.type !== 'folder'">
                    <q-item clickable @click="downloadItem(props.row)">
                      <q-item-section>Télécharger</q-item-section>
                    </q-item>
                  </template>
                  <template v-else>
                    <q-item disable>
                      <q-item-section>Télécharger</q-item-section>
                    </q-item>
                  </template>
                  <template v-if="props.row.type == 'file' && AllowedTypesForViewing.includes(props.row.mimeType)">
                    <q-item clickable @click="downloadItem(props.row, true)">
                      <q-item-section>Voir</q-item-section>
                    </q-item>
                  </template>
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
    <q-card style="min-width: 400px; max-width: 90vw; width: auto">
      <q-card-section>
        <div class="text-h6 q-my-md q-mx-lg text-center">Renommer le {{ renameDialog.item?.type === 'file' ? 'fichier' : 'dossier' }}:</div>
        <div class="q-mt-sm text-center text-italic text-caption text-accent">"{{ renameDialog.item?.name }}"</div>
        <q-input v-model="renameDialog.baseName" dense autofocus class="q-mt-sm" :suffix="renameDialog.extension" filled width="auto">
          <template v-slot:before>
            <q-icon :name="matChevronRight" color="primary" />
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
    <q-card style="min-width: 400px; max-width: 90vw; width: auto">
      <q-card-section>
        <div class="text-h6 q-my-md q-mx-lg text-center">Créer un nouveau dossier :</div>
        <q-input v-model="createFolderDialog.folderName" dense autofocus class="q-mt-sm" filled width="auto">
          <template v-slot:before>
            <q-icon :name="matChevronRight" color="primary" />
          </template>
        </q-input>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Annuler" v-close-popup @click="createFolderDialog.show = false" color="negative" />
        <q-btn flat label="Valider" color="primary" @click="confirmFolderCreation" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="viewFileDialog">
    <FileViewer :file="fileViewer" :file-content="fileViewerContent" />
  </q-dialog>
</template>

<script setup lang="ts">
import type { FileModel, FolderModel } from 'src/models/types/files.type';
import { ref, onMounted, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useFilesStore } from 'src/stores/files-store';
import { useQuasar, type QTableColumn } from 'quasar';
import { useUserStore } from 'src/stores/users-store';
import { fileService } from 'src/services/files.service';
import { AllowedTypesForViewing, colorForFile, computeFolderSize, convertMimeType, formatFileSize, iconForFile, iconForFolder, splitFileName } from 'src/helpers/files-utils';
import ConfirmDialog from '../tools/ConfirmDialog.vue';
import InputFile from 'src/components/files/InputFile.vue';
import FileViewer from 'src/components/files/FileViewer.vue';
import { mdiFormatListChecks, mdiTrashCanOutline } from '@quasar/extras/mdi-v7';
import { matAdd, matArrowBack, matChevronRight, matHome, matMoreVert, matRefresh } from '@quasar/extras/material-icons';
import { useConfigStore } from 'src/stores/config-store';
import { useMLStore } from 'src/stores/ml-store';

const filesStore = useFilesStore();
const userStore = useUserStore();
const mlStore = useMLStore();
const configStore = useConfigStore();
const { computedStyle } = storeToRefs(configStore);
const $q = useQuasar();

const props = defineProps({
  showInput: { type: Boolean, default: true },
  showTitle: { type: Boolean, default: true },
  trainMode: { type: Boolean, default: false },
  predictMode: { type: Boolean, default: false },
  titleName: { type: String, default: 'Explorateur de fichiers' },
});

const selectedItems = ref<(FileModel | FolderModel)[]>([]);
const selectedFile = ref<FileModel | null>(null);
const { rows, loading, canGoBack, rootTree, currentFolder } = storeToRefs(filesStore);
const { isAdmin, currentUser } = storeToRefs(userStore);
const { existingFile, fileToUpload, modelToUpload, existingModel } = storeToRefs(mlStore);
const { reloadRoot, goBack, goToFolder, renameItem, deleteItem, goToHome, createFolder, refreshCurrentFolder } = filesStore;

const createFolderDialog = ref<{ show: boolean; folderName: string }>({ show: false, folderName: '' });

const viewFileDialog = ref(false);
const fileViewerContent = ref<Blob | null>(null);
const fileViewer = ref<FileModel | null>(null);

const renameDialog = ref<{
  show: boolean;
  item: { id: string; name: string; type: string } | null;
  baseName: string;
  extension: string;
}>({
  show: false,
  item: null,
  baseName: '',
  extension: '',
});

const computedColumns = computed(() => {
  const columns: QTableColumn[] = [
    { name: 'select', label: '', field: 'select', align: 'center', sortable: false },
    { name: 'name', label: 'Nom', field: 'name', align: 'left', sortable: true },
    { name: 'type', label: 'Type', field: 'mimeType', align: 'left', sortable: true },
    { name: 'size', label: 'Taille', field: 'size_bytes', align: 'right', sortable: true },
    { name: 'modified_at', label: 'Modifié le', field: 'modified_at', align: 'left', sortable: true },
    { name: 'created_at', label: 'Créé le', field: 'created_at', align: 'left', sortable: true },
    { name: 'user_id', label: 'Propriétaire', field: 'user_id', align: 'left', sortable: true },
    { name: 'actions', label: '', field: 'actions', align: 'center', sortable: false },
    { name: 'delete', label: '', field: 'delete', align: 'right', sortable: false },
  ];

  if (props.trainMode && fileToUpload.value) {
    columns.splice(0, 1);
  }

  return columns;
});

// --- Breadcrumb dynamique ---
const breadcrumbPath = computed(() => {
  const path: FolderModel[] = [];
  function findPath(folder: FolderModel, targetId: string, trail: FolderModel[] = []): boolean {
    if (folder.id === targetId) {
      path.push(...trail, folder);
      return true;
    }
    for (const child of folder.children) {
      if (child.type === 'folder' && findPath(child, targetId, [...trail, folder])) return true;
    }
    return false;
  }
  if (rootTree.value && currentFolder.value) findPath(rootTree.value, currentFolder.value.id);
  return path.slice(1);
});

const currentFolderPath = computed(() => breadcrumbPath.value.map((p) => p.name).join('/') || '/');

function iconForItem(item: { type: string; mimeType?: string }) {
  return item.type === 'folder' ? iconForFolder(true) : iconForFile(item.mimeType || '');
}

function colorForItem(item: { type: string; mimeType?: string }) {
  return item.type === 'folder' ? 'primary' : colorForFile(item.mimeType || '');
}

function onRowDblClick(evt: Event, row: FileModel | FolderModel) {
  if (row.type === 'folder') goToFolder(row);
}

function startRename(item: { id: string; name: string; type: string }) {
  if (item.type === 'folder') {
    renameDialog.value = { show: true, item, baseName: item.name, extension: '' };
  } else {
    const { base, ext } = splitFileName(item.name);
    renameDialog.value = { show: true, item, baseName: base, extension: ext };
  }
}

function startCreateDir() {
  createFolderDialog.value = { show: true, folderName: '' };
}

function confirmRename() {
  const it = renameDialog.value.item;
  if (!it) return (renameDialog.value.show = false);
  const newName = renameDialog.value.baseName + renameDialog.value.extension;
  $q.dialog({
    component: ConfirmDialog,
    componentProps: {
      title: 'Confirmation de modification :',
      message: `Voulez-vous renommer :<br><br><strong>"${it.name}"</strong> en <strong>"${newName}"</strong> ?`,
    },
    persistent: true,
  }).onOk(() => {
    renameItem(it.id, newName).catch((err) => {
      $q.notify({ type: 'negative', message: err instanceof Error ? err.message : 'Erreur lors du renommage.' });
    });
  });
  renameDialog.value.show = false;
}

function confirmFolderCreation() {
  const dir = createFolderDialog.value.folderName?.trim();
  if (!dir) return (createFolderDialog.value.show = false);
  $q.dialog({
    component: ConfirmDialog,
    componentProps: {
      title: 'Confirmation de création',
      message: `Voulez-vous créer ce dossier :<br><br><strong>${dir}</strong> ?`,
    },
    persistent: true,
  }).onOk(() => {
    createFolder(dir).catch((err) => {
      $q.notify({ type: 'negative', message: err instanceof Error ? err.message : 'Erreur création dossier.' });
    });
  });
  createFolderDialog.value.show = false;
}

const itemIsSelected = (item: FileModel | FolderModel) => {
  return selectedItems.value.some((selected) => selected.id === item.id);
};

const toggleItemSelection = (item: FileModel | FolderModel) => {
  if (itemIsSelected(item)) {
    selectedItems.value = selectedItems.value.filter((selected) => selected.id !== item.id);
  } else {
    selectedItems.value.push(item);
  }
};

const isSelected = (row: FileModel) => {
  return selectedFile.value?.id === row.id;
};

const toggleSelection = (row: FileModel) => {
  selectedFile.value = isSelected(row) ? null : row;
};

async function downloadItem(item: FileModel | FolderModel, isView = false) {
  try {
    if (item.type === 'folder') {
      alert('Téléchargement des dossiers non implémenté !');
      return;
    }
    const res = await fileService.downloadFile(item.id);
    if (!res?.data) return console.error('Erreur lors du téléchargement');
    const contentDisposition = res.headers['content-disposition'] || '';
    let filename = 'download';
    const match = contentDisposition.match(/filename\*=(?:UTF-8'')?(.+?)(?:;|$)|filename="?(.+?)"?$/);
    if (match && (match[1] || match[2])) {
      filename = decodeURIComponent(match[1] || match[2] || '');
    }
    if (isView) {
      viewFileDialog.value = true;
      fileViewerContent.value = res.data;
      fileViewer.value = item as FileModel;
      return;
    }
    const url = window.URL.createObjectURL(res.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erreur lors du téléchargement :', error);
  }
}

function removeItem(item: { id: string; name: string; type: string }) {
  const message =
    item.type === 'folder'
      ? `Voulez-vous vraiment supprimer le dossier :<br><br><strong>"${item.name}"</strong>" et tout son contenu ?`
      : `Voulez-vous vraiment supprimer le fichier :<br><br><strong>"${item.name}"</strong>" ?`;
  $q.dialog({
    component: ConfirmDialog,
    componentProps: { title: 'Confirmation de suppression', message },
    persistent: true,
  }).onOk(() => {
    deleteItem(item.id).catch((err) => {
      $q.notify({ type: 'negative', message: err instanceof Error ? err.message : 'Erreur lors du renommage.' });
    });
  });
}

function removeItems() {
  const message = `Etes-vous sûr de vouloir supprimer le ou les éléments sélectionnés ?`;
  $q.dialog({
    component: ConfirmDialog,
    componentProps: { title: 'Confirmation de suppression', message },
    persistent: true,
  }).onOk(() => {
    filesStore.deleteItems(selectedItems.value.map((item) => item.id)).catch((err) => {
      $q.notify({ type: 'negative', message: err instanceof Error ? err.message : 'Erreur lors de la suppression.' });
    });
  });
}

watch(
  () => selectedFile.value,
  (newVal) => {
    if (props.trainMode) {
      if (newVal && newVal.type == 'file') {
        existingFile.value = newVal;
      } else {
        existingFile.value = null;
      }
    } else if (props.predictMode) {
      if (newVal && newVal.type == 'file') {
        existingModel.value = newVal;
      } else {
        existingModel.value = null;
      }
    }
  }
);

onMounted(async () => {
  await reloadRoot();
  if (isAdmin.value) goToHome();
});
</script>

<style lang="scss">
.nav-path:hover {
  color: $accent;
}

.file-explorer-table {
  max-height: 60vh;
  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th {
    background-color: $blue-1;
    font-weight: bold;
    font-size: 14px;
  }

  thead tr th {
    position: sticky;
    z-index: 1;
  }

  thead tr:first-child th {
    top: 0;
  }

  &.q-table--loading thead tr:last-child th {
    top: 48px;
  }

  tbody {
    scroll-margin-top: 48px;
  }
}
</style>
