import test from 'ava';
import * as cu from '../../master/createUser.js';

const {validateNewUser} = cu.exportForTesting


test('Test validateNewUser', t => {
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
  
    // Test case 2: Different password and passwordConfirmation
    user_info = {
      username: '7',
      mail: '7',
      password: '7',
      passwordConfirmation: '8'
    };
    expectedReturnObject = {
        mail: '7',
        mail_validity: true,
        password: '7',
        password_match: false,
        user_validity: true,
        username: '7',
      }
  
    t.deepEqual(validateNewUser(user_info), expectedReturnObject);
  
    // Add more test cases for different scenarios
  
  });

// test('validateNewUser should return the correct return_object', t => {
//     const user_info = {
//       username: '8',
//       mail: '8',
//       password: '8',
//       passwordConfirmation: '8'
//     };
  
//     const expectedReturnObject = {
//       mail: '8',
//       username: '8',
//       mail_validity: true,
//       user_validity: true,
//       password_match: true,
//       password: '8'
//     };
  
//     // Mock search_for_mail and search_for_username functions
//     const search_for_mail = () => false;
//     const search_for_username = () => false;
  
//     // Mock handler function
//     const handler = return_object => {
//       t.deepEqual(return_object, expectedReturnObject);
//     };
  
//     // Invoke the function under test
//     validateNewUser(user_info);
  
//     // Assertions are handled within the handler function
//   });

