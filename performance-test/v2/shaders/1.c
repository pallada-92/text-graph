precision highp float;

uniform sampler2D positions;
uniform sampler2D edges;

int high(vec4 pixel) {
  return int((pixel.r * 256.0 + pixel.g) * 256.0);
}

int low(vec4 pixel) {
  return int((pixel.b * 256.0 + pixel.a) * 256.0);
}

void main() {
  
  float sum = 0.0;
  for (int i=0; i<0; i++) {
    sum += texture2D(input1, vec2(float(i) / 100000.0, float(i) / 200000.0))[0];
  }
  for (int i=0; i<100000; i++) {
    sum += float(i) * gl_FragCoord[0];
  }
  gl_FragColor = vec4(sum, 0.5, 0.75, 1.0);
}
