const express = require('express')
const app = express()
const db = require('./database/models/index');
const UserModel = db.User;
const { Sequelize } = require('sequelize');
const Op = Sequelize.Op;
var crypto = require('crypto');
const basicAccessAuthentication = require("./basicAccessAuthentication");

app.use(express.urlencoded());
app.use(express.json());

if (process.env.NODE_ENV === 'production') {
    var redirectToHTTPS = require('express-http-to-https').redirectToHTTPS;
    const ignoreHosts = [/localhost:(\d{4})/];
    // const ignoreHosts = [];
    const ignoreRoutes = [];
    app.use(redirectToHTTPS(ignoreHosts, ignoreRoutes));
}

app.get('/ping', (req, res) => {
    res.send("pong")
});

app.post('/api/login', (req, res) => {

    if (!(req.body.email && req.body.password)) {
        return res.status(400).send({ message: "Mandatory fields not provided" });
    }

    UserModel.findOne(
        {
            where: {
                email: { [Op.iLike]: req.body.email }
            }
        }).then((h) => {
            const hash = crypto.createHash('sha256').update(req.body.password).digest('base64');

            if (!h || h.password !== hash) {
                return res.status(401).send("User credentials invalid");
            }

            console.log("password: " + req.body.password)
            console.log("hash: " + hash)
            console.log("h.password: " + h.password)

            res.send("ok");
        }).catch(e => {
            console.log(e);
            res.status(500).send("Error on login endpoint");
        });
});

app.get('/api/users/getAll', [basicAccessAuthentication.verifyAccessRequest], (req, res) => {
    UserModel.findAll().then(r => {
        var data = { users: r };

        //https://stackoverflow.com/questions/22203463/replace-null-values-to-empty-values-in-a-json-object
        data = JSON.parse(JSON.stringify(data).replace(/\:null/gi, "\:\"\""));
        res.send(data);
    }).catch(err => {
        res.status(500).send({ message: err.message });
    });
});

app.post("/api/users/addOrUpdate", [basicAccessAuthentication.verifyAccessRequest], (req, res) => {
    if (!(req.body.firstName && req.body.lastName && req.body.email && req.body.password && req.body.data && req.body.hash)) {
        return res.status(400).send({ message: "Mandatory fields not provided" });
    }

    try {
        const fieldsConcatenated = req.body.firstName + req.body.lastName + req.body.email + req.body.password + req.body.data;
        const hash = crypto.createHash('sha256').update(fieldsConcatenated).digest('base64');

        if (hash !== req.body.hash) {
            return res.status(500).send("invalid hash");
        }

        console.log("firstName: " + req.body.firstName)
        console.log("lastName: " + req.body.lastName)
        console.log("email: " + req.body.email)
        console.log("password: " + req.body.password)
        console.log("data: " + req.body.data)
        console.log("hash: '" + req.body.hash + "'")
        console.log("calculated hash: '" + hash + "'")
        console.log("hash are equals: " + (hash === req.body.hash))

        UserModel.findOne({ where: { email: req.body.email } }).then((h) => {
            if (h) {
                h.firstName = req.body.firstName;
                h.lastName = req.body.lastName;
                h.email = req.body.email;
                h.password = req.body.password;
                h.data = req.body.data;
                h.save();
                res.send("User updated: " + h.email);
            } else {
                UserModel.create({
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    email: req.body.email,
                    password: req.body.password,
                    data: req.body.data
                }).then(r => {
                    res.send("User created: " + r.email);
                });
            }
        });
    } catch (error) {
        res.status(500).send({ message: "Error when trying to create an user: " + error })
    }
});

app.post("/api/users/resetUsers", [basicAccessAuthentication.verifyAccessRequest], (req, res) => {

    try {
        UserModel.destroy({
            where: {
                email: { [Op.notILike]: "admin@sf.com" }
            }
        }).then(h => {
            console.log("users deleted");
            return res.send("Users deleted except admin");
        });

    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Error when trying to delete users: " + error })
    }

});
// Start the app by listening on the default Heroku port
app.listen(process.env.PORT || 3001);