const checkbox = document.querySelector("#submitBtn_id");
const loginErrorMsg = document.getElementById("login-error-msg");

checkbox.addEventListener("click", checkboxClick, false);

function checkboxClick(event) {
    event.preventDefault();
    toggleLogin(event)
}

async function toggleLogin(event) { // async await 
    console.log("funcS");
    const button = document.querySelector("#submitBtn_id");

    var username = document.getElementById("name_id");
    var password = document.getElementById("password_id");
    //console.log(username['value'] + password['value'])

    const bodyData = new URLSearchParams();
    bodyData.append('username', username['value']);
    bodyData.append('password', password['value']);

    fetch('/worker/html/fetchUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: bodyData
      })
        .then((response) => {
          if (!response.ok) {
            throwError()
          }
          return response.json();
        })
        .then((data) => {
          console.log(data);
          returnToken(data)
            .then((response) => {
              if (response.ok) {
                window.location.href = '/loggedIn';// getCache();//'/page.html';
              } else {
                console.log('Response not ok');
              }
            })
            .catch((error) => console.log(error));
        })
        .catch((error) => console.error(error));
}

function returnToken(data) {
    const requestOptions = {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${data.accessToken}` }
    };

    return fetch('http://localhost:3000/worker/html/posts', requestOptions)
}

function throwError() {
    loginErrorMsg.style.opacity = 1;
}