/**
 * This is the main entry point for the master server software. It can 
 * (ideally) be run with `node server.js`, and will then set up a web 
 * server
 */

const loginPath = '/worker/html/login.html';
const workerPath = '/worker/html/workerPage.html';
const createUserPath = '/worker/html/createUser.html';
const forgotPasswordPath = '/worker/html/forgotPassword.html';
const changePasswordPath = '/worker/html/changePassword.html';
const indexPath = '/worker/html/index.html';
const customerPagePath = '/customer/customerPage.html';
const CSSPath = 'worker/style.css';


//Library imports
import http from 'http';
import fs from "fs/promises";
import path from "path";
import qs from "querystring";
import formidable from 'formidable';
import jwt from 'jsonwebtoken';
import { env } from 'process';
import NodeCache from "node-cache";


//function imports from other .js files
import { search_db } from "./master/db.js"
import { streamArray, handleUpload } from "./master/exchangeData.js"
import { search, passwords } from "./master/forgotPassword.js"
import { validateNewUser } from "./master/createUser.js"
//import { taskSplitter } from './master/splitData.js';
import { savePendingQueue, addCustomerQueue, removeCustomerQueue, getTaskQueueHead, getUserQueueHead, pendingQueueToFinishedQueue } from './master/queue.js'

//function and const exports
export { fileResponse, requestHandler, throw_user };

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer(requestHandler);
const myCache = new NodeCache({ stdTTL: 100, checkperiod: 120 }); //Cache config

function requestHandler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  console.log("New request: " + req.method + " " + req.url);

  let baseURL = 'http://' + req.headers.host + '/';
  let url = new URL(req.url, baseURL);
  const maxFileSizeGB = 20;
  const form = new formidable.IncomingForm({
    maxFileSize: maxFileSizeGB * 1024 * 1024 * 1024 // 10 GB limit
  });

  switch (url.pathname) {
    //GET 
    case "/":
    case "/index.html":
      fileResponse(res, indexPath);
      break;
    case "/login":
      fileResponse(res, loginPath);
      break;
    case "/page.html":
      fileResponse(res, customerPagePath);
      break;
    case "/style.css":
      fileResponse(res, CSSPath);
      break;
    case "/worker/html/request-worktask":
      streamArray(res, [5, 2, 1, 2, 2, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6]); // Example array
      break;
    case "/worker/html/posts":
      console.log("posts")
      authenticateToken(req, res);
      break;
    case "/401": //called from hrefs
      redirect(req, res, loginPath)
      break;
    case "/workerPage": //called from hrefs
      saveCachePath(workerPath)
      redirect(req, res, loginPath)
      break;
    case "/customerPage":
      saveCachePath(customerPagePath)
      redirect(req, res, loginPath)
      break;
    case "/loggedIn":
      redirect(req, res, getCache())
      break;
    case "/logOut": //called from 
      redirect(req, res, indexPath)
      break;


    //POST
    case "/protectedResource": //called from
      console.log("protectedResource called")
      authenticateToken(req, res)
      break;
    case "/worker/html/fetchUser":
      console.log("post login-attempt")
      extractForm(req)
        .then(user_info => search_db(user_info['username'], user_info['password'])) //login.js
        .then(user => returnToken(req, res, user))
        .catch(thrown_error => returnTokenErr(req, res, 500));
      break;
    case "/worker/html/create-user":
      handleUserCreation(req, res);
      break;
    case "/worker/html/forgot-password-post": //TODO: change underscores to hyphens for consistency in URL's
      handlePasswordPostCase(req, res);
      break;
    case "/worker/html/enter-new-password":
      handleNewPassword(req, res);
      fileResponse(res, customerPagePath);
      break;
    case "/customer/costumerPage/upload":
      //Process the file upload in Node
      handleUpload(form, req, res);
      break;
    default:
      fileResponse(res, "." + url.pathname); //TODO: DELETE THIS LINE AND UNCOMMENT THE NEXT ONE
    //errorResponse(res, 404, "Resource not found");
  }
}
function getCache() {
  let cache = myCache.get("myPath");
  if (cache == undefined) {
    console.log("key not found");
  } else {
    console.log(cache);
  }
  return (cache.path)
}

function saveCachePath(cachePath) {

  // let obj = { path: cachePath };
  // let success = myCache.set("myPath", obj, 10000);
  // console.log('path saved as: ', cachePath)

  let cache = myCache.get("myPath");
  if (cache != undefined) {
    console.log("resetting cache from: ", cachePath);
    let success = myCache.set("myPath", null, 10000);
    saveCachePath(cachePath);
  } else {
    let obj = { path: cachePath };
    let success = myCache.set("myPath", obj, 10000);
    console.log('path saved as: ', cachePath)
  }
}

function redirect(req, res, path) {
  console.log("redirecting to: ", path)
  res.writeHead(302, {
    Location: path
  });
  res.end();
}

function extractForm(req) { //cg addin explanation due
  console.log(req.headers)
  if (isFormEncoded(req.headers['content-type']))
    return collectPostBody(req).then(body => {
      const data = qs.parse(body);
      return data;
    });
  else
    return Promise.reject(new Error(ValidationError));
}

