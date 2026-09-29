uniform float uPoison;
uniform float uTime;

varying vec2 vUv;

// random noise function 
float random(vec2 st) {
  return fract(
    sin(
      dot(st, vec2(12.9898, 78.233))
    ) * 43758.5453
  );
}

void main() {
  if (uPoison <= 0.001) {
    discard;
  }

  float noise = random(vUv * 500.0 + floor(uTime * 30.0));
  
  float scanline = sin(vUv.y * 400.0);
  scanline = scanline * 0.5 + 0.5;

  // create tv glitch bands
  float eightPerSecond = floor(uTime * 8.0); // change random results 8x/second
  float twentyHorizontalBands = floor(vUv.y * 20.0); // splits screen into 20 horizontal bands
  float band = step(0.96, random(vec2(eightPerSecond, twentyHorizontalBands)));
  float bandOffset = (random(vec2(eightPerSecond + 10.0, twentyHorizontalBands)) - 0.5)
    * 0.08
    * band;

  float glitchStrength = abs(bandOffset) * 8.0;

  float opacity = noise * 0.35 + scanline * 0.12 + glitchStrength * 1.5;
  opacity *= uPoison;
  opacity = clamp(opacity, 0.0, 0.95);

  gl_FragColor = vec4(
    vec3(1.0),
    opacity
  );
}

