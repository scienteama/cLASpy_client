<template>
  <div class="q-pa-md">
    <q-card flat bordered>
      <q-card-section class="text-h6">
        Explorateur de fichiers
      </q-card-section>

      <q-separator />

      <!-- Barre de navigation -->
      <q-card-section class="row items-center justify-between">
        <q-btn flat dense icon="arrow_back" @click="goBack" :disable="!canGoBack" class="q-mr-sm" />

        <div class="text-caption text-grey text-ellipsis">
          {{ currentPathDisplay }}
        </div>

        <InputFile class="q-ml-auto" :current-path="currentPathDisplay" />
      </q-card-section>

      <!-- Table de fichiers -->
      <q-card-section>
        <q-table :rows="rows" :columns="columns" row-key="id" flat bordered :loading="loading"
          @row-dblclick="onRowDblClick">
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
                    <q-item clickable @click="removeItem(props.row.id)">
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
      <q-card>
        <q-card-section>
          <div class="text-h6">Renommer</div>
          <div class="q-mt-sm">{{ renameDialog.item?.name }}</div>
          <q-input v-model="renameDialog.newName" dense autofocus class="q-mt-sm" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Annuler" v-close-popup @click="renameDialog.show = false" />
          <q-btn flat label="Valider" @click="confirmRename" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useFilesStore } from 'src/stores/files-store'
import InputFile from 'src/components/files/InputFile.vue'
import { iconForFile, colorForFile, iconForFolder, formatFileSize, computeFolderSize, convertMimeType } from 'src/utils'
import type { QTableColumn } from 'quasar'
import type { FileModel, FolderModel } from 'src/types/files.type'

const filesStore = useFilesStore();

const { rows, loading, currentPathDisplay, canGoBack } = storeToRefs(filesStore)
const { reloadRoot, goBack, goToFolder, renameItem } = filesStore

// --- Table columns ---
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
}
function colorForItem(item: { type: string; mimeType?: string }) {
  return item.type === 'folder' ? 'primary' : colorForFile(item.mimeType || '')
}

function onRowDblClick(evt: Event, row: FileModel | FolderModel) {
  if ((row as FolderModel).type === 'folder') {
    goToFolder(row.name)
  }
}

// --- Rename dialog ---
const renameDialog = ref<{ show: boolean; item: { id: string; name: string } | null; newName: string }>({ show: false, item: null, newName: '' })
function startRename(item: { id: string; name: string }) {
  renameDialog.value = { show: true, item, newName: item.name }
}
async function confirmRename() {
  const it = renameDialog.value.item
  if (!it) { renameDialog.value.show = false; return }
  await renameItem(it.id, renameDialog.value.newName)
  renameDialog.value.show = false
}

function downloadItem(id: string) {
  console.log('Download item id:', id);
  alert('Not implemented yet!');
}

async function removeItem(id: string) {
  alert('Action irréversible ! \n Confirmez la suppression ?');
  await filesStore.deleteItem(id);
}

// --- Mounted ---
onMounted(async () => {
  await reloadRoot()
})
</script>
