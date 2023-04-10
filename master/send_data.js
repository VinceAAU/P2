import fs from "fs";

function start_data_stream(path, res)
{
    const readStream = fs.createReadStream(path); 
    readStream.pipe(res);
    console.log("Begun streaming data");
}