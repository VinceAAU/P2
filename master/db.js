import fs from 'fs';
import sqlite3 from 'better-sqlite3';
import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
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

//Purpose: To hash new passwords, before uploading to db
async function hash(password){
  try{
    let hashedPassword = await bcrypt.hash(password, 10); //10 = salt - further explanation due
    return(hashedPassword);
  }catch (err){
    console.error(err)
  }
}

//For createUser.js
function insert_values(mail, username, password){
  hash(password)
  .then(protectedPassword => insert(mail, username, protectedPassword))
  .catch(err => console.log(err))
};

function insert(mail, username, password){
  const insert = db.prepare('INSERT INTO users(username,email,password) VALUES (?,?,?)');
    try {
        insert.run(username, mail, password);
    } catch (e) {
        console.error(e);
    }  
}

//For login.js
async function search_db(searchUsername, searchPassword){
  const stmt = db.prepare('SELECT * FROM users WHERE username = ?').bind(searchUsername);
  const got = stmt.get(); 

  try{
    if(await bcrypt.compare(searchPassword, got.password)==true){ //function to unhash, with salt and compare with got.password
      return(searchUsername);
    }
    else {
      throw("wrong-password")
    }
  } catch {
    throw("no-user")
  }
};

// Returns true/false    //for the function create_user in createUser.js
function search_for_mail(mailSearch){
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    const mail = stmt.all(mailSearch);
    if(mail.length == 0) {
        return false;
    } else return true;
}

// Returns true/false    //for the function create_user in login.js
function search_for_username(username){
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    const usernameSearch = stmt.all(username);
    if(usernameSearch.length == 0) {
        return false;
    } else return true;
};

//SQL syntax for updating:
// ('UPDATE table SET column1 = value1 WHERE column2 = value2')
// Better-Sqlite allows for '?' to be placeholders for values to insert in SQL statement
function update_password(new_password, user){
  console.log(user)
  hash(new_password)
  .then(protectedPassword => update(protectedPassword, user))
  .catch(err => console.log(err))
};

function update(password, user){
  try {
    const stmt = db.prepare('UPDATE users SET password = ? WHERE username = ?');
    const updates = stmt.run(password, user);  
  }
  catch (err){
    throw(err);
  }
}

export const exportForTesting = {
  hash
}