import { search_db, search_for_username } from "./db.js";
import { forgotpassword2_path } from "../server.js"
export { search }


function search(username) {
    if (search_for_username(username.userName) === false) { //username (from html side) returns: "userName = xyz" hence username.userName
        throw("no user");
    } else {
        return forgotpassword2_path;
    }
}
