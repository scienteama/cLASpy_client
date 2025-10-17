<template>
  <div class="q-mb-sm folder-item">
    <!-- En-tête du dossier -->
    <div class="row items-center">
      <!-- Clic pour ouvrir/fermer -->
      <div class="row items-center cursor-pointer" @click="toggleOpen">
        <q-icon
          :name="isOpen ? 'folder_open' : 'folder'"
          color="primary"
          class="q-mr-sm"
        />
        <span class="text-bold">{{ root.name }}</span>
      </div>

      <!-- Actions -->
      <q-btn
        flat dense round icon="more_vert"
        size="sm"
        class="q-ml-auto"
        :disabled="isRootFolder"
      >
        <q-menu>
          <q-list style="min-width: 150px">
            <q-item clickable>
              <q-item-section>Renommer</q-item-section>
            </q-item>
            <q-item clickable @click.stop="deleteFolder(root.id)">
              <q-item-section>Supprimer</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </div>

    <!-- Contenu du dossier -->
    <q-slide-transition>
      <div v-show="isOpen" class="children-container q-ml-lg q-mt-xs">
        <template v-for="item in sortedChildren" :key="item.id">
          <div class="tree-connector">
            <!-- Trait horizontal -->
            <div class="tree-line"></div>

          <FileItem
            v-if="item.type === 'file'"
            :file="item"
          />
          <FolderItem
            v-else-if="item.type === 'folder'"
            :root="item"
          />
           </div>
        </template>
      </div>
    </q-slide-transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import FileItem from './FileItem.vue'
import FolderItem from './FolderItem.vue'
import { fileService } from 'src/services/files.services'
import type { FolderModel } from 'src/types/files.type'

const props = defineProps<{ root: FolderModel }>()


const isOpen = ref(false)
const isRootFolder = computed(() => props.root.name === 'uploads')
if (isRootFolder.value) isOpen.value = true

const sortedChildren = computed(() => {
  return [...props.root.children].sort((a, b) => {
    // Fichiers d'abord, dossiers après
    if (a.type !== b.type) {
      return a.type === 'file' ? -1 : 1
    }
    // Puis tri alphabétique
    return a.name.localeCompare(b.name)
  })
})

function toggleOpen() {
  isOpen.value = !isOpen.value
}

async function deleteFolder(folderId: string) {
  await fileService.removeFileOrDir(folderId)
}
</script>
<style scoped lang="scss">
.folder-item {
  position: relative;
}

.children-container {
  border-left: 1px solid rgba(0, 0, 0, 0.15);
  margin-left: 12px;
  padding-left: 8px;
}

.tree-connector {
  position: relative;
  display: flex;
  align-items: flex-start;
}

.tree-line {
  width: 16px;
  height: 1px;
  background-color: rgba(0, 0, 0, 0.15);
  margin-top: 12px;
  margin-right: 4px;
}
</style>
