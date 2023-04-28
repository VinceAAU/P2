import { search_db, search_for_username, update_password } from "./db.js";
export { search, passwords, update }

import NodeCache from "node-cache";
const myCache = new NodeCache( { stdTTL: 100, checkperiod: 120 } );

function search(username) {
    if (search_for_username(username) === false) { 
        throw("no user");
    } else {

        let obj = { user: username};
        let success = myCache.set( "myKey", obj, 10000 );
        console.log("key saved, i think")
    };
};

function passwords(info){
    console.log(info.passwordConfirmation)
    console.log(info.password)
    console.log(info.password==info.passwordConfirmation)
    if(info.password==info.passwordConfirmation){
        console.log("passwords are equal")
        update(info.password);
    } else {throw("passwords_unequal");
    };
}

function update(password){
    let cache = myCache.get( "myKey" );
    if ( cache == undefined ){
        console.log("key not found");
    } else {
        console.log(cache);
    }
    update_password(password, cache.user)
}