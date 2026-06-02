<template>
  <q-layout class="bg-grey-1" view="lHh lpR fFf" style="height: 100vh; overflow: hidden">
    <q-drawer show-if-above side="left" bordered class="column no-wrap">
      <!-- Header Left Drawer -->
      <div class="text-center text-h4 text-white q-pa-sm q-mx-xs q-mt-xs glossy bg-grey-7 inset-shadow-down" :style="{ minHeight: headerHeight }">
        CLASPY_T
        <!-- Shadow overlay -->
        <div class="drawer-header"></div>
      </div>

      <AnimatedBackground class="q-mt-xs q-mx-xs" :is-drawer="true" />

      <!-- Body Left Drawer -->
      <div class="column justify-between fit overflow-auto">
        <div class="q-mx-xs">
          <q-list>
            <template v-for="(menuItem, index) in topMenu" :key="'top-' + index">
              <q-item
                clickable
                v-ripple
                :to="menuItem.link"
                :class="['q-mb-xs text-h6', menuItem.bgColor ? `bg-${menuItem.bgColor} glossy text-white` : '']"
                @click="menuItem.label === 'Console' && consoleStore.toggle()"
              >
                <q-item-section avatar>
                  <q-icon :name="menuItem.icon" />
                </q-item-section>
                <q-item-section>{{ menuItem.label }}</q-item-section>
              </q-item>
              <q-separator v-if="menuItem.separator" />
            </template>
          </q-list>
        </div>

        <div class="q-mx-xs">
          <q-separator spaced />

          <q-list>
            <template v-for="(menuItem, index) in bottomMenu" :key="'bottom-' + index">
              <!-- Plugins -->
              <template v-if="menuItem.label === 'Plugins'">
                <q-expansion-item expand-separator :header-class="['q-mb-xs text-h6', menuItem.bgColor ? `bg-${menuItem.bgColor} glossy text-white` : '']" dense expand-icon-class="text-white text-h4">
                  <template v-slot:header>
                    <q-item-section avatar>
                      <q-icon :color="menuItem.iconColor" :name="matExtension" />
                    </q-item-section>
                    <q-item-section> Plugins </q-item-section>
                  </template>
                  <q-list dense class="bg-grey-4">
                    <q-item v-for="plugin in plugins" :key="plugin.name" clickable v-ripple>
                      <q-item-section avatar>
                        <q-icon :name="plugin.enable ? matCheckBox : matDisabledByDefault" :color="plugin.enable ? 'positive' : 'negative'" />
                      </q-item-section>

                      <q-chip class="glossy bg-orange-3 inset-shadow-down" square style="width: 70%">
                        <q-item-section>
                          {{ plugin.name }}
                          <q-tooltip>{{ plugin.tooltip }}</q-tooltip>
                        </q-item-section>

                        <!-- Actions installer / désinstaller -->
                        <q-item-section side class="row justify-end">
                          <q-btn v-if="!plugin.enable" size="sm" color="primary" flat round label="Installer" @click="installPlugin(plugin)" />
                          <q-btn v-else size="sm" color="negative" flat round label="Désinstaller" @click="uninstallPlugin(plugin)" />
                        </q-item-section>
                      </q-chip>
                    </q-item>
                  </q-list>
                </q-expansion-item>
              </template>

              <!-- Autres items du menu -->
              <template v-else>
                <q-item clickable v-ripple :class="['q-mb-xs text-h6', menuItem.bgColor ? `bg-${menuItem.bgColor} glossy text-white` : '']">
                  <q-item-section avatar>
                    <q-icon :name="menuItem.icon" :color="menuItem.iconColor" />
                  </q-item-section>
                  <q-item-section>{{ menuItem.label }}</q-item-section>
                </q-item>
              </template>
              <q-separator v-if="menuItem.separator" />
            </template>
          </q-list>
        </div>
      </div>
    </q-drawer>

    <q-header elevated class="text-white glossy q-pa-sm q-mx-xs q-mt-xs bg-claspy-dark1">
      <q-toolbar>
        <q-tabs v-model="tab" align="left" active-color="warning" inline-label indicator-color="transparent">
          <!-- Dropdown Machine Learning -->
          <q-btn-dropdown
            class="q-ml-md"
            :icon="mlHeaders.icon"
            flat
            menu-anchor="bottom start"
            menu-self="top start"
            :label="mlHeaders.label"
            size="lg"
            :color="tab.startsWith('/ml') ? 'warning' : undefined"
          >
            <q-list class="bg-claspy-dark1">
              <q-item
                v-for="item in mlItems"
                :key="item.path"
                clickable
                @click="go(item.path)"
                :active="item.active"
                active-class="bg-primary text-white"
                :disable="item.label === 'Segmentation'"
                class="glossy"
              >
                <q-item-section avatar>
                  <q-icon color="white" :name="item.icon" />
                </q-item-section>
                <q-item-section>
                  <q-item-label overline class="text-uppercase text-white">{{ item.label }}</q-item-label>
                  <q-item-label>{{ item.description }}</q-item-label>
                </q-item-section>

                <q-item-section side v-if="item.active">
                  <q-icon name="check" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>

          <!-- Utilisateurs -->
          <q-btn class="q-ml-md" :icon="mdiAccountMultipleOutline" flat :label="'Utilisateurs'" size="lg" :color="tab.startsWith('/users') ? 'warning' : undefined" @click="go('/users/list')" />
        </q-tabs>
        <q-space />

        <div class="row items-center no-wrap">
          <q-badge v-if="fileUploadProgress.uploading" color="accent" text-color="white" rounded size="md" :label="(fileUploadProgress.percent * 100).toFixed(0) + '%'">
            <q-tooltip> Upload en cours : {{ fileUploadProgress.speed }} Mo/s </q-tooltip>
          </q-badge>

          <q-btn v-if="$q.screen.gt.xs" dense flat round size="md" :icon="mdiBellOutline" />

          <!-- <q-btn v-if="$q.screen.gt.xs" dense flat>
            <div class="row items-center no-wrap">
              <q-icon :name="matAdd" size="md" />
              <q-icon :name="matArrowDropDown" size="sm" style="margin-left: -2px" />
            </div>
            <q-menu auto-close>
              <q-list dense style="min-width: 100px">
                <q-item clickable>
                  <q-item-section>Action1</q-item-section>
                </q-item>
                <q-item clickable>
                  <q-item-section>Action2</q-item-section>
                </q-item>
                <q-separator />
                <q-item-label header>Autre1</q-item-label>
                <q-item clickable>
                  <q-item-section>Autre2</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn> -->

          <q-btn flat no-wrap>
            <q-avatar v-if="currentUser" rounded size="lg" text-color="white">
              {{ getUserInitials(currentUser) }}
            </q-avatar>
            <q-icon :name="matArrowDropDown" size="sm" />

            <q-menu auto-close fit class="text-bold" style="white-space: nowrap">
              <q-list>
                <q-item class="bg-claspy-dark1 text-white glossy">
                  <q-item-section avatar>
                    <q-icon :name="mdiAccount" />
                  </q-item-section>
                  <q-item-section class="text-uppercase"> {{ currentUser?.firstname }} {{ currentUser?.lastname }} </q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable class="text-uppercase">
                  <q-item-section avatar>
                    <q-icon :name="mdiHomeAccount" color="secondary" />
                  </q-item-section>
                  <q-item-section>Profil</q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable class="text-uppercase">
                  <q-item-section avatar>
                    <q-icon :name="mdiHelpBoxOutline" color="primary" />
                  </q-item-section>
                  <q-item-section>Aide</q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable class="text-uppercase">
                  <q-item-section avatar>
                    <q-icon :name="mdiCogOutline" color="warning" />
                  </q-item-section>
                  <q-item-section>Paramètres</q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable @click="disconnect()" class="bg-negative text-white text-uppercase glossy">
                  <q-item-section avatar>
                    <q-icon :name="mdiLogout" />
                  </q-item-section>
                  <q-item-section>Déconnexion</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-footer reveal elevated class="text-white glossy bg-claspy-dark1 row items-center justify-end">
      <q-badge :color="wsState ? 'positive' : 'negative'" rounded :label="wsState ? 'actif' : 'inactif'" class="q-mr-sm" />
      <q-separator vertical dark />
      <SessionDuration :exp="exp" class="q-mr-sm q-ml-sm" />
    </q-footer>

    <div class="fit overflow-auto" style="min-height: calc(100vh - headerHeight)">
      <q-page-container>
        <router-view />
      </q-page-container>
    </div>
  </q-layout>

  <!-- Console -->
  <q-dialog v-if="consoleStore.logs.length > 0" v-model="consoleStore.isOpen" persistent>
    <q-card style="width: auto; max-width: 80vw">
      <q-bar>
        <q-icon :name="mdiConsole" />
        <q-space />
        <q-btn dense flat icon="close" v-close-popup>
          <q-tooltip>Close</q-tooltip>
        </q-btn>
      </q-bar>
      <q-card-section class="q-px-md q-pt-md q-pb-none">
        <WebConsole />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import type { Plugin } from 'src/models/types/plugins.types';
