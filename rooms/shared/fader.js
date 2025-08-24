// REMOVE this global redeclaration line if it still exists:
// let pauseBtn, pauseImg, controls, fadeSliderGroup, frontImg, backImg;

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
  let controls, fadeSliderGroup;
  let speedBtn;  // ; added

  // ---------- FADER CORE ----------
  function setOpacityWithTransition(element, targetOpacity, durationSeconds) {
    element.style.transition = `opacity ${durationSeconds}s ease-in-out`;
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
      const newBack  = isAFront ? frontImg : backImg;

      newFront.src = nextSrc;
      setOpacityWithTransition(newFront, 1, fadeSeconds);
      setOpacityWithTransition(newBack,  0, fadeSeconds);
      isAFront = !isAFront;

      console.log(`[${new Date().toLocaleTimeString()}] 🖼 Crossfaded to image ${current}: ${nextSrc} (${fadeSeconds}s)`);
      setTimeout(() => { isFading = false; }, fadeSeconds * 1000);
    };
  }

  function showInstantImage(index) {
    if (!images.length) return;
    current = (index + images.length) % images.length;
    const nextSrc = images[current];

    const topImg = isAFront ? frontImg : backImg;
    const botImg = isAFront ? backImg : frontImg;

    topImg.style.transition = 'none';
    botImg.style.transition = 'none';
    topImg.src = nextSrc;
    topImg.style.opacity = 1;
    botImg.style.opacity = 0;

    setTimeout(() => { topImg.style.transition = ''; botImg.style.transition = ''; }, 100);
    console.log(`[${new Date().toLocaleTimeString()}] ⏩ Instantly switched to image ${current}: ${nextSrc}`);
  }

  function nextImage() { crossfadeTo(current + 1); }
  function prevImage() { crossfadeTo(current - 1); }

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
    pauseImg.style.opacity = "1";
    pauseImg.style.display = "block";
    pauseImg.style.visibility = "visible";
    pauseImg.style.pointerEvents = "auto";
    frontImg.style.opacity = "0";
    backImg.style.opacity  = "0";
    document.body.classList.add("paused");
    if (pauseBtn) pauseBtn.textContent = "▶";
    console.log("⏸ Paused slideshow");
  }

  function resumeFader() {
    isPaused = false;
    pauseImg.style.opacity = "0";
    pauseImg.style.pointerEvents = "none";
    frontImg.style.opacity = "1";
    backImg.style.opacity  = "1";
    document.body.classList.remove("paused");
    intervalId = setInterval(nextImage, fadeSeconds * 1000);
    if (pauseBtn) pauseBtn.textContent = "⏸";
    console.log("▶ Resumed slideshow");
  }

  function togglePause() { isPaused ? resumeFader() : showPauseScreen(); }

  // Start hook
  window.startFader = function (imgList) {
    images = imgList;
    current = 0;
    isAFront = true;

    frontImg = document.getElementById('imgA');
    backImg  = document.getElementById('imgB');
    pauseBtn = document.getElementById("pauseBtn");
    pauseImg = document.getElementById("pauseImg");
    controls = document.getElementById("controls");
    fadeSliderGroup = document.getElementById("fadeSliderGroup");

    pauseImg.style.opacity = "0";
    pauseImg.style.pointerEvents = "none";

    showInstantImage(current);
    updateCSSFadeTime(fadeSeconds);

    setTimeout(() => {
      intervalId = setInterval(nextImage, fadeSeconds * 1000);
      console.log("▶ Auto-fader started");
    }, fadeSeconds * 1000);

    if (pauseBtn) pauseBtn.textContent = "⏸";
  };

  // Spacebar pause (bind once)
  (function bindPauseKeyOnce() {
    if (window.__pauseKeyBound) return;
    window.__pauseKeyBound = true;

    const pauseBtnEl = document.getElementById('pauseBtn');
    document.addEventListener('keydown', (e) => {
      if (!(e.code === 'Space' || e.key === ' ')) return;
      if (e.repeat) return;
      const t = e.target, tag = (t.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || t.isContentEditable) return;
      if (document.activeElement === pauseBtnEl) return;
      e.preventDefault();
      togglePause();
    });
  })();

  // ---------- DOMContentLoaded: ALL UI wiring ----------
  document.addEventListener("DOMContentLoaded", () => {
    const controlsEl     = document.getElementById("controls");
    const prevBtn        = document.getElementById("prevBtn");
    const nextBtn        = document.getElementById("nextBtn");
    const pauseBtnEl     = document.getElementById("pauseBtn");
    const slider         = document.getElementById("fadeSpeedSlider");
    const scrollerEl     = document.getElementById("hscroll");
    const imageContainer = document.getElementById("image-container");
    const speedBtn       = document.getElementById("speedBtn");
    const readout        = document.getElementById("speedVal");
    const carouselBtn = document.getElementById("carouselBtn");

    // a11y defaults for carousel
    carouselBtn?.setAttribute("aria-controls", "hscroll");
    carouselBtn?.setAttribute("aria-expanded", "true");
    scrollerEl?.setAttribute("aria-hidden", "false");


      // --- Carousel helpers (fixes ReferenceError) ---
  // How far to scroll on prev/next. “Page-ish” width feels good.
  const STEP = () => Math.round((scrollerEl?.clientWidth ?? 600) * 0.85);

  function safeHScrollBy(px) {
    if (!scrollerEl) return;
    scrollerEl.scrollBy({ left: px, behavior: "smooth" });
  }

  // Replace ANY old calls like: hScrollBy?.(STEP());
  // with theseTO DO DELETET THIS NOTE WHEN SO SURE:
  prevBtn?.addEventListener("click", () => {
    console.log("🖱 ←");
    manualShift(-1);
    safeHScrollBy(-STEP());
  });

  nextBtn?.addEventListener("click", () => {
    console.log("🖱 →");
    manualShift(1);
    safeHScrollBy(STEP());
  });


// --- Show / Hide carousel toggle (ON / OFF) ---
if (carouselBtn && scrollerEl) {
  // let CSS control layout; we only use the .is-hidden class
  scrollerEl.style.display = '';

  const setState = (hidden) => {
    scrollerEl.classList.toggle('is-hidden', hidden);
    scrollerEl.setAttribute('aria-hidden', String(hidden));
    carouselBtn.setAttribute('aria-expanded', String(!hidden));

    // ensure minimal label exists and update it
    let lbl = carouselBtn.querySelector('#carouselLabel');
    if (!lbl) {
      carouselBtn.innerHTML = `
        <img src="../../shared_imgs/carousel.png" alt="" width="24" height="24" decoding="async">
        <span id="carouselLabel"></span>
      `;
      lbl = carouselBtn.querySelector('#carouselLabel');
    }
    lbl.textContent = hidden ? 'off' : 'on';
  };

  // init from DOM
  setState(scrollerEl.classList.contains('is-hidden'));

  // single handler (overwrite any previous click logic)
  carouselBtn.onclick = () =>
    setState(!scrollerEl.classList.contains('is-hidden'));
}



    // Transport buttons
    prevBtn?.addEventListener("click", (e) => { e.stopPropagation(); console.log("🖱 ←"); manualShift(-1); hScrollBy?.(-STEP()); });
    nextBtn?.addEventListener("click", (e) => { e.stopPropagation(); console.log("🖱 →"); manualShift( 1); hScrollBy?.( STEP()); });
    pauseBtnEl?.addEventListener("click", (e) => { e.stopPropagation(); console.log("🖱 ⏯"); togglePause(); });

    // Delegated clicks
    // Delegated clicks
controlsEl?.addEventListener("click", (e) => {
  const btn = e.target.closest("#prevBtn, #nextBtn, #pauseBtn, #speedBtn, #carouselBtn");
  if (!btn) return;
  if (btn.id === "prevBtn")       { manualShift(-1); hScrollBy?.(-STEP()); }
  else if (btn.id === "nextBtn")  { manualShift( 1); hScrollBy?.( STEP()); }
  else if (btn.id === "pauseBtn") { togglePause(); }
  else if (btn.id === "speedBtn") { /* slider toggled below */ }
  // 🚫 remove this line, let the new on/off code handle carousel
  // else if (btn.id === "carouselBtn"){ toggleCarouselVisibility(); }
});


    // --- Slider wiring (vertical UI; keep ↑/↓ working) ---
    if (slider) {
      const MIN = +(slider.min || 1), MAX = +(slider.max || 10);
      slider.addEventListener("input", (e) => {
        const speed   = +e.target.value;       // 1..10
        const seconds = MIN + MAX - speed;     // higher value => faster (fewer seconds)
        fadeSeconds   = seconds;
        updateCSSFadeTime(fadeSeconds);
        if (readout) readout.textContent = seconds;  // no "s" here
        console.log("🖱 Slider set speed to", seconds, "seconds");
      });
      slider.dispatchEvent(new Event("input"));
    }

    // Show/hide slider group on big button
    if (speedBtn) {
      speedBtn.addEventListener("click", () => {
        const group = document.getElementById("fadeSliderGroup");
        if (group) group.hidden = !group.hidden;
      });
    }

    // --- Hide/Show panel UI (moved INSIDE this block per Option A) ---
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
      tabBtn.style.display     = h ? "inline-block" : "none";
      try { localStorage.setItem(LS_KEY, h ? "1" : "0"); } catch {}
    }
    if (localStorage.getItem(LS_KEY) === "1") setHidden(true); else setHidden(false);
    hideBtn.addEventListener("click", () => setHidden(true));
    tabBtn.addEventListener("click",  () => setHidden(false));
  }); // <-- END DOMContentLoaded

  // ---------- Arrow keys for main images ----------
  if (window.__arrowCtl) window.__arrowCtl.abort();
  window.__arrowCtl = new AbortController();
  document.addEventListener("keydown", (e) => {
    if (e.repeat) return;
    const t = e.target, tag = (t.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea" || t.isContentEditable) return;

    if (e.code === "ArrowLeft")  { e.preventDefault(); window.__carousel?.show?.(); prevImage(); }
    if (e.code === "ArrowRight") { e.preventDefault(); window.__carousel?.show?.(); nextImage(); }
  }, { signal: window.__arrowCtl.signal });

  // Fit panel to right gutter (your helper IIFE unchanged)
  (function fitPanelToRightGutter(){
    const panel = document.getElementById('controls');
    if (!panel) return;

    const css = getComputedStyle(document.documentElement);
    const MIN = parseInt(css.getPropertyValue('--panel-min-w')) || 128;
    const MAX = parseInt(css.getPropertyValue('--panel-max-w')) || 500;

    const INNER_MARGIN_X = 12;
    const EDGE_GAP = 0;
    const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

    function activeImageRight(){
      const els = ['imgA','imgB','pauseImg'].map(id => document.getElementById(id)).filter(Boolean);
      if (!els.length) return 0;
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
      const vpW = window.innerWidth;
      const right = activeImageRight();
      let gutterW = vpW - right - EDGE_GAP;
      if (gutterW <= 0) gutterW = MIN + INNER_MARGIN_X * 2;

      const desired = gutterW - INNER_MARGIN_X * 2;
      const panelW  = clamp(desired, MIN, MAX);
      const centered = right + (gutterW - panelW) / 2;
      const left = clamp(centered, 0 + EDGE_GAP, vpW - EDGE_GAP - panelW);

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

})(); // <-- END master IIFE
