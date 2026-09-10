<template>
  <div v-if="exp">
    Session : <span class="text-bold text-secondary">{{ formattedTime }}</span>
  </div>
  <div v-else>
    <q-btn dense label="Actualiser" @click="refreshSession()" size="sm" icon="refresh" />
  </div>
</template>

<script setup lang="ts">
import { useSessionCountdown } from '@/composables/session';
import { useAuth } from '@/stores/auth-store';
import { computed } from 'vue';

const props = defineProps<{
  exp: number | null;
}>();

const { remaining } = useSessionCountdown(props.exp);
const authStore = useAuth();

async function refreshSession() {
  if (!authStore.checked) {
    await authStore.checkSession();
  } else {
    window.location.reload();
  }
}

const formattedTime = computed(() => {
  const totalSeconds = Math.floor(remaining.value / 1000);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours}h ${minutes}m ${seconds}s`;
});
</script>
