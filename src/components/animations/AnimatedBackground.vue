<template>
  <div class="background-wrapper">
    <div v-if="isDrawer" class="image-wrapper">
      <canvas ref="canvas" class="background-canvas"></canvas>
      <q-img :src="classPyIcon" fit="contain" class="foreground-img filtered-img" />
      <q-img :src="classPyIcon" fit="contain" class="foreground-img base-img" />
    </div>
    <div v-else>
      <canvas ref="canvas" class="background-canvas"></canvas>
    </div>
  </div>
</template>


<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import classPyIcon from '../../assets/pythie_alpha_hd_miroir.png';
import Trianglify from "trianglify";

const pal = {
  ocean: ["#03045e", "#023e8a", "#0077b6", "#0096c7", "#00b4d8", "#48cae4", "#90e0ef", "#ade8f4", "#caf0f8"],
  sunset: ["#cc5803", "#e2711d", "#ff9505", "#ffb627", "#ffc971"],
  earth: ["#582f0e", "#7f4f24", "#936639", "#a68a64", "#b6ad90", "#c2c5aa", "#a4ac86", "#656d4a", "#414833", "#333d29"],
  forest: ["#797d62", "#9b9b7a", "#baa587", "#d9ae94", "#f1dca7", "#ffcb69", "#e8ac65", "#d08c60", "#b58463", "#997b66"],
  fire: ["#7f0000", "#b30000", "#e60000", "#ff1a1a", "#ff4d4d", "#ff8080", "#ffb3b3", "#ffe6e6"],
  grayscale: ["#000000", "#1a1a1a", "#333333", "#4d4d4d", "#666666", "#808080", "#999999", "#b3b3b3", "#cccccc", "#e6e6e6", "#ffffff"]
};


type PaletteName = keyof typeof pal;

const props = withDefaults(defineProps<{
  isDrawer?: boolean
  numPoints?: number
  lineWidth?: number
  theme?: PaletteName
}>(), {
  isDrawer: false,
  numPoints: 35,
  lineWidth: 0.1,
  theme: 'forest'
});




//const isDarkMode = false;
//const currentPal = isDarkMode ? colorPal.dark : colorPal.light;

interface Point {
  x: number;
  y: number;
  dx?: number;
  dy?: number;
  fixed?: boolean;
}

const canvas = ref<HTMLCanvasElement | null>(null);
let animationFrameId: number;

onMounted(() => {
  const ctxCanvas = canvas.value!;
  const ctx = ctxCanvas.getContext('2d')!;
  let width = ctxCanvas.clientWidth;
  let height = ctxCanvas.clientHeight;
  ctxCanvas.width = width;
  ctxCanvas.height = height;

  //const numPoints = 35;
  const points: Point[] = [];

  // Random small direction changes for point movement
  const randomDir = () => (Math.random() - 0.5) * 0.3;

  for (let i = 0; i < props.numPoints; i++) {
    points.push({ x: Math.random() * width, y: Math.random() * height, dx: randomDir(), dy: randomDir(), fixed: false });
  }

  // Add fixed points at the corners and edges to stabilize the triangulation
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

  /**
   * Redraws the animated background by:
   * 1. Clearing the canvas.
   * 2. Updating the positions of all non-fixed points, reflecting them off the canvas edges.
   * 3. Generating a set of vertices from the current point positions.
   * 4. Creating a triangulated pattern using the Trianglify library, with a specified color palette.
   * 5. Drawing each triangle (polygon) from the triangulation:
   *    - Fills each triangle with its assigned color.
   *    - Strokes the triangle edges with a subtle outline.
   * 6. Requests the next animation frame to continuously animate the background.
   *
   * This method is intended to be called recursively via requestAnimationFrame to produce a smooth, animated, triangulated background effect.
   */
  function draw() {
    ctx.clearRect(0, 0, width, height);
    points.forEach(p => {
      if (!p.fixed) {
        p.x += p.dx!;
        p.y += p.dy!;
        if (p.x < 0) { p.x = 0; p.dx! *= -1; }
        if (p.x > width) { p.x = width; p.dx! *= -1; }
        if (p.y < 0) { p.y = 0; p.dy! *= -1; }
        if (p.y > height) { p.y = height; p.dy! *= -1; }
      }
    });

    const vertices = points.map(p => [p.x, p.y] as [number, number]);


    const pattern = Trianglify({
      width,
      height,
      points: vertices,
      xColors: props.theme ? pal[props.theme] : pal.ocean,
    });

    pattern.polys.forEach(poly => {
      const vertices = poly.vertexIndices.map(idx => pattern.points[idx]);

      ctx.beginPath();
      ctx.moveTo(vertices[0]![0], vertices[0]![1]);
      ctx.lineTo(vertices[1]![0], vertices[1]![1]);
      ctx.lineTo(vertices[2]![0], vertices[2]![1]);
      ctx.closePath();

      ctx.fillStyle = poly.color.hex();
      ctx.fill();

      //ctx.strokeStyle = "#AAAAAA";
      ctx.lineWidth = props.lineWidth;
      ctx.stroke();
    });

    animationFrameId = requestAnimationFrame(draw);
  }

  draw();

  const resizeHandler = () => {
    width = ctxCanvas.clientWidth;
    height = ctxCanvas.clientHeight;
    ctxCanvas.width = width;
    ctxCanvas.height = height;
  };
  window.addEventListener('resize', resizeHandler);

  onBeforeUnmount(() => {
    cancelAnimationFrame(animationFrameId);
    window.removeEventListener('resize', resizeHandler);
  });
});
</script>
<style scoped lang="scss">
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
  box-shadow: inset 5px 0 8px -5px #000, inset -5px 0 8px -5px #000;
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
