import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
export { returnToken, authenticateToken, returnTokenErr, decodeToken }

//Used to retrieve the secret key hidden in the .env file
dotenv.config();
const acccesTokenSecret = process.env.ACCESS_TOKEN_SECRET;

// Function to assign an accessToken to user upon login. 
function returnToken(req, res, username) {
    const user = { name: username }
    const accessToken = jwt.sign(user, acccesTokenSecret);
    res.statusCode = 201;

    res.setHeader('Content-Type', 'text/txt');
    res.write(JSON.stringify({ accessToken: accessToken }));
    res.end("\n");
}

//Function to validate the previously assigned accesstoken
function authenticateToken(req, res) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401)

    jwt.verify(token, acccesTokenSecret, (err, user) => {
        if (err) return returnTokenErr(res, 403, err) // HTTP 403 = access to the requested resource is forbidden
        //decodeToken(req,res)
        console.log("User: '",decodeToken(req),"' Just logged in")
        res.statusCode = 201; //HTTP 201 = request has succeeded and has led to the creation of a resource 
        res.setHeader('Content-Type', 'text/txt');
        res.write(JSON.stringify({ UUID: uuidv4() }));
        res.end("\n");
    });
};

//Errorhandling. Used to give a response to the user
function returnTokenErr(res, code, err) {
    console.log(err)
    res.statusCode = code;
    res.end("\n");
};

//Function to decode accesstokens, to return the username, decoded in the payload
function decodeToken(req) {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.decode(token, { complete: true });
    const payload = decodedToken.payload;
    const username = payload.name;
    return username;
  };

//For testing purposes
export const exportForTesting = {
    decodeToken
  }