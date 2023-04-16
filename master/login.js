export { user_login};
import { search_db } from "./db.js";


//Purpose: To send data to be verified to database search function
function user_login(user_info) {
  console.log(user_info);
  search_db(user_info['username'], user_info['password']);
};


