/**
 * This is the main entry point for the master server software. It can 
 * (ideally) be run with `node server.js`, and will then set up a web 
 * server
 */

//Library imports
import http from 'http';
import fs from "fs/promises";
import path from "path";

//function imports from other .js files
import { user_login, validify_new_user, handler, hashing } from "./master/login.js"
import { connect_to_db } from "./master/db.js"
import { start_data_stream } from "./master/send_data.js"
import { search, update, passwords } from "./master/forgot_password.js"

//function and const exports
export { fileResponse, requestHandler, forgotpassword2_path };


const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer(requestHandler);

function requestHandler(req, res) {
  console.log("New request: " + req.method + " " + req.url);

  let baseURL = 'http://' + req.headers.host + '/';
  let url = new URL(req.url, baseURL);

  switch(url.pathname){
    //GET stuff
    case "/": case "/index.html":
      fileResponse(res, 'worker/index.html');
      break;
    case "/login.html":
      fileResponse(res, 'worker/login.html');
      break;
    case "/page.html":
      fileResponse(res, 'customer/page.html');
      break;
    case "/worker/style.css":
      fileResponse(res, "worker/style.css");
      break;
    case "/worker/login.html":
      fileResponse(res, "worker/login.html");
      break;

    //POST stuff
    case "/login-attempt": case "/worker/login-attempt": //TODO: Figure out which one of these is redundant
      handleLogin(req, res);
      break;
    case "/create-user":
      handleUserCreation(req, res);
      break;
    case "/request-worktask":
      console.log("Node requested a task");
      start_data_stream("insert path", res); //TODO: refractor to camel_case
      break;
    case "/forgot_password_post": //TODO: change underscores to hyphens for consistency in URL's
      console.log("forgot password post case");
      handlePasswordPostCase(req, res);
      break;
    case "enter_new_password":
      handleNewPassword(req, res);
      break;
    default:
      fileResponse(res, "." + url.pathname); //TODO: DELETE THIS LINE AND UNCOMMENT THE NEXT ONE
      //errorResponse(res, 404, "Resource not found");
  }
}

async function fileResponse(res, filename) {
  const sPath = securePath(filename);

  if(!await fileExists(sPath)){
    errorResponse(res, 404, 'Resource not found');
    return;
  }

  try{
    //In the future, we could work with buffers et cetera
    //However, our files are small (so far), so it doesn't really matter
    const data = await fs.readFile(sPath);
    res.statusCode = 200;
    res.setHeader('Content-Type', guessMimeType(sPath));
    res.write(data);
    res.end('\n');
  } catch (err){
    console.log(err);
    errorResponse(res, 500, 'Internal error')
  }
}

