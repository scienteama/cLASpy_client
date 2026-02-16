<template>
  <q-page class="q-pa-md column bg-grey-3">
    <!-- Titre -->
    <q-card flat class="q-mb-md" :style="cardStyle">
      <q-card-section class="row items-center justify-between">
        <div>
          <div class="text-h5 text-weight-bold">Tableau de bord</div>
          <div class="text-subtitle2 q-mt-xs">Bienvenue dans votre espace personnel, {{ currentUser?.firstname }}.</div>
        </div>
        <q-avatar size="56px" color="primary" text-color="white">
          {{ currentUserInitials }}
        </q-avatar>
      </q-card-section>
    </q-card>

    <!-- Widgets -->
    <div class="row q-mb-md">
      <q-card flat bordered class="col bg-white">
        <q-card-section>
          <q-toggle v-model="showFileExplorer" :label="(showFileExplorer ? 'Masquer' : 'Afficher') + ' l\'explorateur de fichiers'" color="primary" />
        </q-card-section>
      </q-card>
    </div>

    <div class="row q-gutter-md q-mb-md">
      <TaskRunner v-if="isAdmin && taskrunner?.enable" class="col-md-5 bg-white" />

      <q-card flat bordered class="col-md-5 bg-white">
        <q-card-section>
          <div class="text-subtitle1">Autre widget</div>
          <q-item>
            <q-item-section avatar>
              <q-skeleton type="QAvatar" />
            </q-item-section>

            <q-item-section>
              <q-item-label>
                <q-skeleton type="text" />
              </q-item-label>
              <q-item-label caption>
                <q-skeleton type="text" width="65%" />
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section avatar>
              <q-skeleton type="QAvatar" />
            </q-item-section>

            <q-item-section>
              <q-item-label>
                <q-skeleton type="text" />
              </q-item-label>
              <q-item-label caption>
                <q-skeleton type="text" width="90%" />
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="col-md bg-white self-center">
        <HourDate />
      </q-card>

      <!-- <q-card flat bordered class="col-12 col-md-3 bg-white">
        <q-card-section>
          <div class="text-subtitle1">Espace disque utilisé</div>
          <q-linear-progress
            color="green"
            track-color="grey-3"
            :value='0.65'
            class="q-mt-sm"
          />
          <div class="text-caption text-grey-7 q-mt-xs">65% utilisé</div>
        </q-card-section>
      </q-card> -->
    </div>

    <!-- FileExplorer -->
    <q-card v-if="showFileExplorer" flat bordered class="bg-white q-mb-md">
      <q-card-section>
        <FileExplorer :show-input="true" :show-title="false" />
      </q-card-section>
    </q-card>

    <!-- Derniers fichiers -->
    <!-- <q-card flat bordered class="bg-white">
      <q-card-section>
        <div class="text-subtitle1 text-weight-bold q-mb-sm">Derniers fichiers</div>
        <q-list dense bordered class="bg-grey-1">
          <q-item v-for="file in recentFiles" :key="file.name" clickable>
            <q-item-section>{{ file.name }}</q-item-section>
            <q-item-section side class="text-caption">{{ file.date }}</q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card> -->
  </q-page>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import FileExplorer from 'src/components/files/FileExplorer.vue';
import TaskRunner from 'src/components/widgets/TaskRunner.vue';
import HourDate from 'src/components/widgets/HourDate.vue';
import { getTextColorForPalette, glossyStyle, sortPaletteByBrightness } from 'src/helpers/color-utils';
import { useConfigStore } from 'src/stores/config-store';
import { useUserStore } from 'src/stores/users-store';
import { computed, ref } from 'vue';
import { usePluginStore } from 'src/stores/plugins-store';

const userStore = useUserStore();
const { currentUser, isAdmin } = storeToRefs(userStore);
const configStore = useConfigStore();
const { currentTheme } = storeToRefs(configStore);
const showFileExplorer = ref(true);
const pluginStore = usePluginStore();

// Initiales pour avatar
const currentUserInitials = computed(() => {
  if (!currentUser.value) return '';
  const fn = currentUser.value.firstname?.charAt(0) || '';
  const ln = currentUser.value.lastname?.charAt(0) || '';
  return (fn + ln).toUpperCase();
});

const taskrunner = computed(() => pluginStore.getByName('taskrunner'));
const gradient = computed(() => `${glossyStyle}, linear-gradient(90deg, ${currentTheme.value.join(', ')})`);
const sortedPal = computed(() => sortPaletteByBrightness(currentTheme.value));
const textColor = computed(() => getTextColorForPalette(sortedPal.value));
const cardStyle = computed(() => ({ background: gradient.value, color: textColor.value }));
</script>

<style scoped>
.q-card-section {
  min-height: 80px;
}
</style>
