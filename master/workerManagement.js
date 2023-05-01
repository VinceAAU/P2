/**
 * I don't know if this deserves its own file, but it probably does
 */

export {workers}

const workers = {};

const timeout = 10_000;
async function heartbeat(nodes){
    for(uuid in nodes){
        if(nodes[uuid].lastPing < Date.getTime()+timeout){
            console.log(`Worker ${uuid} is dead!!!!`);
            addToBeginningOfQueue(nodes[uuid].curentTask);
            delete workers[uuid];
        }
    }

    await new Promise(r => setTimeout(r, 5000)); //I swear, there's no better way to do sleep()
}

function addWorker(uuid){
    workers[uuid].lastPing = Date.getTime();
}

/**
 * 
 * @param worker The worker
 * @returns The response
 */
async function pong(uuid){
    pings[uuid] = Date.getTime();
}
