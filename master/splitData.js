
//  The following actions are illegal and purely for educational purposes.

export { taskSplitter };
import fs from "fs";

/**
 * The idea here is to read a given file from the server, given a path from the Queue.
 * @param {*} path The filepath specified in the first position of the Queue.
 * @returns Returns the contents of the filepath.
 */
function readFile(path) {
    let entireFile = [];
    fs.readFile(path, function (err, data) {
        if (err) throw err;
        entireFile += data;
      });
      return entireFile;
}

/**
 * This function should take a file and split it into smaller files that are more fit for 
 * @param {*} byteArray A bytearray containing the information of a file.
 */
function splitFile(byteArray) {

  //Perform some operations on the bytearray here.

}

/**
 * If we want to implement some sort of back-up of the split-tasks, in case of server restart etc.
 * That would be implemented here, I suppose.
 */
function saveTasksToSystem() {

}

/**
 * Unsure about the naming, but this could be the main function, that is called and runs the functions of the document.
 */
function taskSplitter() {

}

