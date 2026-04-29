<template>
  <div class="disk-usage">
    <div class="disk-usage__header">
      <div>
        Total utilisé :
        <span v-if="isAdmin" class="text-bold q-ml-sm">{{ formattedUsed }}</span>
        <span v-else class="text-bold q-ml-sm">{{ formattedUsed }} / {{ formattedMax }}</span>
      </div>
    </div>
    <ProgressBar v-if="!isAdmin" :value="percentage" :color="color" size="20px" unit="%" :stripe="true" />
    <div class="disk-usage__footer">
      <div>
        Total restant :
        <span v-if="isAdmin" class="text-bold q-ml-sm">Illimité</span>
        <span v-else class="text-bold q-ml-sm">{{ formattedFree }}</span>
      </div>
      <span v-if="!isAdmin && isNearLimit" class="warning"> ⚠️ Limite presque atteinte </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useFilesStore } from 'src/stores/files-store';
import ProgressBar from '../tools/ProgressBar.vue';
import { useUserStore } from 'src/stores/users-store';
import { formatFileSize } from 'src/helpers/files-utils';
import { storeToRefs } from 'pinia';
import { UserRoleEnum } from 'src/models/enums/roles';

const fileStore = useFilesStore();
const { rootTreeSize } = storeToRefs(fileStore);

const userStore = useUserStore();
const { currentRole, isAdmin } = storeToRefs(userStore);

const diskSpaceMax = computed(() => {
  if (!currentRole.value) return 0;

  const ADMIN_ID = Number(UserRoleEnum.ADMIN);
  if (currentRole.value.id !== ADMIN_ID) {
    return currentRole.value.maxSpace;
  }

  return Infinity;
});

const diskSpaceUsed = computed(() => rootTreeSize.value);

const percentage = computed(() => {
  if (!isFinite(diskSpaceMax.value)) return 0;
  return diskSpaceUsed.value / diskSpaceMax.value;
});

const freeSpace = computed(() => {
  return diskSpaceMax.value - diskSpaceUsed.value;
});

const isNearLimit = computed(() => percentage.value > 0.7);
const color = computed(() => {
  if (percentage.value > 0.7) {
    return 'warning';
  } else if (percentage.value > 0.9) {
    return 'negative';
  } else {
    return 'positive';
  }
});

const formattedUsed = computed(() => formatFileSize(diskSpaceUsed.value));
const formattedMax = computed(() => {
  return isFinite(diskSpaceMax.value) ? formatFileSize(diskSpaceMax.value) : 'Illimité';
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

.warning {
  color: orange;
  font-weight: 500;
}
</style>
