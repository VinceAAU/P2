import test from 'ava';
import * as db from '../../master/db.js';


const {  hash, 
    connectDB, 
    insertValues, 
    insert, 
    searchDB, 
    searchMail, 
    searchUsername, 
    updatePassword, 
    update} = db.exportForTesting



test('Test hashing',async t=>{
    let password = 'sample password';
    t.assert(password != await hash(password));
});

test('Test search',async t=>{
    let password = 'sample password';
    t.assert(password != await hash(password));
});