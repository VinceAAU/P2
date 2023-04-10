import fs from "fs";

export function start_data_stream(path, res)
{
    try{
        const readStream = fs.createReadStream(path); 
        readStream.pipe(res);
        console.log("Begun streaming data");
    }
    catch (e)
    {
        console.log("Couldn't start datastream. Probably because the filepath is wrong");
    }
}