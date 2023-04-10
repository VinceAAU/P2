/*  The worker takes an array and performs standard MergeSort on it; 
    returns the sorted array.                                         */

onmessage = function (e) {
  console.log("Worker received unsorted list: " + e.data);

  //  Merges two subarrays of e.data (a left and a right sub-array)
  function merge(l, r) {
    let result = [];            //  Temp array for storing the result.
    let lIndex = rIndex = 0;

    //  Filling the temp array.
    while (lIndex < l.length && rIndex < r.length) {
      if (l[lIndex] < r[rIndex]) {
        result.push(l[lIndex]);
        lIndex++;
      } else {
        result.push(r[rIndex]);
        rIndex++;
      }
    }

    return result.concat(l.slice(lIndex)).concat(r.slice(rIndex));
  }

  function mergeSort(arr) {
    if (arr.length === 1) return arr;

    //  Finding the middle index, the left, and the right indices.
    const m = Math.floor(arr.length / 2);
    const l = arr.slice(0, m);
    const r = arr.slice(m);
    
    return merge(mergeSort(l), mergeSort(r));
  }

  //  Posting the worker result.
  postMessage(mergeSort(e.data, 0, e.data - 1));
};
