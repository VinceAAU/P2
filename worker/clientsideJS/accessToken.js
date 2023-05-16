// Retrieve the access token and UUID from local storage
const accessToken = localStorage.getItem('accessToken');
const UUID = window.UUID;
// Add the access token to the request headers
const headers = {
  'Authorization': `Bearer ${accessToken}`
};

// Make a request to the server with the access token included in the headers
fetch('protectedResource', { headers })
  .then(response => {
    if (response.status === 403) {
      console.log("received 403")

      // Redirect the user to the login page if the access token is invalid or has expired
      window.location.href = 'login.html';
    } else {
      console.log(accessToken)
      console.log(UUID)
    }
  });