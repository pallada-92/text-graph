let ctx = null;

function startDrawing(data) {
  const canvas = document.getElementById('preview');

  const frame = data['frame.json'];

  ctx = new Context(canvas);
  window.ctx = ctx;
  ctx.initialize();

  frame.program = new Program(ctx.gl, frame.program);
  frame.program.compile();

  for (const variable in frame.attributes) {
    const buffer = new Buffer(ctx.gl, frame.attributes[variable]);
    buffer.send();
    frame.attributes[variable] = buffer;
  }

  for (const variable in frame.textures) {
    const prev = frame.textures[variable];
    prev.image = data[prev.url];
    const texture = new Texture(ctx.gl, prev);
    texture.send();
    frame.textures[variable] = texture;
  }

  ctx.clear(1920, 1080);
  ctx.draw(frame);
}

window.addEventListener('load', () => {
  const dataUrls = [
    'cmu_serif.json',
    'frame.json',
  ];
  const imgsUrls = ['cmu_serif.png'];
  const data = {};

  function checkLoaded() {
    if (dataLoaded === dataUrls.length && imgsLoaded === imgsUrls.length) {
      startDrawing(data);
    }
  }

  let dataLoaded = 0;
  const dataReqs = dataUrls.forEach((url, i) => {
    const req = new XMLHttpRequest();
    const extension = url.split('.')[1];

    req.responseType = {
      json: 'json',
      c: 'text',
    }[extension];

    req.addEventListener('load', () => {
      data[url] = req.response;
      dataLoaded += 1;
      checkLoaded();
    });

    req.open('GET', url);
    req.send();
  });

  let imgsLoaded = 0;
  imgsUrls.forEach(url => {
    const img = new Image();
    img.src = url;
    img.onload = () => {
      imgsLoaded += 1;
      checkLoaded();
    };
    data[url] = img;
  });
});
