uniform float uTime;  
    
uniform float uGrainIntensity;
uniform float uDistortionStrength;

uniform vec3 uBaseColor;

uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec3 uColor4;
uniform vec3 uColor5;
uniform vec3 uColor6;

uniform float uColor1Weight;
uniform float uColor2Weight;
uniform float uColor3Weight;
uniform float uColor4Weight;
uniform float uColor5Weight;
uniform float uColor6Weight;

uniform sampler2D uTouchTexture;

varying vec2 vUv;

float grain(vec2 uv, float time) {
  float noise = fract(
    sin(
      dot(
        uv + time,
        vec2(12.9898, 78.233)
      )
    ) * 43758.5453
  );

  return noise * 2.0 - 1.0;
}

float blobInfluence(
  vec2 uv,
  vec2 center,
  float spread
) {
  float d = distance(uv, center);

  return exp(
    -(d * d) /
    (2.0 * spread * spread)
  );
}

vec2 distortUv(vec2 uv, float time) {
  float waveX =
    sin(uv.y * 4.0 + time * 0.6) +
    0.5 * cos((uv.x + uv.y) * 3.0 + time * 0.4);

  float waveY =
    cos(uv.x * 4.5 - time * 0.5) +
    0.5 * sin((uv.x - uv.y) * 3.5 + time * 0.45);

  vec2 offset = vec2(waveX, waveY);

  return uv + offset * uDistortionStrength;
}
  
void main() {
  vec2 distortedUv = distortUv(vUv, uTime);

  vec4 touch = texture2D(uTouchTexture, vUv);

  float touchX = touch.r * 2.0 - 1.0;
  float touchY = touch.g * 2.0 - 1.0;
  float touchStrength = touch.b;

  distortedUv.x +=
    touchX *
    touchStrength *
    0.5;

  distortedUv.y +=
    touchY *
    touchStrength *
    0.5;
    
  vec2 center1 = vec2(
    0.5 + sin(uTime * 0.4) * 0.3,
    0.5 + cos(uTime * 0.5) * 0.3
  );

  vec2 center2 = vec2(
    0.5 + cos(uTime * 0.6) * 0.35,
    0.5 + sin(uTime * 0.45) * 0.35
  );

  vec2 center3 = vec2(
    0.5 + sin(uTime * 0.35) * 0.3,
    0.5 + cos(uTime * 0.55) * 0.3
  );

  vec2 center4 = vec2(
    0.5 + cos(uTime * 0.5) * 0.3,
    0.5 + sin(uTime * 0.4) * 0.3
  );

  vec2 center5 = vec2(
    0.5 + sin(uTime * 0.7) * 0.25,
    0.5 + cos(uTime * 0.6) * 0.25
  );

  vec2 center6 = vec2(
    0.5 + cos(uTime * 0.45) * 0.35,
    0.5 + sin(uTime * 0.65) * 0.35
  );

  vec2 center7 = vec2(
    0.5 + sin(uTime * 0.55) * 0.32,
    0.5 + cos(uTime * 0.48) * 0.34
  );

  vec2 center8 = vec2(
    0.5 + cos(uTime * 0.65) * 0.30,
    0.5 + sin(uTime * 0.52) * 0.36
  );

  vec2 center9 = vec2(
    0.5 + sin(uTime * 0.42) * 0.34,
    0.5 + cos(uTime * 0.58) * 0.31
  );

  vec2 center10 = vec2(
    0.5 + cos(uTime * 0.48) * 0.30,
    0.5 + sin(uTime * 0.62) * 0.35
  );

  vec2 center11 = vec2(
    0.5 + sin(uTime * 0.68) * 0.27,
    0.5 + cos(uTime * 0.44) * 0.38
  );

  vec2 center12 = vec2(
    0.5 + cos(uTime * 0.38) * 0.33,
    0.5 + sin(uTime * 0.56) * 0.34
  );

  float influence1 = blobInfluence(distortedUv, center1, 0.32);
  float influence2 = blobInfluence(distortedUv, center2, 0.32);
  float influence3 = blobInfluence(distortedUv, center3, 0.32);
  float influence4 = blobInfluence(distortedUv, center4, 0.32);
  float influence5 = blobInfluence(distortedUv, center5, 0.32);
  float influence6 = blobInfluence(distortedUv, center6, 0.32);
  float influence7 = blobInfluence(distortedUv, center7, 0.28);
  float influence8 = blobInfluence(distortedUv, center8, 0.28);
  float influence9 = blobInfluence(distortedUv, center9, 0.28);
  float influence10 = blobInfluence(distortedUv, center10, 0.28);
  float influence11 = blobInfluence(distortedUv, center11, 0.28);
  float influence12 = blobInfluence(distortedUv, center12, 0.28);

  vec2 rotatedUv1 = distortedUv - 0.5;
  float angle1 = uTime * 0.15;

  rotatedUv1 = vec2(
    rotatedUv1.x * cos(angle1) - rotatedUv1.y * sin(angle1),
    rotatedUv1.x * sin(angle1) + rotatedUv1.y * cos(angle1)
  );

  rotatedUv1 += 0.5;
  
  vec2 rotatedUv2 = distortedUv - 0.5;
  float angle2 = -uTime * 0.12;

  rotatedUv2 = vec2(
    rotatedUv2.x * cos(angle2) - rotatedUv2.y * sin(angle2),
    rotatedUv2.x * sin(angle2) + rotatedUv2.y * cos(angle2)
  );

  rotatedUv2 += 0.5;

  float radialDistance1 = distance(rotatedUv1, vec2(0.5));
  float radialDistance2 = distance(rotatedUv2, vec2(0.5));

  float radialInfluence1 =
    1.0 - smoothstep(0.0, 0.8, radialDistance1);

  float radialInfluence2 =
    1.0 - smoothstep(0.0, 0.8, radialDistance2);

  float totalInfluence =
    influence1 * uColor1Weight +
    influence2 * uColor2Weight +
    influence3 * uColor3Weight +
    influence4 * uColor4Weight +
    influence5 * uColor5Weight +
    influence6 * uColor6Weight +
    influence7 * uColor1Weight +
    influence8 * uColor2Weight +
    influence9 * uColor3Weight +
    influence10 * uColor4Weight +
    influence11 * uColor5Weight +
    influence12 * uColor6Weight;

  vec3 color =
    uColor1 * influence1 * uColor1Weight +
    uColor2 * influence2 * uColor2Weight +
    uColor3 * influence3 * uColor3Weight +
    uColor4 * influence4 * uColor4Weight +
    uColor5 * influence5 * uColor5Weight +
    uColor6 * influence6 * uColor6Weight +
    uColor1 * influence7 * uColor1Weight +
    uColor2 * influence8 * uColor2Weight +
    uColor3 * influence9 * uColor3Weight +
    uColor4 * influence10 * uColor4Weight +
    uColor5 * influence11 * uColor5Weight +
    uColor6 * influence12 * uColor6Weight;

  color /= max(totalInfluence, 0.001);

  color += mix(
    uColor1,
    uColor3,
    radialInfluence1
  ) * 0.25;

  color += mix(
    uColor2,
    uColor4,
    radialInfluence2
  ) * 0.2;
    
  float mixAmount = clamp(totalInfluence, 0.0, 1.0);

  vec3 finalColor = mix(
    uBaseColor,
    color,
    mixAmount
  );

  float grainValue = grain(vUv, uTime);

  finalColor += grainValue * uGrainIntensity;

  finalColor = clamp(finalColor, 0.0, 1.0);

  gl_FragColor = vec4(finalColor, 1.0);
}