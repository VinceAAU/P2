import fs from "fs";
import { Readable } from "stream";


export function startDataStream(path, res) {

    fs.access(path, (err) => { // makes sure the server doesn't crash, if given an incorrect path
        if (!err) {
            const readStream = fs.createReadStream(path);
            readStream.pipe(res);
            console.log("Begun streaming data");
        } else {
            
            console.error(`${path} does not exist, or is not accessible`);
        }
    });

}

export function streamArray(res, array) {
    const jsonString = JSON.stringify(array);
    const buffer = Buffer.from(jsonString, "utf-8");
    const readable = new Readable();
  
    readable._read = () => {};
    readable.push(buffer);
    readable.push(null);
  
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Content-Length": buffer.length,
    });
  
    readable.pipe(res);
  }