import WebConsole from 'src/components/WebConsole.vue';
import { ref, onMounted, computed, watch } from 'vue';
import { dom, useQuasar } from 'quasar';
import AnimatedBackground from 'src/components/animations/AnimatedBackground.vue';
import FullScreenSpinner from 'src/components/tools/FullScreenSpinner.vue';
import ConfirmDialog from 'src/components/tools/ConfirmDialog.vue';
import SessionDuration from 'src/components/tools/SessionDuration.vue';
import { useFilesStore } from 'src/stores/files-store';
import { usePluginStore } from 'src/stores/plugins-store';
import { storeToRefs } from 'pinia';
import { useUserStore } from 'src/stores/users-store';
import { getUserInitials } from 'src/helpers/global-utils';
import { useAuth } from 'src/stores/auth-store';
import { useRouter } from 'vue-router';
import { useNavigation } from 'src/composables/navigation';
import {
  mdiAccount,
  mdiAccountMultipleOutline,
  mdiBellOutline,
  mdiCheckerboard,
  mdiCogOutline,
  mdiConsole,
  mdiHelpBoxOutline,
  mdiHomeAccount,
  mdiLogout,
  mdiPlaySpeed,
  mdiVectorDifference,
} from '@quasar/extras/mdi-v7';
import { matArrowDropDown, matCheckBox, matDisabledByDefault, matExtension, matHelp, matHome, matSettings, matTerminal, matViewTimeline } from '@quasar/extras/material-icons';
import { socketClient } from 'src/services/socket.service';
import { useConsoleStore } from 'src/stores/console.store';

