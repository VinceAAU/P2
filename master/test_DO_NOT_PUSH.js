import fs from 'fs/promises'
import { exit } from 'process';

const file_path = "/home/vince/Documents/aau/P2/repo/tools/random_numbers.csv";

const numbers_array = [0];

const fd = await fs.open(file_path);

let current_file_index = 0;

const buffer_size = 100_000;

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
    
    
    numbers_array.push( Number((numbers_array.pop()+'').concat(array_buffer[0])));
    array_buffer.splice(0, 1);

    try{
        for (let i of array_buffer){
            numbers_array.push(i);
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