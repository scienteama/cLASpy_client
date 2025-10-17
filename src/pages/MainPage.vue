<template>
    <q-page class="row items-center justify-center q-pa-md">
      <InputFile  class="col-4"/>
      <FileExplorer class="col-8" />
      <q-card class="col q-pa-md text-center bg-primary" style="min-height: 300px;">
        <q-card-section class="self-center">
          <div class="text-h2 text-white">Entrainement</div>
          <!-- <div class="text-h3" >description de l'entrainement</div> -->
        </q-card-section>
      </q-card>
      <q-card class="col q-pa-md text-center q-mx-md bg-secondary" style="min-height: 300px;">
        <q-card-section>
          <div class="text-h2 text-white">Prédiction</div>
          <!-- <div class="text-h3">description de la prédiction</div> -->
        </q-card-section>
      </q-card>
      <q-card class="col q-pa-md text-center bg-warning" style="min-height: 300px;">
       <q-card-section>
          <div class="text-h2 text-white">Segmentation</div>
          <!-- <div class="text-h3">description de la segmentation</div> -->
        </q-card-section>
      </q-card>
    </q-page>
</template>
<script setup lang="ts">
import InputFile from 'src/components/files/InputFile.vue';
import FileExplorer from 'src/components/files/FileExplorer.vue';

</script>
<style scoped lang="scss">
</style>
