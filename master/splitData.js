import fs from "fs/promises";

export { loadBuckets };


/**
 * This function splits a file's values into buckets
 * @param {*} filePath The path to the file that needs to be loaded.
 * @returns An list of buckets
 */
async function loadBuckets(filePath) {
  const buckets = [];
  const bucketAmount = determineBucketAmount(await fs.stat(filePath).size);
  for (int i = 0; i < bucketAmount; i++) buckets[i] = [];
  const dataRange = 1_000_000_000;
  const bucketInterval = dataRange/bucketAmount;

  let file_index = 0;
  const buffer_size = 1_000_000;

  const fileHandle = await fs.open(filePath);
  
  let leftoverNumber = 0;
  while(true) {
    let buffer = Buffer.alloc(buffer_size);
    let fd_read_return = await fileHandle.read(buffer, 0, buffer_size, file_index);

    if(fd_read_return.bytesRead === 0) { 
      break;
    }

    let array_buffer = (buffer + '')
                    .replace('\n', ',').replace('\r', ',')
                    .split(',').map((value, uselessOne, uselessTwo) => {
                        return Number(value);
                    });
    
    leftoverNumber = Number( (leftoverNumber + '').concat(array_buffer[0]) );
    buckets[determineBucket(bucketInterval, leftoverNumber)] = leftoverNumber;
    array_buffer.splice(0, 1);
    leftoverNumber = array_buffer.pop();

    for (let i of array_buffer){
        buckets[determineBucket(bucketInterval, i)].push(i);
    } 

    file_index += buffer_size;
  }

  buckets[determineBucket(bucketInterval, leftoverNumber)] = leftoverNumber;

  fileHandle.close();
  return buckets;
}

function determineBucket(bucketSize, element){
  return Math.floor(element/bucketSize);
}

function determineBucketAmount(fileSize){
  const targetPayloadSize = 100_000_000; //100 megabytes. Too much? Too little? Idk
  
  //Because we don't send CSV files, but binary arrays, the payload 
  //will actually be about half of the target. This is because my maths 
  //is lazy. FIXME
  return Math.ceil(fileSize/targetPayloadSize);
}

