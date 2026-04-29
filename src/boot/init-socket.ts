import { boot } from 'quasar/wrappers';
import { socketClient } from 'src/services/socket.service';
import { initSocketEvents } from 'src/ws-handlers';

export default boot(() => {
  socketClient.connect();
  initSocketEvents();
});
