// https://stackoverflow.com/questions/9046643/webgl-create-texture
// https://webgl2fundamentals.org/webgl/lessons/webgl-data-textures.html

class Webgl {
  constructor() {
    this.canvas = document.getElementById('calc');
    this.gl = this.canvas.getContext('webgl');
    const gl = this.gl;
    this.draw_buffers = gl.getExtension('WEBGL_draw_buffers');
    // this.texture_float = gl.getExtension('OES_texture_float');

    this.fullTriangle = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.fullTriangle);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, -1, 3, 3, -1]),
      gl.STATIC_DRAW,
    );
  }

  compile(fragmentSource, uniforms) {
    const gl = this.gl;
    const vshader = gl.createShader(gl.VERTEX_SHADER);
    const fshader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(
      vshader,
      `
        attribute vec2 pos;
        void main(void) {
           gl_Position = vec4(pos, 0.0, 1.0);
        }`,
    );
    gl.compileShader(vshader);

    gl.shaderSource(fshader, fragmentSource);
    gl.compileShader(fshader);

    if (!gl.getShaderParameter(fshader, gl.COMPILE_STATUS)) {
      console.log(gl.getShaderInfoLog(fshader));
      return;
    }

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vshader);
    gl.attachShader(shaderProgram, fshader);
    gl.linkProgram(shaderProgram);

    shaderProgram.pos = gl.getAttribLocation(shaderProgram, 'pos');
    console.log('pos location = %d', shaderProgram.pos);
    gl.enableVertexAttribArray(shaderProgram.pos);

    uniforms.forEach(uniform => {
      shaderProgram[uniform] = gl.getUniformLocation(shaderProgram, uniform);
    });

    gl.bindBuffer(gl.ARRAY_BUFFER, this.fullTriangle);
    gl.vertexAttribPointer(shaderProgram.pos, 2, gl.FLOAT, false, 0, 0);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      console.log('Could not initialise shaders');
    }
    return shaderProgram;
  }

  newRGBATexture(width, height, textureId) {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0 + textureId);
    const texture = gl.createTexture();
    texture.width = width;
    texture.height = height;
    texture.type = 'RGBA';
    texture.textureId = textureId;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return texture;
  }

  bindTexture(texture) {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0 + texture.textureId);
    gl.bindTexture(gl.TEXTURE_2D, texture);
  }

  sendTexture(texture, data) {
    const gl = this.gl;
    this.bindTexture(texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl[texture.type],
      texture.width,
      texture.height,
      0,
      gl[texture.type],
      gl.UNSIGNED_BYTE,
      data,
    );
  }

  newFramebuffer(textures) {
    const gl = this.gl;
    const framebuffer = gl.createFramebuffer();
    framebuffer.width = textures[0].width;
    framebuffer.height = textures[0].height;
    framebuffer.textures = textures;
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    textures.forEach((texture, i) => {
      this.bindTexture(texture);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0 + i,
        gl.TEXTURE_2D,
        texture,
        0,
      );
    });
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return framebuffer;
  }

  useFramebuffer(framebuffer) {
    const gl = this.gl;
    this.framebuffer = framebuffer;
    this.gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.viewport(0, 0, this.framebuffer.width, this.framebuffer.height);
    if (framebuffer.textures.length > 1) {
      this.draw_buffers.drawBuffersWEBGL(
        framebuffer.textures.map((texture, i) => gl.COLOR_ATTACHMENT0 + i),
      );
    }
  }

  draw() {
    const gl = this.gl;
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 3);
  }

  readPixels(buffer) {
    const gl = this.gl;
    gl.readPixels(
      0,
      0,
      this.framebuffer.width,
      this.framebuffer.height,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      buffer,
    );
  }
}

function webgl(fshaderSource, points) {
  gl.useProgram(shaderProgram);

  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(
    shaderProgram,
    'aVertexPosition',
  );
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  shaderProgram.pMatrixUniform = gl.getUniformLocation(
    shaderProgram,
    'uPMatrix',
  );
  shaderProgram.mvMatrixUniform = gl.getUniformLocation(
    shaderProgram,
    'uMVMatrix',
  );

  squareVertexPositionBuffer.itemSize = 3;
  squareVertexPositionBuffer.numItems = 4;

  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const mvMatrix = mat4.create();
  const pMatrix = mat4.create();

  mat4.perspective(
    45,
    gl.viewportWidth / gl.viewportHeight,
    0.1,
    100.0,
    pMatrix,
  );

  mat4.identity(mvMatrix);

  mat4.translate(mvMatrix, [0.0, 0.0, -2.4]);
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
  gl.vertexAttribPointer(
    shaderProgram.vertexPositionAttribute,
    squareVertexPositionBuffer.itemSize,
    gl.FLOAT,
    false,
    0,
    0,
  );
  gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
  gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);

  const inputW = 64;
  const inputH = 64;
  const data = new Uint8Array(inputW * inputH * 4);
  for (let i = 0; i < points.length; i += 2) {
    const x = Math.floor(points[i] * 256 * 256);
    const y = Math.floor(points[i + 1] * 256 * 256);
    data[i * 2] = x % 256;
    data[i * 2 + 1] = Math.floor(x / 256);
    data[i * 2 + 2] = y % 256;
    data[i * 2 + 3] = Math.floor(y / 256);
  }

  gl.activeTexture(gl.TEXTURE0);
  let dataTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, dataTexture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    inputW,
    inputH,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    data,
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

  const dataUniform = gl.getUniformLocation(shaderProgram, 'data');
  gl.uniform1i(dataUniform, 0);

  const outputW = 64;
  const outputH = 64;

  const outputTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, outputTexture);

  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    outputW,
    outputH,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    null,
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

  const fb = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.bindTexture(gl.TEXTURE_2D, dataTexture);

  gl.uniform1i(dataUniform, 0);

  for (let iter = 0; iter < 10; iter++) {
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      iter % 2 ? dataTexture : outputTexture,
      0,
    );

    gl.bindTexture(gl.TEXTURE_2D, iter % 2 ? outputTexture : dataTexture);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);
  }

  const outputBuffer = new Uint8Array(outputW * outputH * 4);

  gl.readPixels(
    0,
    0,
    outputW,
    outputH,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    outputBuffer,
  );

  if (0) {
    for (let i = 0; i < outputBuffer.length; i++) {
      if (data[i] !== outputBuffer[i]) {
        console.log('!==', i, data[i], outputBuffer[i]);
      }
    }
  }

  const newPoints = new Array(points.length);
  for (let i = 0; i < points.length; i++) {
    newPoints[i] = (outputBuffer[i * 2] / 256 + outputBuffer[i * 2 + 1]) / 256;
  }

  return newPoints;
}
