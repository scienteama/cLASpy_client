<template>
  <q-card flat bordered>
    <q-card-section class="q-pa-none">
      <div class="row items-center justify-start">
        <div class="row items-center justify-start q-pa-sm col-auto">
          <input class="q-mr-md" type="color" v-model="bgColor" @input="updateBackground" />
          <q-select v-model="colorMode" :options="colorModes" option-value="value" emit-value map-options label="Couleur" dense outlined style="width: 150px" />
          <div class="col-auto q-ml-md">
            <div class="row items-center">
              <span class="text-caption">Taille points : </span>
              <q-slider v-model="pointSize" :min="0.02" :max="5" :step="0.02" dense style="width: 200px" class="q-ml-sm" />
            </div>
          </div>
          <div class="col-auto q-ml-md">
            <q-toggle v-model="showGrid" label="Grille" dense />
            <q-toggle class="q-ml-md" v-model="showAxes" label="Axes" dense />
          </div>
        </div>
        <div class="col-auto q-ml-md">
          {{ renderedPoints }}
        </div>
      </div>
    </q-card-section>
  </q-card>
  <div class="row items-start viewer-area q-mt-sm">
    <q-card flat bordered class="column items-start justify-evenly view-buttons q-mr-sm bg-blue-1">
      <q-btn dense color="primary" label="Top" @click="setPresetView('top')" class="view-btn" />
      <q-btn dense color="primary" label="Bottom" @click="setPresetView('bottom')" class="view-btn" />

      <q-btn dense color="primary" label="Front" @click="setPresetView('front')" class="view-btn" />
      <q-btn dense color="primary" label="Back" @click="setPresetView('back')" class="view-btn" />

      <q-btn dense color="primary" label="Left" @click="setPresetView('left')" class="view-btn" />
      <q-btn dense color="primary" label="Right" @click="setPresetView('right')" class="view-btn" />
      <q-btn dense color="negative" label="Reset" @click="resetView" class="view-btn" />

      <q-btn flat dense color="black" :icon="mdiPlusBox" @click="zoom(1.2)" class="view-btn" size="lg" />
      <q-btn flat dense color="black" :icon="mdiMinusBox" @click="zoom(0.8)" class="view-btn" size="lg" />
    </q-card>
    <q-card bordered ref="container" class="col-4 viewer q-mr-md" :style="{ '--bg-color': bgColor }">
      <div class="spinner">
        <q-card v-if="beforeLoading" flat bordered class="q-pa-md bg-blue-1">
          <div class="text-subtitle1 text-weight-medium text-center">Sélectionnez un fichier LAS</div>
        </q-card>
        <q-spinner-hourglass v-if="loading" color="orange" size="7em" />
      </div>
    </q-card>
    <div class="column items-start">
      <q-card flat bordered class="row items-start justify-center q-pa-sm q-mb-sm" style="width: 100%">
        <div class="col-auto q-mb-sm text-center">
          <div class="text-weight-bold q-mb-sm">Moyenne (30min)</div>
          <MetricsStats :isRealTime="false" />
        </div>
        <q-separator vertical color="grey-4" class="q-mx-sm" />
        <div class="col-auto q-mb-sm text-center">
          <div class="text-weight-bold q-mb-sm">Temps réel</div>
          <MetricsStats :isRealTime="true" />
        </div>
      </q-card>
      <FileExplorer :bordered="true" :show-input="true" :show-title="false" :las-viewer-mode="true" @view:las="handleViewLas" />
    </div>
  </div>
</template>

<script setup lang="ts">
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { LASLoader } from '@loaders.gl/las';
import { load } from '@loaders.gl/core';
import { onMounted, ref, watch } from 'vue';
import FileExplorer from '@/components/files/FileExplorer.vue';
import { mdiMinusBox, mdiPlusBox } from '@quasar/extras/mdi-v7';
import { type FileModel } from '@/models/types/files.type';
import { fileService } from '@/services/files.service';
import { QCard } from 'quasar';
import MetricsStats from '@/components/widgets/MetricsStats.vue';

