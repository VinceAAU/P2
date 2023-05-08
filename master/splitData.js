import fs from "fs/promises";
import { getTaskQueueHead } from "./queue.js";

export { BucketList };

class BucketList{
  buckets = [];
  bucketInterval = 0;

  constructor(bucketAmount, bucketSize, dataRange){
    this.bucketSize = bucketSize;
    for (let i = 0; i < bucketAmount; i++) {
      this.buckets[i] = new Bucket(bucketSize);
    }

    this.bucketInterval = dataRange/bucketAmount;
  }

  push(element){
    let bucketIndex = Math.floor(element/this.bucketInterval);

    if (this.buckets[bucketIndex] === undefined) {
      this.buckets[bucketIndex] = new Bucket(this.bucketSize);
      this.buckets[bucketIndex].push(element);
    } else {
      this.buckets[bucketIndex].push(element);
    }
  }

  static bucketAmount(fileSize){
    const targetPayloadSize = 100_000_000; //100 megabytes. Too much? Too little? Idk
  
    //Because we don't send CSV files, but binary arrays, the payload 
    //will actually be about half of the target. This is because my maths 
    //is lazy. FIXME
    return Math.ceil(fileSize/targetPayloadSize);
  }

  static async fromFile(filePath){
    const fileStats = await fs.stat(filePath);
    const fileSize = fileStats.size;

    const bucketAmount = BucketList.bucketAmount(fileSize);

    let bucketList = new BucketList(bucketAmount, 1_000_000_000, 1_000_000_000);
  
    let file_index = 0;
    const buffer_size = 10_000_000;
    const fileHandle = await fs.open(filePath);
    
    let leftoverNumber = 0;
    while(true) {
      console.log(`Buffer at ${file_index}`);

      let buffer = Buffer.alloc(buffer_size);
      let fd_read_return = await fileHandle.read(buffer, 0, buffer_size, file_index);
  
      if(fd_read_return.bytesRead === 0) { //Checks end of file
        break;
      }
  
      let array_buffer = (buffer + '')
                      .replace('\n', ',').replace('\r', ',')
                      .split(',').map((value, uselessOne, uselessTwo) => {
                          return Number(value);
                      });
      
      if(buffer[0]===44 /*comma*/){
        array_buffer[0] = NaN;
      }

      //TODO: Rewrite line to be more clean and not use two tertiary operators
      leftoverNumber = Number( ((leftoverNumber===NaN?'':leftoverNumber) + '').concat(array_buffer[0]) === NaN ? '' : array_buffer[0] );
      bucketList.push(leftoverNumber);
      array_buffer.splice(0, 1);
      leftoverNumber = array_buffer.pop();
      for (let i of array_buffer){
        bucketList.push(i);
      }
  
      file_index += buffer_size;
    }
  
    bucketList.push(leftoverNumber);
  
    fileHandle.close();
    
    const returnList = [];
    for(let bucket of bucketList.buckets){
      bucket.dezeroify();
      returnList.push(bucket.list); //This probably does it in the correct order
    }

    return returnList;
  }

  static fromQueue(){
    return BucketList.fromFile(getTaskQueueHead() + '.csv');
  }
}

class Bucket{
  size = 0;
  list = new Uint32Array();

  constructor(maximumSize){
    this.list = new Uint32Array(maximumSize);
  }

  push(element){
    this.list[this.size] = element;
    this.size++;
  }

  dezeroify(){
    this.list = this.list.slice(0, this.size);
  }
}

// Debugging:
console.log("Pre-call");
const bigData = await BucketList.fromFile("/home/vince/Documents/aau/P2/repo/tools/random_numbers_average.csv"); //adjust file path for debugging.
console.log("Post-call");
console.log(bigData); // Result