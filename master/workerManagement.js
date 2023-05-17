/**
 * I don't know if this deserves its own file, but it probably does
 */

import {WorkerNode, addToBeginningOfQueue, enqueueTask} from './assignWork.js';

export { workers, addWorker, removeWorker, pong, heartbeat };
var workers = {};

const timeout = 20_000;
async function heartbeat(){
    while(true){ //Possible TODO: get a way to stop the heartbeat
        for(let uuid in workers){
            if(uuid===undefined) continue;
            if(Date.now()-workers[uuid].lastPing > timeout){
                removeWorker(uuid);
            }
        }

        await new Promise(r => setTimeout(r, 5000)); //I swear, there's no better way to do sleep()
    }
}

function addWorker(uuid, task){
    if(workers===undefined) { workers = {}; }
    workers[uuid] = new WorkerNode(task);
}

function removeWorker(uuid) {
    console.log(`Killing worker ${uuid}!`);
    if (workers[uuid] && (typeof workers[uuid].currentTask !== 'undefined' && workers[uuid].currentTask !== null)) {
      enqueueTask(workers[uuid].currentTask);
    } else {
        console.log("User task or user was invalid for some reason ¯\\_(ツ)_/¯");
    }
    delete workers[uuid];
  }
  
  // 420th commit, hurray!

/**
 * 
 * @param worker The worker
 * @returns The response
 */
async function pong(uuid){
    if(workers[uuid]!==undefined) { //Check if the worker has pinged before being registered
        workers[uuid].lastPing = Date.now();
    }
}
