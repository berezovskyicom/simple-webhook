
const initRequest = (
    type,
    url,
    body,
    cb = (f) => f,
) => {
    // 1. Create a new XMLHttpRequest object
    let xhr = new XMLHttpRequest();

    // 2. Configure it: GET-request for the URL /article/.../load
    xhr.open(type, url);

    // 3. Add header for sending data as JSON
    xhr.setRequestHeader('Content-Type', 'application/json');

    // 4. Send the request over the network
    xhr.send(body);

    // 5. This will be called after the response is received
    xhr.onload = function() {
        if (xhr.status != 200) { // analyze HTTP status of the response
            console.error(`Error ${xhr.status}: ${xhr.statusText}`); // e.g. 404: Not Found
        } else { // show the result
            cb(JSON.parse(xhr.response).id);
        }
    };

    // 6. Handle errors
    xhr.onerror = () => {
        console.log('Request failed');
    };
}

// 7. Handle page markup after sending the request successfully
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

// 8. Attach an Event to a Button
document.querySelector('button[data-attr="addUser-submit"]').addEventListener('click', (e) => {
    e.preventDefault();
    const formData = new FormData(document.forms.addUser);

    // 9. Send a request to client-api server
    initRequest(
        'POST',
        'http://localhost:2000/user/create',
        // 10. format form-data to json (use Object.fromEntries() with caution, it's not widely supported)
        JSON.stringify(Object.fromEntries(formData)),
        showSuccess
    );
})