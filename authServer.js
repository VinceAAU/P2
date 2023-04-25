import http from 'http';
import cookie from 'cookie';
import url from 'url';
import escapeHtml from 'escape-html';

const hostname = '127.0.0.1';
const port = 4000;

const server = http.createServer(requestHandler);


function requestHandler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:4000');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    let baseURL = 'http://' + req.headers.host + '/';
    let url = new URL(req.url, baseURL);



    switch (url.pathname) {
        //GET 
        case "/test":
            console.log("called")
            res.writeHead(200);
            res.end();
            break;
        case "/cookie":
            console.log("cookie")
            onRequest(req, res)
            break;
    }
}

function onRequest(req, res) {
    // Parse the query string
    var query = url.parse(req.url, true, true).query;
  
    if (query && query.name) {
      // Set a new cookie with the name
      res.setHeader('Set-Cookie', cookie.serialize('name', String(query.name), {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7 // 1 week
      }));
  
      // Redirect back after setting cookie
      res.statusCode = 302;
      res.setHeader('Location', req.headers.referer || '/');
      res.end();
      return;
    }
}


server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
