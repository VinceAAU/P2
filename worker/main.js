/**
 * The worker module is entirely web-based, and can simply be opened 
 * in the browser!
 */

window.UUID = crypto.randomUUID(); //WARNING: THIS ONLY WORKS IN localhost AND HTTPS
const accessToken = localStorage.getItem("accessToken");
let pingTimerActive = false;
let waitingForTask = false;
let isConnected = false;

async function toggleStartButton() {
  let button = document.querySelector("#start_button");

  if (button.textContent === "Start") { // when user presses "start"
    button.textContent = "Disconnect";
    statusMessage("Node registered, awaiting tasks");

    /* Check if a timer waiting for tasks is already active. 
    *  If it is, this indicates that the button is being spammed, 
    *  and we simply reload the page as a simple solution to avoid further problems. */
    if (!waitingForTask) startWorking();
    else location.reload();

    startAlert();  //Gives a warning when closing if working.

  } else { // when user presses "disconnect"
    button.textContent = "Start";
    statusMessage("")
    stopWorking();
  }
}

function statusMessage(message) { // Updates the user on what their worker node is doing.
  const errorMessage = document.querySelector('#statusMsg');
  errorMessage.textContent = message;
  errorMessage.style.opacity = 1;
}

function startAlert() { // Asks the user if they're sure, when they try to exit.
  window.onbeforeunload = function (e) {
    if (isConnected) {
      e = e || window.event;
      if (e) e.returnValue = 'Sure?'; // For IE and Firefox prior to version 4
      return 'Sure?'; // For safari
    }
  };
}

function stopWorking() {
  isConnected = false;
  stopPingTimer();
  fetch('dead', { // tells server to remove worker from list of active workers
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      "UUID": window.UUID
    }
  });
}

function startWorking() {
  isConnected = true;
  console.log("start")
  startPingTimer(); // starts heartbeat
  fetchTask();
}

async function waitForTask() {
  statusMessage("Waiting for task...");
  const timer = 10000;
  waitingForTask = true;

  return new Promise((resolve) => {
    setTimeout(() => {
      if (isConnected) // Makes sure no tasks are fetched, while the worker is disconnected
      {
        console.log("Finished waiting, asking for task");
        fetchTask();
        waitingForTask = false;
        resolve();
      }
    }, timer);
  });
}

async function fetchTask() {
  fetch('requestFirstTask', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'UUID': window.UUID
    }
  })
    .then(async response => {
      if (response.status === 200) {
        statusMessage("Received task");
        handleReceivedData(response);
      } else {
        console.log("No work available on first fetch. Waiting...");
        waitForTask();
      }
    })
    .catch(error => console.error(error));
}


function startSorting(receivedArray) {
  let startTime = new Date().getTime();

  function quickSort(left = 0, right = receivedArray.length - 1) {

    if (left < right) {
      const pivotIndex = getRandomInt(left, right);
      const pivot = receivedArray[pivotIndex];

      const partitionIndex = partition(pivot, left, right);

      quickSort(left, partitionIndex);
      quickSort(partitionIndex + 1, right);
    } else {
      return;  //  Base case: array is already sorted (~length less than two).
    }
  }

  function partition(pivot, left, right) {
    let i = left - 1;
    let j = right + 1;

    while (true) {
      do {
        j--;
      } while (receivedArray[j] > pivot);

      do {
        i++;
      } while (receivedArray[i] < pivot);

      if (i < j) {
        swap(i, j);
      } else {
        return j;
      }
    }
  }


  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function swap(i, j) {
    const temp = receivedArray[i];
    receivedArray[i] = receivedArray[j];
    receivedArray[j] = temp;
  }


  quickSort();
  let finishedTime = (new Date().getTime() - startTime) / 1000;
  console.log("It took " + finishedTime);
  console.log(receivedArray);


  console.log("Worker returned the sorted list: ");
  console.log(receivedArray);
  statusMessage("Done computing. Sending data to server...")
  sendToServer(receivedArray);
}



async function pingTimer() {
  const pingInterval = 5000;

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
  statusMessage("Computing...");
  startSorting(convertedArray);
}

async function sendToServer(array) {
  if (!isConnected) {
    return;
  } // If not connected, don't send anything or request new tasks.

  await fetch('requestNewTask', {
    method: 'POST',
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Length": array.length,
      'Authorization': `Bearer ${accessToken}`,
      'UUID': window.UUID
    },
    body: array
  })
    .then(async response => {
      if (response.status === 200) {
        console.log(response);
        handleReceivedData(response); // recursive, worker eventually calls sendToServer. Idk if that's a bad way to do it?
      } else {
        console.log("No data returned from the server.");
        waitForTask();
      }
    })
    .catch(error => console.error(error));
}
