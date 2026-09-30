async function loadShader(path) {
  const response = await fetch(path);
  return response.text();
}

function setUpFullSizedRenderer(renderer, id) {
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));

  renderer.domElement.id = id;
  document.body.appendChild(renderer.domElement);
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}