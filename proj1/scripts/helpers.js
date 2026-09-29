async function loadShader(path) {
  const response = await fetch(path);
  return response.text();
}

function setUpFullSizedRenderer(renderer, id) {
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  renderer.domElement.id = id;
  document.body.appendChild(renderer.domElement);
}
