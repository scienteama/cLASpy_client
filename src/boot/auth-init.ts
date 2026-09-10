import { defineBoot } from '#q-app';
import { useAuth } from '@/stores/auth-store';

export default defineBoot(async () => {
  const auth = useAuth();
  await auth.checkSession();
});
