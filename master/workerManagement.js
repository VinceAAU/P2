/**
 * I don't know if this deserves its own file, but it probably does
 */

const pings = {};


const timeout = 10_000;
async function heartbeat(){
    for(uuid in pings){
        if(pings[uuid] < Date.getTime()+timeout){
            console.log(`Worker ${uuid} is dead!!!!`);
            //TODO: Reassign task
        }
    }

    await new Promise(r => setTimeout(r, 5000)); //I swear, there's no better way to do sleep()
}

function addWorker(uuid){
    pings[uuid] = Date.getTime();
}

/**
 * 
 * @param worker The worker
 * @returns The response
 */
async function pong(worker){
    
}