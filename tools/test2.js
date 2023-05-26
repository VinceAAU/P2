import fs from "fs";
//import { off } from "process";

let buckets = [];

for(let i = 0; i < 10; i++)
{
    buckets.push(Uint32Array.from({length: 50000}, () => Math.floor(Math.random() * 10000000)));
}
//let inputArray = Uint32Array.from({length: 5000000}, () => Math.floor(Math.random() * 10000000));
console.log("finished making arrays");

console.log(buckets);

function getCharsForCSV(inputArray)
{
    let numberOfDigits = 0;
    for(let i = 0; i < inputArray.length; i ++) { // goes through every element, counts the elements digits and sums them all together
        numberOfDigits += Math.log(inputArray[i]) * Math.LOG10E + 1 | 0;
    }
    numberOfDigits += inputArray.length; // one comma for each number, and the last number has a newline, which is the same length
    return numberOfDigits;
}

function getBucketFileOffsets(allBuckets)
{
    let offsets = []
    let currentOffset = 0;

    offsets[0] = 0; // first bucket should obviously be placed at the start of the file.
    for(let i = 1; i < allBuckets.length; i++)
    {
        currentOffset += getCharsForCSV(allBuckets[i-1]);
        offsets[i] = currentOffset;
    }

    return offsets;
}

function writeBucketToFile(offset, bucket, filePath)
{
    console.log("Opening file!!!");
        fs.open(filePath, 'r+', function(err, fd) {
        if (err) throw err;
      
          const csvString = bucket.join(',') + '\n';
          const buffer = Buffer.from(csvString);
          fs.write(fd, buffer, 0, buffer.length, offset, function(err) {
            if (err) throw err;
          });
        console.log("Closing file!!!");
          fs.close(fd, function(err) {
            if (err) throw err;
          });
      
      });
}
let offsets = getBucketFileOffsets(buckets);
console.log(offsets);
for(let i = 0; i < 10; i++)
{
    writeBucketToFile(offsets[i], buckets[i], "file.csv");
}


/*
for(let i = 0; i < inputArray.length; i ++) {
    numberOfDigits += Math.log(inputArray[i]) * Math.LOG10E + 1 | 0;
}

console.log("DigitsTime: "+ ((new Date().getTime()-time)/1000));
console.log("Digits in numbers: " + numberOfDigits);
const addedCommas = numberOfDigits + inputArray.length; 
console.log("Digits with added commas: "+ addedCommas);

time = new Date().getTime();

Buffer.from(inputArray);
console.log("BufferTime: "+ ((new Date().getTime()-time)/1000));
time = new Date().getTime();
const csvString = inputArray.join(',') + '\n';
console.log("StringTime: "+ ((new Date().getTime()-time)/1000));

console.log(csvString.length);
*/