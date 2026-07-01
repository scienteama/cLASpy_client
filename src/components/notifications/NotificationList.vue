<template>
  <q-card flat bordered style="min-width: 400px">
    <q-card-section class="row items-center justify-between">
      <div class="row items-center q-gutter-sm">
        <div class="text-h6">Notifications</div>
        <q-badge v-if="unreadCount > 0" color="red">
          {{ unreadCount }}
        </q-badge>
      </div>

      <div class="col-auto row no-wrap q-gutter-x-sm">
        <q-btn v-if="unreadCount > 0" flat dense :icon="mdiCheckAll" size="md" @click="markAllAsRead">
          <q-tooltip>Tout marquer comme lu</q-tooltip>
        </q-btn>

        <q-btn v-if="userNotifications.length > 0" flat dense :icon="mdiDelete" size="md" color="negative" @click="deleteNotifications">
          <q-tooltip>Tout supprimer</q-tooltip>
        </q-btn>
      </div>
    </q-card-section>

    <q-separator />

    <q-list v-if="userNotifications.length">
      <q-item v-for="n in userNotifications" :key="n.id" clickable class="q-py-sm" :class="{ 'bg-blue-1': !n.isRead }">
        <q-item-section avatar>
          <q-icon :name="n.isRead ? mdiBellCheckOutline : mdiBellOutline" :color="n.isRead ? 'grey' : 'primary'" />
        </q-item-section>

        <q-item-section>
          <q-item-label class="text-body2">
            {{ n.message }}
          </q-item-label>
          <q-item-label caption>
            {{ new Date(n.createdAt).toLocaleString() }}
          </q-item-label>
        </q-item-section>

        <q-item-section side>
          <div class="row items-center q-gutter-x-sm">
            <q-btn v-if="!n.isRead" class="col-auto" flat dense :icon="mdiCheckOutline" color="primary" size="md" @click.stop="markAsRead(n.id)" />
            <q-btn class="col-auto" flat dense :icon="mdiDeleteOutline" outlined color="negative" size="md" @click.stop="deleteNotification(n.id)" />
          </div>
        </q-item-section>
      </q-item>
    </q-list>

    <q-card-section v-else class="text-grey text-center"> Pas de notifications. </q-card-section>
  </q-card>

  <q-dialog v-model="deleteDialog" style="width: auto" position="top">
    <q-card>
      <q-card-section>
        <div class="text-h6 row items-center q-gutter-sm">
          <q-icon :name="mdiDelete" color="negative" size="sm" class="col-auto" />
          <span class="col">{{ deleteMode.single ? 'Supprimer la notification' : 'Supprimer toutes les notifications' }}</span>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <div class="text-subtitle1">
          Confirmer la suppression pour :
          <span v-if="deleteMode.single" class="text-caption text-italic text-accent q-pa-md">
            <br />
            {{ '"' + userNotifications.find((n) => n.id === notificationId)?.message + '"' }}
          </span>
          <span v-else class="text-bold"> toutes les notifications ? </span>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-actions align="right">
        <q-btn label="Annuler" v-close-popup />
        <q-btn label="Supprimer" color="negative" v-close-popup @click="deleteMode.single ? notificationStore.deleteNotification(notificationId) : notificationStore.deleteAllNotifications()" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { mdiBellOutline, mdiCheckAll, mdiCheckOutline, mdiDelete, mdiDeleteOutline, mdiBellCheckOutline } from '@quasar/extras/mdi-v7';
import { storeToRefs } from 'pinia';
import { useNotificationStore } from 'src/stores/notification-store';
import { ref } from 'vue';

const notificationStore = useNotificationStore();
const { userNotifications, unreadCount } = storeToRefs(notificationStore);

const deleteDialog = ref(false);
const deleteMode = ref({ single: false, all: false });
const notificationId = ref(0);

const markAsRead = (id: number) => notificationStore.markNotificationAsRead(id);

const markAllAsRead = () => notificationStore.markAllNotificationsAsRead();

const deleteNotification = (id: number) => {
  notificationId.value = id;
  deleteDialog.value = true;
  deleteMode.value = { single: true, all: false };
};

const deleteNotifications = () => {
  deleteDialog.value = true;
  deleteMode.value = { single: false, all: true };
};
</script>
