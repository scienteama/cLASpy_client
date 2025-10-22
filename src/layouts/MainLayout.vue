<template>
  <q-layout class="bg-grey-1" view="lHh lpR fFf">

    <q-drawer show-if-above side="left" bordered class="column no-wrap">

      <!-- Header -->
      <div class="text-center text-h4 text-white q-pa-sm q-mx-xs q-mt-xs glossy"
        :style="{ height: headerHeight, background: 'rgba(0, 0, 0, 0.5)' }">
        ClasPy_T
      </div>

      <AnimatedBackground class="q-mt-xs q-mx-xs" />

      <!-- Left Drawer -->
      <div class="column justify-between fit">

        <div class="q-mx-xs">
          <q-list>
            <template v-for="(menuItem, index) in topMenu" :key="'top-' + index">
              <q-item clickable v-ripple
                :class="['q-mb-xs text-h6', menuItem.bgColor ? `bg-${menuItem.bgColor} glossy text-white` : '']">
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
                <q-expansion-item expand-separator icon="extension" label="Plugins" :header-class="[
                  'q-mb-xs text-h6',
                  menuItem.bgColor ? `bg-${menuItem.bgColor} glossy text-white` : ''
                ]" dense>
                  <q-list dense class="q-pl-sm">
                    <q-item v-for="(plugin) in plugins" :key="plugin.name" clickable v-ripple>
                      <q-item-section avatar>
                        <q-icon :name="plugin.enable ? 'check_box' : 'disabled_by_default'"
                          :color="plugin.enable ? 'positive' : 'negative'" />
                      </q-item-section>

                      <q-item-section>
                        {{ plugin.name }}
                        <q-tooltip>{{ plugin.tooltip }}</q-tooltip>
                      </q-item-section>

                      <!-- Actions installer / désinstaller -->
                      <q-item-section side class="row justify-end">
                        <q-btn v-if="!plugin.enable" size="sm" color="primary" flat round label="Installer"
                          @click.stop="addPlugin(plugin.name)" />
                        <q-btn v-else size="sm" color="negative" flat round label="Désinstaller"
                          @click.stop="removePlugin(plugin.name)" />
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-expansion-item>
              </template>

              <!-- Autres items du menu -->
              <template v-else>
                <q-item clickable v-ripple
                  :class="['q-mb-xs text-h6', menuItem.bgColor ? `bg-${menuItem.bgColor} glossy text-white` : '']">
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

    <q-header elevated class="text-white glossy" style="background: #24292e" height-hint="61.59">
      <q-toolbar class="q-py-sm q-px-md">

        <q-btn round dense flat :ripple="false" icon="menu" size="19px" color="white" class="q-mr-sm" no-caps />

        <div v-if="$q.screen.gt.sm"
          class="GL__toolbar-link q-ml-xs q-gutter-md text-body2 text-weight-bold row items-center no-wrap">
          <a href="javascript:void(0)" class="text-white">
            Menu1
          </a>
          <a href="javascript:void(0)" class="text-white">
            Menu2
          </a>
          <a href="javascript:void(0)" class="text-white">
            Menu3
          </a>
          <a href="javascript:void(0)" class="text-white">
            Menu4
          </a>
        </div>
        <q-space />

        <div class="q-pl-sm q-gutter-sm row items-center no-wrap">
          <q-badge v-if="fileUploadProgress.uploading" color="accent" text-color="white" rounded size="md"
            :label="(fileUploadProgress.percent * 100).toFixed(0) + '%'">
            <q-tooltip>
              Upload en cours : {{ fileUploadProgress.speed }} Mo/s
            </q-tooltip>
          </q-badge>

          <q-btn v-if="$q.screen.gt.xs" dense flat round size="sm" icon="notifications" />
          <q-btn v-if="$q.screen.gt.xs" dense flat>
            <div class="row items-center no-wrap">
              <q-icon name="add" size="20px" />
              <q-icon name="arrow_drop_down" size="16px" style="margin-left: -2px" />
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
            <q-avatar color="grey" rounded size="20px" text-color="white">
              <!-- <img src="https://cdn.quasar.dev/img/avatar3.jpg"> -->
              VG
            </q-avatar>
            <q-icon name="arrow_drop_down" size="16px" />

            <q-menu auto-close>
              <q-list dense>
                <q-item class="GL__menu-link-signed-in">
                  <q-item-section>
                    <div><strong>Valentin Gautier</strong></div>
                  </q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable class="GL__menu-link-status">
                </q-item>
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
                <q-item clickable class="GL__menu-link">
                  <q-item-section>Déconnexion</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">

import { ref, onMounted, computed } from 'vue'
import { dom } from 'quasar'
import AnimatedBackground from 'src/components/animations/AnimatedBackground.vue';
import { useFilesStore } from 'src/stores/files-store';
import { usePluginStore } from 'src/stores/plugins-store';
import { storeToRefs } from 'pinia';

const { style } = dom;
const headerHeight = ref('0px');

const fileStore = useFilesStore();
const fileUploadProgress = computed(() => fileStore.fileUploadProgress);

const pluginStore = usePluginStore()
const { plugins } = storeToRefs(pluginStore)
const { addPlugin, removePlugin } = pluginStore;


const topMenu = [
  { icon: 'home', iconColor: undefined, label: 'Dashboard', bgColor: null, separator: false },
  { icon: 'terminal', iconColor: undefined, label: 'Console', bgColor: null, separator: false },
  { icon: 'view_timeline', iconColor: undefined, label: 'Logs', bgColor: null, separator: true },
]

const bottomMenu = [
  { icon: 'extension', iconColor: undefined, label: 'Plugins', bgColor: null, separator: false },
  { icon: 'settings', iconColor: undefined, label: 'Settings', bgColor: null, separator: true },
  { icon: 'help', iconColor: 'primary', label: 'Help', bgColor: null, separator: false },
]

onMounted(() => {
  const toolbar = document.querySelector('.q-header .q-toolbar');
  if (toolbar) {
    headerHeight.value = style(toolbar, 'height');
  }
})



</script>



<style scoped lang="scss">
.GL {
  &__select-GL__menu-link {
    .default-type {
      visibility: hidden;
    }

    &:hover {
      background: #0366d6;
      color: white;

      .q-item__section--side {
        color: white;
      }

      .default-type {
        visibility: visible;
      }
    }
  }

  &__toolbar-link {
    a {
      color: white;
      text-decoration: none;

      &:hover {
        opacity: 0.7;
      }
    }
  }

  &__menu-link:hover {
    background: #0366d6;
    color: white;
  }

  &__menu-link-signed-in,
  &__menu-link-status {
    &:hover {
      &>div {
        background: white !important;
      }
    }
  }

  &__menu-link-status {
    color: $blue-grey-6;

    &:hover {
      color: $light-blue-9;
    }
  }

  &__toolbar-select.q-field--focused {
    width: 450px !important;

    .q-field__append {
      display: none;
    }
  }
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}
</style>
