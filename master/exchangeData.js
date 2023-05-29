import fs from 'fs';
import { Readable } from 'stream';
import { addCustomerQueue } from './queue.js';
import path from 'path';

export { handleUpload, streamArrayToClient, receiveArray, streamStringArrayToClient };

/**
 * Streams an array to the client. Used to send the data that needs to be sorted to workers.
 * @param res response object from http request
 * @param array task that needs to be sent
 */
function streamArrayToClient(res, array) {
  try {
    const readable = new Readable();

    const buffer = Buffer.from(array.buffer);

    readable._read = () => { };
    readable.push(buffer);
    readable.push(null); // indicates end of stream

    res.writeHead(200, {
      "Content-Type": "application/octet-stream",
      "Content-Length": buffer.length,
    });
    readable.pipe(res);
  } catch (e) {
    console.log(e);
  }


}
/**
 * Receives data from the client, concatenates it and turns it back into a UInt32array.
 * @param req requester object from http request
 * @returns UInt32array of (hopefully) sorted data from a worker.
 */
async function receiveArray(req) {
  return new Promise((resolve) => {
    const chunks = [];

    req.on('data', chunk => {
      chunks.push(chunk);
    });

    req.on('end', () => {
      // Concatenate the received chunks into a single Buffer
      const buffer = Buffer.concat(chunks);

      // Create a UInt32Array from the Buffer
      const uint32Array = new Uint32Array(buffer.buffer, buffer.byteOffset, buffer.byteLength / Uint32Array.BYTES_PER_ELEMENT);

      resolve(uint32Array);
    });
  });
}

/**
 * Receives a file from a client and adds it to the queue.
 * @param req requester object from http request
 */
async function handleUpload(form, req, user) {
  try {
    let filename = await downloadFile(form, req);
    addCustomerQueue(user, filename);
  }
  catch {
    throw (422) //Unprocessable Entity
  }
}

/**
 * Downloads a file onto the master nodes storage, when it has been uploaded by the client.
 * @param req requester object from http request
 * @param form incomming formidable form from the client
 * @returns promise of the filename
 */
async function downloadFile(form, req) {
  return new Promise((resolve, reject) => {
    form.parse(req);

    form.once('end', () => {
      console.log('end');
      resolve(form.openedFiles[0].newFilename);
    });

    form.once('error', (err) => {
      reject(err);
    });

    form.on('progress', (received, expected) => {
      if (received % 100_000_000 < 100_000) console.log(`Upload status: ${received}/${expected}`); // logs upload progress
    })
  });
}
/**
 * Sends an array of strings to the client as a response to a http request.
 * @param res response object from http request
 * @param array an array of strings
 */
function streamStringArrayToClient(res, array) {
  const jsonString = JSON.stringify(array);
  const buffer = Buffer.from(jsonString, "utf-8");
  const readable = new Readable();

  readable._read = () => { };
  readable.push(buffer);
  readable.push(null); // indicates end of stream

  res.writeHead(200, {
    "Content-Type": "application/json",
    "Content-Length": buffer.length,
  });
  readable.pipe(res);
}