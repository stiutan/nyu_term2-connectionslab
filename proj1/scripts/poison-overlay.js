/**
 * screen corruption to mimic digital poisoning
 * derived from https://webgl-shaders.com/badtv-example.html
 */

let poisonRenderer;
let poisonScene;
let poisonCamera;
let poisonMaterial;
let poisonFinaleTriggered = false;

async function initializePoisonOverlay() {
  // 1. set renderer & add to dom
  poisonRenderer = new THREE.WebGLRenderer({ alpha: true });
  setUpFullSizedRenderer(poisonRenderer, "webgl-poison-overlay");

  // 2. set scene
  poisonScene = new THREE.Scene();

  // 3. set camera - simpler cam with no depth/perspective
  poisonCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 10);
  poisonCamera.position.z = 1;

  // 4. set mesh
  const geometry = new THREE.PlaneGeometry(2, 2);
  const [vertexShader, fragmentShader] = await Promise.all([
    loadShader("./shaders/poison.vert"),
    loadShader("./shaders/poison.frag"),
  ]);

  poisonMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uPoison: { value: 0.0 },
      uTime: { value: 0.0 },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
  });

  const mesh = new THREE.Mesh(geometry, poisonMaterial);

  poisonScene.add(mesh);

  animatePoisonOverlay();
}

initializePoisonOverlay();

/** external funcs */

function updatePoisonLevel(value) {
  if (poisonMaterial) {
    poisonMaterial.uniforms.uPoison.value = value;
    document.body.style.setProperty("--poison-level", value);
  }
}

function animatePoisonOverlay(time = 0) {
  if (poisonMaterial) {
    poisonMaterial.uniforms.uTime.value = time * 0.001;
    poisonRenderer.render(poisonScene, poisonCamera);
  }

  requestAnimationFrame(animatePoisonOverlay);
}

async function triggerPoisonEnding() {
  const content = document.querySelector(".content");
  const finale = document.querySelector(".finale");

  if (!poisonFinaleTriggered) {
    poisonFinaleTriggered = true;

    await wait(1800);
    // hide content and unhide finale
    content.classList.add("inactive");
    finale.classList.add("active");
    // lessen poison visuals -- too hard to read text at max visuals
    updatePoisonLevel(0.6);

    await wait(1200);
    await typeFinaleText("you have been poisoned.");

    await wait(1200);
    await typeFinaleText("\n\ni hope the reads were worth it.");
  }
}


async function typeFinaleText(text) {
  const finaleText = document.querySelector(".finale-text");

  for (let letter of text) {
    await wait(100);
    finaleText.textContent += letter;
  }
}
