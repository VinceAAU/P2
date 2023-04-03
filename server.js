/**
 * This is the main entry point for the master server software. It can 
 * (ideally) be run with `node main.js`, and will then set up a web 
 * server
 */

import http from 'http';
import fs from "fs";
import path from "path";
import process from "process";

import qs from "querystring";
import { user_login_info, create_user } from "./master/login.js"
export { fileResponse, requestHandler };

const hostname = '127.0.0.1';
const port = 3000;
const NoResourceError = "No Such Resource";
const ValidationError = "Validation Error";
const InternalError = "Internal Error";
const UserNotRecognized = "User not recognized";


let rootFileSystem = process.cwd();

const server = http.createServer(requestHandler);

function requestHandler(req, res) {
  try {
    handleRequest(req, res);
  } catch (e) {
    console.log("!!: " + e);
    errorResponse(res, 500, "");
  }
}


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
          fileResponse(res, "worker/index.html");
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
      console.log(pathElements[pathElements.length - 1]); //to be looked at /cg
      switch (pathElements[pathElements.length - 1]) {
        case "login-attempt":
          try {
            extractForm(req)
              .then(user_info => user_login_info(user_info))
              .catch(path => fileResponse(res, path))
          }
          catch (e) {
            console.log('Catched exception: ' + e);
          }
          finally {
            fileResponse(res, "worker/worker_page.html");
          }
          break;
        case "create-user":
          try {
            extractForm(req)
              .then(user_info => create_user(user_info))
              .catch(path => fileResponse(res, path))
          }
          catch (e) {
            console.log('Catched exception: ' + e);
          }
          finally {
            fileResponse(res, "worker/login.html");
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

function returnToLogin() {
  console.log("well this sucks");
}

function reportError(res, error) {//cg addin explanation due
  console.log("error catched");
  if (error.message === ValidationError) {
    return errorResponse(res, 400, error.message);
  }
  if (error.message === NoResourceError) {
    return errorResponse(res, 404, error.message);
  }
  if (error.message === UserNotRecognized) {
    //fileResponse(res, "/worker/login.html"); //To be shined up
    return Promise.reject(returnToLogin);
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
  console.log(`Server running at http://${hostname}:${port}/`);
});

