(function () {
  const images   = window.room1images || [];
  const scroller = document.getElementById("hscroll");
  const prev     = document.getElementById("prevBtn");
  const next     = document.getElementById("nextBtn");
  const A        = document.getElementById("imgA");
  const B        = document.getElementById("imgB");
  if (!scroller || !A || !B || !images.length) return;

  // Build THUMBNAIL panels once
  {
    const frag = document.createDocumentFragment();
    images.forEach((src, i) => {
      const btn = document.createElement("button");
      btn.className = "hpanel";
      btn.type = "button";
      btn.dataset.index = i;

      const img = document.createElement("img");
      img.src = src;
      img.alt = `room1 ${i + 1}`;
      img.loading = "lazy";
      img.decoding = "async";

      const badge = document.createElement("span");
      badge.className = "idx";
      badge.textContent = i + 1;

      btn.append(img, badge);
      frag.append(btn);
    });
    scroller.replaceChildren(frag);
    if (scroller.dataset.carouselBound === '1') return;
    scroller.dataset.carouselBound = '1';
  }

  // Wrap + controls
  const N    = images.length;
  const btns = [...scroller.children];

  // init index from visible <img>
  const vis = (parseFloat(getComputedStyle(A).opacity || "0") >= 0.5 ? A.src : B.src).split("/").pop();
  let i = images.findIndex(p => vis.endsWith(p.split("/").pop()));
  if (i < 0) i = 0;

  const set = (j) => {
    const prevIdx = i;
    i = (j + N) % N;

    // highlight
    btns.forEach((b, k) => b.classList.toggle("active", k === i));

    // handle visual wrap (last→first or first→last)
    const wrappedFwd  = (prevIdx === N - 1 && i === 0);
    const wrappedBack = (prevIdx === 0     && i === N - 1);
    if (wrappedFwd || wrappedBack) {
      const endLeft = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
      const oldSnap = scroller.style.scrollSnapType;
      scroller.style.scrollSnapType = "none";
      scroller.scrollLeft = wrappedFwd ? 0 : endLeft; // instant jump
      requestAnimationFrame(() => {
        scroller.style.scrollSnapType = oldSnap || "";
        btns[i].scrollIntoView({ inline: "center", block: "nearest", behavior: "auto" });
      });
      return;
    }

    // normal case
    btns[i].scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  };

  const step = (d) => { set(i + d); (d > 0 ? next : prev)?.click(); };

  set(i);
  // --- keep carousel selection in sync with the fader ---
(() => {
  if (window.__thumbSyncBound) return;           // guard against rebinds
  window.__thumbSyncBound = true;

  const N = images.length;

  const indexFromFader = () => {
    const aTop  = parseFloat(getComputedStyle(A).opacity || '0') >= 0.5;
    const shown = (aTop ? A : B).src.split('/').pop();
    const idx   = images.findIndex(p => shown.endsWith(p.split('/').pop()));
    return (idx >= 0 ? idx : i);
  };

  // Same wrap-aware centering as your set(), but without clicking prev/next
  const syncTo = (nextIdx) => {
    if (nextIdx === i) return;

    const prevIdx = i;
    i = (nextIdx + N) % N;

    // highlight
    btns.forEach((b,k) => b.classList.toggle('active', k === i));

    // handle visual wrap instantly, then center
    const wrappedFwd  = (prevIdx === N - 1 && i === 0);
    const wrappedBack = (prevIdx === 0     && i === N - 1);
    if (wrappedFwd || wrappedBack) {
      const endLeft = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
      const oldSnap = scroller.style.scrollSnapType;
      scroller.style.scrollSnapType = 'none';
      scroller.scrollLeft = wrappedFwd ? 0 : endLeft;
      requestAnimationFrame(() => {
        scroller.style.scrollSnapType = oldSnap || '';
        btns[i].scrollIntoView({ inline:'center', block:'nearest', behavior:'auto' });
      });
      return;
    }

    // normal case
    btns[i].scrollIntoView({ inline:'center', block:'nearest', behavior:'auto' });
  };

  // Observe fader changes (src/style) and coalesce bursts
  let raf = 0;
  const scheduleSync = () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      syncTo(indexFromFader());
    });
  };

  const mo = new MutationObserver(scheduleSync);
  mo.observe(A, { attributes: true, attributeFilter: ['src','style'] });
  mo.observe(B, { attributes: true, attributeFilter: ['src','style'] });

  // initial sync (in case auto-fader changed before we bound)
  scheduleSync();
})();



// show/hide helpers (single global timer) — with logs
window.__carousel = window.__carousel || {};
const AUTO_HIDE_MS = 3000;

