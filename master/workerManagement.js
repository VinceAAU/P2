/**
 * I don't know if this deserves its own file, but it probably does
 */

import {WorkerNode} from './assignWork.js';

export { workers, addWorker, pong };

var workers = {};

const timeout = 10_000;
async function heartbeat(){
    for(uuid in workers){
        if(workers[uuid].lastPing < Date.now()+timeout){
            console.log(`Worker ${uuid} is dead!!!!`);
            addToBeginningOfQueue(workers[uuid].curentTask);
            delete workers[uuid];
        }
    }

    await new Promise(r => setTimeout(r, 5000)); //I swear, there's no better way to do sleep()
}

function addWorker(uuid, task){
    if(workers===undefined) { workers = {}; }
    workers[uuid] = new WorkerNode(task);
}

/**
 * 
 * @param worker The worker
 * @returns The response
 */
async function pong(uuid){
    workers[uuid] = Date.now();
}