const props = defineProps<{
  fileUrl: string | null;
}>();

// Canvas Three.js.
const container = ref<QCard | null>(null);

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;
let pointCloud: THREE.Points | null = null;
let axesHelper: THREE.AxesHelper | null = null;
let gridHelper: THREE.GridHelper | null = null;
let pointCloudBounds: THREE.Box3 | null = null;
let currentClassificationValues: Uint8Array | null = null;

const bgColor = ref('#1a1a2e');
const colorMode = ref<'classification' | 'altitude'>('classification');
const beforeLoading = ref(true);
const loading = ref(false);
const colorModes = [
  { label: 'Classification', value: 'classification' },
  { label: 'Altitude', value: 'altitude' },
];
const pointSize = ref(0.1);
const showGrid = ref(true);
const showAxes = ref(true);
const renderedPoints = ref(0);

// Force le rendu
const renderScene = () => {
  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
};

const updateBackground = () => {
  scene.background = new THREE.Color(bgColor.value);
  renderScene();
};

const updatePointSize = () => {
  if (!pointCloud) return;
  const material = pointCloud.material as THREE.PointsMaterial;
  material.size = pointSize.value;
  material.needsUpdate = true;
  renderScene();
};

async function handleViewLas(file: FileModel) {
  if (!file) return;

  try {
    const res = await fileService.downloadFile(file.id);
    if (!res?.data) return;
    const url = window.URL.createObjectURL(res.data);
    await loadLASFile(url);
  } catch (error) {
    console.error('Erreur lors du téléchargement :', error);
  }
}

const buildClassificationColors = (classifications: Uint8Array) => {
  const colors = new Uint8Array(classifications.length * 3);
  const classColors: Record<number, [number, number, number]> = {
    0: [200, 200, 200],
    1: [180, 180, 180],
    2: [140, 90, 50],
    3: [0, 180, 0],
    4: [0, 120, 0],
    5: [0, 80, 0],
    6: [220, 50, 50],
    7: [100, 100, 100],
    9: [0, 150, 255],
    17: [255, 200, 0],
  };

  for (let i = 0; i < classifications.length; i++) {
    const [r, g, b] = classColors[classifications[i] ?? 0] ?? [255, 255, 255];
    colors[i * 3] = r;
    colors[i * 3 + 1] = g;
    colors[i * 3 + 2] = b;
  }

  return colors;
};

const buildAltitudeColors = (positions: Float32Array) => {
  const colors = new Uint8Array(positions.length);
  let minZ = Infinity;
  let maxZ = -Infinity;

  for (let i = 2; i < positions.length; i += 3) {
    const z = positions[i];
    if (z) {
      minZ = Math.min(minZ, z);
      maxZ = Math.max(maxZ, z);
    }
  }

  const range = maxZ - minZ || 1;

  for (let i = 0; i < positions.length; i += 3) {
    const z = positions[i + 2];
    let normalized = 0;
    if (z) {
      normalized = (z - minZ) / range;
    }

    colors[i] = Math.round(255 * normalized);
    colors[i + 1] = Math.round(128 * (1 - Math.abs(normalized - 0.5) * 2));
    colors[i + 2] = Math.round(255 * (1 - normalized));
  }

  return colors;
};

const applyColorModeToGeometry = (geometry: THREE.BufferGeometry, positions: Float32Array, mode: 'classification' | 'altitude') => {
  const pointCount = positions.length / 3;
  const colors =
    mode === 'classification' && currentClassificationValues && currentClassificationValues.length === pointCount
      ? buildClassificationColors(currentClassificationValues)
      : buildAltitudeColors(positions);

  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3, true));
  const colorAttribute = geometry.getAttribute('color') as THREE.BufferAttribute | undefined;
  if (colorAttribute) {
    colorAttribute.needsUpdate = true;
  }
};

