precision highp float;

uniform sampler2D data;

vec2 get_pt(vec2 pos) {
  vec4 pt = texture2D(data, pos);
  float pt0 = ceil(pt[0] * 255.0);
  float pt1 = ceil(pt[1] * 255.0);
  float pt2 = ceil(pt[2] * 255.0);
  float pt3 = ceil(pt[3] * 255.0);

  float pt_x = pt0 + pt1 * 256.0;
  float pt_y = pt2 + pt3 * 256.0;
  return vec2(pt_x, pt_y);
}

vec4 set_pt(vec2 pos) {
  float pt0 = mod(pos[0], 256.0);
  float pt1 = floor(pos[0] / 256.0);
  float pt2 = mod(pos[1], 256.0);
  float pt3 = floor(pos[1] / 256.0);
  return clamp(vec4(pt0, pt1, pt2, pt3) / 255.0, 0.0, 1.0);
}

void main() {
  vec2 pt1 = get_pt(gl_FragCoord.xy / 64.0);
  vec2 res = pt1;

  for (int i=0; i<64; i++) {
    for (int j=0; j<64; j++) {
      vec2 pt2 = get_pt(vec2(i, j) / 64.0);
      vec2 delta1 = pt2 - pt1;
      float dist = distance(pt1, pt2);
      if (dist > 0.00) {
        float force = log(dist / (256.0 * 256.0 * 0.5)) * 0.1;
        res += delta1 / dist * force;
      }
    }
  }
  
  gl_FragColor = set_pt(res);
}
