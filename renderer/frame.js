class Program {
  constructor(gl, {vertex, fragment}) {
    this.vertex = vertex;
    this.fragment = fragment;
    this.gl = gl;
    this.locations = {};
  }

  compile() {
    const gl = this.gl;
    
    const vshader = gl.createShader(gl.VERTEX_SHADER);
    const fshader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vshader, this.vertex);
    gl.compileShader(vshader);

    if (!gl.getShaderParameter(vshader, gl.COMPILE_STATUS)) {
      console.log(gl.getShaderInfoLog(vshader));
      return;
    }

    gl.shaderSource(fshader, this.fragment);
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

  getAttribLocation(variable) {
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
}

class Buffer {
  constructor(gl, {type, data, itemSize, isElementArray, normalized}) {
    this.gl = gl;
    this.type = type;
    this.data = data;
    this.itemSize = itemSize;
    this.isElementArray = Boolean(isElementArray);
    this.normalized = Boolean(normalized);
    this.location = null;
    this.ref = null;
  }

  getTarget() {
    if (this.isElementArray) {
      return this.gl.ELEMENT_ARRAY_BUFFER;
    } else {
      return this.gl.ARRAY_BUFFER;
    }
  }

  getData() {
    if (this.data.name === this.type) {
      return this.data;
    } else {
      return new window[this.type](this.data);
    }
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

  unsetAttribute() {
    if (this.location === null)  return;
    this.gl.disableVertexAttribArray(this.location);
    this.location = null;
  }
}

class Texture {
  constructor(gl, { image, filter, bindTo }) {
    this.gl = gl;
    this.image = image;
    this.filter = filter;
    this.bindTo = bindTo;
  }

  send() {
    const gl = this.gl;
    this.ref = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.ref);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      this.image,
    );
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MIN_FILTER,
      gl[this.filter],
    );
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MAG_FILTER,
      gl[this.filter],
    );
    gl.bindTexture(gl.TEXTURE_2D, null);
  }
}

class Context {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = 0;
    this.height = 0;
    this.textures = {};
  }

  initialize() {
    this.gl = this.canvas.getContext('webgl', {
      antialias: false,
    });
    const gl = this.gl;
    
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
  }

  clear(width, height) {
    const gl = this.gl;

    if (this.width !== width || this.height !== height) {
      this.width = width;
      this.height = height;
      this.canvas.width = this.width;
      this.canvas.height = this.height;
      gl.viewport(0, 0, this.width, this.height);
    }

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }

  setTexture(texture) {
    const gl = this.gl;

    const bindTo = texture.bindTo;
    if (this.textures[bindTo] === texture) return;

    this.textures[bindTo] = texture;
    gl.activeTexture(gl.TEXTURE0 + bindTo);
    gl.bindTexture(gl.TEXTURE_2D, texture.ref);
  }

  unsetTexture(texture) {
    const gl = this.gl;
    const bindTo = texture.bindTo;
    this.textures[bindTo] = null;
    gl.activeTexture(gl.TEXTURE0 + bindTo);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  draw({program, uniforms, attributes, textures, draw}) {
    const gl = this.gl;

    gl.useProgram(program.ref);

    for (const variable in uniforms) {
      const { value, type } = uniforms[variable];
      const location = program.getUniformLocation(variable);
      gl[`uniform${type}v`](location, value);
    }

    for (const variable in attributes) {
      const buffer = attributes[variable];
      buffer.setAttribute(program.getAttribLocation(variable));
    }

    for (const variable in textures) {
      const texture = textures[variable];
      this.setTexture(texture);

      const location = program.getUniformLocation(variable);
      gl.uniform1i(location, texture.bindTo);
    }

    gl.drawArrays(this.gl[draw.type], draw.first, draw.count);

    for (const variable in attributes) {
      const buffer = attributes[variable];
      buffer.unsetAttribute(program.getAttribLocation(variable));
    }
  }

}

