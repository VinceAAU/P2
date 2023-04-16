import fs from 'fs';
import sqlite3 from 'better-sqlite3';
import Database from 'better-sqlite3';
//import bcrypt from 'bcrypt';
let sql;

const db_path = './data.db';
const db = connect_to_db();

export {connect_to_db, search_db, insert_values, search_for_username, search_for_mail, update_password};

function connect_to_db() {
    if (fs.existsSync(db_path)) {
      console.log("Database initiated");
      const db = new Database(db_path);
      return db; 
    } else {
      try{
        const db = new Database('data.db');
        create_table(db); 
        return db;
      } catch (e) {
        console.error(e);
      };
    };
    console.log("Connection with SQLite has been established");
  };

//Function is only run, if connect_to_db() creates new database
function create_table(db){
    const insert = db.prepare('CREATE TABLE users(id INTEGER PRIMARY KEY,username,email,password)');
    insert.run();
};

function hash(password){
  console.log("hashed password")
  return(password);
}

//For createUser.js
function insert_values(mail, username, password){
  let protectedPassword = hash(password)
    const insert = db.prepare('INSERT INTO users(username,email,password) VALUES (?,?,?)');
    try {
        insert.run(username, mail, protectedPassword);
        console.log(username, mail, protectedPassword);
    } catch (e) {
        console.error(e);
    }    
};

//For login.js
function search_db(searchUsername, searchPassword){
  console.log("srchdb: "+searchUsername, searchPassword)
  const stmt = db.prepare('SELECT * FROM users WHERE username = ?').bind(searchUsername);
  const got = stmt.get(); 

  try{  //If nothing is return with 'better-sqlite3', throws an error, hence the try-statement
    switch (got.password == searchPassword){
      case true: //
        console.log("Welcome "+searchUsername);
        break;
      case false:
        throw("_");
    };
  } catch (e) {
    if(e == "_"){
      throw("wrong-password");
    } else {
    throw("no-user");
    }
  };
};


// Returns true/false    //for the function create_user in login.js
function search_for_mail(srch_m){
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    const mail = stmt.all(srch_m);
    if(mail.length == 0) {
        return false;
    } else return true;
}

// Returns true/false    //for the function create_user in login.js
function search_for_username(srch_u){
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    const username_srch = stmt.all(srch_u);
    if(username_srch.length == 0) {
        return false;
    } else return true;
};

//SQL syntax for updating:
// ('UPDATE table SET column1 = value1 WHERE column2 = value2')
// Better-Sqlite allows for '?' to be placeholders for values to insert in SQL statement
function update_password(new_password, user){
  let protectedPassword = hash(new_password);
  try {
    const stmt = db.prepare('UPDATE users SET password = ? WHERE username = ?');
    const updates = stmt.run(protectedPassword, user);  
  }
  catch{
    throw("update_fail");
  }
};