/**
 * This worker takes two sorted arrays and merges them.
 * Uses the Merge algorihtm.
 */
onmessage = function(e) {  // Pick one of the implementations.
    console.log("Worker: received block of work. ");
    console.log("Nonmerged: " + e.data[0]);
    
    /*
    // Horribly slow, but in-place.
    function mergeInPlace(leftStart, rightStart) {
      let leftEnd = rightStart - 1;
      let rightEnd = e.data[0].length - 1
    
      while (leftStart <= leftEnd && rightStart <= rightEnd) {
        if (e.data[0][leftStart] <= e.data[0][rightStart]) {
          leftStart++;
        } else {
          let temp = e.data[0][rightStart];
          for (let i = rightStart; i > leftStart; i--) {
            e.data[0][i] = e.data[0][i - 1];
          } // Sacrificing time for space, I guess.
          e.data[0][leftStart] = temp;
          leftStart++;
          rightStart++;
          leftEnd++;
        }
      }
    }

    // Blazingly fast, but O(n) extra space.
    function mergeArrays(left, right) {
      let result = [];
      let i = 0, j = 0;
    
      while (i < left.length && j < right.length) {
        if (left[i] < right[j]) {
          result.push(left[i++]);
        } else {
          result.push(right[j++]);
        }
      }

      return result.concat(left.slice(i)).concat(right.slice(j)); // any remaining elements are concat'ted
    }
    */

    // Fast and "in-place" but technically ~O(n/2) extra space.
    function mergeArraysInPlace() {
      let i = e.data[1].length - 1;
      let j = e.data[2].length - 1;
      let k = e.data[1].length + e.data[2].length - 1; 
      // Considered "in-place" but is not strictly in-place due to the k-index.
    
      while (i >= 0 && j >= 0) {
        if (e.data[1][i] > e.data[2][j]) {
          e.data[1][k--] = e.data[1][i--];
        } else {
          e.data[1][k--] = e.data[2][j--];
        }
      }
    
      while (j >= 0) {
        e.data[1][k--] = e.data[2][j--];
      } // any remaining elements are added to e.data[0]
      
      e.data[2] = []; // replace the second array with an empty array to free memory.
    }

    
    // Running Merge.
    mergeArraysInPlace(e.data[1], e.data[2]); // assuming the received array has 3 values, one bool and two arrays.

    // Returning array using POST.
    postMessage(e.data[1], [e.data[1].buffer]);
}