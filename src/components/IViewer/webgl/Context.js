export default class Context {
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
    Object.keys(this.attributes).forEach(variable => {
      if (variable in variables) return;
      const location = this.program.getUniformLocation(variable);
      this.gl.disableVertexAttribArray(location);
      delete this.attributes[variable];
    });
  }

  setAttribute(variable, buffer) {
    const location = this.program.getAttributeLocation(variable);
    if (this.attributes[location] === buffer) return;
    buffer.setAttribute(location);
    this.attributes[location] = buffer;
  }

  setTexture(variable, texture) {
    const { gl } = this;

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
    const { gl } = this;

    gl.useProgram(null);

    this.keepAttributes({});

    Object.values(this.textures).forEach(bindTo => {
      gl.activeTexture(gl.TEXTURE0 + bindTo);
      gl.bindTexture(gl.TEXTURE_2D, null);
    });

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
}
