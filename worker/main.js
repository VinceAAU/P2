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

    //  startWorker();  //  I guess we run the worker some place like here.

    const response = await fetch('request-worktask', {
      method: 'POST'
    });
    const stream = response.body;
    const reader = stream.getReader();
    let data = '';
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      data += value;
    }

    console.log(data); // TODO: needs to be parsed using something like "papaparse"

  } else {
    button.textContent = "Start";
    hackerman.style.visibility = "hidden";
  }
}


// Move to where it should be, and adjust functionality accordingly
function startWorker() {
  if (window.Worker) {
    const workerSort = new Worker("worker.js");

    /*  Somehow feed the array of numbers to sort to the worker.
        For now, a static array of number is fed to test.         */
    workerSort.postMessage([5, 2, 3, 9, 900, 1, 1111, 111, 3]);
    console.log("Block of work posted to the worker. ");

    workerSort.onmessage = function (e) {
      console.log("Worker returned the sorted list: " + e.data);
    }
  } else {
    console.log("Browser does not support webworkers. ");
  }
}
