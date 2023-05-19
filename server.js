/**
 * This is the main entry point for the master server software. It can 
 * (ideally) be run with `node server.js`, and will then set up a web 
 * server
 */


//Library and function imports
import http from 'http';
import path from "path";
import qs from "querystring";
import { requestHandler, fileResponse } from './router.js';
import { heartbeat } from './master/workerManagement.js';


//function and const exports
export { throw_user, securePath, errorResponse, guessMimeType, redirect, extractForm };


const hostname = '127.0.0.1';
const port = 3000;
const server = http.createServer(requestHandler);
const changePasswordPath = '/worker/html/changePassword.html';
server.requestTimeout = 1000 * 60 * 30; // 30 minutes request timeout time. Otherwise, server might crash for big file uploads.

function redirect(req, res, path) {
  console.log("redirecting to: ", path)
  res.writeHead(302, {
    Location: path
  });
  res.end();
}

function extractForm(req) { //cg addin explanation due
  if (isFormEncoded(req.headers['content-type']))
    return collectPostBody(req).then(body => {
      const data = qs.parse(body);
      return data;
    });
  else
    return Promise.reject(new Error(ValidationError));
}


//stay
function isFormEncoded(contentType) {//cg addin explanation due
  let ctType = contentType.split(";")[0];
  ctType = ctType.trim();
  return (ctType === "application/x-www-form-urlencoded");
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
      fileresponse_path = loginPath;
      break;
    case "login.js":
      fileresponse_path = '/login.html';
      break;
    case "forgot-password-post": //User not found
      errorResponse(res, 400, thrown_error);
      break;
    case "new password handler thing i wonder what this will look like":
      switch (thrown_error) {
        case "passwords_unequal":
          console.log("Thrown user: passwords dont match");
          errorResponse(res, 400, thrown_error);
          break;
        case "TypeError: Cannot read properties of undefined (reading 'user')":
          errorResponse(res, 408, thrown_error); //request timeout
          console.log("Cache timed out waiting for a response");
          break;
      }
      fileresponse_path = changePasswordPath;
      break;
    default:
      console.log("an error occured, while directing users");
      fileresponse_path = "/"; //Idk where else to go
  }
  //fileResponse(res, fileresponse_path);
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
  console.log(`Started heartbeat`);
  heartbeat();
  console.log(`Server running at http://${hostname}:${port}/`);
});