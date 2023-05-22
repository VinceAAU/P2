import fs from "fs/promises";
import path from "path";
import { getTaskQueueHead } from "./queue.js";

export { BucketList };

class  BucketList
{
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
      throw new Error(`Element ${element} is out of bounds, tried bucket ${bucketIndex}`)
    } else {
      this.buckets[bucketIndex].push(element);
    }
  }

  /**
   * None of these parameters need to be exact, since the payload won't 
   * be at the exact target size anyway
   * @param elementAmount The amount of elements you have
   * @param elementSize The average size of each element
   * @returns The amount of buckets you need
   */
  static bucketAmount(elementAmount, elementSize){
    const targetPayloadSize = 100_000_000; //100 megabytes. Too much? Too little? Idk

    return Math.ceil((elementAmount*elementSize)/targetPayloadSize);
  }

  static async fromFile(filePath){
    const fileStats = await fs.stat(filePath);
    const fileSize = fileStats.size;

    const bucketAmount = BucketList.bucketAmount(fileSize/10 /*The average size of each element is 9.89 bytes*/, 4);

    const maxBucketSize = 100_000_000; //Arbitrarily chosen
    const dataRange = 1_000_000_000;

    let bucketList = new BucketList(bucketAmount, maxBucketSize, dataRange);
  
    let file_index = 0;
    const buffer_size = 10_000_000;
    const fileHandle = await fs.open(filePath);
    console.log(`Beginning to read file ${path.basename(filePath)}`);
    
    let leftoverNumber = '';
    while(true) {

      let buffer = Buffer.alloc(buffer_size);
      let fd_read_return = await fileHandle.read(buffer, 0, buffer_size, file_index);
      console.log(`Buffer at ${file_index}, there are ${bucketList.buckets.length} buckets`);
  
      if(fd_read_return.bytesRead === 0) { //Checks end of file
        break;
      }
      let string_buffer = buffer.toString('utf-8', 0, fd_read_return.bytesRead);
      string_buffer = string_buffer.replaceAll('\n', ',');
      string_buffer = string_buffer.replaceAll('\r', '');
      let array_buffer = string_buffer.split(',');

      
      leftoverNumber = leftoverNumber.concat(array_buffer[0]);
      bucketList.push(leftoverNumber);
      array_buffer.splice(0, 1);
      leftoverNumber = array_buffer.pop();
      for (let i of array_buffer){
        bucketList.push(Number(i));
      }
  
      file_index += buffer_size;
    }
  
    fileHandle.close();
    console.log(`Finished reading file ${path.basename(filePath)}`);
    
    const returnList = [];
    for(let bucket of bucketList.buckets){
      bucket.dezeroify();
      returnList.push(bucket.list); //This probably does it in the correct order
    }

    return returnList;
  }

  static async fromQueue() {
    let timeLoadBuffer = new Date().getTime();
    let taskQHead = await getTaskQueueHead();

    if(taskQHead===null || taskQHead==='') return null;
    const result = await BucketList.fromFile("master/autogeneratedFiles/csvFiles/" + taskQHead);
    console.log("Loading buffers took took: " + ((new Date().getTime() - timeLoadBuffer)/1000) + " seconds" );
    return result
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

export const exportForTesting = { Bucket };