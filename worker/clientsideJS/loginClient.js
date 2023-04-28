const checkbox = document.querySelector("#submitBtn_id");
const loginErrorMsg = document.getElementById("login-error-msg");

checkbox.addEventListener("click", checkboxClick, false);

function checkboxClick(event) {
    event.preventDefault();
    toggleLogin(event)
}

async function toggleLogin(event) {
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
      throwError();
    }

    const data = await response.json();
    console.log(data.accessToken);
    
    const tokenResponse = await tokenExchange(data);
    const retrieved = await tokenResponse.json(); 
    console.log(retrieved.UUID)

    if (tokenResponse.ok) {
      console.log("response OK")
      saveData(data.accessToken, retrieved.UUID)
      window.location.href = '/loggedIn';// getCache();//'/page.html';
    } else {
      console.log('Response not ok');
    }
  } catch (error) {
    console.error(error);
  }
}

async function tokenExchange(data){
  try {
    const response = await fetch('/posts', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${data.accessToken}`}
    });
    return(response)
  } catch (error) {
    console.error(error);
  }
}

function saveData(accessToken, ID) {
  console.log("savedaata function")
  // Save the access token in local storage
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('UUID', ID);
  console.log("saved accesstoken")
}

function throwError() {
    loginErrorMsg.style.opacity = 1;
}