const { style } = dom;
const headerHeight = ref('0px');

const $q = useQuasar();
const { go, currentPath } = useNavigation();
const fileStore = useFilesStore();
const pluginStore = usePluginStore();
const { currentUser } = useUserStore();
const { userLogout, exp } = useAuth();
const router = useRouter();
const consoleStore = useConsoleStore();

const wsState = computed(() => socketClient.getState().isConnected);

const fileUploadProgress = computed(() => fileStore.fileUploadProgress);
//const availableML = computed(() => plugins.value.some((p) => p.name === 'claspy_ml' && p.enable));

const mlMode = computed(() => {
  if (currentPath.value.startsWith('/ml/train')) return 'train';
  if (currentPath.value.startsWith('/ml/predict')) return 'predict';
  if (currentPath.value.startsWith('/ml/segment')) return 'segment';
  return null;
});

const mlHeaders = computed(() => {
  switch (mlMode.value) {
    case 'train':
      return { label: 'Entraînement', icon: mdiCogOutline };
    case 'predict':
      return { label: 'Prédiction', icon: mdiCheckerboard };
    case 'segment':
      return { label: 'Segmentation', icon: mdiVectorDifference };
    default:
      return { label: 'Machine Learning', icon: mdiPlaySpeed };
  }
});

const mlItems = computed(() => [
  { label: 'Entraînement', description: 'Entraîner un modèle de machine learning', path: '/ml/train', active: mlMode.value === 'train', icon: mdiCogOutline },
  { label: 'Prédiction', description: 'Effectuer des prédictions avec un modèle de machine learning', path: '/ml/predict', active: mlMode.value === 'predict', icon: mdiCheckerboard },
  // { label: 'Segmentation', description: 'A venir', path: '/ml/segment', active: mlMode.value === 'segment', icon: mdiVectorDifference },
]);

