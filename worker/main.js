/**
 * The worker module is entirely web-based, and can simply be opened 
 * in the browser!
 */

async function toggleStartButton() {
  let button = document.querySelector("#start_button");
  let hackerman = document.querySelector("#hackerman");
  if (button.textContent === "Start") {

    // ui stuff
    button.textContent = "Disconnect";
    hackerman.style.visibility = "visible";

    startWorker();  //  I guess we run the worker some place like here.

    console.log("Fetching array from server...");
    fetch('request-worktask')
      .then(response => response.json())
      .then(data => {
        console.log("Received array from server:");
        console.log(data);
      })
      .catch(error => console.error(error));

  } else {
    button.textContent = "Start";
    hackerman.style.visibility = "hidden";
  }
}

let testArr = new Int32Array([5, 2, 3, 9, 900, 1, 1111, 111, 3]);
// Move to where it should be, and adjust functionality accordingly
function startWorker() {
  if (window.Worker) {
    const workerSort = new Worker("../worker.js");

    /*  Somehow feed the array of numbers to sort to the worker.
        For now, a static array of number is fed to test.         */
    workerSort.postMessage(testArr, [testArr.buffer]);
    console.log("Block of work posted to the worker. ");

    workerSort.onmessage = function (e) {
      let arrR = new Int32Array(e.data);
      console.log("Worker returned the sorted list: ");
      arrR.forEach(x => console.log(x));
    }
  } else {
    console.log("Browser does not support webworkers. ");
  }
}
