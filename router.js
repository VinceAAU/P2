import formidable from 'formidable';
import fs from "fs/promises";
import NodeCache from "node-cache";
//import { env } from 'process';asd

export { requestHandler, fileResponse };

//function imports from other .js files
import { search_db } from "./master/db.js";
import { handleUpload, streamArrayToClient, receiveArray, streamStringArrayToClient } from "./master/exchangeData.js";
import { search, passwords } from "./master/forgotPassword.js";
import { validateNewUser } from "./master/createUser.js";
import { returnToken, authenticateToken, returnTokenErr, decodeToken } from './master/tokenHandler.js';
import { securePath, errorResponse, guessMimeType, redirect, extractForm } from './server.js';
import { getTaskByUser, removeFinishedCustomerQueue, findFinishedTaskIndex } from './master/queue.js';
import { pong, removeWorker } from './master/workerManagement.js'
import { assignWorkToWorker, taskCounter, storeSortedBuckets } from './master/assignWork.js';
import { createReadStream, existsSync } from 'fs';

//HTML and CSS file paths
const loginPath = '/worker/html/login.html';
const workerPath = '/worker/html/workerPage.html';
const changePasswordPath = '/worker/html/changePassword.html';
const indexPath = '/worker/html/index.html';
const customerPagePath = '/worker/html/customerPage.html';
const CSSPath = 'worker/style.css';
const createUserPath = '/worker/html/createUser.html';
const forgotPasswordPath = '/worker/html/forgotPassword.html';

//Javascript file paths
//Clientside
const loginClientPath = '/worker/clientsideJS/loginClient.js';
const newUserClientPath = '/worker/clientsideJS/newUserClient.js';
const forgotPasswordClientPath = '/worker/clientsideJS/forgotPasswordClient.js';
const changePasswordClientPath = '/worker/clientsideJS/changePasswordClient.js';
const accessTokenPath = '/worker/clientsideJS/accessToken.js'
const costumerFileHandlerPath = '/worker/clientsideJS/customerFileHandler.js';
//Serverside
const mainJSPath = '/worker/main.js';
const webWorkerSortPath = '/worker/workerSort.js';
const webWorkerMergePath = '/worker/workerMerge.js';

const myCache = new NodeCache({ stdTTL: 200, checkperiod: 240 }); //Cache config


function requestHandler(req, res) {
   if (req.url !== '/ping')
        console.log("New request: " + req.method + " " + req.url);

    let baseURL = "https://cs-23-sw-2-12.p2datsw.cs.aau.dk/node0/";
    let url = new URL(req.url, baseURL);
    //let form = new formidable.IncomingForm();

    switch (url.pathname) {
        //GET 
        //HTML GET calls
        case "/":
        case "/index.html":
            fileResponse(res, indexPath);
            break;
        case "/login.html":
            fileResponse(res, loginPath);
            break;
        case "/customerPage.html":
            fileResponse(res, customerPagePath);
            break;
        case "/workerPage.html":
            fileResponse(res, workerPath);
            break;
        case "/createUser.html":
            fileResponse(res, createUserPath);
            break;
        case "/forgotPassword.html":
            fileResponse(res, forgotPasswordPath);
            break;

        //Javascript GET calls
        case "/loginClient.js":
            fileResponse(res, loginClientPath);
            break;
        case "/customerFileHandler.js":
            fileResponse(res, costumerFileHandlerPath);
            break;
        case "/accessToken.js":
            fileResponse(res, accessTokenPath);
            break;
        case "/main.js":
            fileResponse(res, mainJSPath);
            break;
        case "/workerSort.js":
            fileResponse(res, webWorkerSortPath);
            break;
        case "/workerMerge.js":
            fileResponse(res, webWorkerMergePath);
            break;
        case "/newUserClient.js":
            fileResponse(res, newUserClientPath);
            break;
        case "/forgotPasswordClient.js":
            fileResponse(res, forgotPasswordClientPath);
            break;
        case "/changePasswordClient.js":
            fileResponse(res, changePasswordClientPath);
            break;
        //CSS GET calls
        case "/style.css":
            fileResponse(res, CSSPath);
            break;
        case "/posts":
            authenticateToken(req, res);
            break;
        case "/enterNewPassword":
            fileResponse(res, changePasswordPath);
            break;
        case "/requestFirstTask":
            giveTask(req, res);
            break;
        case "/requestNewTask":
            console.log("Node finished task: " + req.headers.uuid);
            giveNewTask(req, res);
            break;

        //POST
        case "/createUser":
            handleUserCreation(req, res);
            break;
        case "/protectedResource": //called from
            authenticateToken(req, res);
            break;
        case "/fetchUser":
            extractForm(req)
                .then(user_info => search_db(user_info['username'], user_info['password'])) //login.js
                .then(user => returnToken(req, res, user))
                .catch(thrown_error => returnTokenErr(res, 401, thrown_error)); //401: unauthorized
            break;
        case "/worker":
            saveCachePath("workerPage.html");
            redirect(req, res, "login.html");
            break;
        case "/customer":
            saveCachePath("customerPage.html");
            redirect(req, res, "login.html");
            break;
        case "/loggedIn":
            redirect(req, res, getCache());
            break;
        case "/forgot-password-post": //TODO: change underscores to hyphens for consistency in URL's
            handlePasswordPostCase(req, res);
            break;
        case "/enter-new-password":
            handleNewPassword(req, res);
            //fileResponse(res, customerPagePath);
            break;
        case "/upload":
            console.log("User uploading file");
            redirectToHandleUpload(req, res);

            // get user ID token thingy for the requester
            break;
        case "/get-task-list-by-user":
            handleFileQueue(req, res);
            break;
        case "/download":
            console.log("User downloading file");
            downloadFile(req, res);
            break;
        case "/ping":
            //possible TODO: Check for authentication?
            pong(req.headers["uuid"]);
            res.end();
            break;
        case "/dead":
            removeWorker(req.headers["uuid"]);
            res.end();
            break;
        default:
            //fileResponse(res, "." + url.pathname); //TODO: DELETE THIS LINE AND UNCOMMENT THE NEXT ONE //Thanks Lasse <3
            errorResponse(res, 404, "Resource not found");
            break;
    }
}


