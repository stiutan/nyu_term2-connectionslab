/**
 * green poison gradient background with moujse interaction using Three.js, WebGL shaders
 * derived from https://codepen.io/cameronknight/pen/ogxWmBP
 */

const bgColors = {
  color1: "#C0C3AC",
  color2: "#5F7E3D",
  color3: "#1C4F19",
  // color4: "#a2ae34",
  color4: "#000000",
  color5: "#000000",
  color6: "#000000",
  baseColor: "#C0C3AC",
};

// mouse movement bg response
class TouchTexture {
  constructor() {
    this.size = 64;
    this.width = this.size;
    this.height = this.size;

    this.canvas = document.createElement("canvas");
    this.canvas.width = this.size;
    this.canvas.height = this.size;

    this.ctx = this.canvas.getContext("2d");

    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.size, this.size);

    this.texture = new THREE.Texture(this.canvas);

    this.maxAge = 64;
    this.radius = 0.25 * this.size;
    this.speed = 1 / this.maxAge;

    this.trail = [];
    this.last = null;
  }

  clear() {
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  update() {
    this.clear();

    for (let i = this.trail.length - 1; i >= 0; i--) {
      const point = this.trail[i];

      point.age++;

      if (point.age > this.maxAge) {
        this.trail.splice(i, 1);
        continue;
      }

      this.drawPoint(point);
    }

    this.texture.needsUpdate = true;
  }

  drawPoint(point) {
    const x = point.x * this.width;
    const y = (1 - point.y) * this.height;

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

    this.last = {
      x: point.x,
      y: point.y,
    };

    this.trail.push({
      x: point.x,
      y: point.y,
      age: 0,
      force,
      vx,
      vy,
    });
  }
}

const touchTexture = new TouchTexture();

window.addEventListener("mousemove", (event) => {
  const point = {
    x: event.clientX / window.innerWidth,
    y: 1 - event.clientY / window.innerHeight,
  };

  touchTexture.addTouch(point);
});

// 1. renderer = draws what three.js renders
const gradientRenderer = new THREE.WebGLRenderer({ antialias: true });
setUpFullSizedRenderer(gradientRenderer, "webgl-gradient-bg");

// 2. scene = contains what three.js render
const gradientScene = new THREE.Scene();

// 3. camera = decides what is viewed
let fieldOfView = 45; // how wide cam lens is
let aspectRatio = window.innerWidth / window.innerHeight;
const gradientCamera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio);

gradientCamera.position.z = 50; // move cam away from plane to see gradient properly

async function initializeGradientBg() {
  const [vertexShader, fragmentShader] = await Promise.all([
    loadShader("../shaders/gradient.vert"),
    loadShader("../shaders/gradient.frag"),
  ]);

  const geometry = getFullSizedPlaneGeometry();
  const material = getGradientShaderMaterial(vertexShader, fragmentShader);

  // 4. mesh = geometry (shape) + material (surface appearance)
  const gradientPlane = new THREE.Mesh(geometry, material);

  gradientScene.add(gradientPlane);

  const clock = new THREE.Clock();

  function animate() {
    material.uniforms.uTime.value = clock.getElapsedTime();

    touchTexture.update();

    gradientRenderer.render(gradientScene, gradientCamera);

    requestAnimationFrame(animate);
  }

  animate();
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

function getGradientShaderMaterial(vertexShader, fragmentShader) {
  const uniforms = {
    uTime: { value: 0 },

    uGrainIntensity: { value: 0.1 },

    uDistortionStrength: { value: 0.06 },

    uBaseColor: { value: new THREE.Color(bgColors.baseColor) },

    uColor1: { value: new THREE.Color(bgColors.color1) },
    uColor2: { value: new THREE.Color(bgColors.color2) },
    uColor3: { value: new THREE.Color(bgColors.color3) },
    uColor4: { value: new THREE.Color(bgColors.color4) },
    uColor5: { value: new THREE.Color(bgColors.color5) },
    uColor6: { value: new THREE.Color(bgColors.color6) },

    uColor1Weight: { value: 0.6 },
    uColor2Weight: { value: 1.0 },
    uColor3Weight: { value: 1.0 },
    uColor4Weight: { value: 0.6 },
    uColor5Weight: { value: 1.0 },
    uColor6Weight: { value: 1.0 },

    uTouchTexture: { value: touchTexture.texture },
  };

  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
  });
}
