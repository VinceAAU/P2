import test from 'ava';
import * as ed from '../../master/exchangeData.js';
import { Writable } from 'stream';

// streamArrayToClient
// TODO (maybe?): Somehow test if the data being send is the same length, and is correct once received. No clue how to do this as of now.

test('streamArrayToClient handles errors gracefully', (t) => {
  const res = {
    writeHead: (statusCode, headers) => {
      throw new Error('Error occurred');
    },
    pipe: (destination) => {
      // This should not be called due to the error above.
      t.fail('pipe method should not be called');
    }
  };

  const array = new Uint32Array([1, 2, 3]);

  // Check if errors crash the server
  t.notThrows(() => {
    ed.streamArrayToClient(res, array);
  });
});

test('streamArrayToClient sends correct length in bytes', (t) => {
  const array = new Uint32Array([1, 2, 3, 4]);
  const res = {
    writeHead: (statusCode, headers) => {
      t.is(headers['Content-Length'], 16); // uint32 arrays have 4 bytes per element
    },
  };

  ed.streamArrayToClient(res, array);
});


