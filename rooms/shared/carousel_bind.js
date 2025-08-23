// shared/carousel_bind.js
// Reusable binder for the thumbnail carousel. Works with your existing fader.js.
// Assumes the page has: #imgA, #imgB, #hscroll, #prevBtn, #nextBtn.

// shared/carousel_bind.js  (classic script, NOT type="module")
(function () {
  // avoid double-defining
  if (window.initCarousel) return;


  // Expose global API
  window.initCarousel = function initCarousel(opts = {}) {
    const {
      images,
      scrollerId = 'hscroll',
      prevId     = 'prevBtn',
      nextId     = 'nextBtn',
      imgAId     = 'imgA',
      imgBId     = 'imgB',
      autoHideMs = 2000,
    } = opts;

    const scroller = document.getElementById(scrollerId);
    const prev     = document.getElementById(prevId);
    const next     = document.getElementById(nextId);
    const A        = document.getElementById(imgAId);
    const B        = document.getElementById(imgBId);
    const imageContainer = document.getElementById('image-container');




    if (!Array.isArray(images) || !images.length || !scroller || !A || !B) {
      console.warn('[carousel] missing deps or empty images');
      return { teardown(){} };
    }

  

    // ---- Build thumbnails once
    {
      const frag = document.createDocumentFragment();
      images.forEach((src, i) => {
        const btn = document.createElement('button');
        btn.className = 'hpanel'; btn.type = 'button'; btn.dataset.index = i;

        const img = document.createElement('img');
        img.src = src; img.alt = `thumb ${i+1}`; img.loading = 'lazy'; img.decoding = 'async';

        const badge = document.createElement('span');
        badge.className = 'idx'; badge.textContent = i + 1;

        btn.append(img, badge);
        frag.append(btn);
      });
     scroller.replaceChildren(frag);
     scroller.dataset.carouselBound = '1';   // restore CSS hook for sizing/styling
}

// ---- Carousel state & helpers (single definitions) ----

// Wake-once wheel while carousel is hidden
function armWakeWheel() {
  if (window.__wakeWheel) return; // already armed
  window.__wakeWheel = function wakeOnWheel(e) {
    // only when hidden and over the image area
    if (document.body.classList.contains('show-carousel')) { disarmWakeWheel(); return; }
    if (!e.target.closest?.('#image-container')) return;

   const d = Math.sign(e.deltaY);  // use vertical wheel only

    e.preventDefault();
    showCarousel();
    resetCarouselHide();
    if (d) step(d);                      // exactly one step
    disarmWakeWheel();                    // remove after first use
  };
  window.addEventListener('wheel', window.__wakeWheel, { capture:true, passive:false });
}

function disarmWakeWheel() {
  if (!window.__wakeWheel) return;
  window.removeEventListener('wheel', window.__wakeWheel, true);
  window.__wakeWheel = null;
}


let i = 0;                                // current index maintained by carousel UI
const N = images.length;
const btns = Array.from(scroller.children);

const tail = (s) => s.split('/').pop();

function getIndexFromTop() {
  const ao = parseFloat(getComputedStyle(A).opacity || '0');
  const bo = parseFloat(getComputedStyle(B).opacity || '0');
  const topImg = (ao === bo) ? B : (ao > bo ? A : B);
  const shown  = tail(topImg.src);
  return images.findIndex((p) => shown.endsWith(tail(p)));
}

function setActive(j, center = true) {
  const prevIdx = i;
  i = (j + N) % N;

  btns.forEach((b, k) => b.classList.toggle('active', k === i));

  if (!center) return;

  const wrappedFwd  = (prevIdx === N - 1 && i === 0);
  const wrappedBack = (prevIdx === 0     && i === N - 1);
  if (wrappedFwd || wrappedBack) {
    const endLeft = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
    const oldSnap = scroller.style.scrollSnapType;
    scroller.style.scrollSnapType = 'none';
    scroller.scrollLeft = wrappedFwd ? 0 : endLeft;
    requestAnimationFrame(() => {
      scroller.style.scrollSnapType = oldSnap || '';
      btns[i]?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'auto' });
    });
  } else {
    btns[i]?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }
}

// Drive ONE slideshow step using the transport buttons (fallbacks included)
function step(d) {
  if (!d) return;

  // Prefer buttons (matches your old working behavior)
  const btn = d > 0 ? next : prev;
  if (btn) {
    btn.click();
  } else if (typeof window.manualShift === 'function') {
    // Fallback if buttons are absent
    window.manualShift(d);
  } else {
    // Last resort: just move the highlight
    setActive(i + d);
    return;
  }

  // Next frame: sync the active thumb to whichever image is now on top
  requestAnimationFrame(() => {
    const idx = getIndexFromTop();
    if (idx >= 0) setActive(idx);
  });
}

// — keep-open while in use —
const pauseHide = () => clearTimeout(window.__carousel?.hideTimer);
const pokeHide  = () => resetCarouselHide();

scroller.addEventListener('mouseenter', pauseHide);
scroller.addEventListener('mouseleave', pokeHide);

// any interaction should reset the timer
['wheel','pointerdown','pointerup','pointermove','keydown'].forEach(ev =>
  scroller.addEventListener(ev, pokeHide, { passive:false })
);

// --- initial paint ---
i = Math.max(0, getIndexFromTop());
setActive(i, /*center*/ false);
armWakeWheel();


    // ---- Show / Hide with one global timer
window.__carousel = window.__carousel || {};
const AUTO_HIDE_MS = autoHideMs;  // expose minimal API for other scripts (e.g., fader arrow keys)
window.__carousel.show = showCarousel;
window.__carousel.hide = hideCarousel;
  

function showCarousel() {
  const wasHidden = !document.body.classList.contains('show-carousel');
  if (wasHidden) {
    document.body.classList.add('show-carousel');

    // Temporarily disable snap to avoid the "jump"
    const oldSnap = scroller.style.scrollSnapType;
    scroller.style.scrollSnapType = 'none';

    // Ensure correct active index (from visible image) and center it
    const idxNow = getIndexFromTop();
    if (idxNow >= 0) setActive(idxNow, /*center*/ false);

    const active = scroller.querySelector('.hpanel.active');
    active?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'auto' });

    // Restore snap on next frame
    requestAnimationFrame(() => { scroller.style.scrollSnapType = oldSnap || ''; });

    disarmWakeWheel(); // don’t leave global wheel armed while visible
  }
  resetCarouselHide();
}



