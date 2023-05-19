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
        //{n: undefined, expectedBucket: NaN},
        //{n: 'Why are you even reading this test', expectedBucket: NaN},
        //{n: 12.125, expectedBucket: 1},
        //{n: null, expectedBucket: NaN}
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
            finalArray[finalArrayIndex] = Number(n);
            finalArrayIndex++;
        }
    }

    await fh.close();

    return finalArray;
}

function generateBucketlistFromNumbers(bucketNumber, numbers) {
    const bl = new sd.BucketList(bucketNumber, 100_000_000, 1_000_000_000);
    for (let number of numbers){
        bl.push(number);
    }
    const returnList = [];
    for(let bucket of bl.buckets){
      bucket.dezeroify();
      returnList.push(bucket.list); //This probably does it in the correct order
    }

    return returnList;
}

test('File loader', async t => {

    const testfilename = 'test_file.csv';
    const elementAmount = 10_000_000;
    //`numbers` is a Uint32Array of all the numbers written to CSV
    const numbers = await generateCSVData(testfilename, elementAmount); //This should create 4 buckets
    

    const bucketsFromFile = await sd.BucketList.fromFile(testfilename);

    const bucketsFromNumbers = generateBucketlistFromNumbers(bucketsFromFile.length, numbers);

    const testBufferSize = 100;

    for(let i in bucketsFromNumbers){
        for(let j=0; j<bucketsFromNumbers[i].length; j+=testBufferSize){
            t.deepEqual(bucketsFromFile[i].slice(j, j+testBufferSize).toString(),
                     bucketsFromNumbers[i].slice(j, j+testBufferSize).toString(),
                     `The bucket ${i} is wrong between ${j} and ${j+testBufferSize}`);
        }
    }

    await fs.unlink(testfilename); //Clean up after myself
});
