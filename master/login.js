export {user_login_info};
import {fileResponse, requestHandler} from "./server.js"

//important fs
import fs from 'fs'




const ValidationError="Validation Error";
const UserNotRecognized="User not recognized";
const path="P2/worker/login.html";



function user_login_info(user_info){

  console.log("Supposed to read Json --------------");
  fs.readFile('./master/users.json', 'utf-8', (err, jsonString) => {
    if(err) {
      console.log(err);
    } else {
    console.log(jsonString);
    }
  });
  console.log("Supposed to  stop readingread Json --------------");

  console.log(user_info['userName']);
  let userExists = true;
  if(userExists == true){
    console.log("user exists");
    return "success";
  }
  console.log("no user");
  throw(path);
  }