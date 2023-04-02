/**
 * The worker module is entirely web-based, and can simply be opened 
 * in the browser!
 */

function toggleStartButton() {
    var button = document.getElementById("login_button");
    if (button.innerHTML === "Login") {
      button.innerHTML = "Disconnect";
    } else {
      button.innerHTML = "Login";
    }
  }