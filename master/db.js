import fs from 'fs';
import sqlite3 from 'better-sqlite3';
import Database from 'better-sqlite3';
let sql;

const db_path = './data.db';
const db = connect_to_db();

export {connect_to_db, search_db, insert_values, search_for_username, search_for_mail};

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
    //return db;
  };


function create_table(db){
    const insert = db.prepare('CREATE TABLE users(id INTEGER PRIMARY KEY,username,email,password)');
    insert.run();
    //insert_values("un","em","pw");
};

function insert_values(mail, username, password){
    console.log("insert values");
    const insert = db.prepare('INSERT INTO users(username,email,password) VALUES (?,?,?)');
    try {
        insert.run(mail, username, password);
        console.log("Inserted");
        console.log(mail, username, password);
    } catch (e) {
        console.error(e);
    }    
};

//crooked function, needs explanation
function search_db(srch_un, srch_pw){
  
  const stmt = db.prepare('SELECT * FROM users WHERE username = ?').bind(srch_un);
  const got = stmt.get(); 

  try{  //If nothing is return with 'better-sqlite3', throws an error, hence the try-statement
    switch (got.password == srch_pw){
      case true: //
        console.log("Welcome "+srch_un);
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
  console.log("stuck here?");
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    const username_srch = stmt.all(srch_u);
    if(username_srch.length == 0) {
        return false;
    } else return true;
};