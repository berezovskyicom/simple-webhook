const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser')

const app = express();

const mainServer = 'http://localhost:2001';
const webHookAdress = 'http://localhost:2002';

const listeningServer = 'http://localhost:2003';

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

async function notifySomeServer(serverHost, data) {

    await fetch(
        serverHost,
        {
            method: 'POST',
            body: data,
            headers: {
                'Content-Type': 'application/json',
            },
        }
    ).then(
        () => console.log(`sent to ${adress}`)
    ).catch(
        (err) => console.log('=== ERROR ===', err)
    )

}

// simulate post
app.post('/', (req, res) => {

    const body = JSON.stringify({
        ...req.body,
        sent_to_server: true,
    });
    
    notifySomeServer(listeningServer, body)
        .then(() => console.log('sent to listening server'));

    res.send({ action: 'done' });
})

app.listen(2002);
