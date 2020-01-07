## Build your own Node.js webhook!

![Webhook Visual Representation](https://github.com/berezovskycom/simple-webhook/blob/master/docs/webhooks-ixon-cloud.jpg)

Nowadays Webhooks are seen probably everywhere around dev community. A lot of companies use them (e.g. [Github](https://developer.github.com/webhooks/), [Mailchimp](https://mailchimp.com/developer/guides/about-webhooks/) (for signing up users from your website to your newsletter), [Shopify](https://help.shopify.com/en/api/reference/events/webhook) (offers webhooks to keep parts of your commerce system up-to-date, so you don’t have to enter new transaction details manually) and even [PayPal](https://developer.paypal.com/docs/integration/direct/webhooks/)) (to tell your accounting app when your clients pay you). And they definitely should! Now, handling them is pretty easy: you just dive into the documentation and set up a listener of their webhook. But what about creating your own one? In this tutorial we are going to build a simple login form, and, thanks to webhooks, create a new file on other server with user data.

Disclaimer: this application is only intented to show how webhooks work and what you can do with them. You might want to have a different architecture approach in production.

### So what are webhooks anyway?

Imagine you are playing soccer in an international team. And hundreds, thousands of people are watching you. They also make attention to another person - a football commentator. Every time you do something (like having a score or turning right) - he informs your viewers of what is happening on a field. He is the webhook. You are the main server and your viewers are other servers that are connected to webhook - I prefer to call them listeners. Think of webhooks like notifications. Btw, they also can be implemented by using webhooks.

### Now, let's begin

Our project will be structured like this:

```
.
├── app
│   ├── server-client
│   │   ├── index.js
│   │   └── static
│   │       ├── css
│   │       │   └── style.css
│   │       ├── index.html
│   │       └── js
│   │           └── app.js
│   ├── server-client-api
│   │   └── index.js
│   ├── server-webhook-listener
│   │   ├── files
│   │   └── index.js
│   └── webhook
│       └── index.js
├── package-lock.json
└── package.json
```

We got four servers: client (for showing users the frontend part), client-api (our pre-setup backend), webhook and webhook listener (tottaly another server, that only knows what the user has done via webhook).

You might want to check the repo at [this page](https://github.com/berezovskycom/simple-webhook).

### Front-end

In this tutorial we will use our good old plain html for markup and JavaScript for handling the request.

![Screenshot of Login Form](https://github.com/berezovskycom/simple-webhook/blob/master/docs/login-form.png)

The functionality is pretty basic: we set up two inputs, and after clicking on a button we send a request to a server with the data and then show that the operation is successfull by getting the id of that person on our client-api server.

```
<!--- index.html --->
    <main>
        <h1>Add User Page</h1>
        <form class="form form-add-user" name="addUser">
            <input type="text" class="form-add-user__name" name="name" value="john">
            <input type="text" class="form-add-user__surname" name="surname" value="smith">
            <button class="form-add-user__submit" data-attr="addUser-submit">Submit</button>
        </form>
    </main>
    <script src="js/app.js"></script>
```

And JavaScript

```
const initRequest = (type, url, body, cb) => {
    let xhr = new XMLHttpRequest();
    xhr.open(type, url);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(body);
    xhr.onload = () => {
        if (xhr.status != 200) {
            console.error(`Error ${xhr.status}: ${xhr.statusText}`); // e.g. 404: Not Found
        } else {
            cb(JSON.parse(xhr.response).id);
        }
    };
    xhr.onerror = () => console.log('Request failed');
}
```

In initRequest(), we use XMLHttpRequest object to interact with server. When using XMLHttpRequest, don't foget about setting the request header, so you will not have any problems with parsing down the data on server. For futher information about XMLHttpRequest, please refer to [javascript.info article](https://javascript.info/xmlhttprequest).

Besides, as you might have noticed, we intentionally use the callback technique: when initRequest has finished executing - run the cb() function.

Next, we should add an event listener to a button that after clicking on it would send the data to out api server.

```
document.querySelector('button[data-attr="addUser-submit"]').addEventListener('click', (e) => {
    e.preventDefault();
    const formData = new FormData(document.forms.addUser);
    initRequest(
        'POST',
        'http://localhost:2000/user/create',
        // 10. format form-data to json (use Object.fromEntries() with caution, it's not widely supported)
        JSON.stringify(Object.fromEntries(formData)),
        showSuccess
    );
})
```

Take a look at Object.fromEntries(formData). This one is used for formating the form-data to json. Use it with caution, it's only supported in [modern browsers](https://caniuse.com/#search=fromEntries).

After sending the request, we shall notify our user that his request has been sent successfully.

```
const showSuccess = (id) => {
    const span = document.createElement('span');
    span.setAttribute('data-attr', 'notification-add-user');
    span.setAttribute('class', 'form-add-user__notification form-add-user__notification--success');
    span.innerHTML = `
        Added! Go check <code>app/webhook-listener/files </code> folder
        Your id is: <code>${id}</code>
    `;
    document.forms.addUser.appendChild(span);
}


### Our backend story begins..

We start from serving our page on a client server. In each of our servers we use [fetch](https://www.npmjs.com/package/node-fetch) for handling requests, [bodyparser](https://www.npmjs.com/package/body-parser) for parsing the data we get and send.

> [fetch](https://www.npmjs.com/package/node-fetch) is a must-have JavaScript API to learn! [Visit MDN docs for more information](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API). 

In Client server, we have only one route for sending the data that was retrieved by user and then send it to an API server. A route looks exactly like this:

```
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
```

Client-API server:
```
async function notifyWebhook(body) {
    await fetch(
        webHookAdress, // 'http://localhost:2002'
        {
            method: 'POST',
            body,
            headers: {
                'Content-Type': 'application/json',
            },
        }
    ).then(
        () => console.log(`sent to ${webHookAdress}`)
    )
}

// handle post from client server
app.post('/user/create', (req, res) => {
    const id = uuidv4();
    notifyWebhook(JSON.stringify({
        ...req.body,
        id,
        action: 'user_create',
        host: req.hostname + req.path,
    }));
    res.send(JSON.stringify({ id }));
})

app.listen(2001);
```

Here, we got a route for working with the data that we got from our client and notifying the webhook what has been done. Notice how we mutate an object to send - we use tree dots a.k.a ['the spread operator'](https://dev.to/sagar/three-dots---in-javascript-26ci) to pass all object properties to a new object. This pattern is highly used in Redux, when working with [Reducers](https://css-tricks.com/understanding-how-reducers-are-used-in-redux/).

### And... cherry on top!

Our webhook code looks like this:

```
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
    notifySomeServer(listeningServer, body) // 'http://localhost:2003'
        .then(() => console.log('sent to listening server'));
    res.send({ action: 'done' });
})

app.listen(2002);

```

As you can see, there is no rocket science. We basically just make a post to another server with the data that we got from our client-api.

### Our beloved listener

The server-listener takes a big role in our project - without it we wouldn't even create our project. This is the script you'd work on if you only had to connect to companies API that is mentioned in the beginning of this tutorial.

```
// handle the request from webhook
app.post('/', (req, res) => {
    console.log('Got from webhook');
    console.log(req.body);
    const { action } = req.body;
    // handle logic depending on action that was initiated by our user
    switch(action) {
        case 'user_create':
            saveFile(req.body);
            break;
        default:
            return 0;
    }
})
```

Here we handle the webhook call, and choose what to do depending on our action type. 

```
// node.js function for creating a file with user info
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
```

> [fs](https://nodejs.org/api/fs.html) is a powerful Node.js module that you should take a look at. You can create so many cool features with it!

### Finale

If you followed all the steps, run all node.js scripts from its parent folder and open [http://localhost:2000](http://localhost:2000). Fill out the form, click submit and check the server-webhook-listener/files folder. You should see the newly created file containing user information.

![Response from webhook in console](https://github.com/berezovskycom/simple-webhook/blob/master/docs/server-webhook-listener-response.png)

That's all about webhooks for now! Don't stop exploring the topic, it's really interesting!

