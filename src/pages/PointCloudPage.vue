<template>
  <q-page class="full-height q-pa-sm">
    <PointCloudViewer :file-url="null" />
  </q-page>
</template>
<script setup lang="ts">
import PointCloudViewer from '@/components/PointCloudViewer.vue';
</script>
