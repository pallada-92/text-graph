import React from 'react';
import { Container, Form } from 'semantic-ui-react';
import { fromPairs, keys, identity, filter, startsWith, repeat } from 'ramda';

import Downloader from './Downloader';
import DownloadProgress from './DownloadProgress';
import State from './State';

const makeUrl = ({ size, delay, number, error, setLength }) =>
  `http://localhost:3003/cors?size=${size || 10}&delay=${
    delay === undefined ? 0.1 : delay
  }&number=${number || 1}&error=${error || 0}&set_length=${
    setLength === undefined ? 1 : setLength
  }`;

// 'http://localhost:3003/cors?size=15&delay=0.1&number=1'

const bigNumber = repeat('1', 100).join('');

const urls = {
  data1: makeUrl({ number: 1 }),
  data2: makeUrl({ number: 2 }),
  dataSameKey3: makeUrl({ number: 3 }),
  dataSameKey4: makeUrl({ number: 4 }),
  dataBigJSON5: makeUrl({ number: 5 }),
  dataBigBuffer6: makeUrl({
    number: bigNumber,
    delay: 0,
    size: Math.round(100 * 1024 * 1024 / 100),
  }),
  dataNoLength7: makeUrl({ number: 7, setLength: 0 }),
  dataErrorQuick: makeUrl({ error: 403 }),
  dataErrorSlow: makeUrl({ error: 500, delay: 5 }),
  dataServerError: makeUrl({ number: 'x' }),
  dataCorsError: 'http://localhost:3003/',
  dataHostNotFoundError: 'http://lajdijerhjd.com/',
  dataStatic: '/data/google_10k_embed_3d.json',
};

export default () => (
  <Downloader>
    {({ requestDownloads, allDone, progress, storage }) => (
      <State>
        {({ state, setState }) => (
          <Container>
            {allDone ? (
              <div>{JSON.stringify(storage)}</div>
            ) : (
              <DownloadProgress progress={progress} />
            )}
            <Form>
              {[
                'data1',
                'data2',
                'dataSameKey3',
                'dataSameKey4',
                'dataBigJSON5',
                'dataBigBuffer6',
                'dataNoLength7',
                'dataErrorQuick',
                'dataErrorSlow',
                'dataServerError',
                'dataCorsError',
                'dataHostNotFoundError',
                'dataStatic',
              ].map(name => (
                <Form.Checkbox
                  key={name}
                  label={name}
                  checked={state[name]}
                  onChange={(_, { checked }) => setState({ [name]: checked })}
                />
              ))}
              <Form.Button
                content="Download"
                onClick={() =>
                  requestDownloads(
                    fromPairs(
                      keys(filter(identity, state)).map(name => [
                        name,
                        {
                          url: urls[name],
                          title: `title: ${name}`,
                          type:
                            name === 'dataBigBuffer6' ? 'arraybuffer' : 'json',
                          key: startsWith('dataSameKey', name)
                            ? 'dataSameKey'
                            : `key ${name}`,
                        },
                      ]),
                    ),
                  )
                }
              />
            </Form>
          </Container>
        )}
      </State>
    )}
  </Downloader>
);
