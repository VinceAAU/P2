import fs from "fs";

export function start_data_stream(path, res) {

    fs.access(path, (err) => { // makes sure the server doesn't crash, if given an incorrect path
        if (!err) {
            const readStream = fs.createReadStream(path);
            readStream.pipe(res);
            console.log("Begun streaming data");
        } else {
            
            console.error(`${path} does not exist, or is not accessible`);
        }
    });

}