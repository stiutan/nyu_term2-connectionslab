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
  console.log("poison level: ", value);
  if (!poisonMaterial) {
    return;
  }

  poisonMaterial.uniforms.uPoison.value = value;
  document.body.style.setProperty("--poison-level", value);
}

function animatePoisonOverlay(time = 0) {
  requestAnimationFrame(animatePoisonOverlay);

  if (!poisonMaterial) {
    return;
  }

  poisonMaterial.uniforms.uTime.value = time * 0.001;
  poisonRenderer.render(poisonScene, poisonCamera);
}

function triggerPoisonEnding() {
  const content = document.querySelector(".content");
  const finale = document.querySelector(".finale");
  const finaleText = document.querySelector(".finale-text");

  if (!poisonFinaleTriggered) {
    poisonFinaleTriggered = true;

    setTimeout(() => {
      content.classList.add("inactive");
      finale.classList.add("active");
      updatePoisonLevel(0.6);

      setTimeout(() => {
        typeText(finaleText, "you have been poisoned.", () => {
          setTimeout(() => {
            finaleText.textContent += "\n\n";
            typeText(finaleText, "i hope the reads were worth it.");
          }, 1200);
        });
      }, 1200);
    }, 1800);
  }
}

function typeText(element, text, onComplete) {
  let index = 0;

  function typeNextLetter() {
    if (index >= text.length) {
      if (onComplete) {
        onComplete();
      }

      return;
    }

    element.textContent += text[index];

    index++;

    setTimeout(typeNextLetter, 100);
  }

  typeNextLetter();
}
