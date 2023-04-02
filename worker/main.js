/**
 * The worker module is entirely web-based, and can simply be opened 
 * in the browser!
 */

function toggleStartButton() {
    var button = document.getElementById("start_button");
    if (button.innerHTML === "Start") {
      button.innerHTML = "Disconnect";
    } else {
      button.innerHTML = "Start";
    }
  }