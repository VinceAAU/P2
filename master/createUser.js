import { insert_values, search_for_username, search_for_mail } from "./db.js";
export { validateNewUser };

//Purpose: To look for unique credentials and matching passwords, returns data to be handled
function validateNewUser(user_info) {
  console.log("userinfo: ",user_info)
  let return_object = { mail: user_info.mail, username: user_info.username };
  // console.log("validify new user");
  // console.log('name: ' + user_info.username);
  // console.log('mail: ' + user_info.mail);
  // console.log('pass1: ' + user_info.password);
  // console.log('pass2: ' + user_info.passwordConfirmation);
  if (search_for_mail(user_info.mail) == false) {
    return_object["mail_validity"] = true;
  } else {
    return_object["mail_validity"] = false;
  };
  if (search_for_username(user_info.username) == false) {
    return_object["user_validity"] = true;
  } else {
    return_object["user_validity"] = false;
  };
  if (user_info.password == user_info.passwordConfirmation) {
    return_object["password_match"] = true;
    return_object["password"] = user_info.password;
  } else {
    return_object["password_match"] = false;
  }
  console.log("return object ===: ",return_object)
  //handler(return_object);
  return(return_object);
};


//checks the given data for reasons to fail, if none; proceeds to insert data
function handler(new_user_info) {
  console.log(new_user_info)
  switch (true) {
    case new_user_info.mail_validity === false: //if mail already exists
      throw ("mail_exists");
    case new_user_info.user_validity === false: //if user already exists
      throw ("user_exists");
    case new_user_info.password_match === false: //if passwords dont match
      throw ("passwords_unequal");
    default:
      console.log("handler: m,u,p: " + new_user_info['mail'])
      insert_values(new_user_info['mail'], new_user_info['username'], new_user_info['password'])
  };
};

export const exportForTesting = {
  validateNewUser
}