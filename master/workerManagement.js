/**
 * I don't know if this deserves its own file, but it probably does
 */

import { WorkerNode, addToBeginningOfQueue, enqueueTask } from './assignWork.js';

export { workers, addWorker, removeWorker, pong, heartbeat, stopHeartbeat };
var workers = {};

let heartBeating;
const timeout = 20_000; // time before worker is considered dead
async function heartbeat() {
    heartBeating = true;
    while (heartBeating) {
        for (let uuid in workers) {
            if (uuid === undefined) continue;
            if (Date.now() - workers[uuid].lastPing > timeout) {
                removeWorker(uuid);
            }
        }

        await new Promise(r => setTimeout(r, 5000)); //I swear, there's no better way to do sleep()
    }
}

function stopHeartbeat() {
    heartBeating = false;
}

function addWorker(uuid, task) {
    if (workers === undefined) { workers = {}; }
    if (workers[uuid] === undefined || workers[uuid] === null) console.log("Adding worker: " + uuid);
    workers[uuid] = new WorkerNode(task);
    console.log("Workers active: " + Object.keys(workers).length);
}

function removeWorker(uuid) {
    console.log(`Killing worker ${uuid}!`);
    if (workers[uuid] && (typeof workers[uuid].currentTask !== 'undefined' && workers[uuid].currentTask !== null)) {
        enqueueTask(workers[uuid].currentTask);
    } else {
        console.log("User didn't have a task, or didn't exist");
    }
    delete workers[uuid];
    console.log("Workers active: " + Object.keys(workers).length);
}

/**
 * 
 * @param worker The worker
 * @returns The response
 */
async function pong(uuid) {
    if (workers[uuid] !== undefined) { //Check if the worker has pinged before being registered
        workers[uuid].lastPing = Date.now();
    }
}
