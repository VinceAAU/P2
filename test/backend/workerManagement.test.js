import test from 'ava';
import * as wm from '../../master/workerManagement.js';

let workerUUID;

test.before('Create null worker', t=>{
    workerUUID = crypto.randomUUID();

    wm.addWorker(workerUUID, null);

    t.not(wm.workers[workerUUID], undefined);
})

test('Is Null Worker\'s task null?', t=>{
    t.is(wm.workers[workerUUID].currentTask, null);
});
test('Is Null Worker\'s ping correct?', t=>{
    t.true(wm.workers[workerUUID].lastPing <= Date.now());
    //Test if it's within the same second
    t.true(Date.now()-wm.workers[workerUUID].lastPing < 1000);
});

test.after('Can we remove Null Worker?', t=>{
    wm.removeWorker(workerUUID);

    t.is(wm.workers[workerUUID], undefined);
});

test.before('Start heartbeat', async t=> {
    wm.heartbeat();
});

test('Does heartbeat kill dead workers?',async t=> {
    const uuid = crypto.randomUUID();
    wm.addWorker(uuid, null);

    wm.workers[uuid].lastPing = Date.now()-30_000; //Pretend it has been dead for thirty seconds
    await new Promise(r => setTimeout(r, 6_000)); //Allow the heartbeat time to iterate

    t.is(wm.workers[uuid], undefined);
});

test('Does heartbeat preserve living workers?', async t => {
    const uuid = crypto.randomUUID();
    wm.addWorker(uuid, null);
    
    await new Promise(r => setTimeout(r, 6_000));

    t.not(wm.workers[uuid], undefined);
})

test.after('Kill heartbeat', t=> {
    wm.stopHeartbeat();
})