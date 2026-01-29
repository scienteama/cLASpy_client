import { computed } from 'vue';
import { useRoute, useRouter, type RouteLocationRaw } from 'vue-router';

export function useNavigation() {
  const router = useRouter();
  const currentRoute = useRoute();
  const currentPath = computed(() => currentRoute.path);

  async function go(to: string | RouteLocationRaw) {
    if (typeof to === 'string') {
      if (currentRoute.path !== to) await router.push(to);
    } else if ('name' in to && to.name) {
      if (currentRoute.name !== to.name) await router.push(to);
    }
  }

  function replace(to: string | RouteLocationRaw) {
    void router.replace(to);
  }

  function back() {
    router.back();
  }

  return {
    currentRoute,
    currentPath,
    go,
    replace,
    back,
  };
}
