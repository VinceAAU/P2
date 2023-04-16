import { search_db, insert_values, search_for_username, search_for_mail } from "./db.js";
export { validateNewUser };


//Receives data from POST in server.js from create_user.html to be hashed
function hashing(raw_data){ //to be made
    console.log("Hashing"); //blaze it
    let hashed = raw_data; //thats one way to do it
    return(hashed);
  };
  
  
  //Purpose: To look for unique credentials and matching passwords, returns data to be handled
  function validateNewUser(user_info){
    let return_object = {mail: user_info.mail, username: user_info.userName};
    console.log("validify new user");
    console.log(user_info);
    if(search_for_mail(user_info.mail)==false){ //fix perhaps? switch? default case case case case
      return_object["mail_validity"] = true;
    }else{
      return_object["mail_validity"] = false;
    };
    if(search_for_username(user_info.username)==false){
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
    console.log(return_object)
    handler(return_object);
  };
  
  
  //checks the given data for reasons to fail, if none; proceeds to insert data
  function handler(new_user_info){
    switch (true){
      case new_user_info.mail_validity === false:
        throw("mail_exists");
      case new_user_info.user_validity === false:
        throw("user_exists");
      case new_user_info.password_match === false:
        throw("passwords_unequal");
      default:
        console.log("handler: m,u,p: "+new_user_info['mail'])
        insert_values(new_user_info['mail'], new_user_info['username'], new_user_info['password'])
    }; 
  };