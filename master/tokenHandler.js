import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';


export { returnToken, authenticateToken, returnTokenErr }





//
function returnToken(req, res, username) {
    console.log("return token with user: " + username)
    const str = '473f2eb9c7b9a92b59f2990e4e405fedb998dd88a361c0a8534c6c9988a44fa5eeeb5aea776de5b45bdc3cabbc92a8e4c1074d359aacba446119e82f631262f0'; //to be put in .env
    const user = { name: username }
    //console.log(process.env.ACCESS_TOKEN_SECRET)asd


    const accessToken = jwt.sign(user, str);
    res.statusCode = 201;

    res.setHeader('Content-Type', 'text/txt');
    res.write(JSON.stringify({ accessToken: accessToken }));
    res.end("\n");
}

function authenticateToken(req, res, next) {
    console.log("authenticate token function")
    const str = '473f2eb9c7b9a92b59f2990e4e405fedb998dd88a361c0a8534c6c9988a44fa5eeeb5aea776de5b45bdc3cabbc92a8e4c1074d359aacba446119e82f631262f0'; //to be put in .env
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // console.log('req.headers', req.headers);
    // console.log('authHeader:', authHeader);
    // console.log('token:', token);  
    // console.log('req.user', req.user)

    if (token == null) return res.sendStatus(401)

    jwt.verify(token, str, (err, user) => {
        if (err) return errorResponse(res, 403, err)
        
        console.log("token authenticated")
        res.statusCode = 201;
        res.setHeader('Content-Type', 'text/txt');
        res.write(JSON.stringify({ UUID: uuidv4() }));
        res.end("\n");
    });
};

function returnTokenErr(req, res, code, err) {
    console.log(err)
    res.statusCode = code;
    res.end("\n");
}