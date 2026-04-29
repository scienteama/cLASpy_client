import { boot } from 'quasar/wrappers';
import { useAuth } from 'src/stores/auth-store';

export default boot(async () => {
  const auth = useAuth();
  await auth.checkSession();
});
