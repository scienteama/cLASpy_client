<template>
  <div class="background-wrapper">
    <div v-if="isDrawer" class="image-wrapper">
      <canvas ref="canvas" class="background-canvas"></canvas>
      <q-img :src="classPyIcon" fit="contain" class="foreground-img filtered-img" />
      <q-img :src="classPyIcon" fit="contain" class="foreground-img base-img" />
      <div class="choose-theme-btn">
        <q-btn icon="mdi-palette-outline" dense outline color="claspy-dark1" class="bg-white" @click="chooseColor = true" />
        <q-btn icon="mdi-palette-advanced" dense outline color="claspy-dark1" class="bg-white" @click="chooseTheme = true" />
      </div>
    </div>
    <div v-else>
      <canvas ref="canvas" class="background-canvas"></canvas>
    </div>
    <q-dialog v-model="chooseColor" class="choose-theme-dialog" backdrop-filter="blur(4px) saturate(150%)">
      <q-card class="choose-theme-dialog-pos">
        <q-card-section>
          <q-color v-model="hexColor" no-header no-footer flat />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Fermer" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="chooseTheme" class="choose-theme-dialog" backdrop-filter="blur(4px) saturate(150%)">
      <q-card class="choose-theme-dialog-pos">
        <q-card-section>
          <q-select outlined v-model="selectedTheme" label="Thème :" :options="themeList" dense>
            <template v-slot:prepend>
              <q-icon name="mdi-format-list-bulleted-square" color="primary" />
            </template>
          </q-select>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Fermer" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount, nextTick, watch, computed } from 'vue';
import Trianglify from 'trianglify';
import classPyIcon from '../../assets/pythie_alpha_hd_miroir.png';
import type { Point } from 'src/types/global.types';

import { useConfigStore } from 'src/stores/config-store';
import { storeToRefs } from 'pinia';
import { generatePal } from 'src/helpers/color-utils';

const configStore = useConfigStore();
const { defaultThemes, currentTheme } = storeToRefs(configStore);

const props = defineProps({
  isDrawer: { type: Boolean, default: false },
  numPoints: { type: Number, default: 35 },
  lineWidth: { type: Number, default: 0.1 },
});

const hexColor = ref('');
const selectedTheme = ref('');
const themeList = Object.keys(defaultThemes.value);
const themePal = computed(() => defaultThemes.value[selectedTheme.value]);
const chooseColor = ref(false);
const chooseTheme = ref(false);
const baseTheme = ref(defaultThemes.value.forest);

const canvas = ref<HTMLCanvasElement | null>(null);
let ctx: CanvasRenderingContext2D | null = null;
let width = 0;
let height = 0;
let animationFrameId = 0;
let resizeObserver: ResizeObserver | null = null;

const points: Point[] = [];

const randomDir = () => (Math.random() - 0.5) * 0.3;

function initPoints() {
  points.length = 0;

  for (let i = 0; i < props.numPoints; i++) {
    points.push({ x: Math.random() * width, y: Math.random() * height, dx: randomDir(), dy: randomDir() });
  }

  const margin = 50;
  points.push(
    { x: 0, y: 0, fixed: true },
    { x: width, y: 0, fixed: true },
    { x: 0, y: height, fixed: true },
    { x: width, y: height, fixed: true },
    { x: margin, y: margin, fixed: true },
    { x: width - margin, y: margin, fixed: true },
    { x: margin, y: height - margin, fixed: true },
    { x: width - margin, y: height - margin, fixed: true }
  );
}

function draw() {
  if (!ctx || width === 0 || height === 0) return;

  ctx.clearRect(0, 0, width, height);

  points.forEach((p) => {
    if (!p.fixed) {
      p.x += p.dx!;
      p.y += p.dy!;

      if (p.x < 0 || p.x > width) p.dx! *= -1;
      if (p.y < 0 || p.y > height) p.dy! *= -1;
    }
  });

  const vertices = points.map((p) => [p.x, p.y] as [number, number]);
  const xColors = currentTheme.value;

  const pattern = Trianglify({
    width,
    height,
    points: vertices,
    xColors,
  });

  pattern.polys.forEach((poly) => {
    const v = poly.vertexIndices.map((i) => pattern.points[i]);

    ctx!.beginPath();
    ctx!.moveTo(v[0]![0], v[0]![1]);
    ctx!.lineTo(v[1]![0], v[1]![1]);
    ctx!.lineTo(v[2]![0], v[2]![1]);
    ctx!.closePath();

    ctx!.fillStyle = poly.color.hex();
    ctx!.fill();
    ctx!.lineWidth = props.lineWidth;
    ctx!.stroke();
  });

  animationFrameId = requestAnimationFrame(draw);
}

function resize() {
  const el = canvas.value;
  if (!el) return;

  const rect = el.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return;

  width = rect.width;
  height = rect.height;

  el.width = width;
  el.height = height;

  initPoints();
}

watch(hexColor, async () => {
  if (hexColor.value) {
    baseTheme.value = [];
    currentTheme.value = generatePal(hexColor.value, 8);
    cancelAnimationFrame(animationFrameId);
    await nextTick();
    draw();
  }
});

watch(themePal, async () => {
  if (themePal.value) {
    currentTheme.value = themePal.value;
    cancelAnimationFrame(animationFrameId);
    await nextTick();
    draw();
  }
});

onMounted(async () => {
  if (baseTheme.value && currentTheme.value.length == 0) {
    currentTheme.value = baseTheme.value;
  }

  await nextTick();

  if (!canvas.value) return;
  ctx = canvas.value.getContext('2d');

  resize();

  resizeObserver = new ResizeObserver(() => resize());
  resizeObserver.observe(canvas.value);

  draw();
});

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrameId);
  resizeObserver?.disconnect();
});
</script>

<style scoped lang="scss">
.choose-theme-btn {
  position: absolute;
  bottom: 8px;
  right: 8px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.choose-theme-dialog {
  .q-dialog__inner {
    align-items: flex-start;
    justify-content: flex-start;
  }
}

.choose-theme-dialog-pos {
  position: fixed;
  top: 16px;
  left: 16px;
  min-width: 250px;
}

.canvas-container {
  position: relative;
  display: inline-block;
}

.background-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  box-shadow:
    inset 5px 0 8px -5px #000,
    inset -5px 0 8px -5px #000;
}

.foreground-img {
  width: 100%;
  height: 150px;
}

.image-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
  height: 150px;
}

.base-img {
  display: block;
  width: 100%;
  height: 100%;
}

.filtered-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  filter: blur(8px) brightness(0.2) contrast(1.5);
  -webkit-mask: radial-gradient(circle 40% at 50% 50%, rgba(0, 0, 0, 1) 100%, rgba(0, 0, 0, 0) 100%);
  mask: radial-gradient(circle 40% at 50% 50%, rgba(0, 0, 0, 1) 100%, rgba(0, 0, 0, 0) 100%);
  pointer-events: none;
}
</style>
