import test from 'ava';
import * as aw from '../../master/assignWork.js';

const {
    storeSortedBuckets,
    dequeueTask,
    getAllTasks,
    setAllTasks,
    getSortedBuckets,
    getPossibleValues,
    getAvailableTaskIndices,
    setAvailableTaskIndices,
    getQueueHead,
    setQueueHead,
    getQueueTail,
    setQueueTail
} = aw.exportForTesting;

/* "(DYNAMIC)" tests: the data is not predetermined here,
   you will need a file in csvFiles and a pendingQueue pass this test. 
   (use a small file for efficient testing)                             */

let task;

test.before("Initialise values in assignWork.js", async t => {
    task = await aw.assignWorkToWorker("uuid_placeholder");
});

test("enqueueTask tests (DYNAMIC)", t => {
    let randomInt = Math.round(Math.random() * 10000 % getAvailableTaskIndices().length);
    let startTail = getQueueTail();

    aw.enqueueTask(randomInt); // running enqueueTask function
    
    t.assert(getQueueTail() >= 0 && getQueueTail() < getAvailableTaskIndices().length); // tail stays in bounds
    t.is(getAvailableTaskIndices()[startTail], randomInt); // the randomInt is inserted
    t.assert(getQueueTail() !== startTail); // the tail has changed value
});

test("dequeueTask tests (DYNAMIC)", t => {
    let startHead = getQueueHead();
    let expectedDequeueReturn = getAvailableTaskIndices()[startHead];

    let dequeueResult = dequeueTask();
    let secondHead = getQueueHead();

    t.is(dequeueResult, expectedDequeueReturn); // return value of dequeue is as expected
    t.assert(secondHead >= 0 && secondHead < getAvailableTaskIndices().length); // head stays in bounds
    t.assert(secondHead !== startHead); // the head has changed value
});


test("assignWorkToWorker tests (DYNAMIC)", async t => {
    t.assert(task instanceof Uint32Array === true); // see if task is a Uint32Array
    for (let num in task) {
        if (Number.isNaN(num)) {
            t.fail("NAN"); // check if everything in the task is a number
        }
    }
});

// These tests work best on larger files.
test("storeSortedBuckets tests (DYNAMIC)", t => {
    let allThemTasks = getAllTasks();
    let expectedBucketPosition;
    let preCallList;
    let postCallList;
    let allTaskLength = allThemTasks.length;
    let possibleInterval = getPossibleValues();

    for (let task in allThemTasks) {
        preCallList = getSortedBuckets();
        //t.log("This is the pre call: " + preCallList);
        storeSortedBuckets(task); // store a task (not sorted here, but should still sort correctly)
        postCallList = getSortedBuckets();
        //t.log("This is the post call: " + postCallList);

        t.log(`This is the pre call: ${preCallList}  \n This is the post call: ${postCallList}`);
        t.assert(preCallList !== postCallList);
        

        expectedBucketPosition = Math.floor(task/(possibleInterval/allTaskLength));
        t.is(postCallList[expectedBucketPosition], task);
    }



    t.log(expectedBucketPosition);

});


