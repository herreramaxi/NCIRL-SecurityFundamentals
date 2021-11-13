const express = require('express')
const app = express()

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded());

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

app.get('/api/users', (req, res) => {
    res.send("hello world!")
});

app.post("/api/user", (req, res) => {
    // if (!req.body.temperature)
    //     return res.status(400).send({ message: "Mandatory fields not provided: [temperature]" });

    try {

        console.log("data: " + req.body.data)
        console.log("pp: " + req.body.hash)
        res.send("ok: " + req.body.data + ", " + req.body.hash);
    } catch (error) {
        res.status(500).send({ message: "Error when trying to save a temperature sample. " + error })
    }
});
// Start the app by listening on the default Heroku port
app.listen(process.env.PORT || 3001);