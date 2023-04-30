/**
 * This worker takes two sorted arrays and merges them.
 * Uses the Merge algorihtm.
 */
onmessage = function(e) {
    console.log("Worker: received block of work. ");
    console.log("Nonmerged: " + e.data[0]);
    
    // Assuming STD data packages of 10 million entries.
    // We probably need a new/separate startWorker() to pass indices.
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
    
    // Running Merge.
    mergeInPlace(e.data[1], e.data[2]);

     //  Returning array using POST.
    postMessage(e.data[0], [e.data[0].buffer]);
}