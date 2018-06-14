export default class Buffer {
  constructor(gl, { type, data, itemSize, isIndex, normalized }) {
    this.gl = gl;
    this.type = type;
    this.itemSize = itemSize;
    this.isIndex = Boolean(isIndex);
    this.normalized = Boolean(normalized);
    this.location = null;
    this.ref = null;
    this.sent = false;

    if (this.type === 'Uint8Array') {
      this.format = this.gl.UNSIGNED_BYTE;
    } else if (this.type === 'Uint16Array') {
      this.format = this.gl.UNSIGNED_SHORT;
    } else {
      this.format = this.gl.FLOAT;
    }

    if (data.name === this.type) {
      this.data = data;
    } else {
      this.data = new window[this.type](data);
    }

    if (this.isIndex) {
      this.target = this.gl.ELEMENT_ARRAY_BUFFER;
    } else {
      this.target = this.gl.ARRAY_BUFFER;
    }
  }

  send() {
    const { gl } = this;
    this.ref = gl.createBuffer();
    gl.bindBuffer(this.target, this.ref);
    gl.bufferData(this.target, this.data, this.gl.STATIC_DRAW);
    gl.bindBuffer(this.target, null);
    this.sent = true;
  }

  setAttribute(location) {
    const { gl } = this;
    if (location === -1) return;
    this.location = location;
    gl.enableVertexAttribArray(this.location);
    gl.bindBuffer(this.target, this.ref);
    gl.vertexAttribPointer(
      this.location,
      this.itemSize,
      this.format,
      this.normalized,
      0,
      0
    );
    gl.bindBuffer(this.target, null);
  }

  finalize() {
    this.gl.deleteBuffer(this.ref);
  }
}
