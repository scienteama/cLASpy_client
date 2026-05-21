<template>
  <div class="disk-usage">
    <div class="disk-usage__header">
      <div>
        Total utilisé :
        <span class="text-bold q-ml-sm">{{ formattedUsed }} / {{ formattedMax }}</span>
      </div>
    </div>
    <ProgressBar :value="percentage" :color="colorlabel.color" size="20px" unit="%" :stripe="true" />
    <div class="disk-usage__footer">
      <div>
        Total restant :
        <span class="text-bold q-ml-sm">{{ formattedFree }}</span>
      </div>
      <span v-if="isNearLimit" :class="`text-${colorlabel.color}`">{{ colorlabel.msg }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ProgressBar from '../tools/ProgressBar.vue';
import { useUserStore } from 'src/stores/users-store';
import { formatFileSize } from 'src/helpers/files-utils';
import { storeToRefs } from 'pinia';
import { useFilesStore } from 'src/stores/files-store';

const fileStore = useFilesStore();
const { rootTreeSize } = storeToRefs(fileStore);

const userStore = useUserStore();
const { maxDiskSpace, isAdmin, spaceDiskUsed } = storeToRefs(userStore);

const percentage = computed(() => {
  if (!isFinite(maxDiskSpace.value)) return 0;
  return spaceDiskUsed.value / maxDiskSpace.value;
});

const freeSpace = computed(() => {
  return Math.max(0, maxDiskSpace.value - spaceDiskUsed.value);
});

const isNearLimit = computed(() => percentage.value > 0.7);
const colorlabel = computed(() => {
  if (percentage.value >= 1) {
    return { color: 'negative', msg: ' ⚠ Limite atteinte' };
  } else if (percentage.value >= 0.9) {
    return { color: 'negative', msg: ' ⚠ Limite presque atteinte' };
  } else if (percentage.value >= 0.7) {
    return { color: 'warning', msg: ' ⚠ Limite presque atteinte' };
  } else {
    return { color: 'positive', msg: '' };
  }
});

const formattedUsed = computed(() => {
  if (isAdmin.value) {
    return formatFileSize(rootTreeSize.value);
  } else {
    return formatFileSize(spaceDiskUsed.value);
  }
});
const formattedMax = computed(() => {
  return isFinite(maxDiskSpace.value) ? formatFileSize(maxDiskSpace.value) : 'Illimité';
});
const formattedFree = computed(() => formatFileSize(freeSpace.value));
</script>

<style lang="scss" scoped>
.disk-usage {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-left: 10px;
}

.disk-usage__header,
.disk-usage__footer {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}
</style>
