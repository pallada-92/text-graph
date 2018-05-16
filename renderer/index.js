function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
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

let data = {};
let scene = null;
let frame = 0;
let blendIter = 0;
let playing = false;
const baseScene = 'scenes/scene3.base.json';
const overScene = 'scenes/scene3.1.json';

window.addEventListener('keydown', ({ key }) => {
  if (key === ' ') {
    const req = new XMLHttpRequest();
    const url = overScene;
    req.responseType = ext(url);
    req.addEventListener('load', () => {
      data[url] = req.response;
      startDrawing();
    });
    req.open('GET', url);
    req.send();
  } else if (key === 'Escape') {
    playing = false;
  }
});

let pending = 0;

function onFrame() {
  window.requestAnimationFrame(onFrame);
  if (!playing) return;
  if (pending > 10) {
    console.log('PENDING > 10');
    playing = false;
    return;
  }
  if (frame >= scene.stop) {
    console.log('STOP');
    playing = false;
    return;
  }

  scene.drawPostFrame(frame, blendIter + 1);

  blendIter++;
  if (blendIter >= scene.blendIters) {
    if (scene.exportAs) {
      const req = new XMLHttpRequest();
      req.responseType = 'text';
      req.addEventListener('load', () => {
        console.log(req.response);
        if (req.response.slice(0, 3) === 'OK ') {
          pending--;
        }
      });
      req.open(
        'POST',
        `http://localhost:4004?scene=${scene.exportAs}&frame=${frame}`,
      );
      req.send(canvas.toDataURL());
      pending++;
    }
    blendIter = 0;
    frame += scene.step;
    console.timeEnd('frame');
    console.time('frame');
    console.log('FRAME %d', frame);
  }
}

let canvas = null;

function startDrawing() {
  canvas = document.getElementById('preview');

  const sceneBaseData = data[baseScene];
  const sceneOverData = data[overScene];
  const sceneData = mergeDeep(sceneBaseData, sceneOverData);

  sceneData.textures.cmu_serif.image = data['cmu_serif.png'];

  scene = new Scene(canvas, sceneData);
  frame = scene.start;
  blendIter = 0;
  playing = true;
}

function ext(fname) {
  const parts = fname.split('.');
  return parts[parts.length - 1];
}

window.addEventListener('load', () => {
  onFrame();
  const dataUrls = ['cmu_serif.json', baseScene, overScene];
  const imgsUrls = ['cmu_serif.png'];

  function checkLoaded() {
    if (dataLoaded === dataUrls.length && imgsLoaded === imgsUrls.length) {
      startDrawing();
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
