import { boot } from 'quasar/wrappers';
import { initSocketEvents } from 'src/ws-handlers';

export default boot(() => {
  initSocketEvents();
});
