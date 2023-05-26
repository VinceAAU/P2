import fs from "fs";
// Example data to write
// Example Uint32Array to write

const buckets = [];
  
for (let i = 0; i < 10; i++) {
  const start = i * 10 + 1;
  const end = start + 9;
  const array = new Uint32Array(100);
  for (let j = 0; j < 100; j++) {
    array[j] = start + j;
  }
  buckets.push(array);
  console.log(buckets[i]);
}

//console.log("Size is :" +inputArray.byteLength/1000/1000 + " MB");

//for(let i = 0; i < 10; i++) console.log(inputArray[i]);

// Example position to write to (in bytes)
let position = 0;
let time = new Date().getTime();
// Open the file for reading and writing
let file = fs.open('file.csv', 'r+', function(err, fd) {
  if (err) throw err;

  // Create a buffer from the Uint32Array


    const csvString = buckets[i].join(',') + '\n';
    const buffer = Buffer.from(csvString);
    fs.write(fd, buffer, 0, buffer.length, position, function(err) {
      if (err) throw err;
    });
    position += buffer.length;
  
  
  console.log("Time: "+ ((new Date().getTime()-time)/1000));
    // Close the file
  
  console.log("Closing the file...");
    fs.close(fd, function(err) {
      if (err) throw err;
    });

});

function getFilePositions(taskIndex, buckets)
{
    let positions = [];


}

function calculateStringSize(arrayBufferLength)
{

  // IMPORTANT!!!
  // This function assumes the numbers in the array will be seperated by commas followed by a space, and the string ends with a newline
  // If this is not done, data may overlap or be seperated by null values when written onto the file.


}