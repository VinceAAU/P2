export { user_login_info, validify_new_user, handler, hashing};
import { search_db, insert_values, search_for_username, search_for_mail } from "./db.js";

const login_path = "worker/login.html"; //temporary
const worker_path = "./worker/worker_page.html" //temporary

function user_login_info(user_info) {//temporary
  console.log(user_info['userName']); //temp
  let userExists = false;
  if (userExists == true) {
    console.log("user exists");
    return (worker_path);
  }
  console.log("no user");
  throw (login_path);
}

function hashing(raw_data){ //to be made
  console.log("Hashing");
  let hashed = raw_data; //thats one way to do it
  return(hashed);
};

function validify_new_user(user_info){
  let return_object = {mail: user_info.mail, username: user_info.userName};
  console.log("validify new user");
  console.log(user_info);
  if(search_for_mail(user_info.mail)==false){ //fix perhaps? switch? default case case case case
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
  return(return_object);
};


function handler(new_user_info){
  console.log("handler");
  console.log(new_user_info)
  switch (true){
    case new_user_info.mail_validity === false:
      throw("mail_exists");
    case new_user_info.user_validity === false:
      throw("user_exists");
    case new_user_info.password_match === false:
      throw("passwords_inequal");
    default:
      insert_values(new_user_info.mail, new_user_info.username, new_user_info.password)
  }; 
};