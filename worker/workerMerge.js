/**
 * This worker takes two sorted arrays and merges them.
 * Uses the Merge algorihtm.
 */
onmessage = function(e) {
    console.log("Worker: received block of work. ");
    console.log("Unsorted: " + e.data);

    // Assuming STD data packages of 10 million entries.
    // We probably need a new/separate startWorker() to pass indices.
    function mergeInPlace(leftStart = 0, rightStart = 9999999, rightEnd = e.data.length - 1) {
        let leftEnd = rightStart - 1;
      
        while (leftEnd > leftStart && rightEnd > rightStart) {
          if (e.data[rightStart] > e.data[leftStart]) {
            leftStart++;
          } else {
            let temp = e.data[rightStart];
            for (let i = rightStart; i > leftStart; i--) {
              e.data[i] = e.data[i - 1];
            } // Sacrificing time for space, I guess.
            e.data[leftStart] = temp;
            leftStart++;
            rightStart++;
            leftEnd++;
          }
        }
      }
    
    // Running Merge.
    mergeInPlace();

     //  Returning array using POST.
    this.postMessage(e.data, [e.data.buffer]);
}