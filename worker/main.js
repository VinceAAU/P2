/**
 * The worker module is entirely web-based, and can simply be opened 
 * in the browser!
 */

function toggleStartButton() {
    var button = document.getElementById("start_button");
    let hackerman = document.getElementById("hackerman");
    if (button.innerHTML === "Start") {
      button.innerHTML = "Disconnect";
      hackerman.style.visibility="visible";
    } else {
      button.innerHTML = "Start";
      hackerman.style.visibility="hidden";
    }
  }