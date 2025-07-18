let pauseBtn, pauseImg, controls, fadeSliderGroup, frontImg, backImg;

(function () {
  let frontImg, backImg;
  let current = 0;
  let intervalId;
  let images = [];
  let isAFront = true;
  let isFading = false;
  let fadeSeconds = 5; // Default speed
  let isPaused = false;

  let pauseBtn, pauseImg;

  function setOpacityWithTransition(element, targetOpacity, durationSeconds) {
    element.style.transition = `opacity ${durationSeconds}s ease-in-out`;
    element.style.opacity = targetOpacity;
  }

  function crossfadeTo(index) {
    if (!images.length || isFading || isPaused) return;

    current = (index + images.length) % images.length;
    const nextSrc = images[current];
    isFading = true;

    const imgPreloader = new Image();
    imgPreloader.src = nextSrc;
    imgPreloader.onload = () => {
      const newFront = isAFront ? backImg : frontImg;
      const newBack = isAFront ? frontImg : backImg;

      newFront.src = nextSrc;
      setOpacityWithTransition(newFront, 1, fadeSeconds);
      setOpacityWithTransition(newBack, 0, fadeSeconds);
      isAFront = !isAFront;

      console.log(`[${new Date().toLocaleTimeString()}] 🖼 Crossfaded to image ${current}: ${nextSrc} (${fadeSeconds}s)`);

      setTimeout(() => {
        isFading = false;
      }, fadeSeconds * 1000);
    };
  }

  function showInstantImage(index) {
    if (!images.length) return;

    current = (index + images.length) % images.length;
    const nextSrc = images[current];

    const topImg = isAFront ? frontImg : backImg;
    const bottomImg = isAFront ? backImg : frontImg;

    topImg.style.transition = 'none';
    bottomImg.style.transition = 'none';

    topImg.src = nextSrc;
    topImg.style.opacity = 1;
    bottomImg.style.opacity = 0;

    setTimeout(() => {
      topImg.style.transition = '';
      bottomImg.style.transition = '';
    }, 100);

    console.log(`[${new Date().toLocaleTimeString()}] ⏩ Instantly switched to image ${current}: ${nextSrc}`);
  }

  function nextImage() {
    crossfadeTo(current + 1);
  }

  function prevImage() {
    crossfadeTo(current - 1);
  }

  

  function manualShift(direction) {
    clearInterval(intervalId);
    showInstantImage(current + direction);
    setTimeout(() => {
      intervalId = setInterval(nextImage, fadeSeconds * 1000);
      console.log(`[${new Date().toLocaleTimeString()}] 🔄 Resuming auto-fader`);
    }, 100);
  }

  function updateCSSFadeTime(seconds) {
    fadeSeconds = seconds;
    const duration = `${seconds}s`;
    document.querySelectorAll('.fade-img').forEach(img => {
      img.style.transition = `opacity ${duration} ease-in-out`;
    });
  }
 
function showPauseScreen() {
  clearInterval(intervalId);
  isPaused = true;

  // Set pause image visible, hide slideshow images
pauseImg.style.opacity = "1";
 pauseImg.style.display = "block"; 
pauseImg.style.visibility = "visible";
pauseImg.style.pointerEvents = "auto";
frontImg.style.opacity = "0";
backImg.style.opacity = "0";


  // Hide controls
  document.body.classList.add("paused");

  // Change button icon
  if (pauseBtn) pauseBtn.textContent = "▶";
  console.log("⏸ Paused slideshow");
}

function resumeFader() {
  isPaused = false;

  // Resume slideshow visuals
  pauseImg.style.opacity = "0";
  pauseImg.style.pointerEvents = "none";
  frontImg.style.opacity = "1";
  backImg.style.opacity = "1";
  // Restore controls
  document.body.classList.remove("paused");

  // Restart interval
  intervalId = setInterval(nextImage, fadeSeconds * 1000);

  // Change button icon
  if (pauseBtn) pauseBtn.textContent = "⏸";
  console.log("▶ Resumed slideshow");
}

 function togglePause() {
  if (isPaused) {
    resumeFader();
  } else {
    showPauseScreen();
  }
}

window.startFader = function (imgList) {
  images = imgList;
  current = 0;
  isAFront = true;

  frontImg = document.getElementById('imgA');
  backImg = document.getElementById('imgB');
  pauseBtn = document.getElementById("pauseBtn");
  pauseImg = document.getElementById("pauseImg");
  controls = document.getElementById("controls");
  fadeSliderGroup = document.getElementById("fadeSliderGroup");

  // Hide pause image
  pauseImg.style.opacity = "0";
  pauseImg.style.pointerEvents = "none";

  // Set initial image instantly
  showInstantImage(current);

  // Ensure transition styles match the current fade time
  updateCSSFadeTime(fadeSeconds);

  // Start fader after delay
  setTimeout(() => {
    intervalId = setInterval(nextImage, fadeSeconds * 1000);
    console.log("▶ Auto-fader started");
  }, fadeSeconds * 1000);

  if (pauseBtn) pauseBtn.textContent = "⏸";
};


setTimeout(() => {
  intervalId = setInterval(nextImage, fadeSeconds * 1000);
  console.log("▶ Auto-fader started");
}, fadeSeconds * 1000);
  // Entry Point
 
  // Event Listeners
  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("prevBtn")?.addEventListener("click", () => {
      console.log("🖱 Click: ←");
      manualShift(-1);
    });

    document.getElementById("nextBtn")?.addEventListener("click", () => {
      console.log("🖱 Click: →");
      manualShift(1);
    });

    document.getElementById("pauseBtn")?.addEventListener("click", () => {
      console.log("🖱 Click: ⏯");
      togglePause();
    });
    document.getElementById("fadeSpeedSlider")?.addEventListener("input", (e) => {
  fadeSeconds = Number(e.target.value);
  updateCSSFadeTime(fadeSeconds);
  console.log(`⏱️ Fade speed set to ${fadeSeconds} seconds`);
});

    document.addEventListener("keydown", (e) => {
      if (e.code === "ArrowLeft") {
        console.log("⌨️ Key: ←");
        manualShift(-1);
      } else if (e.code === "ArrowRight") {
        console.log("⌨️ Key: →");
        manualShift(1);
      } else if (e.code === "Space") {
        e.preventDefault();
        console.log("⌨️ Key: ⏯ (space)");
        togglePause();
      }
    });
  });
})();
