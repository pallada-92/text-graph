function makeRevFrames(frames) {
  if (typeof frames === 'undefined') return frames;
  const res = {};
  frames.forEach((frame, i) => {
    if (!(frame in res)) {
      res[frame] = [];
    }
    res[frame].push(i);
  });
  return res;
}

function mix(vec1, vec2, t) {
  const res = new Array(vec1.length);
  for (let i = 0; i < vec1.length; i++) {
    res[i] = vec1[i] * (1 - t) + vec2[i] * t;
  }
  return res;
}

function getAtIndex(index, data, size, motionBlur) {
  if (typeof data === 'object') {
    if (data.length === size) {
      return data;
    }
    const val = data.slice(index * size, (index + 1) * size);
    if (!motionBlur || typeof data[0] !== 'number') {
      return val;
    }
    if (Math.random() < 0.5) {
      const val2 = data.slice((index + 1) * size, (index + 2) * size);
      return mix(val, val2, Math.random() * motionBlur);
    } else {
      const val2 = data.slice((index - 1) * size, index * size);
      return mix(val, val2, Math.random() * motionBlur);
    }
  }
  return [data];
}

function sum(vec) {
  let res = 0;
  for (let i = 0; i < vec.length; i++) {
    res += vec[i];
  }
  return res;
}

