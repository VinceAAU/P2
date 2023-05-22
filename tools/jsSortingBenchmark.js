let inputArray = Uint32Array.from({ length: 25000000 }, () =>
  Math.floor(Math.random() * 10000000000)
);

// console.log("Unsorted: " + inputArray);

let startTime = new Date().getTime();

function quickSort(left = 0, right = inputArray.length - 1) {
  if (left < right) {
    const pivotIndex = getRandomInt(left, right);
    const pivot = inputArray[pivotIndex];

    const partitionIndex = partition(pivot, left, right);

    quickSort(left, partitionIndex);
    quickSort(partitionIndex + 1, right);
  } else {
    return; //  Base case: array is already sorted (~length less than two).
  }
}

function partition(pivot, left, right) {
  let i = left - 1;
  let j = right + 1;

  while (true) {
    do {
      j--;
    } while (inputArray[j] > pivot);

    do {
      i++;
    } while (inputArray[i] < pivot);

    if (i < j) {
      swap(i, j);
    } else {
      return j;
    }
  }
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function swap(i, j) {
  const temp = inputArray[i];
  inputArray[i] = inputArray[j];
  inputArray[j] = temp;
}

//  Running QuickSort.
quickSort();
let finishedTime = (new Date().getTime() - startTime) / 1000;
console.log("It took " + finishedTime);
console.log(inputArray);
