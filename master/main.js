/**
 * This is the main entry point for the master server software. It can 
 * (ideally) be run with `node main.js`, and will then set up a web 
 * server
 */

import http from 'http';
import fs from "fs";
import path  from "path";
import process from "process";

const hostname = '127.0.0.1';
const port = 3000;

let rootFileSystem=process.cwd();
//rootFileSystem = rootFileSystem.replace("/master", "");
rootFileSystem = path.dirname(rootFileSystem);

const server = http.createServer(requestHandler);

function requestHandler(req,res){
  try{
   handleRequest(req,res);
  }catch(e){
    console.log("!!: " +e);
   errorResponse(res,500,"");
  }
}


function handleRequest(req, res){
  console.log("GOT: " + req.method + " " +req.url);

  let baseURL = 'http://' + req.headers.host + '/';
  let url=new URL(req.url,baseURL);
  let searchParms=new URLSearchParams(url.search);
  let queryPath=decodeURIComponent(url.pathname);

  switch(req.method){
    case "GET":
      console.log("GET");
      let pathElements=queryPath.split("/"); 
        console.log(pathElements);
        //USE "sp" from above to get query search parameters
        let startPath = "";
        switch(pathElements[1]){     
          case "":
             fileResponse(res,"worker/index.html");
             break;
          case "login.html":
            startPath += "worker/";
            startPath += pathElements[1];
            fileResponse(res, startPath);
           break;
          case "Page.html":
            startPath += "Customer/";
            startPath += pathElements[1];
            fileResponse(res, startPath);
            break;
          default: //for anything else we assume it is a file to be served
             fileResponse(res, req.url);
            break;
    }
      break;
    case "POST":
      
      break;
    default:
      console.log("Fault");
      break;

  }
}

function fileResponse(res, filename){
    const sPath=securePath(filename);
    console.log("Reading:"+sPath);
    fs.readFile(sPath, (err, data) => {
      if (err) {
        console.error(err);
        errorResponse(res,404,String(err));
      }else {
        res.statusCode = 200;
        res.setHeader('Content-Type', guessMimeType(filename));
        res.write(data);
        res.end('\n');
      }
    })
  }


  function guessMimeType(fileName){
    const fileExtension=fileName.split('.').pop().toLowerCase();
    console.log(fileExtension);
    const ext2Mime ={ //Aught to check with IANA spec
      "txt": "text/txt",
      "html": "text/html",
      "ico": "image/ico", // CHECK x-icon vs image/vnd.microsoft.icon
      "js": "text/javascript",
      "json": "application/json", 
      "css": 'text/css',
      "png": 'image/png',
      "jpg": 'image/jpeg',
      "wav": 'audio/wav',
      "mp3": 'audio/mpeg',
      "svg": 'image/svg+xml',
      "pdf": 'application/pdf',
      "doc": 'application/msword',
      "docx": 'application/msword'
     };
      //incomplete
    return (ext2Mime[fileExtension]||"text/plain");
  }


  function errorResponse(res, code, reason){
    res.statusCode=code;
    res.setHeader('Content-Type', 'text/txt');
    res.write(reason);
    res.end("\n");
  }
  
  function securePath(userPath){
    if (userPath.indexOf('\0') !== -1) {
      // could also test for illegal chars: if (!/^[a-z0-9]+$/.test(filename)) {return undefined;}
      return undefined;
  
    }
    userPath = path.normalize(userPath).replace(/^(\.\.(\/|\\|$))+/, '');
  
    let p= path.join(rootFileSystem,path.normalize(userPath)); 
    //console.log("The path is:"+p);
    return p;
  }
  
  
   server.listen(port, hostname, () => {
    console.log(`${rootFileSystem}`)
    console.log(`Server running at http://${hostname}:${port}/`);
   });
    