import { taskSplitter } from "./splitData.js";
export { assignWorkToWorker, enqueueTask, addToBeginningOfQueue, reservedObject };

let allTasks = [];
let availableTaskIndices = [];
let reservedObject = {}; //reserved.UUID = task - delete



let qHead;
let qTail;

function enqueueTask(taskIndex) {
    availableTaskIndices[qTail] = taskIndex;
    qTail = (qTail + 1) % availableTaskIndices.length + 1;
}

// In case a task fails, this task skips to the front of the queue.
function addToBeginningOfQueue(taskIndex) {
    qHead = (qHead - 1) % availableTaskIndices.length + 1;
    availableTaskIndices[qHead] = taskIndex;
}

function dequeueTask() {
    let task = availableTaskIndices[qHead];
    qHead = (qHead + 1) % availableTaskIndices.length + 1;
    return task;
}

async function assignWorkToWorker(userID) {

    if (allTasks.length === 0) {
        allTasks = await taskSplitter();
        availableTaskIndices = Array.from({length: allTasks.length + 1}, (_, i) => i);
        qHead = 0;
        qTail = availableTaskIndices.length;
    }

    if (qHead === qTail) {
        throw new Error("Queue is empty.");
    } else {
        let taskForWorker = dequeueTask();
        // Call a function here to add userID and taskForWorker to a form of reservation list.
        return allTasks[taskForWorker];
    }
}


// call this function with: let workerX/ID/whatever = new worker(task)
class Worker{
    //let current task = ??
    //let lastPing = ??

    constructor(task){
        this.currentTask = task
        this.lastping = Date.getTime() //returns 'DD/MM/YYYY, HH.MM.SS'
    }
}