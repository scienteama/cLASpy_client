<template>
  <q-layout class="bg-grey-1" view="lHh lpR fFf" style="height: 100vh; overflow: hidden">
    <q-drawer show-if-above side="left" bordered class="column no-wrap">
      <!-- Header Left Drawer -->
      <div class="text-center text-h4 text-white q-pa-sm q-mx-xs q-mt-xs glossy bg-grey-7 inset-shadow-down" :style="{ minHeight: headerHeight }">
        cLASpy_Client
        <!-- Shadow overlay -->
        <div class="drawer-header"></div>
      </div>

      <AnimatedBackground class="q-mt-xs q-mx-xs" :is-drawer="true" />

      <!-- Body Left Drawer -->
      <div class="column justify-between fit overflow-auto">
        <div class="q-mx-xs">
          <q-list>
            <template v-for="(menuItem, index) in topMenu" :key="'top-' + index">
              <q-item clickable v-ripple :to="menuItem.link" :class="['q-mb-xs text-h6', menuItem.bgColor ? `bg-${menuItem.bgColor} glossy text-white` : '']">
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
                      <q-icon :color="menuItem.iconColor" name="extension" />
                    </q-item-section>
                    <q-item-section> Plugins </q-item-section>
                  </template>
                  <q-list dense class="bg-grey-4">
                    <q-item v-for="plugin in plugins" :key="plugin.name" clickable v-ripple>
                      <q-item-section avatar>
                        <q-icon :name="plugin.enable ? 'check_box' : 'disabled_by_default'" :color="plugin.enable ? 'positive' : 'negative'" />
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
        <q-tabs v-if="availableML" v-model="tab" align="left" active-color="warning" inline-label indicator-color="transparent">
          <!-- Dropdown Machine Learning -->
          <q-btn-dropdown class="q-ml-md" icon="mdi-cog-outline" flat label="Machine Learning" size="md" :color="tab.startsWith('/ml') ? 'warning' : undefined">
            <q-list>
              <q-item clickable @click="go('/ml/train')">
                <q-item-section>Entraînement</q-item-section>
              </q-item>
              <q-item clickable @click="go('/ml/predict')">
                <q-item-section>Prédiction</q-item-section>
              </q-item>
              <q-item clickable @click="go('/ml/segment')">
                <q-item-section>Segmentation</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>

          <!-- Utilisateurs -->
          <q-tab name="/users/list" label="Utilisateurs" icon="mdi-account-multiple-outline" @click="go('/users/list')" />
        </q-tabs>
        <q-space />

        <div class="row items-center no-wrap">
          <q-badge v-if="fileUploadProgress.uploading" color="accent" text-color="white" rounded size="md" :label="(fileUploadProgress.percent * 100).toFixed(0) + '%'">
            <q-tooltip> Upload en cours : {{ fileUploadProgress.speed }} Mo/s </q-tooltip>
          </q-badge>

          <q-btn v-if="$q.screen.gt.xs" dense flat round size="md" icon="mdi-bell-outline" />
          <q-btn v-if="$q.screen.gt.xs" dense flat>
            <div class="row items-center no-wrap">
              <q-icon name="add" size="md" />
              <q-icon name="arrow_drop_down" size="sm" style="margin-left: -2px" />
            </div>
            <q-menu auto-close>
              <q-list dense style="min-width: 100px">
                <q-item clickable class="GL__menu-link">
                  <q-item-section>Action1</q-item-section>
                </q-item>
                <q-item clickable class="GL__menu-link">
                  <q-item-section>Action2</q-item-section>
                </q-item>
                <q-item clickable class="GL__menu-link">
                  <q-item-section>Action3</q-item-section>
                </q-item>
                <q-item clickable class="GL__menu-link">
                  <q-item-section>Action4</q-item-section>
                </q-item>
                <q-separator />
                <q-item-label header>Autre1</q-item-label>
                <q-item clickable class="GL__menu-link">
                  <q-item-section>Autre2</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>

          <q-btn dense flat no-wrap>
            <q-avatar v-if="currentUser" color="grey" rounded size="md" text-color="white">
              {{ getUserInitials(currentUser) }}
            </q-avatar>
            <q-icon name="arrow_drop_down" size="sm" />

            <q-menu auto-close>
              <q-list dense>
                <q-item class="GL__menu-link-signed-in">
                  <q-item-section>
                    <div>
                      <strong>{{ currentUser?.firstname }} {{ currentUser?.lastname }}</strong>
                    </div>
                  </q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable class="GL__menu-link-status"> </q-item>
                <q-separator />
                <q-item clickable class="GL__menu-link">
                  <q-item-section>Profil</q-item-section>
                </q-item>
                <q-item clickable class="GL__menu-link">
                  <q-item-section>Autre1</q-item-section>
                </q-item>
                <q-item clickable class="GL__menu-link">
                  <q-item-section>Autre2</q-item-section>
                </q-item>
                <q-item clickable class="GL__menu-link">
                  <q-item-section>Autre3</q-item-section>
                </q-item>
                <q-item clickable class="GL__menu-link">
                  <q-item-section>Autre4</q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable class="GL__menu-link">
                  <q-item-section>Aide</q-item-section>
                </q-item>
                <q-item clickable class="GL__menu-link">
                  <q-item-section>Paramètres</q-item-section>
                </q-item>
                <q-item clickable class="GL__menu-link" @click="disconnect()">
                  <q-item-section>Déconnexion</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <div class="fit overflow-auto" style="min-height: calc(100vh - headerHeight)">
      <q-page-container>
        <router-view />
      </q-page-container>
    </div>
  </q-layout>
