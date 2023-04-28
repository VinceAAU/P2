// Retrieve the access token from local storage
const accessToken = localStorage.getItem('accessToken');
const UUID = localStorage.getItem('UUID');
// Add the access token to the request headers
const headers = {
  'Authorization': `Bearer ${accessToken}`
};

// Make a request to the server with the access token included in the headers
fetch('/protectedResource', { headers })
  .then(response => {
    if (response.status === 401) {
        console.log("received 401")
    
      // Redirect the user to the login page if the access token is invalid or has expired
      window.location.href = '/401';
    } else {
      console.log(accessToken)
      console.log(UUID)
    }
  });