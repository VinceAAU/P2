import test from 'ava';
import fs from 'fs/promises';
import * as sd from '../../master/splitData.js';
import crypto from 'crypto';
const { Bucket } = sd.exportForTesting;

test('BucketList.push (randomised)', t => {
    const dataRange = 1_000_000_000; 
    const bucketsAmount = 10;
    const numbersAmount = 20; //Amount of numbers to generate

    const numbers = [];

    for(let i = 0; i<numbersAmount; i++){
        numbers.push(Math.floor(Math.random()*dataRange)); //Low quality randomness, but good enough for testing
    }

    const bl = new sd.BucketList(bucketsAmount, numbersAmount, dataRange);

    for (let n of numbers){
        bl.push(n);
    }

    for(let n of numbers){
        const bucketIndex = Math.floor(n/(dataRange/bucketsAmount));
        const place = bl.buckets[bucketIndex].list.find((i)=>{return i==n});
        t.true(
            place!==undefined, 
            `Element ${n} is in bucket ${bucketIndex} at index ${place}`
        );
    }
});

test('BucketList.push (predetermined)', t=> {
    const bl = new sd.BucketList(10, 100000, 100);

    const numbers = [
        {n: 20, expectedBucket: 2},
        {n: 10, expectedBucket: 1},
        {n:  0, expectedBucket: 0},
        {n:  1, expectedBucket: 0},
        {n:  9, expectedBucket: 0},
        {n: 99, expectedBucket: 9},
        {n: undefined, expectedBucket: NaN},
        {n: 'Why are you even reading this test', expectedBucket: NaN},
        {n: 12.125, expectedBucket: 1},
        {n: null, expectedBucket: NaN}
    ]

    for(let number of numbers){
        bl.push(number.n);
    }
    for(let number of numbers){
        for(let i in bl.buckets){
            if(i === number.expectedBucket){
                t.true(bl.buckets[i].list.find((i)=>{return i==numbers.n}) !== undefined);
            } else {
                t.false(bl.buckets[i].list.find((i)=>{return i==numbers.n}) !== undefined);
            }
        }
    }
});

test('Dezeroifier', t => {
    const targetSize = Math.round(Math.random()*1_000); //Up to a thousand numbers
    const bucketSize = 1_000_000_000;

    const bucket = new Bucket(bucketSize);

    for(let i = 0; i < targetSize; i++){
        bucket.push(
            Math.random() * (Math.pow(2, 32)-1)
        );
    }

    t.is(bucket.size, targetSize);
    
    bucket.dezeroify();

    t.is(bucket.list.length, targetSize);
});

function generateRow(elements, maxValue){
    const row = [];

    for(let i = 0; i < elements; i++){
        row.push(
            Math.floor(Math.random()*maxValue)
        );
    }

    return row.join(',');
}

async function generateCSVData(filename, elementAmount){
    const finalArray = new Uint32Array(elementAmount);
    let finalArrayIndex = 0;

    const maxNumber = 1_000_000_000;

    const columns = 100_000;
    const rows = elementAmount/columns; //Idk what happens if columns doesn't divide elementAmount

    const fh = await fs.open(filename, 'w');

    for(let y = 0; y < rows; y++){
        let row = generateRow(columns, maxNumber);
        await fh.write(row + '\n');
        for(let n of row.split(',')){
            finalArray[finalArrayIndex] = n;
            finalArrayIndex++;
        }
    }

    await fh.close();

    return finalArray;
}

function generateBucketlistFromNumbers(bucketNumber, numbers) {
    const bl = new sd.BucketList(bucketNumber, 100_000_000, 1_000_000_000); //The 4 is just to simulate reality
    console.log("pushing numbers");
    for (let number of numbers){
        bl.push(number);
    }
    console.log('dezeroifying');
    const returnList = [];
    for(let bucket of bl.buckets){
      bucket.dezeroify();
      returnList.push(bucket.list); //This probably does it in the correct order
    }
    console.log('dezeroified');

    return returnList;
}

const hashBuckets = false;

//This test takes a while to run. Good thing ava runs tests in parallel!
//It will time out after five minutes
//Oh, it also takes up all your ram. Might fix it later. Probably won't
test('File loader', async t => {
    //Default timeout is 10 seconds, which is way less than what I need
    t.timeout(5*60_000, "Get a faster computer lol");

    const testfilename = 'test_file.csv';
    const elementAmount = 100_000_00;
    //`numbers` is a Uint32Array of all the numbers written to CSV
    const numbers = await generateCSVData(testfilename, elementAmount); //This should create 4 buckets
    

    const bucketsFromFile = await sd.BucketList.fromFile(testfilename);
    //Hash the data to reduce memory usage
    if(hashBuckets){
        for (let i in bucketsFromFile){
            bucketsFromFile[i] = crypto.createHash('md5').update(bucketsFromFile[i]).digest('hex');
        }
    }

    const bucketsFromNumbers = generateBucketlistFromNumbers(bucketsFromFile.length, numbers);
    //Hash the data to reduce memory usage
    if(hashBuckets){
        for (let i in bucketsFromNumbers){
            bucketsFromNumbers[i] = crypto.createHash('md5').update(bucketsFromNumbers[i]).digest('hex');
        }
    }

    for(let i in bucketsFromNumbers){
        t.is(bucketsFromFile[i], bucketsFromNumbers[i]);
    }
});