const { plugins } = storeToRefs(pluginStore);
const { addPlugin, removePlugin } = pluginStore;

const topMenu = [
  { icon: matHome, iconColor: undefined, label: 'Tableau de bord', bgColor: null, separator: false, link: '/home' },
  { icon: matTerminal, iconColor: undefined, label: 'Console', bgColor: null, separator: false, link: '' },
  { icon: matViewTimeline, iconColor: undefined, label: 'Logs', bgColor: null, separator: true, link: '' },
];

const bottomMenu = [
  { icon: matExtension, iconColor: 'green-4', label: 'Plugins', bgColor: 'grey-7', separator: false },
  { icon: matSettings, iconColor: 'amber', label: 'Settings', bgColor: null, separator: true },
  { icon: matHelp, iconColor: 'primary', label: 'Help', bgColor: null, separator: false },
];

function installPlugin(p: Plugin) {
  $q.dialog({
    component: ConfirmDialog,
    componentProps: {
      title: "Confirmer l'installation",
      message: `Êtes-vous sûr de vouloir installer le plugin : <strong>${p.name}</strong> ?`,
      confirmLabel: 'Confirmer',
      cancelLabel: 'Annuler',
    },
  }).onOk(() => {
    void (async () => {
      const loading = $q.dialog({
        component: FullScreenSpinner,
        componentProps: {
          message: `Installation ${p.name} en cours...`,
          color: 'amber',
          size: '60px',
        },
      });
      try {
        const success = await addPlugin(p.name);
        if (success) {
          $q.notify({
            type: 'positive',
            message: `Le plugin "${p.name}" a été installé avec succès.`,
          });
        } else {
          $q.notify({
            type: 'negative',
            message: `Le plugin "${p.name}" n'a pas pu être installé.`,
          });
        }
      } catch (err) {
        $q.notify({
          type: 'negative',
          message: `Erreur serveur : ${(err as Error).message}`,
        });
      } finally {
        loading.hide();
      }
    })();
  });
}

function uninstallPlugin(p: Plugin) {
  $q.dialog({
    component: ConfirmDialog,
    componentProps: {
      title: 'Confirmer la suppression',
      message: `<p>Êtes-vous sûr de vouloir désinstaller le plugin : <strong>${p.name}</strong> ?</p>`,
      confirmLabel: 'Confirmer',
      cancelLabel: 'Annuler',
    },
  }).onOk(() => {
    void (async () => {
      const loading = $q.dialog({
        component: FullScreenSpinner,
        componentProps: {
          message: `Désinstallation ${p.name} en cours...`,
          color: 'amber',
          size: '60px',
        },
      });
      try {
        const success = await removePlugin(p.name);
        if (success) {
          $q.notify({
            type: 'positive',
            message: `Le plugin "${p.name}" a été désinstallé avec succès.`,
          });
        } else {
          $q.notify({
            type: 'negative',
            message: `Le plugin "${p.name}" n'a pas pu être désinstallé.`,
          });
        }
      } catch (err) {
        $q.notify({
          type: 'negative',
          message: `Erreur serveur : ${(err as Error).message}`,
        });
      } finally {
        loading.hide();
      }
    })();
  });
}

function disconnect() {
  $q.dialog({
    component: ConfirmDialog,
    componentProps: {
      title: 'Déconnexion',
      message: `Êtes-vous sûr de vouloir vous déconnecter ?`,
      confirmLabel: 'Confirmer',
      cancelLabel: 'Annuler',
    },
  }).onOk(() => {
    void (async () => {
      const res = await userLogout();
      if (res) await router.push({ name: 'login', query: { email: currentUser?.email } });
    })();
  });
}

watch(currentPath, (newPath) => {
  if (newPath) {
    tab.value = newPath;
  }
});

const tab = ref(currentPath.value);

onMounted(() => {
  const toolbar = document.querySelector('.q-header');
  if (toolbar) {
    headerHeight.value = style(toolbar, 'height');
  }
});
</script>
<style lang="scss"></style>
