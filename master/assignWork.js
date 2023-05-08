// import { taskSplitter } from "./splitData.js";
import { addWorker } from "./workerManagement.js";
export { assignSortWorkToWorker, enqueueSortTask, addToBeginningOfSortQueue, addToBeginningOfMergeQueue, WorkerNode };

let allSortTasks = [];
let availableSortTaskIndices = [];

let qHeadSort;
let qTailSort;

function enqueueSortTask(sortTaskIndex) {
    availableSortTaskIndices[qTailSort] = sortTaskIndex;
    qTailSort = (qTailSort + 1) % availableSortTaskIndices.length + 1;
}

// In case a task fails, this task skips to the front of the queue.
function addToBeginningOfSortQueue(sortTaskIndex) {
    qHeadSort = (qHeadSort - 1) % availableSortTaskIndices.length + 1;
    availableSortTaskIndices[qHeadSort] = sortTaskIndex;
}

function dequeueSortTask() {
    let task = availableSortTaskIndices[qHeadSort];
    qHeadSort = (qHeadSort + 1) % availableSortTaskIndices.length + 1;
    return task;
}

async function assignSortWorkToWorker(workerUUID) {

    if (allSortTasks.length === 0) {
        allSortTasks = await taskSplitter();
        availableSortTaskIndices = Array.from({length: allSortTasks.length + 1}, (_, i) => i);
        qHeadSort = 0;
        qTailSort = availableSortTaskIndices.length;
    }

    if (qHeadSort === qTailSort) {
        console.log("Completed sorting, beginning to merge.");
        assignMergeWorkToWorker(workerUUID);
    } else {
        let sortTaskForWorker = dequeueSortTask();
        // Call a function here to add userID and sortTaskForWorker to a form of reservation list.
        addWorker(workerUUID, false, sortTaskForWorker);
        return [false, allSortTasks[sortTaskForWorker]];
    }
}

let allMergeTasks = []; // needs to store all the sorted tasks from the workers, somehow.
let availableMergeTaskIndices = [];

let qHeadMerge;
let qTailMerge;  // populate variables etcetc

function enqueueMergeTask(mergeTaskIndex) {
    availableMergeTaskIndices[qTailMerge] = mergeTaskIndex;
    qTailMerge = (qTailMerge + 1) % availableMergeTaskIndices.length + 1;
}

// In case a task fails, this task skips to the front of the queue.
function addToBeginningOfMergeQueue(mergeTaskIndex) {
    qHeadMerge = (qHeadMerge - 1) % availableMergeTaskIndices.length + 1;
    availableMergeTaskIndices[qHeadMerge] = mergeTaskIndex;
}

function dequeueMergeTask() {
    let task = availableMergeTaskIndices[qHeadMerge];
    qHeadMerge = (qHeadMerge + 1) % availableMergeTaskIndices.length + 1;
    return task;
}

async function assignMergeWorkToWorker(workerUUID) {

    if (allMergeTasks.length === 0) {
        throw new Error("Nothing to merge.");
    } /* Not sure how we get the sorted arrays into the local "allMergeTasks"
     since the workers don't return their results here. [INSERT MAGIC] */

    if (qHeadMerge === qTailMerge) {
        console.log("Done merging."); /* Something when it's done (callback, function, promise, idk), 
                                         probably would not be done when the Head and Tail meet, since the
                                         server is supposed to do the last few steps. */
    } else {
        // Taking two tasks to merge
        let mergeTaskForWorkerOne = dequeueMergeTask(); // The whole idea behind this kind of queue was to not lose data on node failure,
        let mergeTaskForWorkerTwo = dequeueMergeTask(); // so how are we going to free the arrays continuously?
        // assuming we can handle assigning more than some taskID to a worker, through an array or something.
        addWorker(workerUUID, true, [mergeTaskForWorkerOne, mergeTaskForWorkerTwo]); 
        return [true, allMergeTasks[mergeTaskForWorkerOne], allMergeTasks[mergeTaskForWorkerTwo]];
        // bool + two arrays, check bool to see if it is a sort or merge.
    }
} 

// call this function with: let workerX/ID/whatever = new WorkerNode(task)
class WorkerNode {
    //let currentTask;
    //let lastPing;

    constructor(merge, task){
        this.currentTask = task;
        this.lastPing = new Date().getTime();
        this.isMerging = merge;
    }
}
