// https://stackoverflow.com/questions/27316605/is-vertex-attrubute-pointer-persistent-in-opengl-es
// https://stackoverflow.com/questions/27148273/what-is-the-logic-of-binding-buffers-in-webgl/27164577#27164577

function drawMain(data) {
  shaderProgram.pMatrixUniform = gl.getUniformLocation(
    shaderProgram,
    'uPMatrix',
  );
  shaderProgram.mvMatrixUniform = gl.getUniformLocation(
    shaderProgram,
    'uMVMatrix',
  );
  const mvMatrix = mat4.create();
  const pMatrix = mat4.create();
  mat4.perspective(
    45,
    gl.viewportWidth / gl.viewportHeight,
    0.1,
    10.0,
    pMatrix,
  );
  mat4.identity(mvMatrix);
  mat4.translate(mvMatrix, [0, 0.0, -5.0]);
  gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
  gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);

  const vertices2 = [
    -0.9,
    -0.9,
    +0.9,
    +0.9,
    +0.9,
    -0.9,
    -0.9,
    +0.9,
    -0.9,
    +0.9,
    -0.9,
    +0.9,
  ];
  const squareVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices2), gl.STATIC_DRAW);
  squareVertexPositionBuffer.itemSize = 3;
  squareVertexPositionBuffer.numItems = 4;

  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(
    shaderProgram,
    'aVertexPosition',
  );
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
  gl.vertexAttribPointer(
    shaderProgram.vertexPositionAttribute,
    squareVertexPositionBuffer.itemSize,
    gl.FLOAT,
    false,
    0,
    0,
  );

  gl.lineWidth(10);
  gl.drawArrays(gl.POINTS, 0, squareVertexPositionBuffer.numItems);

  const outputBuffer = new Uint8Array(1920 * 1080 * 4);

  gl.readPixels(0, 0, 1920, 1080, gl.RGBA, gl.UNSIGNED_BYTE, outputBuffer);

  console.log(canvas.toDataURL());
}

class Draw {
  constructor(canvas, data) {
    this.canvas = canvas;
    this.data = data;
  }

  getVertexShaderSource({ file }) {
    return this.data[file + '.c'];
  }

  getFragmentShaderSource({ file }) {
    return this.data[file + '.c'];
  }

  compileShadersForLayer({ vertex, fragment }) {
    const gl = this.gl;

    const vshader = gl.createShader(gl.VERTEX_SHADER);
    const fshader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vshader, this.getVertexShaderSource(vertex));
    gl.compileShader(vshader);

    if (!gl.getShaderParameter(vshader, gl.COMPILE_STATUS)) {
      console.log(gl.getShaderInfoLog(vshader));
      return;
    }

    gl.shaderSource(fshader, this.getFragmentShaderSource(fragment));
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

    return shaderProgram;
  }

  makeBuffer(obj) {
    const gl = this.gl;

    switch (obj.type) {
      case 'Float32Array':
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array(obj.data),
          gl.STATIC_DRAW,
        );
        return buffer;

      case 'Image':
        const image = this.data[obj.fname];
        const texture = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          image,
        );

        gl.texParameteri(
          gl.TEXTURE_2D,
          gl.TEXTURE_MIN_FILTER,
          obj.filter === 'NEAREST' ? gl.NEAREST : gl.LINEAR,
        );
        gl.texParameteri(
          gl.TEXTURE_2D,
          gl.TEXTURE_MAG_FILTER,
          obj.filter === 'NEAREST' ? gl.NEAREST : gl.LINEAR,
        );
        return texture;
    }
  }

  prepareScene(scene) {
    this.scene = scene;

    this.gl = this.canvas.getContext('webgl', {
      antialias: false,
    });
    const gl = this.gl;

    this.canvas.width = this.scene.width;
    this.canvas.height = this.scene.height;

    this.scene.layers.forEach(layer => {
      layer.compiled = this.compileShadersForLayer(layer);

      for (const bufferName in layer.buffers) {
        const buffer = layer.buffers[bufferName];
        buffer.reference = this.makeBuffer(buffer);
        buffer.location = gl.getAttribLocation(layer.compiled, bufferName);

        if (buffer.location === -1) {
          console.log('Attribute %s is not linked', bufferName);
        }
      }
    });

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.viewport(0, 0, this.scene.width, this.scene.height);
  }

  setAttribute(buffer) {
    const gl = this.gl;

    gl.enableVertexAttribArray(buffer.location);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer.reference);

    gl.vertexAttribPointer(
      buffer.location,
      buffer.type === 1,
      gl.FLOAT,
      false,
      0,
      0,
    );
  }

  unsetAttribute(buffer) {
    const gl = this.gl;
    gl.disableVertexAttribArray(buffer.location);
  }

  drawLayer({ type, compiled, buffers }) {
    const gl = this.gl;
    gl.useProgram(compiled);

    for (const buffer in buffers) {
      this.setAttribute(buffers[buffer]);
    }

    switch (type) {
      case 'POINTS':
        gl.drawArrays(gl.POINTS, 0);
    }

    for (const buffer in buffers) {
      this.unsetAttribute(buffers[buffer]);
    }
  }

  drawFrame(t, seed) {
    const gl = this.gl;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    this.scene.layers.forEach(layer => {
      this.drawLayer(layer);
    });
  }
}
