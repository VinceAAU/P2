import fs from "fs";
/*import { queueHead } from "./queue.js";
          assuming there will be some function in queue.js 
          that returns the filepath of the #1 spot in the queue.*/


/**
 * The idea here is to read a given file from the server's filesystem, given a path from the Queue.
 * @param {*} path The filepath specified in the first position of the Queue (or some arbitrary path provided).
 * @returns Returns the contents of the filepath -- turns a CSV into a falt array of values.
 */
export function readFile(path) {
  fs.readFile(path, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
  
    const rows = data.trim().split('\r\n'); // split the data into an array of rows
    const values = rows.map(row => row.split(',')); // split each row into an array of values
    const resultArray = values.flat();  // flatten the array of arrays into a single array

    // Do something with the resulting array of values
    console.log(resultArray); // Probably running splitFile() here.
  });
  
}

/**
 * This function should take a file and split it into smaller files that are more fit for 
 * @param {*} byteArray A bytearray containing the information of a file.
 */
function splitFile(byteArray) {

  //  Perform some operations on the bytearray here.
  //  As a start: Split into lists of roughly 10 million elements.

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
export function taskSplitter() {
  /*

  return newTasks = splitFile(readFile(queueHead()));
  
   Something like this; this could return an array of split-up tasks. 
   This would need a "queueHead()" or equivalent function to return
   the #1 queue filepath. 

   */
}

