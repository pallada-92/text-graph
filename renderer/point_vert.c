attribute vec3 aVertexPosition;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

varying float value;

void main(void) {
  // gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
  gl_Position = vec4(aVertexPosition, 1.0);
  gl_PointSize = 256.0;
  value = 1.0;
}

// 32 * 32 * 256 = 262144
