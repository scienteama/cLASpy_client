<template>
  <q-page class="q-pa-md column bg-grey-3">
    <!-- Titre -->
    <q-card flat class="q-mb-md" :style="computedStyle">
      <q-card-section class="row items-center justify-between">
        <div class="main-title-page" :style="{ '--computed-color': computedStyle.color.name }">
          <div class="text-h5 text-weight-bold">Tableau de bord</div>
          <div class="text-subtitle2 q-mt-xs">Bienvenue dans votre espace personnel, {{ currentUser?.firstname }}.</div>
        </div>
        <q-avatar :style="{ '--computed-avatar-color': invertColor(computedStyle.color.value), '--computed-bg': computedStyle.color.value }" class="user-avatar">{{ currentUserInitials }} </q-avatar>
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

      <q-card flat bordered class="col-md-4 bg-white'" style="height: 200px">
        <q-card-section>
          <div class="text-subtitle1 text-weight-medium q-mb-sm row items-center justify-between">
            <div class="col">{{ isAdmin ? 'Espace disque' : 'Espace personnel' }}</div>
            <div class="col-auto">
              <q-btn flat dense :icon="matRefresh" color="primary" @click="userStore.getMe()">
                <q-tooltip>Rafraîchir</q-tooltip>
              </q-btn>
            </div>
          </div>
          <SpaceUsed />
        </q-card-section>
      </q-card>

      <q-card flat bordered class="col-auto bg-white" style="height: 200px">
        <q-card-section>
          <div class="text-subtitle1 text-weight-medium row items-center justify-between">
            <div class="col">
              {{ 'Performances : ' + (showRealTime && isAdmin ? 'temps réel' : '30 minutes') }}
              <q-tooltip>Moyenne sur 30 minutes</q-tooltip>
            </div>
            <div class="col-auto">
              <q-toggle v-if="isAdmin" class="cursor-pointer" v-model="showRealTime" color="primary" size="sm"> </q-toggle>
              <q-btn flat dense :icon="matRefresh" color="primary" @click="metric.refreshMetricStore()">
                <q-tooltip>Rafraîchir</q-tooltip>
              </q-btn>
            </div>
          </div>
        </q-card-section>
        <MetricsStats :is-real-time="showRealTime" />
      </q-card>

      <q-card flat bordered class="col-md bg-white self-start" style="height: 200px">
        <HourDate />
      </q-card>
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
import SpaceUsed from 'src/components/widgets/SpaceUsed.vue';
import MetricsStats from 'src/components/widgets/MetricsStats.vue';
import { useConfigStore } from 'src/stores/config-store';
import { useUserStore } from 'src/stores/users-store';
import { computed, onMounted, ref } from 'vue';
import { usePluginStore } from 'src/stores/plugins-store';
import { invertColor } from 'src/helpers/color-utils';
import { matRefresh } from '@quasar/extras/material-icons';
import { useMetricsStore } from 'src/stores/metrics-store';
import { useAuth } from 'src/stores/auth-store';

const auth = useAuth();
const userStore = useUserStore();
const { currentUser, isAdmin } = storeToRefs(userStore);

const configStore = useConfigStore();
const { computedStyle } = storeToRefs(configStore);

const showFileExplorer = ref(true);
const showRealTime = ref(false);
const pluginStore = usePluginStore();
const metric = useMetricsStore();

// Initiales pour avatar
const currentUserInitials = computed(() => {
  if (!currentUser.value) return '';
  const fn = currentUser.value.firstname?.charAt(0) || '';
  const ln = currentUser.value.lastname?.charAt(0) || '';
  return (fn + ln).toUpperCase();
});

const taskrunner = computed(() => pluginStore.getByName('taskrunner'));

onMounted(async () => {
  await auth.checkSession();
});
</script>

<style scoped>
.q-card-section {
  min-height: 80px;
}
.main-title-page {
  color: var(--computed-color);
}
.user-avatar {
  color: var(--computed-avatar-color);
  size: 56px;
  background-color: var(--computed-bg);
}
</style>
