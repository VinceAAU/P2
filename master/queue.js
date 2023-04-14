import { appendFileSync } from "fs";
export { saveQueue };


console.log("queue.js loaded");
let userQueue = ["1","2","3","4","5","6","7","8","9","10"];
let taskQueue = ["a","b","c","d","e","f","g","h","i","j"];

function addCustomerQueue(user, task){
    userQueue.push(user);
    taskQueue.push(task);
} 

function removeCustomerQueue(){ // will presumably be run when a task is finished
    userQueue.shift();
    taskQueue.shift();
}


const csvMaker = function (data){ //This function makes the two arrays of the queue data into a csv format
    console.log("----csvMaker works!----");
    let csvRows = [];
    
    const headers = Object.keys(data);

    csvRows.push(headers.join(','));

    const values = Object.values(data).join(',');
    csvRows.push(values);

    return csvRows.join('\n');
}

const serverDownloadCsv = function (data){ //Somehow this will do the downloading of the csv file on the server
    
    console.log("----ServerDownloadCSV is working----");
    try {
        console.log("----The try in the ServerDownloadCSV is working----");
        appendFileSync("master/autoGeneratedFiles/queue.csv",data); //Something is wrong with this append and i don't know why 
    } catch (err) {
        console.error(err);
    }
}


function saveQueue(){        //This function will at some point save the current queue as a csv file on the server-side
    const data = {           //This is done in case anything goes down on the server
        User: userQueue,     //we will still know what was in the queue and the order
        task: taskQueue
    }

    const csvData = csvMaker(data);
    serverDownloadCsv(csvData);
}
