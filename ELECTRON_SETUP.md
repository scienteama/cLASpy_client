# Electron Integration

### Développement

```bash
yarn start:electron
```

### Build

```bash
# Génère un installeur et une version portable
yarn build:electron
```

Les fichiers générés seront dans:
- `dist/electron/Packaged/`
  - `cLASpy-Client-Setup-x.x.x.exe` - Installeur
  - `cLASpy-Client-x.x.x-portable.exe` - Version portable

## Configuration

La configuration Electron est définie dans `quasar.config.ts` sous la section `electron`:

- **bundler**: Utilise `electron-builder` pour générer les .exe
- **win**: Configuration spécifique à Windows
  - Cible: NSIS (installeur) et Portable
  - Architecture: x64

## API Electron disponible

Le preload script expose l'API suivante:

```typescript
window.electronAPI.sendNotification(title: string, message: string)
window.electronAPI.onNotification(callback: (data) => void)
```

## Exemple d'utilisation dans un composant Vue

```vue
<script setup>
const sendNotif = () => {
  window.electronAPI?.sendNotification('Titre', 'Message');
};
</script>

<template>
  <button @click="sendNotif">Envoyer notification</button>
</template>
```

## Notes importantes

En développement, l'app se connecte à `https://localhost:8081`.
En production, assurez-vous que le backend est accessible.


