import { addWorker } from "./workerManagement.js";
import {getTaskQueueHead, pendingQueueToFinishedQueue} from "./queue.js";
import { BucketList } from "./splitData.js";
import fs from 'fs/promises';
export { assignWorkToWorker, enqueueTask, addToBeginningOfQueue, WorkerNode, taskCounter, storeSortedBuckets };

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

function enqueueTask(taskIndex) {
    availableTaskIndices[qTail] = taskIndex;
    qTail = (qTail + 1) % (allTasks.length + 1);
}

// In case a task fails, this task skips to the front of the queue.
function addToBeginningOfQueue(taskIndex) {
    qHead = (qHead - 1) % (allTasks.length + 1);
    availableTaskIndices[qHead] = taskIndex;
}

function dequeueTask() {
    let task = availableTaskIndices[qHead];
    qHead = (qHead + 1) % (allTasks.length + 1);
    return task;
}

async function assignWorkToWorker(workerUUID) {

    if (allTasks == null || allTasks.length === 0) {
        allTasks = await BucketList.fromQueue();
        console.log(`All tasks:`);
        for (let i in allTasks){
            console.log(`\t${i}: ${allTasks[i].length}`)
        }
        if (allTasks !== null) {
            availableTaskIndices = Array.from({length: allTasks.length + 1}, (_, i) => i);
            qHead = 0;
            qTail = allTasks.length;
        } else {
            qHead = 0;
            qTail = 0;
        }
    }

    if (qHead === qTail) {
        console.log("Completed sorting. ");
        addWorker(workerUUID, null);
        return null; // add some handling; if null is returned something is wrong.
    } else {
        console.log(`I'M GONNA DEQUEUE THE TASK!!!!`);
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

    constructor(task){
        this.currentTask = task;
        this.lastPing = new Date().getTime();
    }
}

// Put the sorted bucket into the correct position of the sortedBuckets array.
function storeSortedBuckets(bucket) {
    let indexForSortedBucket = Math.floor(bucket[0]/(possibleValues/allTasks.length));
    sortedBuckets[indexForSortedBucket] = bucket;
}


async function taskCounter(){
    taskCount++;
    if (taskCount >= allTasks.length) {
        await bucketConcatenate();
        taskCount = 0;
    }
}

async function bucketConcatenate() {
    let fileName = await getTaskQueueHead();

    let outputFile = await fs.open(`master/autogeneratedFiles/csvFiles/sorted${fileName}`, "w+") //Note to self: figure out if I can hack a computer through this

    for(let element of sortedBuckets){
        await outputFile.write(`${element},`); //Might be a good idea to do some buffer stuff if this is too slow
    }
    fs.unlink(`master/autogeneratedFiles/csvFiles/${fileName}`); // delete unsorted file when sorted file is done
    await pendingQueueToFinishedQueue();
    allTasks = [];
    sortedBuckets = [];
}
/*
// Debugging
console.log("Pre-call");
const getTask = await assignWorkToWorker("tis");
console.log(getTask);
console.log("Post-call");*/