const updateColorMode = () => {
  if (!pointCloud) return;

  const geometry = pointCloud.geometry;
  const positionAttribute = geometry.getAttribute('position');

  if (positionAttribute?.array) {
    applyColorModeToGeometry(geometry, positionAttribute.array as Float32Array, colorMode.value);
  }

  const currentMaterial = pointCloud.material as THREE.PointsMaterial;
  const nextMaterial = new THREE.PointsMaterial({
    size: pointSize.value,
    sizeAttenuation: currentMaterial.sizeAttenuation,
    depthWrite: currentMaterial.depthWrite,
    transparent: currentMaterial.transparent,
    opacity: currentMaterial.opacity,
    vertexColors: true,
    color: new THREE.Color(0xffffff),
  });

  pointCloud.material = nextMaterial;
  currentMaterial.dispose();
  pointCloud.material.needsUpdate = true;
  renderScene();
};

const updateGridVisibility = () => {
  if (gridHelper) {
    gridHelper.visible = showGrid.value;
  }
};

const updateAxesVisibility = () => {
  if (axesHelper) {
    axesHelper.visible = showAxes.value;
  }
};

const setPresetView = (view: 'bottom' | 'top' | 'front' | 'back' | 'right' | 'left' | 'iso') => {
  if (!pointCloudBounds) return;
  const center = pointCloudBounds.getCenter(new THREE.Vector3());
  const size = pointCloudBounds.getSize(new THREE.Vector3());
  const distance = Math.max(size.x, size.y, size.z) * 1.8;
  const target = new THREE.Vector3();

  switch (view) {
    case 'top':
      target.set(center.x, center.y + distance, center.z);
      break;
    case 'bottom':
      target.set(center.x, center.y - distance, center.z);
      break;
    case 'front':
      target.set(center.x, center.y, center.z + distance);
      break;
    case 'right':
      target.set(center.x + distance, center.y, center.z);
      break;
    case 'left':
      target.set(center.x - distance, center.y, center.z);
      break;
    case 'back':
      target.set(center.x, center.y, center.z - distance);
      break;
    default:
      target.set(center.x + distance, center.y + distance, center.z + distance);
  }

  camera.position.copy(target);
  camera.lookAt(center);
  controls.target.copy(center);
  controls.update();
};

const resetView = () => {
  setPresetView('iso');
};

const zoom = (scale: number) => {
  const direction = camera.position.clone().sub(controls.target);
  camera.position.copy(controls.target).add(direction.multiplyScalar(1 / scale));
  camera.updateProjectionMatrix();
  controls.update();
};

// Crée et positionne les aides visuelles (grille et axes).
function updateHelpers(bounds: THREE.Box3) {
  const center = bounds.getCenter(new THREE.Vector3());
  const size = bounds.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z, 10);
  const gridSize = Math.max(Math.ceil(maxDim / 10) * 10, 10);
  const divisions = Math.min(Math.max(Math.round(gridSize / 10), 10), 100);

  if (gridHelper) {
    scene.remove(gridHelper);
  }
  gridHelper = new THREE.GridHelper(gridSize, divisions, 0x888888, 0x444444);
  gridHelper.position.set(center.x, bounds.min.y, center.z);
  gridHelper.visible = showGrid.value;
  scene.add(gridHelper);

  if (axesHelper) {
    scene.remove(axesHelper);
  }
  axesHelper = new THREE.AxesHelper(maxDim * 0.5);
  axesHelper.position.copy(center);
  axesHelper.visible = showAxes.value;
  scene.add(axesHelper);
}

