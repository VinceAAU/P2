export {user_login_info, create_user};
import {fileResponse, requestHandler} from "../server.js"

//important fs
import fs from 'fs'




const ValidationError="Validation Error";
const UserNotRecognized="User not recognized";
const login_path="worker/login.html";
const createUser_path="worker/create_user.html";
const jsonPath="./master/users.json"



function readJSON() { //Needs variable inputs
  fs.readFile(jsonPath, 'utf-8', (err, jsonString) => {
    if(err) {
      console.log(err);
    } else {
      try { //try catch will catch any errors from parsing bad json
        const data = JSON.parse(jsonString);
        console.log(data.userName);
        return(data);
      }
      catch (err) {
        console.log('Error parsing JSON', err);
      }
    }
  });
}

function writeToJSON(){
  let newData = {
    userName: "a",
    mail: "b",
    password:"c"
  };

  let newData_String = JSON.stringify(newData); //stringify to convert to json format

  fs.readFile(jsonPath, 'utf-8', (err, jsonString) => { //Parsing Json file to jsonString, and potential error as err
    if(err) {
      console.log(err);
    } else {
      let oldData = JSON.parse(jsonString); //Initializing old data, as to not overwrite
      let oldData_string = JSON.stringify(oldData); //Stringifying
      let oldData_string_insert = oldData_string.replace(']',',');
      let newData_String_insert = newData_String + ']';

      console.log(oldData_string_insert+newData_String_insert);

      let dataToInsert = oldData_string_insert+newData_String_insert;

      fs.writeFile(jsonPath, dataToInsert, err => {
        if (err) {
          console.log('An error occurred, while uploading to JSON '+err);
        }
      })
    
      }
  });
}



function user_login_info(user_info){
  //readJSON() //temp
   //temp

  console.log(user_info['userName']); //temp
  let userExists = true;
  if(userExists == true){
    console.log("user exists");
    return "success";
  }
  console.log("no user");
  throw(login_path);
  }


function create_user(user_info){ //create exception for already existing user
  //let specify = userName;
  //console.log(readJSON());

  //(Notes to self) To do:
  // 
  // Verify unique password
  // Read JSON. Check for existing users
  // If none, proceed to upload
  // Fix auth fail


  let userExists = true;
  if(userExists == true){
    console.log("user exists");
    return "success";
  }
  console.log("no user");
  throw(createUser_path);
}