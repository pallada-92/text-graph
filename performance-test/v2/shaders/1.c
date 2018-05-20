precision highp float;

// uniform sampler2D input1;
// uniform sampler2D input2;

void main() {
  float sum = 0.0;
  /*
  for (int i=0; i<0; i++) {
    sum += texture2D(input1, vec2(float(i) / 100000.0, float(i) / 200000.0))[0];
  }
  */
  for (int i=0; i<100000; i++) {
    sum += float(i) * gl_FragCoord[0];
  }
  gl_FragColor = vec4(sum, 0.5, 0.75, 1.0);
}
