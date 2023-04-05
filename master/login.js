export { user_login_info, create_user };
import { fileResponse, requestHandler, } from "../server.js";
import { search_db, insert_values } from "./db.js";

import fs from 'fs';

const login_path = "worker/login.html";
const createUser_path = "worker/create_user.html";
const jsonPath = "./master/users.json"
const worker_path = "./worker/worker_page.html"

let newData_String = JSON.stringify(newData); //stringify to convert to json format

function user_login_info(user_info) {
  console.log(user_info['userName']); //temp
  let userExists = true;
  if (userExists == true) {
    console.log("user exists");
    return (worker_path);
  }
  console.log("no user");
  throw (login_path);
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