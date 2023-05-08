import formidable from 'formidable';
import fs from "fs/promises";
import NodeCache from "node-cache";
import fs2 from "fs";
//import { env } from 'process';asd

export { requestHandler, fileResponse };

//function imports from other .js files
import { search_db } from "./master/db.js";
import { handleUpload, streamArrayToClient, receiveArrayFromClient} from "./master/exchangeData.js";
import { search, passwords } from "./master/forgotPassword.js";
import { validateNewUser } from "./master/createUser.js";
import { returnToken, authenticateToken, returnTokenErr } from './master/tokenHandler.js';
import { securePath, throw_user, errorResponse, guessMimeType, redirect, extractForm } from './server.js';
import { savePendingQueue, addCustomerQueue, removeCustomerQueue, getTaskQueueHead, getUserQueueHead, pendingQueueToFinishedQueue, getTaskByUser } from './master/queue.js';
import { pong } from './master/workerManagement.js'
import { assignWorkToWorker, enqueueTask, addToBeginningOfQueue, WorkerNode } from './master/assignWork.js';

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
    //let form = new formidable.IncomingForm();
    const maxFileSizeGB = 20;
    const form = new formidable.IncomingForm({
        maxFileSize: maxFileSizeGB * 1024 * 1024 * 1024 // 20 GB limit
    });

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

        case "/request-worktask":
            streamArrayToClient(res, Buffer.from([5, 2, 1, 2, 2, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6])); // Example array
            break;
        case "/posts":
            console.log("posts");
            authenticateToken(req, res);
            break;
        case "/enterNewPassword":
            fileResponse(res, changePasswordPath);
            break;
        case "/requestFirstTask":
            giveFirstTask(req, res);
            break;
        case "/requestNewTask":
            giveNewTask(req, res);
            break;

        //POST
        case "/createUser":
            handleUserCreation(req, res);
            break;
        case "/protectedResource": //called from
            console.log("protectedResource called");
            authenticateToken(req, res);
            break;
        case "/fetchUser":
            console.log("post login-attempt");
            extractForm(req)
                .then(user_info => search_db(user_info['username'], user_info['password'])) //login.js
                .then(user => returnToken(req, res, user))
                .catch(thrown_error => returnTokenErr(res, 401, thrown_error)); //401: unauthorized
            break;
        case "/worker":
            saveCachePath("/workerPage.html");
            redirect(req, res, "/login.html");
            break;
        case "/customer":
            saveCachePath("/customerPage.html");
            redirect(req, res, "/login.html");
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
            redirectToHandleUpload(req, res);

            // get user ID token thingy for the requester
            break;
        case "/get-task-list-by-user":
            handleFileQueue(req, res);
            break;
        case "/download":
            downloadFile(req, res);
            break;
        case "/ping":
            //possible TODO: Check for authentication?
            pong(req.headers["uuid"]);
            res.end();
            break;
        case "/upload-sorted-array":
            const data = receiveArrayFromClient(req, res);
            console.log(data);
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
        .catch(thrown_error => throw_user(res, thrown_error, "create-user"));
}

//Function for forgot password page
function handlePasswordPostCase(req, res) {
    extractForm(req)
        .then(username => search(username)) //in forgotPassword.js
        .then(_ => {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.write('User found');
            res.end();
        })
        //.then(_ => fileResponse(res, changePasswordPath))
        .catch(thrown_error => throw_user(res, thrown_error, "forgot-password-post"));
}

//Function for adding new password
function handleNewPassword(req, res) {
    extractForm(req)
        .then(info => passwords(info)) //in forgotPassword.js
        .then(_ => {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.write('User found');
            res.end();
        })
        .catch(thrown_error => throw_user(res, thrown_error, "new password handler thing i wonder what this will look like"));
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

function saveCachePath(path) {
    let cache = myCache.get("myPath");
    if (cache != undefined) {
        console.log("resetting cache");
        let success = myCache.set("myPath", null, 100);
        saveCachePath(path);
    } else {
        let obj = { path: path };
        let success = myCache.set("myPath", obj, 100);
        console.log('path saved as: ', path)
    }
}

function getCache() {
    let cache = myCache.get("myPath");
    if (cache == undefined) {
        console.log("key not found");
        return ("/index.html")
    } else {
        console.log(cache);
        return (cache.path);
    }
}

async function handleFileQueue(req, res) {
    console.log(req.headers['authorization'])
    const authHeader = req.headers['authorization'];
    console.log("\n");
    console.log(authHeader);
    console.log("\n");
    const tempToken = authHeader.split(' ')[1];
    const user = tempToken.split('.')[0];

    let userTaskArray = await getTaskByUser(user);
    console.log(userTaskArray);
    streamArrayToClient(res, userTaskArray);
}

async function downloadFile(req, res) {
    try {
        let downloadFileName = req.headers['url']
        let filePath = './master/autogeneratedFiles/csvFiles/' + downloadFileName + '.csv';
        const stat = fs2.statSync(filePath);
        const fileSize = stat.size;
        const headers = { 'Content-Type': 'text/csv', 'Content-Length': fileSize, 'Content-Disposition': 'attachment; filename=test.csv', };
        res.writeHead(200, headers);
        fs2.createReadStream(filePath).pipe(res);

    } catch (error) {
        console.log(cache);
        return (cache.path);
    }
}


let buckets = [];
let sortedBuckets = [];
let taskCount = 0;

async function giveFirstTask(req, res) {
    if (buckets == []) {
        let firstFileName = getTaskQueueHead;
        buckets = await loadBuckets(`master/autogeneratedFiles/${firstFileName}.csv`);
    }

    //NEED TO CHANGE "assignWorkToWorker" TO NEW FUNCTION
    //streamArrayToClient(await assignWorkToWorker(req.getHeader("UUID")));
}

async function giveNewTask(req, res) {
    let workerUUID = req.getHeader("UUID");

    //NEED TO HANDLE SAVING THE RETURNED ARRAY
    taskCount += 1;
    if (taskCount >= buckets.length) {
        await bucketConcatenate();
    }
    //moveTaskFromReservedTosorted(workerUUID);

    //NEED TO CHANGE "assignWorkToWorker" TO NEW FUNCTION
    streamArrayToClient(await assignWorkToWorker(workerUUID));
}

function redirectToHandleUpload(req, res) {
    //Process the file upload in Node
    if (existsSync("master/autogeneratedFiles")) {
        if (!existsSync("master/autogeneratedFiles/csvFiles")) {
            mkdirSync("master/autogeneratedFiles/csvFiles");
        }
    } else {
        mkdirSync("master/autogeneratedFiles");
        mkdirSync("master/autogeneratedFiles/csvFiles");
    }
    const authHeader = req.headers['authorization'];
    const tempToken = authHeader.split(' ')[1];
    const user = tempToken.split('.')[1];
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

async function bucketConcatenate() {
    let fileName = getTaskQueueHead;
    let first = 1;
    sortedBuckets.forEach(element => {
        try {
            if (first) {
                writeFileSync(`master/autogeneratedFiles/csvFiles/sorted${fileName}.csv`, data, { encoding: 'utf8', flag: 'w' });
                first = 0;
            } else {
                writeFileSync(`master/autogeneratedFiles/csvFiles/sorted${fileName}.csv`, data, { encoding: 'utf8', flag: 'a' });
            }

        } catch (err) {
            console.error(err);
        }

    });
    first = 1;
    pendingQueueToFinishedQueue();
    buckets = [];
    sortedBuckets = [];
    taskCount = 0;
}