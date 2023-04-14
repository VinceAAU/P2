
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

  //  Perform some operations on the bytearray here.
  //  To start: Split into lists of roughly 10 million elements.

  //  Return an array of arrays (each array being a task)

}

/**
 * If we want to implement some sort of back-up of the split-tasks, in case of server restart etc.
 * That would be implemented here, I suppose.
 */
/*function saveTasksToSystem() {

}  This functionality is deprioritised --> in the first place this will not be added. */

/**
 * Unsure about the naming, but this could be the main function, that is called and runs the functions of the document.
 */
function taskSplitter() {
  //  Perhaps here we call some queue function, that tells us the path of the queue #1,
  //  then we call the split file on this path, splitfile gives the path to readfile.

  

  //  Return the results?
}

