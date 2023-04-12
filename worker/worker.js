/*  The worker takes an array and performs QuickSort on it; 
    returns the sorted array.                                         */

onmessage = function(e) {
  console.log("Worker: received block of work. ");
  console.log("Unsorted: " + e.data);

  //  Trying out QuickSort.
  function quicksort(array) {
    if (array.length <= 1) {
      return array;
    }
  
    let pivot = array[0];
    
    let left = []; 
    let right = [];
  
    for (let i = 1; i < array.length; i++) {
      array[i] < pivot ? left.push(array[i]) : right.push(array[i]);
    }
  
    return quicksort(left).concat(pivot, quicksort(right));
  };
  let resultArr = new Int32Array(quicksort(e.data));

  // Experimenting with Transferrable objects.
  postMessage(resultArr, [resultArr.buffer]);

}