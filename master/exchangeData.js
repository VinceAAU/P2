import fs from 'fs';
import { Readable } from 'stream';
import { addCustomerQueue } from './queue.js';
import path from 'path';

export { handleUpload, streamArrayToClient, receiveArray, streamStringArrayToClient };

function streamArrayToClient(res, array) {

  const readable = new Readable();

  const buffer = Buffer.from(array.buffer); 

  readable._read = () => { };
  readable.push(buffer);
  readable.push(null);

  res.writeHead(200, {
    "Content-Type": "application/octet-stream",
    "Content-Length": buffer.length,
  });

  readable.pipe(res);

}

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

      // Resolve the promise with the UInt32Array
      resolve(uint32Array);
    });
  });
}

async function handleUpload(form, req, user) { 
  try {
    let filename = await downloadFile(form, req);
    addCustomerQueue(user, filename);
  }
  catch {
    throw (422) //Unprocessable Entity
  }
}

async function downloadFile(form, req) {
  return new Promise((resolve, reject) => {
    form.parse(req);

    form.once('end', ()=> {
      console.log('end');
      resolve(form.openedFiles[0].newFilename); //There HAS to be a better way of doing this
    });

    form.once('error', (err) => {
      reject(err);
    });

    form.on('progress', (received, expected) => {
      if(received%100_000_000<100_000) console.log(`Upload status: ${received}/${expected}`);
    })
  });
}

function streamStringArrayToClient(res, array) {
  const jsonString = JSON.stringify(array);
  const buffer = Buffer.from(jsonString, "utf-8");
  const readable = new Readable();

  readable._read = () => { };
  readable.push(buffer);
  readable.push(null);

  res.writeHead(200, {
    "Content-Type": "application/json",
    "Content-Length": buffer.length,
  });
  readable.pipe(res);
}