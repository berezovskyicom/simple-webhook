const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');

const app = express();

const listeningServer = 'http://localhost:2003';

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

// send notifications to preconnected servers
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

// default route for handling the data that we got from out client-api server
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
