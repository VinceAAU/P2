import fs from 'fs/promises'

const file_path = "/home/vince/Downloads/random_numbers_90.csv";

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
                    .split(',');
    
    
    numbers_array.push( (numbers_array.pop()+'').concat(array_buffer[0]));
    array_buffer.splice(0, 1);

    numbers_array.push(...array_buffer);
    

    current_file_index += buffer_size;
}

console.log(numbers_array);