import fs from 'fs/promises'
import { exit } from 'process';

const file_path = "/home/vince/Documents/aau/P2/repo/tools/random_numbers.csv";

const numbers_array = new Uint32Array(1_000_000_000);
numbers_array[0] = 0;
let   current_numarray_index = 0;

const fd = await fs.open(file_path);

let current_file_index = 0;

const buffer_size = 1_000_000;

console.log(fd);

while(true){
    let buffer = Buffer.alloc(buffer_size);
    let fd_read_return = await fd.read(buffer, 0, buffer_size, current_file_index);

    if(fd_read_return.bytesRead === 0)
        break;
    

    let array_buffer = (buffer + '')
                    .replace('\n', ',').replace('\r', ',')
                    .split(',').map((value, fuck, you) => {
                        return Number(value);
                    });
    
    
    numbers_array[current_numarray_index] = Number((numbers_array[current_numarray_index] + '').concat(array_buffer[0]));
    array_buffer.splice(0, 1);

    try{
        for (let i of array_buffer){
            current_numarray_index++;
            numbers_array[current_numarray_index] = i;
        } 
    } catch (err) {
        console.log(`Error ${err}`);
        console.log(`With data ${numbers_array.length}, ${array_buffer.length}`);
        exit();
    }

    current_file_index += buffer_size;

    if(current_file_index%10000_000 === 0)
        console.log(current_file_index);
}

console.log(numbers_array);