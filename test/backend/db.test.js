import test from 'ava';
import * as dbt from '../../master/db.js';

import fs from 'fs';
import sqlite3 from 'better-sqlite3';
import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
let sql;


const { hash,
    connectDB,
    insertValues,
    insert,
    searchDB,
    searchMail,
    searchUsername,
    updatePassword,
    update,
    getDB } = dbt.exportForTesting
const db = connectDB()


test('Test hashing', async t => {
    let password = 'sample password';
    t.assert(password != await hash(password));
});

test('Test searchDB: With existing username', async t => {
    let username = 'admin'; //existing user
    let password = 'admin'; //must be correct password

    let expectedOutput = username
    t.assert(expectedOutput === await searchDB(username, password));
});

test('Test searchDB: Without existing username', async t => {
    let username = 'doesNotExist'; //non-existing user
    let password = 'admin';

    const exception = await t.throwsAsync(async () => {
        await searchDB(username, password);
    });
    t.is(exception.message, 'no-user');
});

test('Test searchDB: Wrong password', async t => {
    let username = 'admin'; //existing user
    let password = 'wrongPassword'; //wrong password

    let expectedOutput = username;
    const exception = await t.throwsAsync(async () => {
        await searchDB(username, password);
    });
    t.is(exception.message, 'invalid-password');
});

test('Test insert', t => {
    let username = 'test-username';
    let email = 'test-email';
    let password = 'test-password';

    insert(email, username, password); // has already been called

    const stmt = db.prepare('SELECT * FROM users WHERE username = ? AND email = ? AND password = ?');
    const result = stmt.get(username, email, password);

    if (!result) {
        t.fail();
    } else {
        t.pass()
    }
});

test('Test update', t => {
    let forUser = 'update-password'
    let dummymail = '_'
    let oldP = 'old-password';
    let newP = 'new-password'

    insert(dummymail, forUser, oldP); // has already been called
    update(newP, forUser)

    const stmt = db.prepare('SELECT * FROM users WHERE username = ? AND email = ? AND password = ?');
    const result = stmt.get(forUser, dummymail, newP);

    if (!result) {
        t.fail();
    } else {
        t.pass()
    }
});

test('Test searchUsername: for existing user', t => {
    let existingUser = 'admin';
    t.deepEqual(searchUsername(existingUser), true);
});

test('Test searchUsername: for non-existing user', t => {
    let nonExistingUser = 'no-user';
    t.deepEqual(searchUsername(nonExistingUser), false);
});

test('Test searchMail: for existing mail', t => {
    let existingMail = 'admin';
    t.deepEqual(searchMail(existingMail), true);
});

test('Test searchMail: for non-existing mail', t => {
    let nonExistingMail = 'no-mail';
    t.deepEqual(searchMail(nonExistingMail), false);
});