import mitt from 'mitt';

export const emitter = mitt();

export type EventCallbacks = {
  [eventName: string]: (data: unknown) => void;
};

/**
 * Crée une connexion SSE simple pour un endpoint et redirige les events vers les callbacks.
 * Pas de reconnexion automatique.
 */
export function createEventSource(endpoint: string, callbacks: EventCallbacks): EventSource {
  const source = new EventSource(endpoint);

  // Écoute des events
  for (const eventName in callbacks) {
    const callback = callbacks[eventName];
    if (!callback) continue;

    source.addEventListener(eventName, (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        callback(data);
      } catch (err) {
        console.error(`Erreur SSE sur ${eventName}:`, err, event.data);
      }
    });
  }

  source.onopen = () => {
    console.info(`✅ SSE connecté sur ${endpoint}`);
  };

  source.onerror = (err) => {
    console.error(`⚠️ SSE erreur sur ${endpoint}`, err);
    source.close();
  };

  return source;
}

/**
 * Ferme la connexion SSE
 */
export function closeEventSource(source: EventSource) {
  source.close();
}
