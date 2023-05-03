import fs from 'fs/promises'

/**
 * This function loads a file into memory, inside a Uint32Array.
 * @param {*} filePath The path to the file that needs to be loaded.
 * @returns The Uint32Array containing the CSV-file's data.
 */
async function loadFileToArray(filePath) {

    let numbers_array = new Uint32Array(1_000_000_000);
    let numarray_index = 0;
    let file_index = 0;
    const buffer_size = 1_000_000;

    const fileHandle = await fs.open(filePath);

    while(true) {
        let buffer = Buffer.alloc(buffer_size);
        let fd_read_return = await fileHandle.read(buffer, 0, buffer_size, file_index);

        if(fd_read_return.bytesRead === 0) { 
            break;
        }

        let array_buffer = (buffer + '')
                        .replace('\n', ',').replace('\r', ',')
                        .split(',').map((value, fuck, you) => {
                            return Number(value);
                        });
        
        numbers_array[numarray_index] = Number((numbers_array[numarray_index] + '').concat(array_buffer[0]));
        array_buffer.splice(0, 1);

        for (let i of array_buffer){
            numarray_index++;
            numbers_array[numarray_index] = i;
        } 

        file_index += buffer_size;
    }

    numbers_array = numbers_array.slice(0, numarray_index + 1);
    return numbers_array;
}