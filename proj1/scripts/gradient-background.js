/**
 * green poison gradient background with moujse interaction using Three.js, WebGL shaders
 * derived from https://codepen.io/cameronknight/pen/ogxWmBP
 */

const bgColors = {
  blackColor: "#000000",
  baseColor: "#C0C3AC",
  color1: "#C0C3AC",
  color2: "#5F7E3D",
  color3: "#1C4F19",
  // color4: "#a2ae34",
};

let gradientRenderer;
let gradientScene;
let gradientCamera;
let gradientMaterial;

async function initializeGradientBg() {
  // 1. renderer = draws what three.js renders
  gradientRenderer = new THREE.WebGLRenderer({ antialias: true });
  setUpFullSizedRenderer(gradientRenderer, "webgl-gradient-bg");

  // 2. scene = contains what three.js render
  gradientScene = new THREE.Scene();

  // 3. camera = decides what is viewed
  let fieldOfView = 45; // how wide cam lens is
  let aspectRatio = window.innerWidth / window.innerHeight;
  gradientCamera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio);
  gradientCamera.position.z = 50; // move cam away from plane to see gradient properly

  const [vertexShader, fragmentShader] = await Promise.all([
    loadShader("./shaders/gradient.vert"),
    loadShader("./shaders/gradient.frag"),
  ]);
  
  // 4. mesh = geometry (shape) + material (surface appearance)
  const geometry = getFullSizedPlaneGeometry();
  gradientMaterial = getGradientShaderMaterial(vertexShader, fragmentShader);
  const mesh = new THREE.Mesh(geometry, gradientMaterial);

  gradientScene.add(mesh);

  const clock = new THREE.Clock();
  animateGradientBackground(clock);
}

initializeGradientBg();

/** helpers **/

function getFullSizedPlaneGeometry() {
  // calculate visible width and height of cam at cam's position/depth
  const fovInRadians = (gradientCamera.fov * Math.PI) / 180;

  const height = 2 * Math.tan(fovInRadians / 2) * gradientCamera.position.z;
  const width = height * gradientCamera.aspect;

  // create a plane that spans the whole view size
  return new THREE.PlaneGeometry(width, height);
}

function animateGradientBackground(clock) {
  // set time value 
  gradientMaterial.uniforms.uTime.value = clock.getElapsedTime();

  touchTexture.update();
  gradientRenderer.render(gradientScene, gradientCamera);

  requestAnimationFrame(() => animateGradientBackground(clock));
}

function getGradientShaderMaterial(vertexShader, fragmentShader) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uGrainIntensity: { value: 0.1 },
      uDistortionStrength: { value: 0.06 },

      uBaseColor: { value: new THREE.Color(bgColors.baseColor) },
      uBlackColor: { value: new THREE.Color(bgColors.blackColor) },
      uColor1: { value: new THREE.Color(bgColors.color1) },
      uColor2: { value: new THREE.Color(bgColors.color2) },
      uColor3: { value: new THREE.Color(bgColors.color3) },

      uTouchTexture: { value: touchTexture.texture },
    },
    vertexShader,
    fragmentShader,
  });
}

/** response to mouse movement logic **/

class TouchTexture {
  constructor() {
    this.size = 64;

    this.canvas = document.createElement("canvas");
    this.canvas.width = this.size;
    this.canvas.height = this.size;

    this.ctx = this.canvas.getContext("2d");
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.size, this.size);

    this.texture = new THREE.Texture(this.canvas);

    this.maxAge = 64;
    this.radius = 0.25 * this.size;

    this.trail = [];
    this.last = null;
  }

  clear() {
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.size, this.size);
  }

  update() {
    this.clear();

    for (let i = this.trail.length - 1; i >= 0; i--) {
      const point = this.trail[i];

      if (++point.age > this.maxAge) {
        this.trail.splice(i, 1);
        continue;
      }

      this.drawPoint(point);
    }

    this.texture.needsUpdate = true;
  }

  drawPoint(point) {
    const x = point.x * this.size;
    const y = (1 - point.y) * this.size;

    const life = 1 - point.age / this.maxAge;
    const intensity = life * point.force;

    const r = ((point.vx + 1) / 2) * 255;
    const g = ((point.vy + 1) / 2) * 255;
    const b = intensity * 255;

    const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, this.radius);
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${intensity})`);
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(x, y, this.radius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  addTouch(point) {
    let force = 0;
    let vx = 0;
    let vy = 0;

    if (this.last) {
      const dx = point.x - this.last.x;
      const dy = point.y - this.last.y;

      if (dx === 0 && dy === 0) return;

      const distanceSquared = dx * dx + dy * dy;
      const distance = Math.sqrt(distanceSquared);

      vx = dx / distance;
      vy = dy / distance;

      force = Math.min(distanceSquared * 30000, 3.0);
    }

    this.last = point;
    this.trail.push({
      ...point,
      age: 0,
      force,
      vx,
      vy,
    });
  }
}

const touchTexture = new TouchTexture();

window.addEventListener("mousemove", (event) => {
  touchTexture.addTouch({
    x: event.clientX / window.innerWidth,
    y: 1 - event.clientY / window.innerHeight,
  });
});