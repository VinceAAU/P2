import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import {errorResponse} from '../server.js'
import dotenv from 'dotenv';
dotenv.config();

const acccesTokenSecret = process.env.ACCESS_TOKEN_SECRET;

export { returnToken, authenticateToken, returnTokenErr, decodeToken }


//
function returnToken(req, res, username) {
    console.log("return token with user: " + username)
    
    const user = { name: username }
    const accessToken = jwt.sign(user, acccesTokenSecret);
    res.statusCode = 201;

    res.setHeader('Content-Type', 'text/txt');
    res.write(JSON.stringify({ accessToken: accessToken }));
    res.end("\n");
}

function authenticateToken(req, res) {
    console.log("authenticateToken")
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    console.log(token == null)
    if (token == null) return res.sendStatus(401)

    jwt.verify(token, acccesTokenSecret, (err, user) => {
        if (err) return returnTokenErr(res, 403, err)
        decodeToken(req,res)
        console.log("token authenticated")
        res.statusCode = 201;
        res.setHeader('Content-Type', 'text/txt');
        res.write(JSON.stringify({ UUID: uuidv4() }));
        res.end("\n");
    });
};

function returnTokenErr(res, code, err) {
    console.log(err)
    res.statusCode = code;
    res.end("\n");
};

function decodeToken(req) {
    console.log("decode token")
    const authHeader = req.headers.authorization;
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.decode(token, { complete: true });
    const payload = decodedToken.payload;
    const username = payload.name;
    return username;
  };
  