class Scene {
  constructor(canvas, scene) {
    this.canvas = canvas;
    this.width = scene.width;
    this.height = scene.height;
    this.canvas.width = scene.width;
    this.canvas.height = scene.height;
    this.scene = scene;
    this.frames = scene.frames;

    this.gl = this.canvas.getContext('webgl', {
      antialias: false,
      preserveDrawingBuffer: true,
    });
    const gl = this.gl;

    this.ctx = new Context(gl);

    gl.enable(gl.DEPTH_TEST);
    const bg = scene.background;
    gl.clearColor(bg[0], bg[1], bg[2], bg[3]);
    gl.viewport(0, 0, scene.width, scene.height);

    this.programs = {};
    for (const id in scene.programs) {
      const program = new Program(gl, scene.programs[id]);
      program.compile();
      this.programs[id] = program;
    }

    this.buffers = {};
    for (const id in scene.buffers) {
      const buffer = new Buffer(gl, scene.buffers[id]);
      buffer.send();
      this.buffers[id] = buffer;
    }

    this.textures = {};
    for (const id in scene.textures) {
      const texture = new Texture(gl, scene.textures[id]);
      texture.send();
      this.textures[id] = texture;
    }

    for (const id in scene.layers) {
      scene.layers[id].revFrames = makeRevFrames(scene.layers[id].frames);
    }

    if (scene.postprocessing) {
      this.postPosBuffer = new Buffer(gl, {
        type: 'Float32Array',
        data: [-1, -1, -1, 3, 3, -1],
        is_index: false,
        item_size: 2,
      });
      this.postPosBuffer.send();

      this.framebufferTexture = new Texture(gl, {
        width: scene.width,
        height: scene.height,
        filter: 'NEAREST',
        image: null,
      });
      this.framebufferTexture.send();

      this.depthBuffer = gl.createRenderbuffer();
      gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthBuffer);
      gl.renderbufferStorage(
        gl.RENDERBUFFER,
        gl.DEPTH_COMPONENT16,
        scene.width,
        scene.height,
      );
      gl.bindRenderbuffer(gl.RENDERBUFFER, null);

      this.framebuffer = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
      gl.framebufferRenderbuffer(
        gl.FRAMEBUFFER,
        gl.DEPTH_ATTACHMENT,
        gl.RENDERBUFFER,
        this.depthBuffer,
      );
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        this.framebufferTexture.ref,
        0,
      );
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);

      this.postProgram = new Program(gl, this.scene.postprocessing.program);
      this.postProgram.compile();

      this.postTextures = [];
      this.postFramebuffers = [];
      this.blendPrograms = [];

      for (let i = 1; i < this.scene.postprocessing.iters.length; i++) {
        const texture = new Texture(gl, {
          width: scene.width,
          height: scene.height,
          filter: 'NEAREST',
          image: null,
        });
        texture.send();
        this.postTextures.push(texture);

        const framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(
          gl.FRAMEBUFFER,
          gl.COLOR_ATTACHMENT0,
          gl.TEXTURE_2D,
          texture.ref,
          0,
        );
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        this.postFramebuffers.push(framebuffer);

        const program = new Program(gl, {
          vertex:
            'precision highp float; attribute vec2 pos; varying vec2 v_pos; void main(void) {gl_Position = vec4(pos.xy, 0.0, 1.0); v_pos = (pos + 1.0) / 2.0;}',
          fragment:
            'precision highp float; uniform sampler2D texture; varying vec2 v_pos; void main(void) { gl_FragColor = texture2D(texture, v_pos); }',
          attributes: {
            pos: '2f',
          },
          textures: {
            texture: 7 - i,
          },
          mode: 'TRIANGLES',
        });
        program.compile();
        this.blendPrograms.push(program);
      }
    }
  }

  motionBlur() {
    return this.scene.postprocessing.motionBlur || 0;
  }

  getViewportMatrix(frame) {
    const camera = this.scene.camera;
    const fov =
      getAtIndex(frame, camera.fov, 1, this.motionBlur())[0] / 180 * Math.PI;
    const near = getAtIndex(frame, camera.near, 1, this.motionBlur())[0];
    const far = getAtIndex(frame, camera.far, 1, this.motionBlur())[0];
    const target = getAtIndex(frame, camera.target, 3, this.motionBlur());
    const [alpha, beta, dist] = getAtIndex(
      frame,
      camera.polar,
      3,
      this.motionBlur(),
    );
    const viewport = mat4.create();
    mat4.perspective(viewport, fov, this.width / this.height, near, far);
    const transform = mat4.create();
    mat4.translate(transform, transform, [0, 0, -dist]);
    mat4.rotateY(transform, transform, alpha / 180 * Math.PI);
    mat4.rotateX(transform, transform, beta / 180 * Math.PI);
    mat4.translate(transform, transform, target);
    mat4.multiply(viewport, viewport, transform);
    return viewport;
  }

  drawLayer(layer, index) {
    const {
      program: programId,
      attributes,
      textures,
      uniforms,
      draw,
      index: indexed,
    } = layer;

    const program = this.programs[programId];
    ctx.useProgram(program);

    for (const variable in uniforms) {
      const size = program.getUniformSize(variable);
      let value = null;
      if (variable === 'random') {
        value = [];
        for (let i = 0; i < size; i++) {
          value.push(Math.random());
        }
      } else if (variable === 'camera') {
        value = viewport;
      } else if (variable === 'screen') {
        value = [this.width, this.height];
      } else {
        value = getAtIndex(index, uniforms[variable], size, this.motionBlur());
      }
      ctx.setUniform(variable, value);
    }

    ctx.keepAttributes(attributes);
    for (const variable in attributes) {
      const bufferId = getAtIndex(index, attributes[variable], 1)[0];
      ctx.setAttribute(variable, this.buffers[bufferId]);
    }

    for (const variable in textures) {
      const textureId = getAtIndex(index, textures[variable], 1)[0];
      ctx.setTexture(variable, this.textures[textureId]);
    }

    const first = getAtIndex(index, draw.first, 1)[0];
    const count = getAtIndex(index, draw.count, 1)[0];
    if (indexed) {
      const indexBuffer = getAtIndex(index, indexed, 1)[0];
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers[indexBuffer]);
      gl.drawElements(gl[program.mode], count, gl.UNSIGNED_SHORT, first);
    } else {
      gl.drawArrays(gl[program.mode], first, count);
    }
  }

  drawFrame(frame) {
    const gl = this.gl;
    const ctx = this.ctx;

    const viewport = this.getViewportMatrix(frame);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    for (const layerName in this.scene.layers) {
      const layer = this.scene.layers[layerName];
      if (!(frame in layer.revFrames)) return;
      layer.revFrames[frame].forEach(index => {
        this.drawLayer(this.scene.layers[layerName], index);
      });
    }
  }

  drawPostFrame(frame, stack) {
    const gl = this.gl;
    const ctx = this.ctx;
    const curStack = stack.slice();

    while (true) {
      let i = 0,
        stop = false;

      while (stack[i] === 0) {
        i++;
        if (i === stack.length) {
          stop = true;
          break;
        }
      }
      if (stop) break;
      stack[i]--;

      if (i === 0) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        gl.enable(gl.DEPTH_TEST);
        gl.disable(gl.BLEND);
        this.drawFrame(frame);

        gl.enable(gl.BLEND);
        gl.disable(gl.DEPTH_TEST);

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.postFramebuffer);
        gl.blendColor(0, 0, 0, 1 / i);
        gl.blendFunc(gl.CONSTANT_ALPHA, gl.ONE_MINUS_CONSTANT_ALPHA);
        continue;
      }
    }

    for (let i = 1; i <= 5; i++) {
      ctx.useProgram(this.postProgram);
      ctx.setUniform('screen', [scene.width, scene.height]);
      ctx.setUniform('random', [Math.random(), Math.random()]);
      ctx.keepAttributes({ pos: null });
      ctx.setAttribute('pos', this.postPosBuffer);
      ctx.setTexture('texture', this.framebufferTexture);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      ctx.setTexture('texture', null);
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.blendColor(0, 0, 0, 1 / n);
    gl.blendFunc(gl.CONSTANT_ALPHA, gl.ONE_MINUS_CONSTANT_ALPHA);

    ctx.useProgram(this.blendProgram);
    ctx.keepAttributes({ pos: null });
    ctx.setAttribute('pos', this.postPosBuffer);
    ctx.setTexture('texture', this.postTexture);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    ctx.setTexture('texture', null);
  }

  finalize() {
    this.ctx.finalize();
    for (const programId in this.programs) {
      this.programs[programId].finalize();
    }
    for (const textureId in this.textures) {
      this.textures[textureId].finalize();
    }
    for (const bufferId in this.buffers) {
      this.buffers[bufferId].finalize();
    }
  }
}
