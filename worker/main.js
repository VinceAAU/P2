/**
 * The worker module is entirely web-based, and can simply be opened 
 * in the browser!
 */

function toggleStartButton() {
  let button = document.querySelector("#start_button");
  let hackerman = document.querySelector("#hackerman");
  if (button.textContent === "Start") {
    button.textContent = "Disconnect";
    hackerman.style.visibility="visible";
  } else {
    button.textContent = "Start";
    hackerman.style.visibility="hidden";
  }
}