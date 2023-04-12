
//  The following actions are illegal and purely for educational purposes.

export { splitData };
import fs from "fs";

function splitData(path) {
    let all_data = [];
    fs.readFile(path, function (err, data) {
        if (err) throw err;
        all_data += data;
      });
      return all_data;
}
