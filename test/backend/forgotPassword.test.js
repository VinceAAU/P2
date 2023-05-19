import test from 'ava';
import sinon from 'sinon';
import * as fp from '../../master/forgotPassword.js';

let { search, passwords, userCache, getMyCache } = fp.exportForTesting;
import NodeCache from "node-cache";
const myCache = new NodeCache( { stdTTL: 100, checkperiod: 120 } ); //TTL and checkperiod in seconds

//If tests fail, remember to un-comment the return statements within the forgotPassword.js


test('Test search: With user', t => {
    const expectedReturn = 'User found';
    const searchFor = "admin" //Already existing user
  
  
    t.deepEqual(search(searchFor), expectedReturn);
  });

test('Test search: Without user', t => {
    //const expectedReturn = 'User found';
    const searchFor = "notARealUser" //Not existing existing user
  
    const exception = t.throws(() => {
        search(searchFor);
      })
    t.is(exception.message, "noUser");
   });

test('Test passwords: Matching passwords', t => {
    const info = {
        password: 'identical',
        passwordConfirmation: 'identical'
    }
    const expectedReturn = info.password;
  
    t.deepEqual(passwords(info), expectedReturn);
   });

test('Test passwords: Not matching passwords', t => {
    const info = {
        password: 'identical',
        passwordConfirmation: 'not-identical'
    }
    //const expectedReturn = info.password;
  
    const exception = t.throws(() => {
        passwords(info);
      })
      t.is(exception.message, "passwords_unequal");
   });

test('Test userCache: existing cache', t => {
    const info = {
        password: 'identical',
        passwordConfirmation: 'identical'
    }
    let returnObj = 'admin'; //saved to cache in first test

    t.deepEqual(userCache(info.password), info.password, returnObj);
   });

test('Test userCache: Cleared cache', t => {
    let gettingMyCache = getMyCache();
    const info = {
        password: 'identical',
        passwordConfirmation: 'identical'
    }

    let returnObj = undefined;
    
    try{
        let success = gettingMyCache.del("myKey");
    }catch {
        t.fail();
    }
    const exception = t.throws(() => {
        userCache(info.password);
      })
      t.is(exception.message, "noKey");
   });