function showCarousel() {
  const wasHidden = !document.body.classList.contains('show-carousel');
  if (wasHidden) {
    document.body.classList.add('show-carousel');
    btns[i]?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'auto' });
    console.log('[carousel] SHOW → centered index', i);
  } else {
    console.log('[carousel] show (already visible) → index', i);
  }
  resetCarouselHide();
}

function hideCarousel() {
  clearTimeout(window.__carousel.hideTimer);
  if (document.body.classList.contains('show-carousel')) {
    document.body.classList.remove('show-carousel');
    console.log('[carousel] HIDE');
  } else {
    console.log('[carousel] hide (already hidden)');
  }
  // ⬇️ re-arm the wake-once wheel so next vertical scroll can open it again
  if (typeof wakeOnWheel === 'function') {
    window.addEventListener('wheel', wakeOnWheel, { capture: true, passive: false });
    console.log('[wakeWheel] re-armed on hide');
  }
}


function resetCarouselHide() {
  clearTimeout(window.__carousel.hideTimer);
  window.__carousel.hideTimer = setTimeout(() => {
    console.log(`[carousel] auto-hide after ${AUTO_HIDE_MS}ms idle`);
    hideCarousel();
  }, AUTO_HIDE_MS);
  console.log('[carousel] reset hide timer →', AUTO_HIDE_MS, 'ms');
}




  // SINGLE thumb click handler
  scroller.addEventListener("click", (e) => {
    const b = e.target.closest(".hpanel"); if (!b) return;
    const t = btns.indexOf(b);
    const f = (t - i + N) % N, r = (i - t + N) % N;
    for (let n = Math.min(f, r); n--; ) (f <= r ? next : prev)?.click();
    set(t);
    hideCarousel();
    (typeof window.resumeFader === "function") && window.resumeFader();
  });


  // AAROWS: show on first use + step
 document.addEventListener("keydown", (e) => {
  if (e.repeat) return;
  const tag = (e.target.tagName || "").toLowerCase();
  if (tag === "input" || tag === "textarea" || e.target.isContentEditable) return;

  if (["ArrowRight","ArrowDown"].includes(e.key)) {
    e.preventDefault();
    console.log('⌨️ Arrow → (show + step +1)');
    showCarousel();
    resetCarouselHide();
    step(1);
  } else if (["ArrowLeft","ArrowUp"].includes(e.key)) {
    e.preventDefault();
    console.log('⌨️ Arrow ← (show + step -1)');
    showCarousel();
    resetCarouselHide();
    step(-1);
  }
});


  let wheelLock = 0; 
const QUIET = 600;

scroller.addEventListener("wheel", (e) => {
  const dy = e.deltaY, dx = e.deltaX, mode = e.deltaMode; // 0:px, 1:lines, 2:pages
  const d  = Math.sign(Math.abs(dy) >= Math.abs(dx) ? dy : dx);
  console.log(`[wheel@hscroll] dy=${dy} dx=${dx} mode=${mode} lock=${wheelLock} dir=${d}`);
  if (!d || wheelLock) {
    if (!d) console.log('[wheel@hscroll] ignore (no direction)');
    if (wheelLock) console.log('[wheel@hscroll] ignore (cooldown)');
    return;
  }

  e.preventDefault();
  showCarousel();
  resetCarouselHide();

  wheelLock = 1;
  console.log('[wheel@hscroll] STEP', d > 0 ? '+1' : '-1');
  step(d);

  setTimeout(() => {
    wheelLock = 0;
    console.log('[wheel@hscroll] unlock after', QUIET, 'ms');
  }, QUIET);
}, { passive: false });


  // wake-once wheel while hidden (because #hscroll is display:none)
  const wakeOnWheel = (e) => {
  if (document.body.classList.contains("show-carousel")) {
    window.removeEventListener("wheel", wakeOnWheel, true);
    return;
  }
  if (!e.target.closest?.("#image-container")) return;

  const dy = e.deltaY, dx = e.deltaX, mode = e.deltaMode;
  const d  = Math.sign(Math.abs(dy) >= Math.abs(dx) ? dy : dx);
  console.log(`[wakeWheel] dy=${dy} dx=${dx} mode=${mode} dir=${d}`);

  e.preventDefault();
  showCarousel();              // will log SHOW + center
  resetCarouselHide();

  if (d) {
    console.log('[wakeWheel] forward first gesture as step', d > 0 ? '+1' : '-1');
    step(d);
  }

  window.removeEventListener("wheel", wakeOnWheel, true);
  console.log('[wakeWheel] removed self');
};
window.addEventListener("wheel", wakeOnWheel, { capture: true, passive: false });


})(); // ← exactly one close
