import { EventEmitter } from 'events';

function createInterface (renderer) {
  const emitter = new EventEmitter();

  const receive = result => {
    if (result && result.event) {
      emitter.emit(result.event, result.data);
    }
  };

  if (renderer) {
    window.onmessage = ev => receive(ev.data.pluginMessage);
  } else {
    figma.ui.onmessage = data => receive(data);
  }

  emitter.send = function (event, data) {
    if (typeof event !== 'string') {
      throw new Error('Expected first argument to be an event name string');
    }
    const postData = {
      event,
      data
    };
    if (renderer) {
      window.parent.postMessage({ pluginMessage: postData }, '*');
    } else {
      figma.ui.postMessage(postData);
    }
  };

  emitter.async = function (ev) {
    return new Promise((resolve) => {
      this.once(ev, resolve);
    });
  };

  return emitter;
}

const isRenderer = typeof figma === 'undefined';
export const ui = isRenderer ? createInterface(true) : undefined;
export const main = isRenderer ? undefined : createInterface();
