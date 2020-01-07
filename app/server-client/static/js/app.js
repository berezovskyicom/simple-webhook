
const initRequest = (
    method,
    url,
    body,
    cb = (f) => f,
) => {
    fetch(
        url,
        {
            method,
            body,
            headers: {
                'Content-Type': 'application/json',
            },
        }
    ).then(res => res.json()
    ).then(body => cb(body.id))
};

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