#extension GL_EXT_draw_buffers : require 

precision highp float;

uniform sampler2D positions;
uniform sampler2D edges;

uniform int eCnt;
uniform int vCnt;
uniform int cCnt;
const int cSize = 100;

int high(vec4 pixel) {
  return int((pixel.r * 256.0 + pixel.g) * 256.0);
}

int low(vec4 pixel) {
  return int((pixel.b * 256.0 + pixel.a) * 256.0);
}

float fl(vec4 pixel) {
  return pixel.r * 256.0 * 256.0 + pixel.g * 256.0 + pixel.b + pixel.a / 256.0;
}

vec4 from_fl(float f) {
  return vec4(fract(f * 256.0 * 256.0 * 256.0), fract(f * 256.0 * 256.0), fract(f * 256.0), fract(f));
}

void main() {
  float row = gl_FragCoord.y / float(cCnt);
  float cy = 1.0 / (1.0 + float(cSize));
  float source = float(high(texture2D(edges, vec2(0.0, row))));
  float x = fl(texture2D(positions, vec2(0.0, source / float(vCnt))));
  float y = fl(texture2D(positions, vec2(1.0, source / float(vCnt))));
  float x_sum = 0.0;
  float y_sum = 0.0;
  for (int i=0; i < cSize; i++) {
    vec4 edge_pixel = texture2D(edges, vec2(float(i) * cy, row));
    float weight = float(high(edge_pixel)) / 256.0 / 256.0;
    if (weight == 0.0) break;
    float target = float(high(edge_pixel));
    float dx = fl(texture2D(positions, vec2(0.0, target / float(vCnt)))) - x;
    float dy = fl(texture2D(positions, vec2(1.0, target / float(vCnt)))) - y;
    float sq_dist = dx * dx + dy * dy;
    float mul = weight / (sq_dist + 1.0);
    x_sum += mul * dx;
    y_sum += mul * dy;
  }
  gl_FragData[0] = from_fl(x_sum);
  gl_FragData[1] = from_fl(y_sum);
}
