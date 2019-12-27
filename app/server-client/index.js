const express = require('express');
const fetch = require('node-fetch');

const app = express();

const mainServer = 'http://localhost:2001';

const bodyParser = require('body-parser')

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

app.use(express.static('static'))

app.post('/user/create', (req, res) => {
    const body = JSON.stringify({
        ...req.body,
        action: 'user_create',
    })

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
