import { taskSplitter } from "./splitData.js";
export { assignWorkToWorker, enqueueTask, addToBeginningOfQueue, reservedObject };

let allTasks = [];
let availableTaskIndices = [];
let reservedObject = {}; //reserved.UUID = task - delete



let qHead;
let qTail;

function enqueueTask(taskIndex) {
    availableTaskIndices[qTail] = taskIndex;
    qTail = (qTail + 1) % availableTaskIndices.length;
}

// In case a task fails, this task skips to the front of the queue.
function addToBeginningOfQueue(taskIndex) {
    qHead = (qHead - 1) % availableTaskIndices.length;
    availableTaskIndices[qHead] = taskIndex;
}

function dequeueTask() {
    let task = availableTaskIndices[qHead];
    qHead = (qHead + 1) % availableTaskIndices.length;
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
        // Call reservedTasks(userID, taskForWorker); function here
        return allTasks[taskForWorker];
    }
}