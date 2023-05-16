/**
 * The worker module is entirely web-based, and can simply be opened 
 * in the browser!
 */

window.UUID = crypto.randomUUID(); //WARNING: THIS ONLY WORKS IN localhost AND HTTPS
let pingTimerActive = false;
let isConnected = false;
let workerSort;
//const errorMessage = document.getElementById('statusMsg');




async function toggleStartButton() {
  let hackerman = document.querySelector("#hackerman");
  let button = document.querySelector("#start_button");

  if (button.textContent === "Start") { // when user presses "start"
    button.textContent = "Disconnect";
    //hackerman.style.visibility = "visible";
    statusMessage("Node registered, awaiting tasks");
    
    startWorking(); // Request data and start sorting
    startAlert();  //Gives a warning when closing if working.

  } else { // when user presses "disconnect"
    button.textContent = "Start";
    statusMessage("")
    //hackerman.style.visibility = "hidden";
    stopWorking();
  }
}

function statusMessage(message) {
  const errorMessage = document.querySelector('#statusMsg');
  errorMessage.textContent = message;
  errorMessage.style.opacity = 1;
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
      "UUID": window.UUID
    }
  });
}

function startWorking()
{
  workerSort = new Worker("workerSort.js");
    isConnected = true;
    console.log("start")
    //fetchTask()

    startPingTimer();
    startPingTask();
    

}

function fetchTask(){
  fetch('requestFirstTask', {
    method: 'GET',
    headers: {
      'UUID': window.UUID
    }
  })
    .then(async data => {
      if(data.ok){
        console.log("ping response OK")
        console.log(data)
        statusMessage("Recieved task. Computing begun")
        handleReceivedData(data);
      }
    })
    .catch(error => console.error(error));
}

async function startPingTask(){
  console.log("startPingTask")
  const pingInterval = 30000;

  while (pingTimerActive) {
    fetchTask()
    statusMessage("No new tasks. Awaiting...")
    console.log("ping loop")
    await new Promise(r => setTimeout(r, pingInterval));
  } 
}

function startWebWorker(receivedArray) {
  if (window.Worker) {

    workerSort.postMessage(receivedArray, [receivedArray.buffer]);
    console.log("Block of work posted to the worker. ");

    workerSort.onmessage = function (e) {
      let arrS = new Uint32Array(e.data);
      console.log("Worker returned the sorted list: ");
      console.log(arrS);
      statusMessage("Done computing")
      sendToServer(arrS);
    }
  } else {
    console.log("Browser does not support webworkers. ");
  }
}

async function pingTimer() {
  const pingInterval = 5000;
  const accessToken = localStorage.getItem("accessToken");
  const uuid = window.UUID;

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
  if (!isConnected){ 
    return
  }; // If not connected, don't send anything or request new tasks. 
  await fetch('requestNewTask', {
    method: 'POST',
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Length": array.length,
      'UUID': window.UUID
    },
    body: array
  })
  .then(async response => {
    if (response.ok) {
      //const data = await response.json();
      console.log(response)
      handleReceivedData(response); // recursive, worker eventually calls sendToServer. Idk if that's a bad way to do it?
    } else {
      console.log("No data returned from the server.");
      startPingTask();
    }
  })
  .catch(error => console.error(error));
}
