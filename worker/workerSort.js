/**
 * The worker takes an array and performs QuickSort on it;
 * returns the array, sorted. 
 */
onmessage = function(e) {
  console.log("Worker: received block of work. ");
  console.log("Unsorted: " + e.data);

  /**
   * Implementation of the QuickSort algorithm. Sorts in-place and uses a random pivot.
   * It is worth noting that QuickSort is performed directly on the data received (e.data).
   * @param {*} left The left-most index.
   * @param {*} right The right-most index.
   * @returns The function does not return anything as it sorts the array in-place.
   */
  function quickSort(left = 0, right = e.data.length - 1) {

    if (left < right) {
      const pivotIndex = getRandomInt(left, right);
      const pivot = e.data[pivotIndex];
  
      const partitionIndex = partition(pivot, left, right);
    
      quickSort(left, partitionIndex);
      quickSort(partitionIndex + 1, right);
    } else {
      return;  //  Base case: array is already sorted (~length less than two).
    }
  }
  
  /**
   * The partition part of QuickSort. It places the pivot at the correct position of the array; 
   * smaller elements are placed before it and larger elements are placed after it in the array.
   * @param {*} pivot The element we are placing at the right index.
   * @param {*} left Renamed 'i' in the code. This is one of two pointers used to scan through the array left to right and right to left.
   * @param {*} right Renamed 'j' in the code. This is the other pointer.
   * @returns The index of the partition point.
   */
  function partition(pivot, left, right) {
    let i = left - 1;
    let j = right + 1;
  
    while (true) {
      do{
        j--;
      } while (e.data[j] > pivot); 

      do {
        i++;
      } while (e.data[i] < pivot);

      if (i < j) {
        swap(i, j);
      } else {
        return j;
      }
    }
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
   * @param {*} i One element, that needs to be switched with another element.
   * @param {*} j --||--
   */
  function swap(i, j) {
    const temp = e.data[i];
    e.data[i] = e.data[j];
    e.data[j] = temp;
  }
  
  //  Running QuickSort.
  quickSort();

  //  Returning the now-sorted array using POST.
  this.postMessage(e.data, [e.data.buffer]);
}