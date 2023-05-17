import test from 'ava';
import * as aw from '../../master/assignWork.js';

let { storeSortedBuckets, dequeueTask } = aw.exportForTesting;

let allTasks = [ [1,2,3] , [6,5,4] , [7,8,9] , [12,11,10] , [13,14,15] ];
let availableTaskIndices = [ 0 , 1 , 2 , 3 , 4 , 5];

let qHead = 0;
let qTail = allTasks.length;


/* Dynamic meaning the data is not predetermined here,
   you will need a file in csvFiles and a pendingQueue pass this test. */
test("assignWorkToWorker tests (dynamic)", async t => {
    let task = await aw.assignWorkToWorker("uuid_placeholder");
    t.assert(task instanceof Uint32Array === true); // see if task is a Uint32Array
    for (let num in task) {
        if (isNaN(num)) {
            t.fail("NAN"); // check if everything in the task is a number
        }
    }
});


// Writitng the function here to have access to variables; primitive variables are hard to test.
function enqueueTask(taskIndex) {
    availableTaskIndices[qTail] = taskIndex;
    qTail = (qTail + 1) % (allTasks.length + 1);
}

test("enqueueTask tests (static)", t => {

    let randomInt = Math.random * 10000 % availableTaskIndices.length;
    let startTail = qTail;

    enqueueTask(randomInt);

    t.assert(qTail >= 0 && qTail < availableTaskIndices.length); // tail stays in bounds
    t.is(availableTaskIndices[startTail], randomInt); // the randomInt is inserted
    t.assert(qTail !== startTail); // the tail has changed value
});