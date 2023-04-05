import fs from 'fs';
import sqlite3 from 'better-sqlite3';
import Database from 'better-sqlite3';
let sql;

const db_path = './data.db';
const db = connect_to_db();


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
    insert_values("aa","em","pw");
};

function insert_values(username, mail, password){
    let db = connect_to_db();
    const insert = db.prepare('INSERT INTO users(username,email,password) VALUES (?,?,?)');
    try {
        insert.run(username, mail, password);
    } catch (e) {
        console.error(e);
    }    
};

function print_all(){
    const stmt = db.prepare('SELECT * FROM users');
    const cat = stmt.get();

    console.log(cat); // => 2
}

print_all()
