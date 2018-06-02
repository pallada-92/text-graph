import React, { Fragment } from 'react';
import { range, juxt, apply } from 'ramda';
import { Button, Form, Input, Header } from 'semantic-ui-react';

import SimpleDownloader from './SimpleDownloader';
import FullScreen from './FullScreen';
import Viewport2d from './Viewport2d';
import Cloud2dCanvas from './Cloud2dCanvas';
import WordInfo from './WordInfo';
import State from './State';

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
      console.log('cloud2dApp');
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
                  <State initial={{ settinsOpen: false }}>
                    {({ state: { settingsOpen }, setState }) => (
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
                        <div
                          style={{
                            position: 'absolute',
                            display: settingsOpen ? 'block' : 'none',
                            background: '#f0f0f0',
                            right: 0,
                            top: 0,
                            bottom: 75,
                            width: 250,
                            padding: 15,
                            boxShadow: '-2px -1px 64px 15px rgba(0,0,0,0.28)',
                            overflowY: 'scroll',
                          }}
                        >
                          <Header as="h3">Third Header</Header>
                          <Form style={{ textAlign: 'right' }}>
                            <Form.Field>
                              <label style={{ textAlign: 'left' }}>
                                test test test test test test test test test
                                test test test test test test
                              </label>
                              <Input
                                style={{
                                  width: 100,
                                }}
                                type="number"
                                step="0.0001"
                              />
                            </Form.Field>
                            <Form.Input label="test" />
                            <Form.Input label="test" />
                            <Form.Input label="test" />
                            <Form.Input label="test" />
                            <Form.Input label="test" />
                            <Form.Input label="test" />
                            <Form.Input label="test" />
                            <Form.Input label="test" />
                            <Form.Input label="test" />
                            <Form.Input label="test" />
                            <Form.Input label="test" />
                            <Form.Input label="test" />
                            <Form.Input label="test" />
                            <Form.Input label="test" />
                            <Form.Button basic>Сброс</Form.Button>
                          </Form>
                        </div>
                        <Button
                          icon={settingsOpen ? 'close' : 'options'}
                          circular
                          color="black"
                          onClick={() =>
                            setState(({ settingsOpen }) => ({
                              settingsOpen: !settingsOpen,
                            }))
                          }
                          style={{
                            position: 'absolute',
                            bottom: 20,
                            right: 20,
                          }}
                        />
                      </Fragment>
                    )}
                  </State>
                );
              }}
            </Viewport2d>
          )}
        </FullScreen>
      );
    }}
  </SimpleDownloader>
);
