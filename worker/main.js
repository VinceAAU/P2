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

    fetch('request-worktask', {
	method: 'GET',
	headers: {
		'UUID': UUID
	}
    })
      .then(response => response.json())
      .then(data => {
        console.log("Received array from server:");
        console.log(data);
        const convertedArray = new Int32Array(data);
        console.log("Array as Int32Array:");
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

function startWorkerSort(receivedArray) {
  if (window.Worker) {
    const workerSort = new Worker("/workerSort.js");

    workerSort.postMessage(receivedArray, [receivedArray.buffer]);
    console.log("Block of work posted to the worker. ");

    workerSort.onmessage = function (e) {
      let arrS = new Int32Array(e.data);
      console.log("Worker returned the sorted list: ");
      console.log(arrS);
      sendToServer(arrS);
    }
  } else {
    console.log("Browser does not support webworkers. ");
  }
}

// rightStart assumes the first array is 10 million elements if not otherwise specified.
function startWorkerMerge(receivedArray, leftStart = 0, rightStart = 10000000) {
  if (window.Worker) {
    const workerSort = new Worker("/workerMerge.js");

    workerSort.postMessage([receivedArray, leftStart, rightStart], [receivedArray.buffer]);
    console.log("Block of work posted to the worker. ");

    workerSort.onmessage = function (e) {
      let arrM = new Int32Array(e.data);
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
  fetch('/upload-sorted-array', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(array)
  });
}

// w.i.p
async function streamArrayToServer(array) {
  // Send sorted array to server in chunks of 1000 elements
  const chunkSize = 1000;
  console.log(array.length);
  for (let i = 0; i < array.length; i += chunkSize) {
    const chunk = array.slice(i, i + chunkSize);
    try {
      const response = await fetch('/upload-sorted-array', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8'
        },
        body: JSON.stringify(chunk)
      });

      if (response.ok) {
        console.log("Array chunk streamed successfully to server");
      } else {
        console.error("Error streaming array chunk to server. Status:", response.status);
      }
    } catch (error) {
      console.error("Error streaming array chunk to server:", error);
    }
  }
}