onMounted(async () => {
  if (!container.value) return;

  const el = container.value?.$el as HTMLElement;

  // Initialiser la scène
  scene = new THREE.Scene();
  scene.background = new THREE.Color(bgColor.value);

  // Initialiser la caméra
  const width = el.clientWidth;
  const height = el.clientHeight;

  camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000000);
  camera.position.set(100, 100, 100);

  // Initialiser le renderer
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  el.appendChild(renderer.domElement);

  // Initialiser les contrôles
  controls = new OrbitControls(camera, renderer.domElement);
  controls.autoRotate = false;
  controls.autoRotateSpeed = 2;
  controls.enableDamping = false;
  controls.dampingFactor = 0.05;
  controls.update();

  // Ajouter l'éclairage
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(100, 200, 100);
  scene.add(directionalLight);

  const animate = () => {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
    renderedPoints.value = renderer.info.render.points;
  };
  animate();

  // Gestion du redimensionnement
  const handleResize = () => {
    if (!container.value) return;
    const newWidth = el.clientWidth;
    const newHeight = el.clientHeight;
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight, false);
  };
  window.addEventListener('resize', handleResize);

  watch(bgColor, updateBackground);
  watch(colorMode, updateColorMode);
  watch(pointSize, updatePointSize);
  watch(showGrid, updateGridVisibility);
  watch(showAxes, updateAxesVisibility);

  if (props.fileUrl) {
    await loadLASFile(props.fileUrl);
  }

  return () => {
    window.removeEventListener('resize', handleResize);
    renderer.dispose();
  };
});

// Charge un fichier LAS et construit le nuage de points associé.
async function loadLASFile(url: string) {
  try {
    beforeLoading.value = false;
    loading.value = true;

    const lasMesh = await load(url, LASLoader, { worker: true, wasm: true });

    console.log(lasMesh);

    const positionAttribute = lasMesh.attributes.POSITION ?? lasMesh.attributes.POSITION_CARTESIAN ?? lasMesh.attributes.position;

    const classificationAttribute = lasMesh.attributes.classification;

    if (!positionAttribute || !positionAttribute.value) {
      throw new Error('Position attribute manquant dans le LAS.');
    }

    const positions = Float32Array.from(positionAttribute.value as ArrayLike<number>);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const rawClassifications = classificationAttribute?.value;
    currentClassificationValues = rawClassifications && (rawClassifications as ArrayLike<number>).length === positions.length / 3 ? Uint8Array.from(rawClassifications as ArrayLike<number>) : null;

    applyColorModeToGeometry(geometry, positions, colorMode.value);

    const material = new THREE.PointsMaterial({
      size: pointSize.value,
      vertexColors: true,
    });

    const newPointCloud = new THREE.Points(geometry, material);
    if (pointCloud) {
      scene.remove(pointCloud);
      const oldGeom = pointCloud.geometry;
      oldGeom.dispose();
      const oldMat = pointCloud.material;
      if (Array.isArray(oldMat)) {
        oldMat.forEach((m) => m.dispose());
      } else {
        oldMat.dispose();
      }
    }
    pointCloud = newPointCloud;
    scene.add(pointCloud);

    // Ajuster la caméra pour voir tout le nuage de points
    const box = new THREE.Box3().setFromObject(newPointCloud);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z, 10);
    const fov = camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));

    cameraZ *= 1.5;

    const viewDirection = new THREE.Vector3(1, 1, 1).normalize();
    camera.position.copy(center).addScaledVector(viewDirection, cameraZ);
    camera.lookAt(center);

    controls.target.copy(center);
    controls.update();

    pointCloudBounds = box;
    updateHelpers(box);
    updatePointSize();
    updateColorMode();
  } catch (error) {
    console.error('Erreur lors du chargement du fichier LAS:', error);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped lang="scss">
.viewer {
  position: relative;
  flex: 1 1 auto;
  min-width: 0;
  max-width: 50%;
  height: 80vh;
  box-sizing: border-box;
  overflow: hidden;
  background-color: var(--bg-color);
}

.viewer .spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 20;
}

.viewer-area {
  position: relative;
}

.viewer-area .view-buttons {
  position: absolute;
  left: 8px;
  top: 8px;
  z-index: 30;
  padding: 6px;
  margin-left: 7px;
  margin-top: 7px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 80px;
  align-items: stretch;
  box-sizing: border-box;
}

.viewer .view-btn {
  width: 100% !important;
}

.viewer-area .view-buttons .view-btn {
  width: 100% !important;
}

.view-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: fit-content;
  flex: 0 0 auto;
}

.view-btn {
  width: 100% !important;
}
</style>
