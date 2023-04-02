export {user_login_info};
import {fileResponse, requestHandler} from "./server.js"

const ValidationError="Validation Error";
const UserNotRecognized="User not recognized";
const path="P2/worker/login.html";

function user_login_info(user_info){
    console.log(user_info['userName']);
    let userExists = true;
    if(userExists == true){
      console.log("user exists");
      return "success";
    }
    console.log("no user");
    throw(path);
  }