//This function only checks if the file exists, nothing 
//about whether it's readable etc
async function fileExists(filename){
  try{
    await fs.access(filename, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function guessMimeType(fileName) {
  const fileExtension = fileName.split('.').pop().toLowerCase();
  console.log(fileExtension);
  const ext2Mime = { 
    "txt": "text/txt",
    "html": "text/html",
    "ico": "image/ico",
    "js": "text/javascript",
    "json": "application/json",
    "css": 'text/css'
  };
  return (ext2Mime[fileExtension] || "text/plain");
}

function errorResponse(res, code, reason) {
  res.statusCode = code;
  res.setHeader('Content-Type', 'text/txt');
  res.write(reason);
  res.end("\n");
  console.log(`    Returned error ${code}: "${reason}"`)
}

function securePath(userPath) {
  if (userPath.indexOf('\0') !== -1) {
    // could also test for illegal chars: if (!/^[a-z0-9]+$/.test(filename)) {return undefined;}
    return undefined;

  }
  userPath = path.normalize(userPath).replace(/^(\.\.(\/|\\|$))+/, '');

  let p = path.join("./", path.normalize(userPath)); 
  //console.log("The path is:"+p); 
  return p;
}

/**
 * TODO: Move the user and form handling functions to their own file
 * Pls :(
 * 
 * I would do this myself, but that would require that I read through them,
 * and I did try doing that, but then I saw yet another 2-dimensional switch 
 * statement, and I don't particuarly feel like crying today again
 */

function handleLogin(req, res){
  extractForm(req)
  .then(user_info => user_login(user_info))
  .then(_ => fileResponse(res, "worker/worker_page.html"))
  .catch(thrown_error => throw_user(res, thrown_error, "login handler"));
}

function handleUserCreation(req, res){
  extractForm(req)
  .then(user_info => hashing(user_info))
  .then(hashed_info => validify_new_user(hashed_info))
  .then(processed_info => handler(processed_info))
  .then(_ => fileResponse(res, "worker/login.html"))
  .catch(thrown_error => throw_user(res, thrown_error, "user creator"));
}

function extractForm(req) { //cg addin explanation due
  if (isFormEncoded(req.headers['content-type']))
    return collectPostBody(req).then(body => {
      const data = qs.parse(body);//LEGACY
      //console.log(body);
      //let data=new URLSearchParams(body);
      return data;
    });
  else
    return Promise.reject(new Error(ValidationError));  //create a rejected promise
}

function throw_user(res, thrown_error, redirected_from){ // to be fixed with post/DOM
  let fileresponse_path = "FAKE PATH IN CASE THERE'S A CATASTROPHIC FAILURE";

  switch (redirected_from){
    case "login-attempt":
      switch(thrown_error){
        case "wrong-password":
          console.log("wrong-password");
          break;
        case "no-user":
          console.log("user not found");
          break;
      }
      fileresponse_path = "worker/login.html";
      break;
    case "create-user":
      switch(thrown_error){
        case "mail_exists":
        console.log("Thrown_user: Mail");
        break;
        case "user_exists":
        console.log("Thrown_user: User");
        break;
        case "passwords_unequal":
        console.log("Thrown_user: Passwords");
        break;
      }
      fileresponse_path = "worker/create_user.html";
      break;
    case "forgot_password_post":
      console.log("Thrown user: User not found")
      console.log(thrown_error);
      fileresponse_path = "worker/forgot_password.html";
      break;
    case "enter_new_password":
      switch(thrown_error) {
        case "passwords_unequal":
          console.log("Thrown user: passwords dont match");
          break;
        case "update_fail":
          console.log("Thrown user: update db failed"); //Potential cache TTL timeout
          break;
      }
      fileresponse_path = forgotpassword2_path;
      break;
    default:
      console.log("an error occured, while directing users");
      fileresponse_path = "/"; //Idk where else to go
  }
  fileResponse(res, fileresponse_path);
}
function isFormEncoded(contentType) {//cg addin explanation due
  let ctType = contentType.split(";")[0];
  ctType = ctType.trim();
  return (ctType === "application/x-www-form-urlencoded");
}
function handlePasswordPostCase(req, res){
  extractForm(req)
  .then(username => search(username))
  .then(path_response => fileResponse(res, path_response))
  .catch(thrown_error => throw_user(res, thrown_error, "password post case thing"));
}
function collectPostBody(req) {//cg addin explanation due
  function collectPostBodyExecutor(resolve, reject) {
    let bodyData = [];
    let length = 0;
    req.on('data', (chunk) => {
      bodyData.push(chunk);
      length += chunk.length;

      if (length > 10000000) {
        req.connection.destroy();
        reject(new Error(MessageTooLongError));
      }
    }).on('end', () => {
      bodyData = Buffer.concat(bodyData).toString();
      console.log(bodyData);
      resolve(bodyData);
    });
    //Exceptions raised will reject the promise
  }
  return new Promise(collectPostBodyExecutor);
}
function handleNewPassword(req, res){
  extractForm(req)
  .then(info => passwords(info))
  .then(password => update(password))
  .then(_ => fileResponse(res, "worker/worker_page.html"))
  .catch(thrown_error => throw_user(res, thrown_error, "new password handler thing i wonder what this will look like"));

}


server.listen(port, hostname, () => {
  connect_to_db();
  console.log(`Server running at http://${hostname}:${port}/`);
});

