const express = require('express');
const fetch = require('node-fetch');

const app = express();

const mainServer = 'http://localhost:2001';

const bodyParser = require('body-parser')

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

// handle static files (like index.html and styles)
app.use(express.static('static'))

// make a route for handling new user
app.post('/user/create', (req, res) => {
    const body = JSON.stringify(req.body);

    // fetch to client-api server
    fetch(
        `${mainServer}/user/create`,
        {
            method: 'POST',
            body,
            headers: {
                'Content-Type': 'application/json',
            },
        }
    ).then(
        res => res.json()
    ).then(
        json => res.send(json)
    )
})

app.listen(2000);