</template>

<script setup lang="ts">
import type { Plugin } from 'src/types/plugins.types';
import { ref, onMounted, computed, watch } from 'vue';
import { dom, useQuasar } from 'quasar';
import AnimatedBackground from 'src/components/animations/AnimatedBackground.vue';
import FullScreenSpinner from 'src/components/tools/FullScreenSpinner.vue';
import ConfirmDialog from 'src/components/tools/ConfirmDialog.vue';
import { useFilesStore } from 'src/stores/files-store';
import { usePluginStore } from 'src/stores/plugins-store';
import { storeToRefs } from 'pinia';
import { useUserStore } from 'src/stores/users-store';
import { getUserInitials } from 'src/helpers/global-utils';
import { useAuth } from 'src/stores/auth-store';
import { useRouter } from 'vue-router';
import { useNavigation } from 'src/composables/navigation';

const { style } = dom;
const headerHeight = ref('0px');

const $q = useQuasar();
const { go, currentPath } = useNavigation();
const fileStore = useFilesStore();
const pluginStore = usePluginStore();
const { currentUser } = useUserStore();
const { userLogout } = useAuth();
const router = useRouter();

const fileUploadProgress = computed(() => fileStore.fileUploadProgress);
const availableML = computed(() => plugins.value.some((p) => p.name === 'claspy_ml' && p.enable));

const { plugins } = storeToRefs(pluginStore);
const { addPlugin, removePlugin } = pluginStore;

const topMenu = [
  { icon: 'home', iconColor: undefined, label: 'Tableau de bord', bgColor: null, separator: false, link: '/home' },
  { icon: 'terminal', iconColor: undefined, label: 'Console', bgColor: null, separator: false, link: '' },
  { icon: 'view_timeline', iconColor: undefined, label: 'Logs', bgColor: null, separator: true, link: '' },
];

const bottomMenu = [
  { icon: 'extension', iconColor: 'green-4', label: 'Plugins', bgColor: 'grey-7', separator: false },
  { icon: 'settings', iconColor: 'amber', label: 'Settings', bgColor: null, separator: true },
  { icon: 'help', iconColor: 'primary', label: 'Help', bgColor: null, separator: false },
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
      if (res) await router.push('/auth/login');
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
