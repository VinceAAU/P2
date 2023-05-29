import { addWorker } from "./workerManagement.js";
import { getTaskQueueHead, pendingQueueToFinishedQueue } from "./queue.js";
import { BucketList } from "./splitData.js";
import fs from "fs/promises";
import { existsSync, createWriteStream } from "fs";
export {
  assignWorkToWorker,
  enqueueTask,
  addToBeginningOfQueue,
  WorkerNode,
  taskCounter,
  storeSortedBuckets,
};

// Constants
const possibleValues = 1_000_000_000;

// Variables for the sorted tasks and merging
let taskCount = 0;
let sortedBuckets = [];

// Variables for the queue of tasks
let allTasks = [];
let availableTaskIndices = [];

let qHead;
let qTail;
let fileLoad = false;

function enqueueTask(taskIndex) {
  availableTaskIndices[qTail] = taskIndex;
  qTail = (qTail + 1) % (allTasks.length + 1);
}

// In case a task fails, this task skips to the front of the queue.
function addToBeginningOfQueue(taskIndex) {
  qHead = qHead - 1 > 0 ? (qHead - 1) % (allTasks.length + 1) : 0;
  availableTaskIndices[qHead] = taskIndex;
}

function dequeueTask() {
  let task = availableTaskIndices[qHead];
  qHead = (qHead + 1) % (allTasks.length + 1);
  return task;
}
let startTime;

async function assignWorkToWorker(workerUUID) {
  if (fileLoad == false) {
    if (allTasks == null || allTasks.length === 0) {
      console.log("Getting current time: ");
      try{
        startTime = new Date().getTime();
        console.log(startTime);
      }
      catch(e) {
        console.log("Error getting time: " + e);
      }
      
      fileLoad = true;
      allTasks = await BucketList.fromQueue();
      fileLoad = false;
     // console.log(`All tasks:`);
      for (let i in allTasks) {
        console.log(`\t${i}: ${allTasks[i].length}`);
      }
      if (allTasks !== null) {
        availableTaskIndices = Array.from(
          { length: allTasks.length + 1 },
          (_, i) => i
        );
        qHead = 0;
        qTail = allTasks.length;
      } else {
        qHead = 0;
        qTail = 0;
      }
    }
  } else {
    qHead = 0;
    qTail = 0;
    console.log("File is being loaded in");
  }

  if (qHead === qTail) {
    console.log("No available tasks");
    addWorker(workerUUID, null);
    return null; // add some handling; if null is returned something is wrong.
  } else {
    let taskForWorker = dequeueTask();
    console.log(`Task for worker: ${taskForWorker}`);
    // Call a function here to add userID and sortTaskForWorker to a form of reservation list.
    addWorker(workerUUID, taskForWorker);
    return allTasks[taskForWorker];
  }
}

// call this function with: let workerX/ID/whatever = new WorkerNode(task)
class WorkerNode {
  currentTask;
  lastPing;

  constructor(task) {
    this.currentTask = task;
    this.lastPing = new Date().getTime();
  }
}

// Put the sorted bucket into the correct position of the sortedBuckets array.
function storeSortedBuckets(bucket) {
  let indexForSortedBucket = Math.floor(
    bucket[0] / (possibleValues / allTasks.length)
  );
  sortedBuckets[indexForSortedBucket] = bucket;
}

async function taskCounter() {
  taskCount++;
  if (taskCount >= allTasks.length) {
    await bucketConcatenate();
    taskCount = 0;
  }
}

  /**
   * Finds a unique name for a file, when it is sorted. This prevents issues with other functions accessing the wrong files.
   * @param filename name of the file in question
   * @returns if the name is taken, it returns a unique name with a number at the end, otherwise it returns the same name as the input.
   */
async function findUniqueName(filename) {
  if (existsSync("master/autogeneratedFiles/csvFiles/sorted" + filename)) {
    console.log("File already exists, creating new filename...");
    const pureFilename = filename.slice(0, filename.lastIndexOf(".")); // get filename without .csv extension
    for (let i = 1; i < 99999; i++) {
      // arbitrary limit
      let newFileName = pureFilename + " (" + i + ")" + ".csv"; // similar to how windows handles duplicates, when downloading file
      if (
        !existsSync("master/autogeneratedFiles/csvFiles/sorted" + newFileName)
      )
        return `${newFileName}`;
    }
  } else {
    console.log("No duplicates detected");
    return `${filename}`;
  }
}

async function bucketConcatenate() {
  let fileName = await getTaskQueueHead();
  let uniqueFileName = await findUniqueName(fileName);
  uniqueFileName = "sorted" + uniqueFileName;

  console.log("Concat started");
  let concatTime = new Date().getTime();

  let outputFile = await fs.open(
    `master/autogeneratedFiles/csvFiles/${uniqueFileName}`,
    "w+"
  ); 
  
  let i = 0;
  for (let element of sortedBuckets) {
    console.log(i);
    await outputFile.write(`${element},`); 
    i++;
  }
  console.log("Concat time: " + ((new Date().getTime() - concatTime)/1000))
  fs.unlink(`master/autogeneratedFiles/csvFiles/${fileName}`); // delete unsorted file when sorted file is done
  await pendingQueueToFinishedQueue(uniqueFileName);
  allTasks = [];
  sortedBuckets = [];
  console.log("Completed Sorting");
}

// Below functions only exported for testing is found.
const getQueueHead = () => qHead;
const getQueueTail = () => qTail;
const getAllTasks = () => allTasks;
const getSortedBuckets = () => sortedBuckets;
const getPossibleValues = () => possibleValues;
const getAvailableTaskIndices = () => availableTaskIndices;

export const exportForTesting = {
  getQueueHead,
  getQueueTail,
  getAllTasks,
  getSortedBuckets,
  getPossibleValues,
  getAvailableTaskIndices,
  storeSortedBuckets,
  dequeueTask,
};
