import { search_for_username, update_password } from "./db.js";
export { search, passwords, userCache };

//Cache parameters
import NodeCache from "node-cache";
const myCache = new NodeCache( { stdTTL: 100, checkperiod: 120 } ); //TTL and checkperiod in seconds

//Searches if the user exists in the database, returns throw if no user is found
function search(username) {
    if (search_for_username(username) === false) { 
        throw new TypeError ("noUser");
    } else {
        let obj = { user: username};
        let success = myCache.set( "myKey", obj, 10000 );
        return("User found")
    };
};

//Checking for equal passwords before updating the database
function passwords(info){
    if(info.password==info.passwordConfirmation){
        console.log("Equal passwords: ",info.password==info.passwordConfirmation);
        userCache(info.password);
    } else {throw new TypeError("passwords_unequal");
    };
};

//Function for retrieving username from cache
function userCache(password){ 
    let cache = myCache.get( "myKey" );
    if ( cache === undefined ){
        console.log("key not found");
        throw new TypeError("noKey")
    } else {
        console.log(cache);
        update_password(password, cache.user);
    };
};

export const exportForTesting = {
    search, passwords, userCache
  }