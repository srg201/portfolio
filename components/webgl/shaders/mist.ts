/**
 * Шейдер тумана: fbm-шум с двойным domain warping.
 * Цвета приходят из CSS-токенов темы (uBg, uBrand, uCool), курсор подсвечивает
 * туман рядом с собой, скролл медленно сдвигает поле.
 * OCTAVES подставляется при сборке: на мобиле меньше октав, туман проще.
 */

export const mistVertex = /* glsl */ `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

export const mistFragment = (octaves: number) => /* glsl */ `
precision highp float;

#define OCTAVES ${octaves}

uniform float uTime;
uniform float uAspect;
uniform float uScroll;
uniform float uIntensity;
uniform vec2 uMouse;
uniform float uMouseActive;
uniform vec3 uBg;
uniform vec3 uBrand;
uniform vec3 uCool;

varying vec2 vUv;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  mat2 rotate = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < OCTAVES; i++) {
    value += amplitude * noise(p);
    p = rotate * p * 2.02;
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  vec2 screen = (vUv - 0.5) * vec2(uAspect, 1.0);
  vec2 p = screen * 1.35 + vec2(0.0, uScroll * 0.6);
  float t = uTime * 0.03;

  // Двойной domain warping: туман «течёт» и закручивается
  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - t));
  vec2 r = vec2(
    fbm(p + 3.5 * q + vec2(1.7, 9.2) + t * 1.4),
    fbm(p + 3.5 * q + vec2(8.3, 2.8) - t)
  );
  float field = fbm(p + 3.0 * r);
  // Широкий smoothstep: мягкие клубы без резких прожилок
  float mist = smoothstep(0.2, 1.05, field);

  // Курсор: мягкое пятно, в котором туман светлее и теплее
  vec2 mouse = (uMouse - 0.5) * vec2(uAspect, 1.0);
  float glow = exp(-dot(screen - mouse, screen - mouse) * 5.0) * uMouseActive;

  // Фирменное свечение в верхнем углу, как в статичной версии
  float corner = exp(-length(vUv - vec2(0.95, 1.05)) * 2.2);

  vec3 color = uBg;
  color = mix(color, uCool, mist * 0.28 * uIntensity);
  color = mix(color, uBrand, clamp((mist * mist * 0.38 + corner * 0.32 + glow * (0.12 + mist * 0.4)) * uIntensity, 0.0, 1.0));

  // Дизеринг против полос на плавных градиентах
  color += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) / 255.0;

  gl_FragColor = vec4(color, 1.0);
}
`;