function hideCarousel() {
  clearTimeout(window.__carousel.hideTimer);
  document.body.classList.remove('show-carousel');
  armWakeWheel();                              // ⬅️ re-arm so next wheel can re-open
}


  const isVisible = () => document.body.classList.contains('show-carousel');

function resetCarouselHide(ms = AUTO_HIDE_MS) {
  if (!isVisible()) return;                    // don't run timers while hidden
  clearTimeout(window.__carousel.hideTimer);
  window.__carousel.hideTimer = setTimeout(hideCarousel, ms);
}


    // ---- Click: shortest path, then hide + resume

// Click: go to the nearest direction; one slideshow step per hop
// Click: go to the nearest direction; one slideshow step per hop (yielded)
const onThumbClick = (e) => {
  const btn = e.target.closest('.hpanel');
  if (!btn) return;

  e.preventDefault();
  showCarousel();          // ensure visible
  resetCarouselHide();     // keep it open while interacting

  const t = btns.indexOf(btn);   // target index
  if (t < 0) return;

  const f = (t - i + N) % N;     // forward distance
  const r = (i - t + N) % N;     // reverse distance
  const hops = Math.min(f, r);

  if (hops === 0) {
    // already at this image — keep carousel open but refresh timer
    resetCarouselHide();
    return;
  }

  const dir = (f <= r) ? +1 : -1;  // choose direction
  let n = 0;
  const hopOnce = () => {
    if (n >= hops) {
      // snap UI to target next frame (observer will confirm)
      requestAnimationFrame(() => setActive(t));
      resetCarouselHide();  // leave open; user can keep clicking/wheeling
      return;
    }
    step(dir);              // drives manualShift → changes main image
    n += 1;
    resetCarouselHide();
    setTimeout(hopOnce, 0); // yield so fader can update DOM between hops
  };
  hopOnce();
};

