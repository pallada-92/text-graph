precision highp float;

// uniform float seed;

varying float value;

highp float rand(vec2 co)
{
    
  highp float a = 12.9898;
  highp float b = 78.233;
  highp float c = 43758.5453;
  highp float dt = dot(co.xy, vec2(a,b));
  highp float sn = mod(dt, 3.14);
  return fract(sin(sn) * c);
}

void main(void) {
  float seed = 1.1;
  if (rand(vec2(seed, gl_FragCoord.y) + gl_FragCoord.xz) < 0.0) discard;
  gl_FragColor = vec4(gl_FragCoord.zz, value, 240.0 / 255.0);
}