function isFormEncoded(contentType) {//cg addin explanation due
  console.log(contentType);
  let ctType = contentType.split(";")[0];
  ctType = ctType.trim();
  return (ctType === "application/x-www-form-urlencoded");
}

//
function returnToken(req, res, username) {
  console.log("return token with user: " + username)
  const str = '473f2eb9c7b9a92b59f2990e4e405fedb998dd88a361c0a8534c6c9988a44fa5eeeb5aea776de5b45bdc3cabbc92a8e4c1074d359aacba446119e82f631262f0'; //to be put in .env
  const user = { name: username }
  //console.log(process.env.ACCESS_TOKEN_SECRET)


  const accessToken = jwt.sign(user, str);
  res.statusCode = 201;

  res.setHeader('Content-Type', 'text/txt');
  res.write(JSON.stringify({ accessToken: accessToken }));
  res.end("\n");
}

function authenticateToken(req, res) {
  console.log("authenticate token function")
  const str = '473f2eb9c7b9a92b59f2990e4e405fedb998dd88a361c0a8534c6c9988a44fa5eeeb5aea776de5b45bdc3cabbc92a8e4c1074d359aacba446119e82f631262f0'; //to be put in .env
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // console.log('req.headers', req.headers);
  // console.log('authHeader:', authHeader);
  // console.log('token:', token);  
  // console.log('req.user', req.user)
  console.log(token == null)
  //if (token == null) return res.sendStatus(401)

  jwt.verify(token, str, (err, user) => {
    if (err) return returnTokenErr(req, res, 401)
    req.user = user;
    console.log("token authenticated")
    res.statusCode = 200;
    res.end("\n");
  });
};


function returnTokenErr(req, res, code) {
  console.log(code)
  res.statusCode = code;
  res.end("\n");
}

//Function for creating new users
function handleUserCreation(req, res) {
  extractForm(req)
    .then(user_info => validateNewUser(user_info))
    .then(_ => fileResponse(res, loginPath))
    .catch(thrown_error => throw_user(res, thrown_error, "create-user"));
}

//Function for forgot password page
function handlePasswordPostCase(req, res) {
  extractForm(req)
    .then(username => search(username)) //in forgotPassword.js
    .then(_ => fileResponse(res, changePasswordPath))
    .catch(thrown_error => throw_user(res, thrown_error, "forgot-password-post"));
}

//Function for adding new password
function handleNewPassword(req, res) {
  extractForm(req)
    .then(info => passwords(info)) //in forgotPassword.js
    .then(_ => fileResponse(res, loginPath))
    .catch(thrown_error => throw_user(res, thrown_error, "new password handler thing i wonder what this will look like"));
}

async function fileResponse(res, filename) {
  //console.log("fileresponse");
  const sPath = securePath(filename);

  if (!await fileExists(sPath)) {
    errorResponse(res, 404, 'Resource not found');
    return;
  }

  try {
    //In the future, we could work with buffers et cetera
    //However, our files are small (so far), so it doesn't really matter
    const data = await fs.readFile(sPath);
    res.statusCode = 200;
    res.setHeader('Content-Type', guessMimeType(sPath));
    //console.log('Content-Type', guessMimeType(sPath))
    //console.log(res.headers)
    res.write(data);
    res.end('\n');
  } catch (err) {
    console.log(err);
    errorResponse(res, 500, 'Internal error')
  }
}

//This function only checks if the file exists, nothing 
//about whether it's readable etc
async function fileExists(filename) {
  try {
    await fs.access(filename, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function guessMimeType(fileName) {
  const fileExtension = fileName.split('.').pop().toLowerCase();
  //console.log(fileExtension);
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
  console.log("error response")
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




function throw_user(res, thrown_error, redirected_from) {
  let fileresponse_path = "FAKE PATH IN CASE THERE'S A CATASTROPHIC FAILURE";
  console.log("throw user. (Err, from): " + thrown_error, redirected_from);
  switch (redirected_from) {
    case "login handler":
      switch (thrown_error) {
        case "wrong-password":
          console.log("wrong-password");
          break;
        case "no-user":
          console.log("user not found");
          break;
      }
      fileresponse_path = loginPath;
      break;
    case "login.js":
      switch (thrown_error) {
        case "wrong-password":
          console.log("wrong-password2");
          break;
        case "no-user":
          console.log("user not found2");
          break;
      }
      fileresponse_path = './worker/html/login.html';
      break;
    case "create-user":
      switch (thrown_error) {
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
      fileresponse_path = createUserPath;
      break;
    case "forgot-password-post": //newpassword
      console.log("Thrown user: User not found")
      console.log(thrown_error);
      fileresponse_path = forgotPasswordPath;
      break;
    case "new password handler thing i wonder what this will look like":
      switch (thrown_error) {
        case "passwords_unequal":
          console.log("Thrown user: passwords dont match");
          break;
        case "update_fail":
          console.log("Thrown user: update db failed");
          break;
        case "TypeError: Cannot read properties of undefined (reading 'user')":
          console.log("Cache timed out waiting for a response");
          break;
      }
      fileresponse_path = changePasswordPath;
      break;
    default:
      console.log("an error occured, while directing users");
      fileresponse_path = "/"; //Idk where else to go
  }
  fileResponse(res, fileresponse_path);
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

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

