<template>
  <q-card flat bordered>
    <div v-if="showTitle">
      <q-card-section class="text-h6">Explorateur de fichiers</q-card-section>
      <q-separator />
    </div>

    <!-- Barre de navigation -->
    <q-card-section :class="'row items-center' + (showInput ? ' justify-between' : ' justify-start')">
      <q-btn flat dense icon="home" color="primary" @click="goToHome">
        <q-tooltip>Accueil</q-tooltip>
      </q-btn>
      <q-btn flat dense icon="refresh" color="secondary" @click="refreshCurrentFolder">
        <q-tooltip>Rafraîchir</q-tooltip>
      </q-btn>
      <q-btn flat dense icon="arrow_back" color="negative" @click="goBack" :disable="!canGoBack" class="q-mr-sm">
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
    <q-card-section>
      <q-table :rows="rows" :columns="columns" row-key="id" flat bordered :loading="loading" @row-dblclick="onRowDblClick" virtual-scroll v-model:pagination="pagination" :rows-per-page-options="[0]">
        <template v-slot:header-cell-actions>
          <q-th class="q-pa-none flex justify-end items-center">
            <q-btn color="secondary" icon="add" dense outline @click="startCreateDir()">
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
    <q-card style="min-width: 400px; max-width: 90vw; width: auto">
      <q-card-section>
        <div class="text-h6 q-my-md q-mx-lg text-center">Créer un nouveau dossier :</div>
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
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useFilesStore } from 'src/stores/files-store';
import InputFile from 'src/components/files/InputFile.vue';
import { iconForFile, colorForFile, iconForFolder, formatFileSize, computeFolderSize, convertMimeType, splitFileName } from 'src/utils';
import { useQuasar, type QTableColumn } from 'quasar';
import type { FileModel, FolderModel } from 'src/types/files.type';
import ConfirmDialog from '../tools/ConfirmDialog.vue';
import { useUserStore } from 'src/stores/users-store';
import { fileService } from 'src/services/files.service';

const filesStore = useFilesStore();
const userStore = useUserStore();
const $q = useQuasar();

defineProps({
  showInput: { type: Boolean, default: true },
  showTitle: { type: Boolean, default: true },
});

const { rows, loading, canGoBack, rootTree, currentFolder } = storeToRefs(filesStore);
const { isAdmin, currentUser } = storeToRefs(userStore);
const { reloadRoot, goBack, goToFolder, renameItem, deleteItem, goToHome, createFolder, refreshCurrentFolder } = filesStore;

const pagination = ref({ rowsPerPage: 0 });
const createFolderDialog = ref<{ show: boolean; folderName: string }>({ show: false, folderName: '' });
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

const columns: QTableColumn[] = [
  { name: 'name', label: 'Nom', field: 'name', align: 'left', sortable: true },
  { name: 'type', label: 'Type', field: 'mimeType', align: 'left', sortable: true },
  { name: 'size', label: 'Taille', field: 'size_bytes', align: 'right', sortable: true },
  { name: 'modified_at', label: 'Modifié le', field: 'modified_at', align: 'left', sortable: true },
  { name: 'created_at', label: 'Créé le', field: 'created_at', align: 'left', sortable: true },
  { name: 'user_id', label: 'Propriétaire', field: 'user_id', align: 'left', sortable: true },
  { name: 'actions', label: '', field: 'actions', align: 'right' },
];

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

async function downloadItem(item: { id: string; type: string }) {
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

onMounted(async () => {
  await reloadRoot();
  if (isAdmin.value) goToHome();
});
</script>

<style lang="scss" scoped>
.nav-path:hover {
  color: $accent;
}
</style>
