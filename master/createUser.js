import { insertValues, searchUsername, searchMail } from "./db.js";
export { validateNewUser, handler };

//Purpose: To look for unique credentials and matching passwords, returns data to be handled
function validateNewUser(user_info) {
  let return_object = { mail: user_info.mail, username: user_info.username };
  if (searchMail(user_info.mail) == false) {
    return_object["mail_validity"] = true;
  } else {
    return_object["mail_validity"] = false;
  };
  if (searchUsername(user_info.username) == false) {
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
  return(return_object); 
};


//checks the given data for reasons to fail, if none; proceeds to insert data
function handler(new_user_info) {
  switch (true) {
    case new_user_info.mail_validity === false: //if mail already exists
      throw new TypeError ("mail_exists");
    case new_user_info.user_validity === false: //if user already exists
      throw new TypeError("user_exists");
    case new_user_info.password_match === false: //if passwords dont match
      throw new TypeError("passwords_unequal");
    default:
      let obj = {
        mail: new_user_info['mail'], 
        username: new_user_info['username'], 
        password: new_user_info['password']
      }
      return(obj)

  };
};

export const exportForTesting = {
  validateNewUser, handler
}