const search = document.querySelector("#searchBtn");
const errorMessage = document.getElementById('error-message');


search.addEventListener("click", searchForUserEvent, false);

function searchForUserEvent(event) {
    event.preventDefault();
    toggleSearch(event)
}

async function toggleSearch(event) {
    var username = document.getElementById("nameID");
    

    const bodyData = new URLSearchParams();
    bodyData.append('username', username['value']);

    try {
        const response = await fetch('/forgot-password-post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: bodyData
        });

        if (!response.ok) {
            console.log(response.status)
            noUser()
            
        } else {
            console.log("response OK")
            window.location.href = '/enterNewPassword';
        }
    } catch (error) {
        console.error(error);        
    }

}

function noUser() {
    console.log("func nouser")
    errorMessage.textContent = "User not found.";
    errorMessage.style.opacity = 1;
}


