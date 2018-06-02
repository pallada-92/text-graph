import { Component } from 'react';
import {
  fromPairs,
  toPairs,
  all,
  keys,
  values,
  contains,
  omit,
  uniq,
  pluck,
  propEq,
} from 'ramda';

export default class extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tokens: {},
    };
    this.requests = {};
    this.storage = {};
  }

  download(token, { url, type, title, key }) {
    const req = new XMLHttpRequest();
    req.open('GET', url);
    req.responseType = type;

    this.setState(({ tokens }) => ({
      tokens: {
        ...tokens,
        [token]: {
          token,
          key,
          url,
          type,
          title,
          bytesDownloaded: 0,
          bytesToDownload: 0,
          state: 'downloading',
        },
      },
    }));

    const onError = (...args) => {
      console.log(`error during download of ${token}`);
      this.setState(({ tokens }) => ({
        tokens: {
          ...tokens,
          [token]: {
            ...tokens[token],
            state: 'fail',
            error: `${req.status + ' ' || ''}${req.statusText}`,
          },
        },
      }));
    };

    req.addEventListener('load', () => {
      if (req.status !== 200) {
        onError();
        return;
      }
      this.storage[token] = req.response;
      this.setState(({ tokens }) => ({
        tokens: {
          ...tokens,
          [token]: {
            ...tokens[token],
            state: 'done',
          },
        },
      }));
    });

    req.addEventListener('progress', evt => {
      if (evt.lengthComputable) {
        this.setState(({ tokens }) => ({
          tokens: {
            ...tokens,
            [token]: {
              ...tokens[token],
              bytesDownloaded: evt.loaded,
              bytesToDownload: evt.total,
            },
          },
        }));
      } else {
        console.log(
          `download size of ${token} is unknown (${
            evt.loaded
          } bytes downloaded)`,
        );
      }
    });

    req.addEventListener('error', onError);

    this.requests[token] = req;

    req.send();
  }

  requestDownloads = requests => {
    // Мы используем такой массив из-за отложенного действия
    // метода setState.
    const tokensToOmit = [];

    toPairs(this.state.tokens).forEach(([token, { state }]) => {
      if (token in requests && state !== 'fail') return;

      // Если мы дошли до сюда, значит мы хотим удалить информацию
      // загрузке с токеном `token`.

      if (state === 'downloading') {
        // Если загрузка не нужна, при этом она еще не была
        // завершена, отменить её.
        this.requests[token].abort();
        console.log('aborted ' + token);
      }

      delete this.requests[token];
      delete this.storage[token];

      tokensToOmit.push(token);
    });

    this.setState(({ tokens }) => ({
      tokens: omit(tokensToOmit, tokens),
    }));

    toPairs(requests).forEach(([token, request]) => {
      if (this.state.tokens[token] && !contains(token, tokensToOmit)) return;

      // Начать загрузку новых данных.
      this.download(token, request);
    });
  };

  selfCheck() {
    const infos = values(this.state.tokens);
    const count1 = infos.length;
    const count2 = uniq(pluck('key', infos)).length;
    const count3 = keys(this.requests).length;
    const count4 = keys(this.storage).length;
    if (count1 !== count2 || count2 !== count3 || count3 < count4) {
      console.log(
        'Downloads self-check error',
        `counts# = [${count1}, ${count2}, ${count3}, ${count4}]`,
      );
    }
  }

  render() {
    this.selfCheck();
    return this.props.children({
      requestDownloads: this.requestDownloads,

      allDone: all(propEq('state', 'done'), values(this.state.tokens)),

      progress: values(this.state.tokens),

      storage: fromPairs(
        toPairs(this.storage).map(([token, data]) => [
          this.state.tokens[token].key,
          data,
        ]),
      ),
    });
  }
}
