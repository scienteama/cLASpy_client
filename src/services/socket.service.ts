/* eslint-disable @typescript-eslint/no-explicit-any */
import { reactive, readonly } from 'vue';
import { io, type Socket } from 'socket.io-client';
import { socket_url } from '@/boot/axios';

interface WSState {
  isConnected: boolean;
  messages: any[];
}

export class SocketIOClient {
  private socket!: Socket;

  private state = reactive<WSState>({
    isConnected: false,
    messages: [],
  });

  constructor() {
    this.socket = io(socket_url, {
      autoConnect: false,
      transports: ['websocket'],
      withCredentials: true,
    });
  }

  public connect() {
    if (this.socket?.connected) return;
    this.socket.connect();
    this.bindCoreEvents();
  }

  private bindCoreEvents() {
    this.socket.on('connect', () => {
      console.log('[socket] connected');
      this.state.isConnected = true;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[socket] disconnected:', reason);
      this.state.isConnected = false;
    });

    this.socket.on('connect_error', (err) => {
      console.error('[socket] error:', err.message);
      this.state.isConnected = false;
    });
  }

  public on<T = any>(event: string, handler: (data: T) => void) {
    this.socket.on(event, handler);
  }

  public send(event: string, payload: any) {
    this.socket.emit(event, payload);
  }

  public getState() {
    return readonly(this.state);
  }

  public close() {
    this.socket.disconnect();
  }
}

export const socketClient = new SocketIOClient();
