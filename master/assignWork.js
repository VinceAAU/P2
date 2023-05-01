import { taskSplitter } from "./splitData.js";
import { addWorker } from "./workerManagement.js";
export { assignWorkToWorker, enqueueTask, addToBeginningOfQueue, WorkerNode };

let allTasks = [];
let availableTaskIndices = [];

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
        addWorker(userID, taskForWorker);
        return allTasks[taskForWorker];
    }
}


// call this function with: let workerX/ID/whatever = new WorkerNode(task)
class WorkerNode{
    //let currentTask;
    //let lastPing;

    constructor(task){
        this.currentTask = task
        this.lastPing = new Date().getTime();

    }
}
