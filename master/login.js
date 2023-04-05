export { user_login_info, create_user, validify_new_user };
  import { userInfo } from "os";
import { fileResponse, requestHandler, } from "../server.js";
import { search_db, insert_values, search_for_username, search_for_mail } from "./db.js";

import fs from 'fs';

const login_path = "worker/login.html";
const createUser_path = "worker/create_user.html";
const jsonPath = "./master/users.json"
const worker_path = "./worker/worker_page.html"

function user_login_info(user_info) {
  console.log(user_info['userName']); //temp
  let userExists = false;
  if (userExists == true) {
    console.log("user exists");
    return (worker_path);
  }
  console.log("no user");
  throw (login_path);
}

function validify_new_user(user_info){
  let return_object = {mail: user_info.mail, username: user_info.userName};
  console.log("validify new user");
  console.log(user_info);
  if(search_for_mail(user_info.mail)==false){ //fix perhaps?
    return_object["mail_validity"] = true;
  }else{
    return_object["mail_validity"] = false;
  };
  if(search_for_username(user_info.userName)==false){
    return_object["user_validity"] = true;
  }else{
    return_object["user_validity"] = false;
  };
  if(user_info.password[0]==user_info.password[1]){
    return_object["password_match"] = true;
    return_object["password"] = user_info.password[0];
  } else {
    return_object["password_match"] = false;
  }

  console.log(user_info.mail);
  console.log(return_object);

  // check if mail
  //reentering og password
}

function create_user(user_info) { //create exception for already existing user

  //(Notes to self) To do:
  // 
  // Verify unique password
  // Read JSON. Check for existing users
  // If none, proceed to upload
  // Fix auth fail
  

  let userExists = true;
  if (userExists == true) {
    console.log("user exists");
    return "success";
  }
  console.log("no user");
  throw (createUser_path);
}


