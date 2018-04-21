import React, { Fragment } from 'react';
import { range, juxt, apply } from 'ramda';

import SimpleDownloader from './SimpleDownloader';
import FullScreen from './FullScreen';
import Viewport2d from './Viewport2d';
import Cloud2dCanvas from './Cloud2dCanvas';
import WordInfo from './WordInfo';

import { findNearest2d } from '../geometry';

const getBounds = juxt([apply(Math.min), apply(Math.max)]);

export default () => (
  <SimpleDownloader
    downloads={{
      coords2d: {
        url: 'data/google_10k_embed_2d.json',
        type: 'json',
        title: '2d координаты терминов',
        key: 'coords2d',
      },
      vocab: {
        url: 'data/google_10k_vocab.json',
        type: 'json',
        title: 'названия терминов',
        key: 'vocab',
      },
    }}
  >
    {({ coords2d, vocab }) => {
      const ptCount = coords2d.x.length;
      const [xMin, xMax] = getBounds(coords2d.x);
      const [yMin, yMax] = getBounds(coords2d.y);
      return (
        <FullScreen>
          {({ width, height }) => (
            <Viewport2d
              initialViewport={[
                (xMin + xMax) / 2,
                (yMin + yMax) / 2,
                (yMax - yMin) * 1.05,
              ]}
              width={width}
              height={height}
            >
              {({
                viewport,
                setViewport,
                mouseScreenPos,
                mouseSpacePos,
                mouseOver,
                ...canvasEvents
              }) => {
                const nearest = findNearest2d(
                  coords2d.x,
                  coords2d.y,
                  mouseSpacePos,
                );

                const sizes = new Array(ptCount).fill(1);
                sizes[nearest] = 5;

                return (
                  <Fragment>
                    <Cloud2dCanvas
                      width={width}
                      height={height}
                      data={{
                        viewport,
                        pt_x: coords2d.x,
                        pt_y: coords2d.y,
                        pt_size: sizes,
                        pt_order: range(0, ptCount),
                      }}
                      {...canvasEvents}
                    />
                    <div
                      style={{
                        width: 250,
                        position: 'absolute',
                        top: 20,
                        right: 20,
                      }}
                    >
                      <WordInfo word={vocab[nearest]} rank={nearest} />
                    </div>
                  </Fragment>
                );
              }}
            </Viewport2d>
          )}
        </FullScreen>
      );
    }}
  </SimpleDownloader>
);
