import fs from "fs/promises";
import { getTaskQueueHead, removeCustomerQueue } from "./queue.js";

export { taskSplitter };


/**
 * The idea here is to read a given file from the server's filesystem, given a path from the Queue.
 * @param {*} path The filepath specified in the first position of the Queue (or some arbitrary path provided).
 * @returns Returns the contents of the filepath -- turns a CSV into a flat array of values.
 */
async function readDataFile(filePath) {
  try {
    let data = await fs.readFile(filePath, 'utf8'); // read file
    let rows = data.trim().split('\r\n'); // split the data into an array of rows
    let values = rows.map(row => row.split(',')); // split each row into an array of values
    let fileArray = values.flat(); // flatten the array of arrays into a single array

    return fileArray; // return the flattened array of values / the file as an array.
  } catch (err) {
    console.error(err); // print any errors
  }
}

/**
 * This function should take an array and split it into smaller arrays that are more fit for 
 * being distributed. As a start: Split into lists of roughly 10 million elements.
 * @param {*} filePath Filepath to give to the readDataFile function to get the whole file as an array in return.
 */
async function splitArray(filePath) {

  const taskSize = 10000000; //  How many elements we want in each task (primitive, yet effective).
  let tasks = []; //  Array to contain arrays (tasks) ready to be scheduled.

  //  Call the function to read the data file
  let data = await readDataFile(filePath);
  
  while (data.length) {
    tasks.push(data.splice(0, taskSize));
  }

  return(tasks);  //  Return an array of arrays (each array being a task)
}

/**
 * Unsure about the naming, but this could be the main function, that is called and runs the functions of the document.
 * Pretty useless right now, but perhaps there is a use for it in the future.
 */
async function taskSplitter() {
  
  let filePath = getTaskQueueHead(); 
  removeCustomerQueue();
  let tasks = await splitArray(filePath);

  return(tasks);  // Just prints all the arrays(tasks) to show it works. Call it in server.js.
  
}
//let arr1 = [], let arr2 = []
function combineArrays(arr1, arr2){
  const newArr = arr1.concat(arr2)
  arr1, arr2 = [];
  return(newArr)
}