scroller.addEventListener('click', onThumbClick);
bindScrollerWheelOnce(); // <— call AFTER onWheel + binder exist
if (imageContainer && imageContainer.dataset.wheelBound !== '1') {
  imageContainer.dataset.wheelBound = '1';
  imageContainer.addEventListener('wheel', onWheel, { passive: false, capture: true });
}

// ---- Wheel (optional): one step per gesture
let wheelLock = 0;
const QUIET = 400; // tune: 300–600ms

function onWheel(e) {                    // ← hoisted
  const d = Math.sign(e.deltaY);         // ← vertical only
  if (!d || wheelLock) return;

  e.preventDefault();
  showCarousel();                         // will disarm wake wheel if it was armed
  resetCarouselHide();

  wheelLock = 1;
  step(d);                                // ONE step
  setTimeout(() => (wheelLock = 0), QUIET);
}


// ---- wheel binding: exactly once on the scroller
//let scrollerWheelCtl;   // AbortController for this scroller instance
let scrollerWheelCtl; 
function bindScrollerWheelOnce() {
  if (scroller.dataset.wheelBound === '1') return; // already bound
  scroller.dataset.wheelBound = '1';

  // safety: abort any previous binding (hot reloads etc.)
  try { scrollerWheelCtl?.abort(); } catch {}
  scrollerWheelCtl = new AbortController();

  scroller.addEventListener('wheel', onWheel, {
    passive: false,
    signal: scrollerWheelCtl.signal
  });

  console.debug('[carousel] wheel bound once');
}



 // ---- Wake-once wheel while hidden (because #hscroll is display:none)
if (!window.__wakeWheel) {
  window.__wakeWheel = function wakeOnWheel(e) {
    if (document.body.classList.contains('show-carousel')) {
      window.removeEventListener('wheel', window.__wakeWheel, true);
      window.__wakeWheel = null;
      return;
    }
    if (!e.target.closest?.('#image-container')) return;

    const d = Math.sign(e.deltaY);
    e.preventDefault();
    showCarousel(); resetCarouselHide();
    if (d) step(d);

    window.removeEventListener('wheel', window.__wakeWheel, true);
    window.__wakeWheel = null;
  };

  window.addEventListener('wheel', window.__wakeWheel, { capture:true, passive:false });
}
    // ---- Stay in sync with fader (no fader edits needed)
// ---- Stay in sync with fader (no fader edits needed)
if (scroller.dataset.thumbSyncBound !== '1') {
  scroller.dataset.thumbSyncBound = '1';
  let raf = 0;
  const scheduleSync = () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      // recompute i from visible layer
      const ao = parseFloat(getComputedStyle(A).opacity || '0');
      const bo = parseFloat(getComputedStyle(B).opacity || '0');
      const topImg = (ao === bo) ? B : (ao > bo ? A : B);
      const shown  = tail(topImg.src);
      const idx = getIndexFromTop();
      if (idx >= 0 && idx !== i) setActive(idx);
    });
  };
  const mo = new MutationObserver(scheduleSync);
  mo.observe(A, { attributes:true, attributeFilter:['src','style'] });
  mo.observe(B, { attributes:true, attributeFilter:['src','style'] });

  // expose teardown to caller
  return {
    show: showCarousel,
    hide: hideCarousel,
    setIndex: (idx)=> setActive(idx),
    teardown() {
      scroller.removeEventListener('click', onThumbClick);
      scroller.removeEventListener('wheel', onWheel);
      // keyAbort wasn’t declared anywhere → remove or guard
      // if (keyAbort) keyAbort.abort();
      window.removeEventListener('wheel', window.__wakeWheel, true);
      delete scroller.dataset.carouselBound;
      delete scroller.dataset.thumbSyncBound;
      mo.disconnect();
    }
  };
}

// fallback (if thumbSync already bound)
return {
  show: showCarousel,
  hide: hideCarousel,
  setIndex: (idx)=> setActive(idx),
  teardown() {}
};

}; // END initCarousel
})();
