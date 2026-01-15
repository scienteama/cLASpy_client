import { EventEmitter } from 'events';

interface AppEvent {
  data: { message: string; timestamp: number };
  error: Error;
  finished: void;
}

class AppEmitter extends EventEmitter {
  override on<K extends keyof AppEvent>(event: K, listener: (payload: AppEvent[K]) => void): this {
    return super.on(event, listener);
  }

  override emit<K extends keyof AppEvent>(event: K, payload: AppEvent[K]): boolean {
    return super.emit(event, payload);
  }
}

export const emitter = new AppEmitter();
