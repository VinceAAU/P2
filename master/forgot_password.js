import { search_db, search_for_username } from "./db.js";
export { search }

const forgotpassword2_path = "../worker/forgot_password2.html";

function search(username) {
    if (search_for_username(username.userName) === false) { //username (from html side) returns: "userName = xyz" hence username.userName
        throw("no user");
    } else {
        return forgotpassword2_path;
    }
}
