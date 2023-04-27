import { taskSplitter } from "splitData.js";

async function assignWorkToWorker() {

    let allTasks = await taskSplitter();

    let availableTasks = Array.from({length: allTasks.length}, (e, i) => i);

    /*
        Implement Queue system on "availableTasks"
    */


    /*
        Call a 'reserved' function here, to add an assigned task to the reservation system.
    */
}