import test from 'ava';
import * as wm from '../../master/workerManagement.js';

let workerUUID;

test.before('Create null worker', t=>{
    workerUUID = crypto.randomUUID();

    wm.addWorker(workerUUID, null);

    t.pass();
})

test('Is null worker null?', t=>{
    t.is(wm.workers[workerUUID].currentTask, null);
});
test('Is Ping correct?', t=>{
    t.truthy(wm.workers[workerUUID].lastPing < Date.now());
    //Test if it's within the same second
    t.truthy(Date.now()-wm.workers[workerUUID].lastPing < 1000);
});

test('Is the worker added to array?', t=>{
    t.is(Object.keys(wm.workers).length, 1);
});
