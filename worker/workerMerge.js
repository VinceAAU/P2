/**
 * This worker takes two sorted arrays and merges them.
 * Uses the Merge algorihtm.
 */
onmessage = function(e) {  // Pick one of the implementations.
    console.log("Worker: received block of work. ");
    console.log("Nonmerged: " + e.data[0]);
    
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

    // Fast and "in-place" but technically ~O(n/2) extra space.
    function mergeArraysInPlace(left, right) {
      let i = left.length - 1;
      let j = right.length - 1;
      let k = left.length + right.length - 1; 
      // Considered "in-place" but is not strictly in-place due to the k-index.
    
      while (i >= 0 && j >= 0) {
        if (left[i] > right[j]) {
          left[k--] = left[i--];
        } else {
          left[k--] = right[j--];
        }
      }
    
      while (j >= 0) {
        left[k--] = right[j--];
      } // any remaining elements are added to left
    
      return left;
    }

    
    // Running Merge.
    mergeInPlace(e.data[1], e.data[2]);

    // Returning array using POST.
    postMessage(e.data[0], [e.data[0].buffer]);
}