import test from 'ava';
import sinon from 'sinon';
import * as cu from '../../master/createUser.js';

var stub = sinon.stub();
const {validateNewUser, handler, once} = cu.exportForTesting


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
