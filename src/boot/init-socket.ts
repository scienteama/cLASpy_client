import { socketClient } from '@/services/socket.service';
import { initSocketEvents } from '@/ws-handlers';
import { defineBoot } from '#q-app';

export default defineBoot(() => {
  socketClient.connect();
  initSocketEvents();
});
