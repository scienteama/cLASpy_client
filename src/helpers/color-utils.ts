import type { HSL } from 'src/types/global.types';

/**
 * Convertit une couleur hexadécimale en HSL.
 * @param hex Couleur au format hex (ex: "#ff5733")
 * @returns Objet HSL { h: 0-360, s: 0-100, l: 0-100 }
 */
export function hexToHSL(hex: string): HSL {
  const r = parseInt(hex.substring(1, 3), 16) / 255;
  const g = parseInt(hex.substring(3, 5), 16) / 255;
  const b = parseInt(hex.substring(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * Convertit une couleur HSL en hexadécimal.
 * @param hsl Objet HSL { h: 0-360, s: 0-100, l: 0-100 }
 * @returns Couleur hexadécimale (ex: "#ff5733")
 */
export function hslToHex({ h, s, l }: HSL): string {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0,
    g = 0,
    b = 0;

  if (h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }

  const toHex = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Génère une palette de couleurs à partir d’une couleur de base.
 *
 * La palette est construite en variant la **luminosité** autour de la couleur de base.
 *
 * @param baseHex Couleur de départ au format hex (ex: "#ff5733")
 * @param steps Nombre de couleurs à générer (par défaut 8)
 * @returns Tableau de couleurs hexadécimales
 */
export function generatePal(baseHex: string, steps: number = 8): string[] {
  const baseHSL = hexToHSL(baseHex);
  const palette: string[] = [];

  for (let i = 0; i < steps; i++) {
    // Variation linéaire de luminosité
    const l = Math.min(100, Math.max(0, baseHSL.l + (i - steps / 2) * (50 / steps)));
    const color: HSL = { h: baseHSL.h, s: baseHSL.s, l };
    palette.push(hslToHex(color));
  }

  return palette;
}

/**
 * Palettes de couleurs par défaut.
 */
export const defaultPals: Record<string, string[]> = {
  ocean: ['#03045e', '#023e8a', '#0077b6', '#0096c7', '#00b4d8', '#48cae4', '#90e0ef', '#ade8f4', '#caf0f8'],
  sunset: ['#cc5803', '#e2711d', '#ff9505', '#ffb627', '#ffc971'],
  earth: ['#582f0e', '#7f4f24', '#936639', '#a68a64', '#b6ad90', '#c2c5aa', '#a4ac86', '#656d4a', '#414833', '#333d29'],
  forest: ['#797d62', '#9b9b7a', '#baa587', '#d9ae94', '#f1dca7', '#ffcb69', '#e8ac65', '#d08c60', '#b58463', '#997b66'],
  fire: ['#7f0000', '#b30000', '#e60000', '#ff1a1a', '#ff4d4d', '#ff8080', '#ffb3b3', '#ffe6e6'],
  grayscale: ['#000000', '#1a1a1a', '#333333', '#4d4d4d', '#666666', '#808080', '#999999', '#b3b3b3', '#cccccc', '#e6e6e6', '#ffffff'],
};

/**
 * Calcule la luminosité d'une couleur hex (#RRGGBB)
 * @param hex
 * @returns luminosité entre 0 et 255
 */
export function getLuminance(hex: string) {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Trie une palette de couleurs hex du plus sombre au plus clair
 * @param pal
 * @returns palette triée
 */
export function sortPaletteByBrightness(pal: string[]) {
  return pal.slice().sort((a, b) => getLuminance(a) - getLuminance(b));
}

/**
 * Retourne une couleur de texte adaptée à une palette (blanc ou noir)
 * La décision n'est plus un seuil fixe, mais ajustée selon la luminosité moyenne
 * @param pal
 * @returns '#ffffff' ou '#000000'
 */
export function getTextColorForPalette(pal: string[]): { name: string; value: string } {
  const lumSum = pal.reduce((sum, hex) => sum + getLuminance(hex), 0);
  const lumAvg = lumSum / pal.length;
  const threshold = 150;
  return lumAvg < threshold ? { name: 'white', value: '#ffffff' } : { name: 'black', value: '#000000' };
}

/**
 * Retourne une couleur de texte adaptée à une seule couleur hex (blanc ou noir)
 * La décision n'est plus un seuil fixe, mais ajustée selon la luminosité
 * @param hexColor
 * @returns '#ffffff' ou '#000000'
 */
export function getTextColorForHex(hexColor: string): string {
  const lum = getLuminance(hexColor);
  const threshold = 150;
  return lum < threshold ? '#ffffff' : '#000000';
}

/**
 * Applique l'effet glossy de quasar.
 *
 * Utilisation : concaténer à dégradé existant
 *
 * Exemple: `${glossyStyle}, linear-gradient(....)`
 */
export const glossyStyle = `linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.3),
    rgba(255, 255, 255, 0) 50%,
    rgba(0, 0, 0, 0.12) 51%,
    rgba(0, 0, 0, 0.04)
  )`;


export function invertColor(hex: string) {
  hex = hex.replace('#', '');
  const r = (255 - parseInt(hex.substring(0, 2), 16)).toString(16).padStart(2, '0');
  const g = (255 - parseInt(hex.substring(2, 4), 16)).toString(16).padStart(2, '0');
  const b = (255 - parseInt(hex.substring(4, 6), 16)).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}