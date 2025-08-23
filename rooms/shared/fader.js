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


// === Spacebar toggles pause (no double-trigger if button is focused) ===
(function bindPauseKeyOnce() {
  if (window.__pauseKeyBound) return;
  window.__pauseKeyBound = true;

  const pauseBtnEl = document.getElementById('pauseBtn');

  document.addEventListener('keydown', (e) => {
    // Only Space; ignore repeats
    if (!(e.code === 'Space' || e.key === ' ')) return;
    if (e.repeat) return;

    // If you're typing in inputs/textarea/contentEditable, don't toggle
    const t = e.target;
    const tag = (t.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || t.isContentEditable) return;

    // If the pause button is focused, the browser will synthesize a click on Space.
    // Let that click handle it to avoid a double-toggle.
    if (document.activeElement === pauseBtnEl) return;
    

    e.preventDefault();      // stop page scrolling on Space
    togglePause();           // same behavior as clicking the pause icon
  });
})();


// === UI wiring (clean) ===
document.addEventListener("DOMContentLoaded", () => {
  const controlsEl     = document.getElementById("controls");
  const prevBtn        = document.getElementById("prevBtn");
  const nextBtn        = document.getElementById("nextBtn");
  const pauseBtnEl     = document.getElementById("pauseBtn");
  const slider         = document.getElementById("fadeSpeedSlider");
  const scrollerEl     = document.getElementById("hscroll");
  const imageContainer = document.getElementById("image-container");
  const speedBtn = document.getElementById("speedBtn");
const readout = document.getElementById("speedVal");

  
 prevBtn?.addEventListener("click", (e) => { e.stopPropagation(); console.log("🖱 ←"); manualShift(-1); hScrollBy?.(-STEP()); });
 nextBtn?.addEventListener("click", (e) => { e.stopPropagation(); console.log("🖱 →"); manualShift(1);  hScrollBy?.(STEP());   });
 //pauseBtnEl?.addEventListener("click", (e) => { e.stopPropagation(); console.log("🖱 ⏯"); togglePause(); });


pauseBtnEl?.addEventListener("click", (e) => {
  e.stopPropagation();
  console.log("🖱 ⏯");
  togglePause();
});
// Delegation fallback: catches clicks even if inner <img> etc. is clicked
controlsEl?.addEventListener("click", (e) => {
  const btn = e.target.closest("#prevBtn, #nextBtn, #pauseBtn, #speedBtn, #carouselBtn");
  if (!btn) return;

  if (btn.id === "prevBtn")   { manualShift(-1); hScrollBy?.(-STEP()); }
  if (btn.id === "nextBtn")   { manualShift( 1); hScrollBy?.( STEP()); }
  if (btn.id === "pauseBtn")  { togglePause(); }
  if (btn.id === "speedBtn")  {
    // later: show/hide slider panel; for now just log
    console.log("speed button clicked");
  }
  if (btn.id === "carouselBtn") {
    // later: open/close carousel; for now just log
    console.log("carousel button clicked");
  }
});
  
  // --- Slider wiring ---


if (slider) {
  const MIN = +(slider.min || 1), MAX = +(slider.max || 10);

  slider.addEventListener("input", (e) => {
    const speed = +e.target.value;          // 1..10
    const seconds = MIN + MAX - speed;      // invert mapping
    fadeSeconds = seconds;
    updateCSSFadeTime(fadeSeconds);
    if (readout) readout.textContent = `${seconds}s`;
  });

  // Initialize display
  slider.dispatchEvent(new Event("input"));
}

// Toggle the slider group when big button is clicked
if (speedBtn) {
  speedBtn.addEventListener("click", () => {
    const group = document.getElementById("fadeSliderGroup");
    group.hidden = !group.hidden;
  });
}

  // stop arrow keys from nudging the slider
  slider.addEventListener("keydown", (e) => {
    if (["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(e.key)) {
      e.preventDefault(); e.stopPropagation();
    }
  });

 

  // --- Arrow keys → horizontal scroll (single owner) ---
  if (window.__arrowCtl) window.__arrowCtl.abort();
  window.__arrowCtl = new AbortController();
  document.addEventListener("keydown", (e) => {
    if (e.repeat) return;
    const t = e.target, tag = (t.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea" || t.isContentEditable) return;

      if (e.code === "ArrowLeft") {
    e.preventDefault();
    window.__carousel?.show?.();   // ✅ open carousel
    step?.(-1);                    // ✅ move main image
  }
  if (e.code === "ArrowRight") {
    e.preventDefault();
    window.__carousel?.show?.();   // ✅ open carousel
    step?.(1);                     // ✅ move main image
  }

  }, { signal: window.__arrowCtl.signal });

  // --- Wheel → single step ---
  // if (scrollerEl) {
  //   let locked = false, timer = null;
  //   const QUIET_MS = 120;  //QUIET TIME FOR SCROLL WHEEL 
  //   const stepOnce = (dir) =>
  //     (typeof window.manualShift === "function")
  //       ? window.manualShift(dir)
  //       : (dir > 0 ? nextBtn : prevBtn)?.click();

  //   scrollerEl.addEventListener("wheel", (e) => {
  //     if (!e.target.closest("#hscroll")) return;
  //     const d = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
  //     const dir = Math.sign(d); if (!dir) return;

  //     if (!locked) { locked = true; stepOnce(dir); }
  //     clearTimeout(timer);
  //     timer = setTimeout(() => { locked = false; }, QUIET_MS);
  //     e.preventDefault();
  //   }, { passive: false });
  // }

// ---- helpers used above (unchanged) ----
// function scroller(){ return document.getElementById("hscroll"); }
// function STEP(){ const el=scroller(); return Math.max(80, Math.round((el?.clientWidth || 400) * 0.25)); }
// function hScrollBy(px){ const el=scroller(); if (!el) return; el.scrollBy({ left:px, behavior:"smooth" }); }


  // --- Hide/Show panel UI (pill inside the panel + comeback tab) ---
  let hideBtn = document.getElementById("controlsHide");
  if (!hideBtn) {
    hideBtn = document.createElement("button");
    hideBtn.id = "controlsHide";
    hideBtn.textContent = "Hide";
    Object.assign(hideBtn.style, {
      position: "absolute", top: "8px", right: "8px",
      background: "rgba(255,255,255,0.6)", color: "#000",
      border: "2px solid #fff", borderRadius: "999px",
      padding: "4px 10px", cursor: "pointer",
      fontSize: "13px", fontWeight: "600", zIndex: "10"
    });
    controlsEl?.appendChild(hideBtn);
  }

  let tabBtn = document.getElementById("controlsTab");
  if (!tabBtn) {
    tabBtn = document.createElement("button");
    tabBtn.id = "controlsTab";
    tabBtn.textContent = "Controls";
    Object.assign(tabBtn.style, {
      position: "fixed", right: "0.5rem", top: "50%", transform: "translateY(-50%)",
      background: "rgba(255,255,255,0.6)", color: "#000",
      border: "2px solid #fff", borderRadius: "12px",
      padding: "6px 12px", cursor: "pointer",
      display: "none", zIndex: "1001", fontSize: "13px", fontWeight: "600"
    });
    document.body.appendChild(tabBtn);
  }

  const LS_KEY = "controls.hidden";
  function setHidden(h) {
    if (!controlsEl) return;
    controlsEl.style.display = h ? "none" : "";
    tabBtn.style.display = h ? "inline-block" : "none";
    try { localStorage.setItem(LS_KEY, h ? "1" : "0"); } catch {}
  }
  // default show unless explicitly hidden before
  if (localStorage.getItem(LS_KEY) === "1") setHidden(true); else setHidden(false);
  hideBtn.addEventListener("click", () => setHidden(true));
  tabBtn.addEventListener("click",  () => setHidden(false));

//TODO: do i need this?
  // sizePanel();
  // window.addEventListener("resize", sizePanel);
  // window.addEventListener("load",   sizePanel);
});

// --- Fit & center panel in the right gutter, with strong fallbacks + logs ---
// Center the panel INSIDE the right gutter reliably
// --- Fit & center panel in the right gutter (clamped & robust) ---
(function fitPanelToRightGutter(){
  const panel = document.getElementById('controls');
  if (!panel) return;

  const css = getComputedStyle(document.documentElement);
  const MIN = parseInt(css.getPropertyValue('--panel-min-w')) || 128;
  const MAX = parseInt(css.getPropertyValue('--panel-max-w')) || 500;

  const INNER_MARGIN_X = 12;  // padding inside the gutter (both sides)
  const EDGE_GAP       = 0;   // gap from viewport right edge
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

  function activeImageRight(){
    const els = ['imgA','imgB','pauseImg'].map(id => document.getElementById(id)).filter(Boolean);
    if (!els.length) return 0;
    // choose the visible/top one; also guard with max right
    let bestRight = 0, bestScore = -1;
    els.forEach(el => {
      const r  = el.getBoundingClientRect();
      const op = parseFloat(getComputedStyle(el).opacity) || 0;
      const s  = op * 10 + r.width;
      if (s > bestScore) { bestScore = s; bestRight = r.right; }
    });
    const maxRight = Math.max(...els.map(el => el.getBoundingClientRect().right));
    return Math.max(bestRight, maxRight);
  }

  function sizeOnce(){
    const vpW      = window.innerWidth;
    const right    = activeImageRight();
    let gutterW    = vpW - right - EDGE_GAP;  // may be ≤ 0
    if (gutterW <= 0) gutterW = MIN + INNER_MARGIN_X * 2; // fallback

    const desired  = gutterW - INNER_MARGIN_X * 2;
    const panelW   = clamp(desired, MIN, MAX);

    // centered left; then clamp so it never goes off-screen
    const centered = right + (gutterW - panelW) / 2;
    const minLeft  = 0 + EDGE_GAP;                 // never past left edge
    const maxLeft  = vpW - EDGE_GAP - panelW;      // never past right edge
    const left     = clamp(centered, minLeft, maxLeft);

    panel.style.width = panelW + 'px';
    panel.style.left  = Math.round(left) + 'px';
    panel.style.right = 'auto';
    panel.style.top   = 'calc(env(safe-area-inset-top) + 12px)';
    panel.style.bottom= 'calc(env(safe-area-inset-bottom) + 12px)';
    panel.style.zIndex= '1000';
  }

  sizeOnce();
  window.addEventListener('resize', sizeOnce);
  window.addEventListener('load',   sizeOnce);
})();



//FIN DOM BLOCK


})();
