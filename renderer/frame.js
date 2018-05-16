const sizes = {
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  Matrix2: 4,
  Matrix3: 9,
  Matrix4: 16,
};

class Program {
  constructor(
    gl,
    { vertex, fragment, attributes, uniforms, textures, mode, constants },
  ) {
    this.vertex = vertex;
    this.fragment = fragment;
    this.attributes = attributes;
    this.uniforms = uniforms;
    this.textures = textures;
    this.mode = mode;
    this.gl = gl;
    this.constants = constants;
    this.locations = {};
  }

  getUniformSize(variable) {
    if (!(variable in this.uniforms)) {
      console.log('Uniform %s not found!', variable);
    }
    return sizes[this.uniforms[variable].slice(0, -1)];
  }

  getAttributeSize(variable) {
    return sizes[this.attributes[variable].slice(0, -1)];
  }

  replaceConstants(source) {
    for (const c in this.constants) {
      source = source.replace(c, this.constants[c]);
    }
    return source;
  }

  compile() {
    const gl = this.gl;

    const vshader = gl.createShader(gl.VERTEX_SHADER);
    const fshader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vshader, this.replaceConstants(this.vertex));
    gl.compileShader(vshader);

    if (!gl.getShaderParameter(vshader, gl.COMPILE_STATUS)) {
      console.log(gl.getShaderInfoLog(vshader));
      return;
    }

    gl.shaderSource(fshader, this.replaceConstants(this.fragment));
    gl.compileShader(fshader);

    if (!gl.getShaderParameter(fshader, gl.COMPILE_STATUS)) {
      console.log(gl.getShaderInfoLog(fshader));
      return;
    }

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vshader);
    gl.attachShader(shaderProgram, fshader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      console.log('Could not initialise shaders');
    }

    this.ref = shaderProgram;
  }

  getAttributeLocation(variable) {
    if (variable in this.locations) {
      return this.locations[variable];
    }
    const location = this.gl.getAttribLocation(this.ref, variable);
    if (location === -1) {
      console.log(`Attribute ${variable} is not used`);
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
      console.log(`Uniform ${variable} is not used`);
    }
    this.locations[variable] = location;
    return location;
  }

  finalize() {
    this.gl.deleteProgram(this.ref);
  }
}

class Buffer {
  constructor(gl, { type, data, item_size, is_index, normalized }) {
    this.gl = gl;
    this.type = type;
    this.data = data;
    this.itemSize = item_size;
    this.isIndex = Boolean(is_index);
    this.normalized = Boolean(normalized);
    this.location = null;
    this.ref = null;
  }

  getTarget() {
    if (this.isIndex) {
      return this.gl.ELEMENT_ARRAY_BUFFER;
    } else {
      return this.gl.ARRAY_BUFFER;
    }
  }

  getData() {
    if (this.data.name === this.type) {
      return this.data;
    }
    return new window[this.type](this.data);
  }

  send() {
    const gl = this.gl;
    this.ref = gl.createBuffer();
    gl.bindBuffer(this.getTarget(), this.ref);
    gl.bufferData(this.getTarget(), this.getData(), this.gl.STATIC_DRAW);
    gl.bindBuffer(this.getTarget(), null);
  }

  isSent() {
    return this.ref !== null;
  }

  getFormat() {
    if (this.type === 'Uint8Array') {
      return this.gl.UNSIGNED_BYTE;
    } else if (this.type == 'Uint16Array') {
      return this.gl.UNSIGNED_SHORT;
    } else {
      return this.gl.FLOAT;
    }
  }

  setAttribute(location) {
    const gl = this.gl;
    if (location === -1) return;
    this.location = location;
    gl.enableVertexAttribArray(this.location);
    gl.bindBuffer(this.getTarget(), this.ref);
    gl.vertexAttribPointer(
      this.location,
      this.itemSize,
      this.getFormat(),
      this.normalized,
      0,
      0,
    );
    gl.bindBuffer(this.getTarget(), null);
  }

  finalize() {
    this.gl.deleteBuffer(this.ref);
  }
}

class Texture {
  constructor(gl, { image, width, height, filter }) {
    this.gl = gl;
    this.image = image;
    this.width = width;
    this.height = height;
    this.filter = filter;
  }

  send() {
    const gl = this.gl;
    this.ref = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.ref);
    if (this.image) {
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        this.image,
      );
    } else {
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        this.width,
        this.height,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        null,
      );
    }
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl[this.filter]);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl[this.filter]);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  finalize() {
    this.gl.deleteTexture(this.ref);
  }
}

class Context {
  constructor(gl) {
    this.gl = gl;
    this.program = null;
    this.attributes = {};
    this.textures = {};
  }

  useProgram(program) {
    if (this.program === program) return;
    this.gl.useProgram(program.ref);
    this.program = program;
  }

  setUniform(variable, value) {
    const location = this.program.getUniformLocation(variable);
    const type = this.program.uniforms[variable];
    if (type[0] === 'M') {
      this.gl[`uniform${type}v`](location, false, value);
    } else {
      this.gl[`uniform${type}v`](location, value);
    }
  }

  keepAttributes(variables) {
    for (const variable in this.attributes) {
      if (variable in variables) continue;
      this.gl.disableVertexAttribArray(location);
      delete this.attributes[variable];
    }
  }

  setAttribute(variable, buffer) {
    const location = this.program.getAttributeLocation(variable);
    if (this.attributes[location] === buffer) return;
    buffer.setAttribute(location);
    this.attributes[location] = buffer;
  }

  setTexture(variable, texture) {
    const gl = this.gl;

    const bindTo = this.program.textures[variable];
    if (this.textures[bindTo] === texture) return;

    this.textures[bindTo] = texture;
    gl.activeTexture(gl.TEXTURE0 + bindTo);
    if (texture === null) {
      gl.bindTexture(gl.TEXTURE_2D, null);
    } else {
      gl.bindTexture(gl.TEXTURE_2D, texture.ref);
      const location = this.program.getUniformLocation(variable);
      gl.uniform1i(location, bindTo);
    }
  }

  // https://stackoverflow.com/questions/23598471/
  finalize() {
    const gl = this.gl;

    gl.useProgram(null);

    this.keepAttributes({});

    for (const bindTo in this.textures) {
      gl.activeTexture(gl.TEXTURE0 + Number(bindTo));
      gl.bindTexture(gl.TEXTURE_2D, null);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
}
