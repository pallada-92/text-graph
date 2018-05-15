function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

function mergeDeep(target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();
  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }
  return mergeDeep(target, ...sources);
}

let scene = null;

const baseScene = 'scenes/scene2.base.json';
const overScene = 'scenes/scene1.1.json';

function startDrawing(data) {
  const canvas = document.getElementById('preview');

  const sceneBaseData = data[baseScene];
  const sceneOverData = data[overScene];
  const sceneData = mergeDeep(sceneBaseData, sceneOverData);
  
  sceneData.textures.cmu_serif.image = data['cmu_serif.png'];

  scene = new Scene(canvas, sceneData);
  drawFrame(0, 1);
}

function drawFrame(frame, n) {
  if (n < 5) {
    window.requestAnimationFrame(() => {
      drawFrame(frame, n + 1);
    });
  }
  scene.drawPostFrame(frame, n);
}

function ext(fname) {
  const parts = fname.split('.');
  return parts[parts.length - 1];
}

window.addEventListener('load', () => {
  const dataUrls = ['cmu_serif.json', baseScene, overScene];
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

    req.responseType = {
      json: 'json',
      c: 'text',
    }[ext(url)];

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
