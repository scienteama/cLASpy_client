<template>
  <q-page class="q-pa-md column q-gutter-md bg-grey-3">
    <!-- <PointCloudInfo /> -->
    <FileExplorer :show-input="true" />
  </q-page>
</template>

<script setup lang="ts">
//import PointCloudInfo from 'src/components/files/PointCloudInfo.vue';
import FileExplorer from 'src/components/files/FileExplorer.vue';
</script>
