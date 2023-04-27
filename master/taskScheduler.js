import { taskSplitter } from "splitData.js";

let allTasks = [];
let availableTasks = [];

async function assignWorkToWorker(userID) {

    if (allTasks.length === 0) {
        allTasks = await taskSplitter();
        availableTasks = Array.from({length: allTasks.length}, (_, i) => i);
    }

    /*
        Implement Queue system on "availableTasks"
    */

    

    /*
        Call a 'reserved' function here, to add an assigned task to the reservation system.
    */

    

}