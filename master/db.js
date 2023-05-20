import fs from 'fs';
import sqlite3 from 'better-sqlite3';
import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
let sql;

const db_path = './data.db';
const db = connectDB();

export {connectDB, searchDB, insertValues, searchUsername, searchMail, updatePassword};

function connectDB() {
    if (fs.existsSync(db_path)) {
      console.log("Database initiated");
      const db = new Database(db_path);
      return db; 
    } else {
        const db = new Database('data.db');
        console.log("Database created");
        const insert = db.prepare('CREATE TABLE users(id INTEGER PRIMARY KEY,username,email,password)');
        insert.run(); 
        console.log(db.name);
        return db;
    };
  };

//Purpose: To hash new passwords, before uploading to db
async function hash(password){
  let hashedPassword = await bcrypt.hash(password, 10); //10 = salt - further explanation due
  return(hashedPassword);
}

//For createUser.js
function insertValues(mail, username, password){
  hash(password)
  .then(protectedPassword => insert(mail, username, protectedPassword))
  .catch(err => console.log(err))
};

function insert(mail, username, password){
  const insert = db.prepare('INSERT INTO users(username,email,password) VALUES (?,?,?)');
    insert.run(username, mail, password);
}

//For login.js
async function searchDB(searchUsername, searchPassword){
  const stmt = db.prepare('SELECT * FROM users WHERE username = ?').bind(searchUsername);
  const got = stmt.get(); 

  try{
    if(await bcrypt.compare(searchPassword, got.password)==true){ //function to unhash, with salt and compare with got.password
      return(searchUsername);
    }
  } catch {
    throw new TypeError("login-failed")
  }
};

// Returns true/false    //for the function create_user in createUser.js
function searchMail(mailSearch){
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    const mail = stmt.all(mailSearch);
    if(mail.length == 0) {
        return false;
    } else return true;
}

// Returns true/false    //for the function create_user in login.js
function searchUsername(username){
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    const usernameSearch = stmt.all(username);
    if(usernameSearch.length == 0) {
        return false;
    } else return true;
};

//SQL syntax for updating:
// ('UPDATE table SET column1 = value1 WHERE column2 = value2')
// Better-Sqlite allows for '?' to be placeholders for values to insert in SQL statement
function updatePassword(new_password, user){
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
  hash, 
  connectDB,  
  insertValues, 
  insert, 
  searchDB, 
  searchMail, 
  searchUsername, 
  updatePassword, 
  update
}

