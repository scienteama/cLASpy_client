import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

export function useSessionCountdown(exp: number | null) {
  const now = ref(Date.now());
  let interval: ReturnType<typeof setInterval>;

  const expiration = computed(() => (exp ? exp * 1000 : 0));

  const remaining = computed(() => {
    if (!exp) return 0;
    return Math.max(expiration.value - now.value, 0);
  });

  onMounted(() => {
    interval = setInterval(() => {
      now.value = Date.now();
    }, 1000);
  });

  onBeforeUnmount(() => {
    clearInterval(interval);
  });

  return {
    remaining,
  };
}
