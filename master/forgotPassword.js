import { search_db, search_for_username, update_password } from "./db.js";
export { search, passwords, update }

import NodeCache from "node-cache";
const myCache = new NodeCache( { stdTTL: 100, checkperiod: 120 } );


const forgotpassword2_path = "../worker/forgot_password2.html";

function search(username) {
    if (search_for_username(username.userName) === false) { //username (from html side) returns: "userName = xyz" hence username.userName
        console.log('uu: '+username.userName);
        throw("no user");
    } else {

        let obj = { user: username.userName};
        let success = myCache.set( "myKey", obj, 10000 );

        return forgotpassword2_path;
    };
};


function passwords(info){
    if(info.password[0]==info.password[1]){
        return(info.password[0]);
    } else {throw("passwords_unequal");
    };
}

function update(password){
    let cache = myCache.get( "myKey" );
    if ( cache == undefined ){
        console.log("key not found");
    } else {
        console.log(cache);
        console.log("else");
    }
    update_password(password, cache.user)
}