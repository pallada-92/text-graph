// import { mat4, vec3 } from 'gl-matrix';

import Context from './Context';
import Program from './Program';
import Buffer from './Buffer';

export default class Scene {
  constructor(canvas, scene) {
    this.canvas = canvas;
    this.scene = scene;

    this.width = scene.width;
    this.height = scene.height;
    this.canvas.width = scene.width;
    this.canvas.height = scene.height;

    this.gl = this.canvas.getContext('webgl', {
      antialias: false,
      preserveDrawingBuffer: true,
    });
    const { gl } = this;
    this.ctx = new Context(gl);

    gl.enable(gl.DEPTH_TEST);
    const bg = scene.background;
    gl.clearColor(bg[0], bg[1], bg[2], bg[3]);
    gl.viewport(0, 0, scene.width, scene.height);

    this.programs = {};
    Object.keys(scene.programs).forEach(id => {
      const program = new Program(gl, scene.programs[id]);
      program.compile();
      this.programs[id] = program;
    });

    this.buffers = {};
    Object.keys(scene.buffers).forEach(id => {
      const buffer = new Buffer(gl, scene.buffers[id]);
      buffer.send();
      this.buffers[id] = buffer;
    });

    /*
    this.textures = {};
    for (const id in scene.textures) {
      const texture = new Texture(gl, scene.textures[id]);
      texture.send();
      this.textures[id] = texture;
    }
    */

    if (scene.clickBuffer) {
      /*
      this.clickTexture = new Texture(gl, {
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
        scene.height
      );
      gl.bindRenderbuffer(gl.RENDERBUFFER, null);

      this.framebuffer = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
      gl.framebufferRenderbuffer(
        gl.FRAMEBUFFER,
        gl.DEPTH_ATTACHMENT,
        gl.RENDERBUFFER,
        this.depthBuffer
      );
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        this.framebufferTexture.ref,
        0
      );
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      */
    }
  }

  /*
  getViewportMatrix() {
    const viewport = mat4.create();
    mat4.perspective(viewport, fov, this.width / this.height, near, far);
    const transform = mat4.create();
    const camPos = vec3.fromValues(0, 0, -dist);
    vec3.rotateY(camPos, camPos, [0, 0, 0], (-alpha / 180) * Math.PI);
    vec3.rotateX(camPos, camPos, [0, 0, 0], (-beta / 180) * Math.PI);
    vec3.subtract(camPos, camPos, target);

    mat4.rotateY(transform, transform, (alpha / 180) * Math.PI);
    mat4.rotateX(transform, transform, (beta / 180) * Math.PI);
    mat4.translate(transform, transform, camPos);

    mat4.multiply(viewport, viewport, transform);
    return viewport;
  }
  */

  drawLayer({
    program: programId,
    attributes,
    // textures,
    uniforms,
    draw: { first, count },
    index: indexed,
  }) {
    const { ctx, gl } = this;

    const program = this.programs[programId];
    ctx.useProgram(program);

    Object.keys(uniforms).forEach(variable => {
      ctx.setUniform(variable, uniforms[variable]);
    });

    ctx.keepAttributes(attributes);
    Object.keys(attributes).forEach(variable => {
      ctx.setAttribute(variable, this.buffers[attributes[variable]]);
    });

    /*
    for (const variable in textures) {
      if (variable === 'render') {
        ctx.setTexture('render', params.renderTexture);
      } else {
        const textureId = getAtIndex(index, textures[variable], 1)[0];
        ctx.setTexture(variable, this.textures[textureId]);
      }
    }
    */

    if (indexed) {
      const indexBuffer = indexed;
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
        this.drawLayer(this.scene.layers[layerName], index, { viewport });
      });
    }
  }

  /*
  drawPostFrame(frame, n) {
    const gl = this.gl;
    const ctx = this.ctx;
    if (!this.doPost) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.enable(gl.DEPTH_TEST);
      gl.disable(gl.BLEND);
      this.drawFrame(frame);
      return;
    }

    for (let i = 1; i <= this.scene.postprocessing.post_iters; i++) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
      gl.enable(gl.DEPTH_TEST);
      gl.disable(gl.BLEND);

      this.drawFrame(frame);

      gl.enable(gl.BLEND);
      gl.disable(gl.DEPTH_TEST);

      gl.bindFramebuffer(gl.FRAMEBUFFER, this.postFramebuffers[0]);
      gl.blendColor(0, 0, 0, 1 / i);
      gl.blendFunc(gl.CONSTANT_ALPHA, gl.ONE_MINUS_CONSTANT_ALPHA);

      this.drawLayer(this.scene.postprocessing, frame, {
        renderTexture: this.framebufferTexture,
      });
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.blendColor(0, 0, 0, 1 / n);
    gl.blendFunc(gl.CONSTANT_ALPHA, gl.ONE_MINUS_CONSTANT_ALPHA);

    ctx.useProgram(this.blendPrograms[0]);
    ctx.keepAttributes({ pos: null });
    ctx.setAttribute('pos', this.buffers.fullscreen);
    ctx.setTexture('render', this.postTextures[0]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    ctx.setTexture('render', null);
  }
  */

  finalize() {
    this.ctx.finalize();
    Object.keys(this.programs).forEach(programId => {
      this.programs[programId].finalize();
    });
    /*
    for (const textureId in this.textures) {
      this.textures[textureId].finalize();
    }
    */
    Object.keys(this.buffers).forEach(bufferId => {
      this.buffers[bufferId].finalize();
    });
  }
}
