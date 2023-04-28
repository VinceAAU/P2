const update = document.querySelector("#updateBtn");
const errorMessage = document.getElementById('error-message');

update.addEventListener("click", updatePasswordEvent, false);

function updatePasswordEvent(event) {
    event.preventDefault();
    updatePassword(event)
}

async function updatePassword(event) {
    var password = document.getElementById("password");
    var passwordConfirmation = document.getElementById("passwordConfirmation");
    

    const bodyData = new URLSearchParams();
    bodyData.append('password', password['value']);
    bodyData.append('passwordConfirmation', passwordConfirmation['value']);
    

    try {
        const response = await fetch('/enter-new-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: bodyData
        });

        if (!response.ok) {
            console.log(response.status)
            unevenPasswords()
            
        } else {
            console.log("response OK")
            window.location.href = '/login.html';
        }
    } catch (error) {
        console.error(error);        
    }
}

function unevenPasswords(){
    console.log("uneven passwords")
    errorMessage.textContent = "Passwords are not equal";
    errorMessage.style.opacity = 1;
}