//Function for creating new users
function handleUserCreation(req, res) {
    extractForm(req)
        .then(user_info => validateNewUser(user_info))
        .then(_ => {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.write('User created successfully');
            res.end();
        })
        .catch(thrown_error => {
            if (thrown_error instanceof TypeError) {
                if (thrown_error.message === "mail_exists" || thrown_error.message === "user_exists"){
                    errorResponse(res, 409, thrown_error.message);
                } else if (thrown_error.message === "passwords_unequal"){
                    errorResponse(res, 400, thrown_error.message);
                }
            }
        });
}

//Function for forgot password page
function handlePasswordPostCase(req, res) {
    extractForm(req)
        .then(username => search(username["username"])) //in forgotPassword.js
        .then(status => {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.write(status);
            res.end();
        })
        .catch(thrown_error => {
            if (thrown_error instanceof TypeError) {
            errorResponse(res, 400, thrown_error.message)
            }
        });
}

//Function for adding new password,
function handleNewPassword(req, res) {
    extractForm(req)
        .then(info => passwords(info)) //in forgotPassword.js
        .then(_ => {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.write('User found');
            res.end();
        })
        .catch(thrown_error => {
            if (thrown_error instanceof TypeError) {
                if (thrown_error.message === "passwords_unequal"){
                    errorResponse(res, 400, thrown_error.message);
                } else { // Triggered when TTL on cache is hit
                    errorResponse(res, 404, thrown_error.message);
                }
            }
        });
}

async function fileResponse(res, filename) {
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

function saveCachePath(path) {
    let cache = myCache.get("myPath");
    if (cache != undefined) {
        let success = myCache.set("myPath", null, 100);
        saveCachePath(path);
    } else {
        let obj = { path: path };
        let success = myCache.set("myPath", obj, 100);
    }
}

function getCache() {
    let cache = myCache.get("myPath");
    if (cache == undefined) {
        return ("index.html") //Returns if user timed out beyond cache TTL
    } else {
        return (cache.path);
    }
}

async function handleFileQueue(req, res) {
    const user = decodeToken(req)

    let userTaskArray = await getTaskByUser(user);
    streamStringArrayToClient(res, userTaskArray);
}


async function downloadFile(req, res) {
    try {
        let downloadFileName = req.headers['url']
        let filePath = './master/autogeneratedFiles/csvFiles/' + downloadFileName;
        const stat = await fs.stat(filePath);
        const fileSize = stat.size;
        const headers = { 'Content-Type': 'text/csv', 'Content-Length': fileSize, 'Content-Disposition': 'attachment; filename=test.csv', };
        res.writeHead(200, headers);

        let file = await fs.open(filePath);
        const stream = file.createReadStream();
        stream.pipe(res);

        const user = await decodeToken(req)
        let userTaskArray = await getTaskByUser(user);

        const index = await findFinishedTaskIndex(user, downloadFileName);

        removeFinishedCustomerQueue(index);

        stream.on('end', () => {
            // File has been fully streamed/downloaded by the user, so we can delete it now
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error(`Error deleting the file: ${err}`);
                    return;
                }
            });
        });
    } catch (error) {
        console.log(error);
    }
}

async function giveTask(req, res) {
    try {
      let task = await assignWorkToWorker(req.headers["uuid"]);
      if (task !== null) {
        streamArrayToClient(res, task);
      } else {
        throw new Error("No tasks available");
      }
    } catch {
      res.statusCode = 204;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "No tasks available" }));
    }
  }
  
  
async function giveNewTask(req, res) {
    let recievedTask = await receiveArray(req, res)

    storeSortedBuckets(recievedTask);
    await taskCounter();
    await giveTask(req, res);
}

async function redirectToHandleUpload(req, res) {
    if (!await fileExists("master/autogeneratedFiles")) {
        await fs.mkdir("master/autogeneratedFiles");
    }
    if (!await fileExists("master/autogeneratedFiles/csvFiles")) {
        await fs.mkdir("master/autogeneratedFiles/csvFiles");
    }

    const maxFileSizeGB = 20;
    const form = new formidable.IncomingForm({
        maxFileSize: maxFileSizeGB * 1024 * 1024 * 1024, // 20 GB limit
        uploadDir: 'master/autogeneratedFiles/csvFiles',
        filename: (name, ext, part, form) => {
            if (existsSync("master/autogeneratedFiles/csvFiles/" + part.originalFilename)) {
                console.log("File already exists, creating new filename...");
                const pureFilename = part.originalFilename.slice(0, part.originalFilename.lastIndexOf(".")); // get filename without .csv extension 
                for (let i = 1; i < 50; i++) { // arbitrary limit
                    let newFileName = pureFilename + " (" + i + ")" + ".csv"; // similar to how windows handles duplicates, when downloading file
                    if(!existsSync("master/autogeneratedFiles/csvFiles/"+ newFileName)) return `${newFileName}`;
                }
            } else {
               // console.log("No duplicates detected");
                return `${part.originalFilename}`;
            }
        }
    });

    const user = decodeToken(req)
    handleUpload(form, req, user)
        .then(_ => {
            console.log("Received file from: " + user);

            res.writeHead(204);
            res.end();
        })
        .catch(err => {
            console.log(err);
            res.writeHead(err); //bad request
            res.end();
        })

}

