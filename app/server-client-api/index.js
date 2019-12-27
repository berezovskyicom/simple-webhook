const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser')
const uuidv4 = require('uuid/v4');

const app = express();

const webHookAdress = 'http://localhost:2002';

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

async function notifyWebhook(data) {

    await fetch(
        webHookAdress,
        {
            method: 'POST',
            body: data,
            headers: {
                'Content-Type': 'application/json',
            },
        }
    ).then(
        () => console.log(`sent to ${webHookAdress}`)
    )

}

// simulate post
app.post('/user/create', (req, res) => {

    console.log(req.body);

    const id = uuidv4();

    notifyWebhook(JSON.stringify({
        ...req.body,
        id,
        host: req.hostname + req.path,
    }));

    res.send(JSON.stringify({ id }));
})

app.listen(2001);
