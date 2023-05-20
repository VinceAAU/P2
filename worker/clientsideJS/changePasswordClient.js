const update = document.querySelector("#updateBtn");
const errorMessage = document.getElementById('error-message');

update.addEventListener("click", updatePassword, false);

async function updatePassword(event) {
    event.preventDefault();
    var password = document.getElementById("password");
    var passwordConfirmation = document.getElementById("passwordConfirmation");
    

    const bodyData = new URLSearchParams();
    bodyData.append('password', password['value']);
    bodyData.append('passwordConfirmation', passwordConfirmation['value']);
    

    try {
        const response = await fetch('enter-new-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: bodyData
        });

        if (!response.ok) {
            console.log(response.status)
            switch(response.status) {
                case 400:
                    console.log(response.status)
                    unevenPasswords()
                    break;
                case 404:
                    console.log(response.status)
                    window.location.href = '/login.html';
                    break;

            }

            
            
            
        } else {
            console.log("response OK")
            window.location.href = 'login.html';
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