import mitt, { type Emitter, type Handler } from 'mitt';
import { type AppEvents } from './types/global.types';

export class AppEmitter {
  private emitter: Emitter<AppEvents>;

  constructor() {
    this.emitter = mitt<AppEvents>();
  }

  /** Émettre un événement */
  emit<K extends keyof AppEvents>(event: K, payload: AppEvents[K]): void {
    this.emitter.emit(event, payload);
  }

  /** Écouter un événement */
  on<K extends keyof AppEvents>(event: K, handler: Handler<AppEvents[K]>): void {
    this.emitter.on(event, handler);
  }

  /** Arrêter d’écouter un événement */
  off<K extends keyof AppEvents>(event: K, handler?: Handler<AppEvents[K]>): void {
    this.emitter.off(event, handler);
  }
}

export const emitter = new AppEmitter();
