/*  The worker takes an array and performs QuickSort on it; 
    returns the array, sorted.                               */

onmessage = function(e) {
  console.log("Worker: received block of work. ");
  console.log("Unsorted: " + e.data);

  let amountOfRecursions = 0; //  Keeping track of how many times QuickSort is called, for science!

  /**
   * Implementation of the QuickSort algorithm. Sorts in-place and uses a random pivot.
   * @param {*} arr The array to sort, in-place.
   * @param {*} left The left-most index.
   * @param {*} right The right-most index.
   * @returns The function does not return anything as it sorts the array in-place.
   */
  function quickSort(arr, left = 0, right = arr.length - 1) {

    //  Base case: array is already sorted (~length less than two).
    if (left >= right) {
      return; //  Stops the recursive call-chain.
    }
    
    //  Choosing a random pivot to decrease likelihood of worst-case running time.
    const pivotIndex = getRandomInt(left, right);
    const pivot = arr[pivotIndex];

    //  ------------------------ For debugging. ------------------------
    console.log(`Pivot for run #${amountOfRecursions} is ${pivotIndex}`); 
    amountOfRecursions++;

    //  Partition the array into two subarrays.
    const partitionIndex = partition(arr, pivot, left, right);
  
    //  Recursively sort the subarrays.
    quickSort(arr, left, partitionIndex - 1);
    quickSort(arr, partitionIndex, right);
  }
  
  /**
   * The partition part of QuickSort. It places the pivot at the correct position of the array; 
   * smaller elements are placed before it and larger elements are placed after it in the array.
   * @param {*} arr 
   * @param {*} pivot 
   * @param {*} left Renamed 'i' in the code. This is one of two pointers used to scan through the array left to right and right to left.
   * @param {*} right Renamed 'j' in the code. This is the other pointer.
   * @returns The index of the partition point.
   */
  function partition(arr, pivot, left, right) {

    //  Move elements smaller than pivot to the left, and elements larger than the pivot to the right.
    let i = left;
    let j = right;
  
    while (i <= j) {
      //  Next element from the left that - is greater than or equal to pivot.
      while (arr[i] < pivot) {
        i++;
      }
  
      //  Next element from the right - that is less than or equal to pivot.
      while (arr[j] > pivot) {
        j--;
      }
  
      //  Swap the elements if they are in the wrong order.
      if (i <= j) {
        swap(arr, i, j);
        i++;
        j--;
      }
    }
  
    //  Return the index of the partition point.
    return i;
  }
  
  /**
   * Getting a random integer from the specific range (in this case, defined by the left and right indices).
   * @param {*} min The lower bound of the range.
   * @param {*} max The upper bound of the range.
   * @returns A random integer from the range (min and max included).
   */
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  /**
   * Swaps element indices. Note: In-place; it manipulates the given array, thusly, it does not return anything.
   * @param {*} arr An array that needs elements swapped.
   * @param {*} i One element, that needs to be switched with another element.
   * @param {*} j --||--
   */
  function swap(arr, i, j) {
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  
  //  Running QuickSort, in-place on the provided array.
  quickSort(e.data);

  //  Returning the now-sorted array using POST.
  this.postMessage(e.data, [e.data.buffer]);

  //  Logging the amount of times QuickSort was called, for fun (also somewhat informative).
  console.log(`QuickSort ran ${amountOfRecursions} recursive calls. `);
}