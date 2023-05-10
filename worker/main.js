/**
 * The worker module is entirely web-based, and can simply be opened 
 * in the browser!
 */

const UUID = localStorage.getItem('UUID');


async function toggleStartButton() {
  let button = document.querySelector("#start_button");
  let hackerman = document.querySelector("#hackerman");


  if (button.textContent === "Start") {

    // ui stuff
    button.textContent = "Disconnect";
    hackerman.style.visibility = "visible";

    fetch('requestFirstTask', {
	method: 'GET',
	headers: {
		'UUID': UUID
	}
    })
      .then(async data => {
        console.log("Received array from server:");
        console.log(data);
        const buffer = await data.arrayBuffer();
        const convertedArray = new Uint32Array(buffer);
        console.log("Array as Uint32Array:");
        console.log(convertedArray);
      // startWorkerMerge(convertedArray, 0, 2);
        startWorkerSort(convertedArray);
      })
      .catch(error => console.error(error));

	pingTimer(); //Begin ping timer thing - since it's async, it should happen in background(?)

      //Gives a warning when closing if working.
      window.onbeforeunload = function (e) {
        if (button.textContent === "Disconnect"){
          e = e || window.event;
        // For IE and Firefox prior to version 4
        if (e) {
          e.returnValue = 'Sure?';
        }
  
        // For Safari
        return 'Sure?';
      }
      };

  } else {
    button.textContent = "Start";
    hackerman.style.visibility = "hidden";
  }
}

function requestTask()
{

}

function startWorkerSort(receivedArray) {
  if (window.Worker) {
    const workerSort = new Worker("/workerSort.js");

    workerSort.postMessage(receivedArray, [receivedArray.buffer]);
    console.log("Block of work posted to the worker. ");

    workerSort.onmessage = function (e) {
      let arrS = new Uint32Array(e.data);
      console.log("Worker returned the sorted list: ");
      console.log(arrS);
      sendToServer(arrS);
    }
  } else {
    console.log("Browser does not support webworkers. ");
  }
}

// rightStart assumes the first array is 10 million elements if not otherwise specified.
function startWorkerMerge(nestedArray) {
  if (window.Worker) {
    const workerSort = new Worker("/workerMerge.js");

    workerSort.postMessage(nestedArray, [nestedArray.buffer]);
    console.log("Block of work posted to the worker. ");

    workerSort.onmessage = function (e) {
      let arrM = new Uint32Array(e.data[1]);
      console.log("Worker returned the merged list: ");
      console.log(arrM);
    }
  } else {
    console.log("Browser does not support webworkers. ");
  }
}

async function pingTimer(pingInterval = 5_000){
  //TODO: Test what happens if there isn't an access token. Can that even happen???
  const accessToken = localStorage.getItem("accessToken");
  const uuid        = localStorage.getItem("UUID");
  while(true){
    await fetch("ping", {
	    "method": "POST",
	    "headers": {
		    "Authorisation": `Bearer ${accessToken}`,
		    "UUID": uuid
	    }
    });
    await new Promise(r => setTimeout(r, pingInterval));
  }
}


async function sendToServer(array) // temp function
{
  fetch('/requestNewTask', {
    method: 'POST',
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Length": array.length,
      'UUID': UUID
    },
    body: array
  });
}

