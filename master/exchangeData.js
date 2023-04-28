import fs from "fs";
import { Readable } from "stream";
import formidable from "formidable";
import {addCustomerQueue} from './queue.js'

export { handleUpload, startDataStream, streamArray }

function startDataStream(path, res) {

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

function streamArray(res, array) {
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

  async function handleUpload(form, req, user) { //please dont do export like this
    try {
      const uploadedFile = await downloadFile(form, req);
      addCustomerQueue(user, uploadedFile);
    }
    catch(err){
      throw(err)
    }
    
  }
  
  async function downloadFile(form, req)
  {
    return new Promise((resolve, reject) => {
      form.parse(req, function (error, fields, file) {
        if (error) {
          console.error(error);
          reject(error);
        }
        if (!file.fileupload || !file.fileupload.filepath) {
          console.error("File path not found");
          reject(new Error("File path not found"));
          throw("pathNotFound")
        }
  
        const oldPath = file.fileupload.filepath;
        const newPath = './master/autogeneratedFiles/csvFiles/' + file.fileupload.originalFilename;
  
        // Create a read stream to stream the file directly to disk
        const readStream = fs.createReadStream(oldPath);
        const writeStream = fs.createWriteStream(newPath);
  
        // Pipe the read stream to the write stream to write the file to disk
        readStream.pipe(writeStream);
  
        // Remove the temporary file created by formidable
        readStream.on('end', function () {
          fs.unlinkSync(oldPath);
          resolve(file.fileupload.originalFilename);
        });
      });
  
      form.on('error', function (err) {
        console.error(err);
        reject(err);
      });
    });
  }