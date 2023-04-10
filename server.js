/**
 * This is the main entry point for the master server software. It can 
 * (ideally) be run with `node server.js`, and will then set up a web 
 * server
 */

//Library imports
import http from 'http';
import fs from "fs";
import path from "path";
import process from "process";
import qs from "querystring";

//function imports from other .js files
import { user_login, validify_new_user, handler, hashing} from "./master/login.js"
import { connect_to_db } from "./master/db.js"
import { start_data_stream} from "./master/send_data.js"
import { search } from "./master/forgot_password.js"

//function and const exports
export { fileResponse, requestHandler, forgotpassword2_path };

//errors
const NoResourceError = "No Such Resource";
const ValidationError = "Validation Error";
const InternalError = "Internal Error";

//paths
const login_path          = "./worker/login.html";
const createUser_path     = "./worker/create_user.html";
const worker_path         = "./worker/worker_page.html";
const index_path          = "./worker/index.html";
const forgotpassword_path = "./worker/forgot_password.html"
const forgotpassword2_path = "./worker/forgot_password2.html"

const hostname = '127.0.0.1';
const port = 3000;

let rootFileSystem = process.cwd();

const server = http.createServer(requestHandler);

function requestHandler(req, res) {
  try {
    handleRequest(req, res);
  } catch (e) {
    console.log("!!: " + e);
    errorResponse(res, 500, "");
  };
};

function handleRequest(req, res) {
  console.log("GOT: " + req.method + " " + req.url);

  let baseURL = 'http://' + req.headers.host + '/';
  let url = new URL(req.url, baseURL);
  let searchParms = new URLSearchParams(url.search);
  let queryPath = decodeURIComponent(url.pathname);

  switch (req.method) {
    case "GET":
      console.log("GET");
      let pathElements = queryPath.split("/");
      console.log(pathElements);
      //USE "sp" from above to get query search parameters
      let startPath = "";
      switch (pathElements[1]) {
        case "":
          fileResponse(res, index_path);
          break;
        case "login.html":
          startPath += "worker/";
          startPath += pathElements[1];
          fileResponse(res, startPath);
          break;
        case "page.html":
          startPath += "customer/";
          startPath += pathElements[1];
          fileResponse(res, startPath);
          break;
        default: //for anything else we assume it is a file to be served
          fileResponse(res, req.url);
          break;
      }
      break;
    case "POST": {
      console.log("POST");
      let pathElements = queryPath.split("/");
      switch (pathElements[pathElements.length - 1]) {
        case "login-attempt":
          try {
            extractForm(req)
              .then(user_info => user_login(user_info))
              .then(_ => fileResponse(res, worker_path))
              .catch(thrown_error => throw_user(res, thrown_error, pathElements[pathElements.length - 1]))
            }
          catch (e) { 
            console.log('Error: ' + e);
          }
          break;
        case "create-user":
          try {
            extractForm(req)
              .then(user_info => hashing(user_info))
              .then(hashed_info => validify_new_user(hashed_info))
              .then(processed_info => handler(processed_info))
              .then(_ => fileResponse(res, login_path))
              .catch(thrown_error => throw_user(res, thrown_error, pathElements[pathElements.length - 1]))
          }
          catch (e) {
            console.log('Catched exception: ' + e);
          }
          break;
          case "request-worktask":
            try{
              console.log("Node requested a task");
              // insert path to appropriately sized CSV file, for one worker
              start_data_stream("insert path", res);
            }
            catch (e) {
              console.log("CAUGHT exception" + e);
            }            
          break;
          case "forgot_password_post": //-------------
            console.log("forgot password post case");
            try {
              extractForm(req)
              .then(username => search(username))
              .then(path_response => fileResponse(res, path_response))
              .catch(thrown_error => throw_user(res, thrown_error, pathElements[pathElements.length - 1]));
            }
            catch (e) {
              console.log('Catched exception: ' + e);
            }
          break;
          default:
          
          console.error("Resource doesn't exist");
          reportError(res, new Error(NoResourceError));
      }
    }
      break; //POST URL
    default:
      console.log("Fault");
      break;

  }
}

function throw_user(res, thrown_error, redirected_from){ // to be fixed with post/DOM
  let fileresponse_path;

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
      fileresponse_path = login_path;
      break;
    case "create-user":
      switch(thrown_error){
        case "mail_exists":
        console.log("Thrown_user: Mail");
        break;
        case "user_exists":
        console.log("Thrown_user: User");
        break;
        case "passwords_inequal":
        console.log("Thrown_user: Passwords");
        break;
      }
      fileresponse_path = createUser_path;
      break;
    case "forgot_password_post":
      console.log("Thrown user: User not found")
      console.log(thrown_error);
      fileresponse_path = forgotpassword_path;
      break;
    default:
      console.log("an error occured, while directing users");
  }
  fileResponse(res, fileresponse_path);
}

function extractForm(req) { //cg addin explanation due
  if (isFormEncoded(req.headers['content-type']))
    return collectPostBody(req).then(body => {
      const data = qs.parse(body);//LEGACY
      //console.log(data);
      //let data=new URLSearchParams(body);
      return data;
    });
  else
    return Promise.reject(new Error(ValidationError));  //create a rejected promise
}

function isFormEncoded(contentType) {//cg addin explanation due
  let ctType = contentType.split(";")[0];
  ctType = ctType.trim();
  return (ctType === "application/x-www-form-urlencoded");
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


function reportError(res, error) {//cg addin explanation due
  console.log("error catched");
  if (error.message === ValidationError) {
    return errorResponse(res, 400, error.message);
  }
  if (error.message === NoResourceError) {
    return errorResponse(res, 404, error.message);
  }
  else {
    console.log(InternalError + ": " + error);
    return errorResponse(res, 500, "");
  }
}

function fileResponse(res, filename) {
  const sPath = securePath(filename);
  console.log("Reading:" + sPath);
  fs.readFile(sPath, (err, data) => {
    if (err) {
      console.error(err);
      errorResponse(res, 404, String(err));
    } else {
      res.statusCode = 200;
      res.setHeader('Content-Type', guessMimeType(filename));
      res.write(data);
      res.end('\n');
    }
  })
}


function guessMimeType(fileName) {
  const fileExtension = fileName.split('.').pop().toLowerCase();
  console.log(fileExtension);
  const ext2Mime = { //Aught to check with IANA spec
    "txt": "text/txt",
    "html": "text/html",
    "ico": "image/ico", // CHECK x-icon vs image/vnd.microsoft.icon
    "js": "text/javascript",
    "json": "application/json",
    "css": 'text/css'
  };
  //incomplete
  return (ext2Mime[fileExtension] || "text/plain");
}


function errorResponse(res, code, reason) {
  res.statusCode = code;
  res.setHeader('Content-Type', 'text/txt');
  res.write(reason);
  res.end("\n");
}

function securePath(userPath) {
  if (userPath.indexOf('\0') !== -1) {
    // could also test for illegal chars: if (!/^[a-z0-9]+$/.test(filename)) {return undefined;}
    return undefined;

  }
  userPath = path.normalize(userPath).replace(/^(\.\.(\/|\\|$))+/, '');

  let p = path.join(rootFileSystem, path.normalize(userPath));
  //console.log("The path is:"+p);
  return p;
}


server.listen(port, hostname, () => {
  console.log(`${rootFileSystem}`)
  connect_to_db();
  console.log(`Server running at http://${hostname}:${port}/`);
});

