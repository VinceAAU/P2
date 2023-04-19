const checkbox = document.querySelector("#submitBtn_id");
const loginErrorMsg = document.getElementById("login-error-msg");

checkbox.addEventListener("click", checkboxClick, false);

function checkboxClick(event) {
    event.preventDefault();
    toggleLogin(event)
}

async function toggleLogin(event) {
  console.log("funcS");
  const button = document.querySelector("#submitBtn_id");

  var username = document.getElementById("name_id");
  var password = document.getElementById("password_id");

  const bodyData = new URLSearchParams();
  bodyData.append('username', username['value']);
  bodyData.append('password', password['value']);

  try {
    const response = await fetch('/worker/html/fetchUser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: bodyData
    });

    if (!response.ok) {
      console.log("response not ok")
      throwError();
    }

    const data = await response.json();
    console.log(data.accessToken);

    const tokenResponse = await returnToken(data);

    console.log(tokenResponse['accessToken']);

    if (tokenResponse.ok) {
      console.log("response OK")
      saveAccessToken(data.accessToken)
      window.location.href = '/loggedIn';// getCache();//'/page.html';
    } else {
      console.log('Response not ok');
    }
  } catch (error) {
    console.error(error);
  }
}

function returnToken(data) {
  console.log("return token function")
  const requestOptions = {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${data.accessToken}` }
  };

  return fetch('/worker/html/posts', requestOptions);
}

function saveAccessToken(accessToken) {
  // Save the access token in local storage
  localStorage.setItem('accessToken', accessToken);
  console.log("saved accesstoken")
}

function throwError() {
    loginErrorMsg.style.opacity = 1;
}