document.body.innerHTML = `<div id="example_container">
<button id="fullscreen_button">Fullscreen</button>
<button id="lock_button">Lock</button>
<button id="unlock_button">Unlock</button>
<textarea id="log" rows="7" cols="85"></textarea>
</div>`;
const log = document.getElementById("log");

// Lock button: Lock the screen to the other orientation (rotated by 90 degrees)
const rotate_btn = document.querySelector("#lock_button");
rotate_btn.addEventListener("click", () => {
  log.textContent += `Lock pressed \n`;

  const oppositeOrientation = screen.orientation.type.startsWith("portrait")
    ? "landscape"
    : "portrait";
  screen.orientation
    .lock(oppositeOrientation)
    .then(() => {
      log.textContent = `Locked to ${oppositeOrientation}\n`;
    })
    .catch((error) => {
      log.textContent += `${error}\n`;
    });
});

// Unlock button: Unlock the screen orientation (if locked)
const unlock_btn = document.querySelector("#unlock_button");
unlock_btn.addEventListener("click", () => {
  log.textContent += "Unlock pressed \n";
  screen.orientation.unlock();
});

// Full screen button: Set the example to fullscreen.
const fullscreen_btn = document.querySelector("#fullscreen_button");
fullscreen_btn.addEventListener("click", () => {
  log.textContent += "Fullscreen pressed \n";
  const container = document.querySelector("#example_container");
  container.requestFullscreen().catch((error) => {
    log.textContent += `${error}\n`;
  });
});
