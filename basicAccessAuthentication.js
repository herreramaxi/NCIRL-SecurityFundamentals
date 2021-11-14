const db = require('./database/models/index');
const UserRepo = db.User;

verifyAccessRequest = (req, res, next) => {
    let header = req.headers["authorization"];

    if (!header || !header.includes("Basic ")) {
        return res.status(403).send({
            message: "Authorization header error 1"
        });
    }

    const token = header.substring(6);
    var decodedString = Buffer.from(token, 'base64').toString();

    if (!decodedString.includes(":")) {
        return res.status(403).send({
            message: "Authorization header error 2"
        });
    }

    const userPass = decodedString.split(':');

    UserRepo.findOne({ where: { email: userPass[0] } }).then((h) => {
        console.log("pass token: " + userPass[1]);
        console.log("pass db : " + h.password);
        if (!h || h.password !== userPass[1]) {
            return res.status(403).send("User credentials invalid");
        }

        next();
    }).catch(e => {
        console.log(e);
        res.status(500).send("Error on basicAccessAuthentication");
    });
}

const basicAccessAuthentication = {
    verifyAccessRequest: verifyAccessRequest
};

module.exports = basicAccessAuthentication;