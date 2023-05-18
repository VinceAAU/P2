import { insert_values, search_for_username, search_for_mail } from "./db.js";
export { validateNewUser };

//Purpose: To look for unique credentials and matching passwords, returns data to be handled
function validateNewUser(user_info) {
  let return_object = { mail: user_info.mail, username: user_info.username };
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
  handler(return_object);
  //return(return_object);
};


//checks the given data for reasons to fail, if none; proceeds to insert data
function handler(new_user_info) {
  console.log(new_user_info)
  switch (true) {
    case new_user_info.mail_validity === false: //if mail already exists
      throw new TypeError ("mail_exists");
    case new_user_info.user_validity === false: //if user already exists
      throw new TypeError("user_exists");
    case new_user_info.password_match === false: //if passwords dont match
      throw new TypeError("passwords_unequal");
    default:
      console.log("handler: m,u,p: " + new_user_info['mail'])
      insert_values(new_user_info['mail'], new_user_info['username'], new_user_info['password'])
      //return(new_user_info['mail'], new_user_info['username'], new_user_info['password'])
  };
};

function once(fn) {
  var returnValue,
    called = false;
  return function () {
    if (!called) {
      called = true;
      returnValue = fn.apply(this, arguments);
    }
    return returnValue;
  };
}

export const exportForTesting = {
  validateNewUser, handler, once
}

// test("calls the original function", t=> {
//   var callback = sinon.fake();
//   var proxy = once(callback);

//   proxy();

//   t.assert(callback.called);
// });