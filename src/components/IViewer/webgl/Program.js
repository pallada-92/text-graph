import { warn } from '../../../console';

const sizes = {
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  Matrix2: 4,
  Matrix3: 9,
  Matrix4: 16,
};

export default class Program {
  constructor(
    gl,
    { vertex, fragment, attributes, uniforms, textures, mode, constants }
  ) {
    this.gl = gl;
    this.vertex = vertex;
    this.fragment = fragment;
    this.attributes = attributes;
    this.uniforms = uniforms;
    this.textures = textures;
    this.mode = mode;
    this.constants = constants;
    this.locations = {};
  }

  getUniformSize(variable) {
    if (!(variable in this.uniforms)) {
      warn('Uniform %s not found!', variable);
    }
    return sizes[this.uniforms[variable].slice(0, -1)];
  }

  getAttributeSize(variable) {
    if (!(variable in this.attributes)) {
      warn('Attribute %s not found!', variable);
    }
    return sizes[this.attributes[variable].slice(0, -1)];
  }

  replaceConstants(source) {
    let res = source;
    Object.keys(this.constants).forEach(c => {
      res = res.replace(c, this.constants[c]);
    });
    return res;
  }

  compile() {
    const { gl } = this;

    const vshader = gl.createShader(gl.VERTEX_SHADER);
    const fshader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vshader, this.replaceConstants(this.vertex));
    gl.compileShader(vshader);

    if (!gl.getShaderParameter(vshader, gl.COMPILE_STATUS)) {
      warn(gl.getShaderInfoLog(vshader));
      return;
    }

    gl.shaderSource(fshader, this.replaceConstants(this.fragment));
    gl.compileShader(fshader);

    if (!gl.getShaderParameter(fshader, gl.COMPILE_STATUS)) {
      warn(gl.getShaderInfoLog(fshader));
      return;
    }

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vshader);
    gl.attachShader(shaderProgram, fshader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      warn('Could not initialise shaders');
    }

    this.ref = shaderProgram;
  }

  getAttributeLocation(variable) {
    if (variable in this.locations) {
      return this.locations[variable];
    }
    const location = this.gl.getAttribLocation(this.ref, variable);
    if (location === -1) {
      warn(`Attribute ${variable} is not used`);
    }
    this.locations[variable] = location;
    return location;
  }

  getUniformLocation(variable) {
    if (variable in this.locations) {
      return this.locations[variable];
    }
    const location = this.gl.getUniformLocation(this.ref, variable);
    if (location === null) {
      warn(`Uniform ${variable} is not used`);
    }
    this.locations[variable] = location;
    return location;
  }

  finalize() {
    this.gl.deleteProgram(this.ref);
  }
}
