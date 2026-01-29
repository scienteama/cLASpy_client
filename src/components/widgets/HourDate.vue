<template>
  <q-card-section>
    <div class="text-subtitle1 text-weight-medium q-mb-sm">Date & heure</div>

    <div class="row items-center no-wrap">
      <q-icon name="mdi-clock-outline" size="42px" color="primary" class="q-mr-md" />

      <div>
        <div class="text-h5 text-weight-bold">
          {{ time }}
        </div>
        <div class="text-caption text-grey-7">
          {{ date }}
        </div>
      </div>
    </div>
  </q-card-section>
</template>
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

const time = ref('');
const date = ref('');

let timer: number;

function updateDateTime() {
  const now = new Date();

  time.value = now.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  date.value = now.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

onMounted(() => {
  updateDateTime();
  timer = window.setInterval(updateDateTime, 1000);
});

onBeforeUnmount(() => {
  clearInterval(timer);
});
</script>
