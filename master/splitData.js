import fs from "fs/promises";
import { getTaskQueueHead, removeCustomerQueue } from "./queue.js";

export { taskSplitter };


/**
 * This function loads a file into memory, inside a Uint32Array.
 * @param {*} filePath The path to the file that needs to be loaded.
 * @returns The Uint32Array containing the CSV-file's data.
 */
async function loadFileToArray(filePath) {

  let numbers_array = new Uint32Array(1_000_000_000);
  let numarray_index = 0;
  let file_index = 0;
  const buffer_size = 1_000_000;

  const fileHandle = await fs.open(filePath);

  while(true) {
      let buffer = Buffer.alloc(buffer_size);
      let fd_read_return = await fileHandle.read(buffer, 0, buffer_size, file_index);

      if(fd_read_return.bytesRead === 0) { 
          break;
      }

      let array_buffer = (buffer + '')
                      .replace('\n', ',').replace('\r', ',')
                      .split(',').map((value, uselessOne, uselessTwo) => {
                          return Number(value);
                      });
      
      numbers_array[numarray_index] = Number((numbers_array[numarray_index] + '').concat(array_buffer[0]));
      array_buffer.splice(0, 1);

      for (let i of array_buffer){
          numarray_index++;
          numbers_array[numarray_index] = i;
      } 

      file_index += buffer_size;
  }

  fileHandle.close();
  numbers_array = numbers_array.slice(0, numarray_index + 1);
  return numbers_array;
}

/**
 * This function should take an array and split it into smaller arrays that are more fit for 
 * being distributed. As a start: Split into lists of roughly 10 million elements.
 * @param {*} filePath Filepath to give to the readDataFile function to get the whole file as an array in return.
 */
async function splitArray(filePath) {

  const taskSize = 10_000_000; //  How many elements we want in each task (primitive, yet effective).
  let tasks = []; //  Array to contain arrays (tasks) ready to be scheduled.

  //  Call the function to read the data file
  let data = await loadFileToArray(filePath);

  for (let leftIndex = 0; leftIndex < data.length; leftIndex += taskSize) {
    tasks.push(data.slice(leftIndex, taskSize + leftIndex));
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