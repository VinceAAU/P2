import test from "ava";
import * as aw from "../../master/assignWork.js";

const {
  getQueueHead,
  getQueueTail,
  getAllTasks,
  getSortedBuckets,
  getPossibleValues,
  getAvailableTaskIndices,
  storeSortedBuckets,
  dequeueTask,
} = aw.exportForTesting;

/* "(DYNAMIC)" tests: the data is not predetermined here,
   you will need a file in csvFiles and a pendingQueue pass this test. 
   (use a small file for efficient testing)                             */

let task;

test.before("Initialise values in assignWork.js", async (t) => {
  task = await aw.assignWorkToWorker("uuid_placeholder");
});

test("enqueueTask tests (DYNAMIC)", (t) => {
  let randomInt = Math.round(
    (Math.random() * 10000) % getAvailableTaskIndices().length
  );
  let startTail = getQueueTail();

  aw.enqueueTask(randomInt); // running enqueueTask function

  t.assert(
    getQueueTail() >= 0 && getQueueTail() < getAvailableTaskIndices().length
  ); // tail stays in bounds
  t.is(getAvailableTaskIndices()[startTail], randomInt); // the randomInt is inserted
  t.assert(getQueueTail() !== startTail); // the tail has changed value
});

test.after("addToBeginningOfQueue tests (DYNAMIC)", (t) => {
  let randomInt = Math.round(
    (Math.random() * 10000) % getAvailableTaskIndices().length
  ); // Random int to insert.

  let startHead = getQueueHead();

  aw.addToBeginningOfQueue(randomInt); // running addToBeginningOfQueue function

  t.assert(
    getQueueHead() >= 0 && getQueueHead() < getAvailableTaskIndices().length
  ); // head stays in bounds
  t.is(getAvailableTaskIndices()[getQueueHead()], randomInt); // the randomInt is inserted
  t.assert(
    startHead !== 0
      ? getQueueHead() !== startHead
      : getQueueHead() === startHead
  ); // the head has changed value, if start head was not 0.
});

test("dequeueTask tests (DYNAMIC)", (t) => {
  let startHead = getQueueHead();
  let expectedDequeueReturn = getAvailableTaskIndices()[startHead];

  let dequeueResult = dequeueTask();
  let secondHead = getQueueHead();

  t.is(dequeueResult, expectedDequeueReturn); // return value of dequeue is as expected
  t.assert(secondHead >= 0 && secondHead < getAvailableTaskIndices().length); // head stays in bounds
  t.assert(secondHead !== startHead); // the head has changed value
});

test("assignWorkToWorker tests (DYNAMIC)", async (t) => {
  t.assert(task instanceof Uint32Array === true); // see if task is a Uint32Array
  for (let num in task) {
    if (Number.isNaN(num)) {
      t.fail("NAN"); // check if everything in the task is a number
    }
  }
});

// These tests work best on larger files.
test("storeSortedBuckets tests (DYNAMIC)", (t) => {
  let allPossibleTasks = getAllTasks().length;
  let possibleInterval = getPossibleValues();

  let preCallList = getSortedBuckets();
  t.assert(preCallList.length === 0); // Before the call, the array is empty.

  storeSortedBuckets(task); // calling the function

  let expectedBucketPosition = Math.floor(
    task[0] / (possibleInterval / allPossibleTasks)
  ); // using the math to check if the expected position is correct.

  let postCallList = getSortedBuckets(); // The updated list.

  t.assert(
    postCallList.length > 0 &&
      postCallList !== null &&
      postCallList !== undefined
  ); /* Essentially the same as t.assert(postCallList); or similar checks,
        however, this is done to be more explicity and for readability      */

  t.is(postCallList[expectedBucketPosition], task); // The expected position of the task contains the task.
});
