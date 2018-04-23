import React from 'react';
import { range, sum } from 'ramda';

import SimpleDownloader from './SimpleDownloader';
import FullScreen from './FullScreen';
import Viewport3d from './Viewport3d';
import Cloud2dCanvas from './Cloud2dCanvas';

export default () => (
  <SimpleDownloader
    downloads={{
      coords3d: {
        url: 'data/google_10k_embed_3d.json',
        type: 'json',
        title: '3d координаты терминов',
        key: 'coords3d',
      },
      vocab: {
        url: 'data/google_10k_vocab.json',
        type: 'json',
        title: 'названия терминов',
        key: 'vocab',
      },
    }}
  >
    {({ coords3d, vocab }) => {
      const ptCount = coords3d.x.length;
      const target = [
        sum(coords3d.x) / ptCount,
        sum(coords3d.y) / ptCount,
        sum(coords3d.z) / ptCount,
      ];
      return (
        <FullScreen>
          {({ width, height }) => (
            <Viewport3d
              initialTarget={target}
              initialViewport={[0, 0, 100, Math.PI / 180 * 90]}
              width={width}
              height={height}
            >
              {({
                target,
                viewport,
                setTarget,
                setViewport,
                pt2px,
                ...canvasEvents
              }) => {
                const pt_x = new Array(ptCount);
                const pt_y = new Array(ptCount);
                const pt_label = new Array(ptCount);
                const sizes = new Array(ptCount);

                for (let i = 0; i < ptCount; i++) {
                  const [u, v, dist] = pt2px([
                    coords3d.x[i],
                    coords3d.y[i],
                    coords3d.z[i],
                  ]);
                  pt_x[i] = u;
                  pt_y[i] = v;
                  if (dist < 0) {
                    sizes[i] = 0;
                  } else {
                    const size = dist * 100;
                    sizes[i] = size;
                    if (size > 10) {
                      pt_label[i] = vocab[i];
                    } else {
                      pt_label[i] = null;
                    }
                  }
                }

                return (
                  <Cloud2dCanvas
                    width={width}
                    height={height}
                    data={{
                      viewport: [width / 2, height / 2, height],
                      pt_x,
                      pt_y,
                      pt_label,
                      pt_size: sizes,
                      pt_order: range(0, ptCount),
                    }}
                    {...canvasEvents}
                  />
                );
              }}
            </Viewport3d>
          )}
        </FullScreen>
      );
    }}
  </SimpleDownloader>
);
