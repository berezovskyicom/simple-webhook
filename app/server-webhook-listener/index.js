const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser')
const fs = require('fs');
const path = require('path');

const app = express();

const mainServer = 'http://localhost:2001';
const webHookAdress = 'http://localhost:2002';

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

// simulate post
app.get('/', (req, res) => {
    res.send('Another page');
})

app.post('/', (req, res) => {
    console.log('Got from webhook');
    console.log(req.body);

    const { action } = req.body;

    switch(action) {
        case 'user_create':
            saveFile(req.body);
            break;
        default:
            return 0;
    }
})

const saveFile = (body) => {
    const {
        name,
        surname,
        id,
    } = body;

    const to = path.resolve(__dirname + `/files/${name}-${id}.txt`);
    const content = `New user been registered (${name}, ${surname}).`

    fs.writeFile(to, content, () => console.log('Saved!'));
}

app.listen(2003);
