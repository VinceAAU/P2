import test from 'ava';
import * as cu from '../../master/createUser.js';

const {validateNewUser, handler} = cu.exportForTesting

// remember to uncomment the return statements in createSecureServer.js

test('Test validateNewUser: Correct information', t => {
  // Test case 1: All fields match
  let user_info = {
    username: '7',
    mail: '7',
    password: '7',
    passwordConfirmation: '7'
  };


  let expectedReturnObject = {
    mail: '7',
    username: '7',
    mail_validity: true,
    user_validity: true,
    password_match: true,
    password: '7'
  };
  t.deepEqual(validateNewUser(user_info), expectedReturnObject);
  });



test('Test validateNewUser: unmatching passwords', t => {
  // Test case 2: Uneven passwords
  let user_info = {
    username: '7',
    mail: '7',
    password: '89',
    passwordConfirmation: '7'
  };
  let expectedReturnObject = {
    mail: '7',
    username: '7',
    mail_validity: true,
    user_validity: true,
    password_match: false
  };
  t.deepEqual(validateNewUser(user_info), expectedReturnObject);
});

test('Test validateNewUser: Existing mail', t => {
  // Test case 2: Uneven passwords
  let user_info = {
    username: '7',
    mail: 'admin',
    password: '7',
    passwordConfirmation: '7'
  };
  let expectedReturnObject = {
    mail: 'admin',
    username: '7',
    mail_validity: false,
    user_validity: true,
    password_match: true,
    password: '7'
  };
  t.deepEqual(validateNewUser(user_info), expectedReturnObject);
});

test('Test validateNewUser: Existing user', t => {
  // Test case 2: Uneven passwords
  let user_info = {
    username: 'admin',
    mail: '7',
    password: '7',
    passwordConfirmation: '7'
  };
  let expectedReturnObject = {
    mail: '7',
    username: 'admin',
    mail_validity: true,
    user_validity: false,
    password_match: true,
    password: '7'
  };
  t.deepEqual(validateNewUser(user_info), expectedReturnObject);
});

test('Test handler: All fields match', t => {
  // Test case 2: Uneven passwords
  let new_user_info = {
    mail: '7',
    username: '7',
    mail_validity: true,
    user_validity: true,
    password_match: true,
    password: '7'
  };
  let expectedReturnObject = {
    mail: '7',
    username: '7',
    password: '7'
  };


  t.deepEqual(handler(new_user_info), expectedReturnObject);
});

test('Test handler: Throw for already existing mail', t => {
  let new_user_info = {
    mail: '7',
    username: '7',
    mail_validity: false,
    user_validity: true,
    password_match: true,
    password: '7'
  };
  const exception = t.throws(() => {
    handler(new_user_info);
  })
  t.is(exception.message, "mail_exists");
});

test('Test handler: Throw for already existing user', t => {
  let new_user_info = {
    mail: '7',
    username: 'admin',
    mail_validity: true,
    user_validity: false,
    password_match: true,
    password: '7'
  };
  const exception = t.throws(() => {
    handler(new_user_info);
  })
  t.is(exception.message, "user_exists");
});

test('Test handler: Throw for non-matching passwords', t => {
  let new_user_info = {
    mail: '7',
    username: 'admin',
    mail_validity: true,
    user_validity: true,
    password_match: false
  };
  const exception = t.throws(() => {
    handler(new_user_info);
  })
  t.is(exception.message, "passwords_unequal");
});