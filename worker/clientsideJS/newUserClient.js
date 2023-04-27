const checkbox = document.querySelector("#submitBtn_id");
const errorMessage = document.getElementById('error-message');


checkbox.addEventListener("click", checkboxClick, false);

function checkboxClick(event) {
    event.preventDefault();
    toggleLogin(event)
}

async function toggleLogin(event) {
    var mail = document.getElementById("mailID");
    var username = document.getElementById("nameID");
    var password = document.getElementById("passwordID");
    var passwordConfirmation = document.getElementById("passwordConfirmationID");

    const bodyData = new URLSearchParams();
    bodyData.append('username', username['value']);
    bodyData.append('mail', mail['value']);
    bodyData.append('password', password['value']);
    bodyData.append('passwordConfirmation', passwordConfirmation['value']);

    try {
        const response = await fetch('/createUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: bodyData
        });

        if (!response.ok) {
            console.log(response.status)
            switch (response.status) {
                case 409:
                    alreadyExists();
                    break;
                case 400:
                    unevenPasswords();
                    break;
            }
        } else {
            console.log("response OK")
            window.location.href = '/worker/html/login.html';
        }
    } catch (error) {
        console.error(error);
    }

}

function unevenPasswords() {
    errorMessage.textContent = "Passwords are not equal";
    errorMessage.style.opacity = 1;
}

function alreadyExists() {
    errorMessage.textContent = "Mail or user already exists";
    errorMessage.style.opacity = 1;
}

function errorHandler() {
    errorMessage.textContent = "An error occurred";
    errorMessage.style.opacity = 1;
}