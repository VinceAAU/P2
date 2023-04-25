import formidable from 'formidable';
import fs from "fs/promises";
import NodeCache from "node-cache";
//import { env } from 'process';asd

export { requestHandler, fileResponse }

//function imports from other .js files
import { search_db } from "./master/db.js"
import { streamArray, handleUpload } from "./master/exchangeData.js"
import { search, passwords } from "./master/forgotPassword.js"
import { validateNewUser } from "./master/createUser.js"
import { returnToken, authenticateToken } from './master/tokenHandler.js';
import { securePath, throw_user, errorResponse, guessMimeType, redirect, extractForm } from './server.js';
import { savePendingQueue, addCustomerQueue, removeCustomerQueue, getTaskQueueHead, getUserQueueHead, pendingQueueToFinishedQueue, getTaskByUser } from './master/queue.js'

const loginPath = '/worker/html/login.html';
const workerPath = '/worker/html/workerPage.html';

const changePasswordPath = '/worker/html/changePassword.html';
const indexPath = '/worker/html/index.html';
const customerPagePath = '/customer/customerPage.html';
const CSSPath = 'worker/style.css';

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
      maxFileSize: maxFileSizeGB * 1024 * 1024 * 1024 // 10 GB limit
    });

    switch (url.pathname) {
        //GET 
        case "/":
        case "/index.html":
            fileResponse(res, indexPath);
            break;
        case "/login.html":
        case "/worker/login.html":
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
                .catch(thrown_error => returnTokenErr(req, res, 401, thrown_error)); //401: unauthorized
            break;
        case "/401": //called from hrefs
            redirect(req, res, loginPath)
            break;
        case "/workerPage":
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
        case "/get-task-list-by-user":
            handleFileQueue(req, res);
            break;

        default:
            fileResponse(res, "." + url.pathname); //TODO: DELETE THIS LINE AND UNCOMMENT THE NEXT ONE
        //errorResponse(res, 404, "Resource not found");
    }
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

function saveCachePath(path) {
    let cache = myCache.get("myPath");
    if (cache != undefined) {
        console.log("resetting cache");
        let success = myCache.set("myPath", null, 10000);
        saveCachePath(path);
    } else {
        let obj = { path: path };
        let success = myCache.set("myPath", obj, 10000);
        console.log('path saved as: ', path)
    }
}

function getCache() {
    let cache = myCache.get("myPath");
    if (cache == undefined) {
        console.log("key not found");
        redirect(req, res, indexPath);
    } else {
        console.log(cache);
        return (cache.path);
    }   
}
