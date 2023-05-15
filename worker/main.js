/**
 * The worker module is entirely web-based, and can simply be opened 
 * in the browser!
 */

const UUID = localStorage.getItem('UUID');
let pingTimerActive = false;
let isConnected = false;
let workerSort;

async function toggleStartButton() {
  let hackerman = document.querySelector("#hackerman");
  let button = document.querySelector("#start_button");

  if (button.textContent === "Start") { // when user presses "start"
    button.textContent = "Disconnect";
    hackerman.style.visibility = "visible";
    
    startWorking(); // Request data and start sorting
    startAlert();  //Gives a warning when closing if working.

  } else { // when user presses "disconnect"
    button.textContent = "Start";
    hackerman.style.visibility = "hidden";
    stopWorking();
  }
}

function startAlert()
{
  window.onbeforeunload = function (e) {
    if (isConnected) {
      e = e || window.event;
      if (e) e.returnValue = 'Sure?'; // For IE and Firefox prior to version 4
      return 'Sure?'; // For safari
    }
  };
}

function stopWorking()
{
  isConnected = false;
  workerSort.terminate();
  stopPingTimer();
  fetch('dead', {
    method: 'POST',
    headers: {
      "UUID": UUID
    }
  });
}

function startWorking()
{
  workerSort = new Worker("workerSort.js");
    isConnected = true;
    fetch('requestFirstTask', {
      method: 'GET',
      headers: {
        'UUID': UUID
      }
    })
      .then(async data => {
        handleReceivedData(data);
      })
      .catch(error => console.error(error));

    startPingTimer();

}

function startWebWorker(receivedArray) {
  if (window.Worker) {

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

async function pingTimer() {
  const pingInterval = 5000;
  const accessToken = localStorage.getItem("accessToken");
  const uuid = localStorage.getItem("UUID");

  while (pingTimerActive) {
    await fetch("ping", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "UUID": uuid
      }
    });
    await new Promise(r => setTimeout(r, pingInterval));
  }
}

function startPingTimer() {
  pingTimerActive = true;
  pingTimer();
}

function stopPingTimer() {
  pingTimerActive = false;
}


async function handleReceivedData(data) {
  console.log("Received array from server:");
  console.log(data);
  const buffer = await data.arrayBuffer();
  const convertedArray = new Uint32Array(buffer);
  console.log("Array as Uint32Array:");
  console.log(convertedArray);
  startWebWorker(convertedArray);
}

async function sendToServer(array) {
  if (!isConnected) return; // If not connected don't send anything or request new tasks. 
  await fetch('requestNewTask', {
    method: 'POST',
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Length": array.length,
      'UUID': UUID
    },
    body: array
  }).then(async data => {
    handleReceivedData(data); // recursive, worker eventually calls sendToServer. Idk if that's a bad way to do it?
  })
    .catch(error => console.error(error));
}

