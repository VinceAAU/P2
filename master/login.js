export { user_login};
import { search_db } from "./db.js";
import {asyncThrow} from '../server.js'


function user_login(user_info){
  tryDis(user_info)
  .catch(err => {throw(err);});
};


//Purpose: To send data to be verified to database search function
async function tryDis(user_info) {
  console.log(user_info);
  try {
    console.log(search_db(user_info['username'], user_info['password']))
    //.catch(err => {
    //  console.log("login.js: async catch")
    //  throw(err);});
  } catch (e) {
    console.log("login.js: catch")
    throw(e);
  }
  
    //.catch(err => {throw(err);});
};



