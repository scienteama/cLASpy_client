/* eslint-disable @typescript-eslint/no-explicit-any */
import { wss_url } from 'src/boot/axios';
import { reactive, readonly } from 'vue';

interface WSMessage {
  type: string;
  [key: string]: any;
}

interface WSState {
  isConnected: boolean;
  messages: WSMessage[];
}

type WSHandler = (message: WSMessage) => void | Promise<void>;

export class WebSocketClient {
  private socket: WebSocket | null = null;
  private url: string;
  private reconnectInterval: number;
  private state: WSState;

  private handlers: Record<string, WSHandler> = {};

  constructor(url: string, reconnectInterval = 5000) {
    this.url = url;
    this.reconnectInterval = reconnectInterval;
    this.state = reactive({
      isConnected: false,
      messages: [],
    });
    this.connect();
  }

  public on(type: string, handler: WSHandler) {
    this.handlers[type] = handler;
  }

  private async handleMessage(msg: WSMessage | { type: 'text'; message: string }) {
    const handler = this.handlers[msg.type];
    if (handler) {
      try {
        await handler(msg);
      } catch (err) {
        console.error('Erreur dans handler WS pour type', msg.type, err);
      }
    } else {
      this.state.messages.push(msg);
    }
  }

  private connect() {
    this.socket = new WebSocket(this.url);

    this.socket.addEventListener('open', () => {
      console.log('WebSocket connecté');
      this.state.isConnected = true;
    });

    this.socket.addEventListener('message', (event) => {
      this.handleMessageWrapper(event);
    });

    this.socket.addEventListener('close', () => {
      console.log('WebSocket déconnecté. Tentative de reconnexion...');
      this.state.isConnected = false;
      setTimeout(() => this.connect(), this.reconnectInterval);
    });

    this.socket.addEventListener('error', (err) => {
      console.error('Erreur WebSocket:', err);
      this.socket?.close();
    });
  }

  private handleMessageWrapper(event: MessageEvent) {
    const msgStr = event.data as string;

    (async () => {
      try {
        const data = JSON.parse(msgStr) as WSMessage;
        if (data.type !== 'ping') {
          await this.handleMessage(data);
        }
      } catch {
        // Message texte simple
        await this.handleMessage({ type: 'text', message: msgStr });
      }
    })().catch((err) => {
      console.error('Erreur traitement message WS:', err);
    });
  }

  /** Envoie un message JSON */
  public send(message: Record<string, any>) {
    if (this.socket && this.state.isConnected) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket non connecté, impossible d'envoyer le message");
    }
  }

  public getState() {
    return readonly(this.state);
  }
}

export let websocketService: WebSocketClient | null = null;

/** Singleton instance */
export function createWebsocket(): WebSocketClient {
  if (!websocketService) {
    websocketService = new WebSocketClient(wss_url);
  }
  return websocketService;
}

/** Enregistre un handler pour un type de message WebSocket */
export function registerWSHandler(type: string, handler: WSHandler) {
  if (!websocketService) {
    console.warn('WebSocket non initialisé, handler non enregistré');
    return;
  }
  websocketService.on(type, handler);
}
