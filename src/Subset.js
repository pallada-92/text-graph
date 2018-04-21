export default class {
  fromFilter = (array, fun) => {
    this.indices = new Array(array.length);
    this.map = {};
    let pos = 0;
    for (let i = 0; i < array.length; i++) {
      if (!fun(array[i], i)) continue;
      this.indices[pos] = i;
      this.map[i] = pos;
      pos++;
    }
    this.indices.length = pos;
    return this;
  };

  fromIndices = indices => {
    this.indices = indices;
    this.map = {};
    for (let i = 0; i < this.indices.length; i++) {
      this.map[this.indices[i]] = i;
    }
    return this;
  };

  length = () => this.indices.length;

  hasIndex = index => index in this.map;

  apply = array => {
    const res = new Array(this.indices.length);
    for (let i = 0; i < this.indices.length; i++) {
      res[i] = array[this.indices[i]];
    }
    return res;
  };

  applyMany = (...arrays) => arrays.map(this.apply);

  reindex = indices => indices.map(index => this.map[index]);

  reindexMany = (...indices) => indices.map(this.reindex);

  filter = indices => indices.filter(index => index in this.map);

  filterAndReindex = indices => this.reindex(this.filter(indices));
}
