// shared/carousel_bind.js  (classic script, NOT type="module")
(function () {
  // avoid double-defining across hot reloads
  if (window.initCarousel) return;

  // Public API
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

    // DOM deps
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
        btn.className = 'hpanel';
        btn.type = 'button';
        btn.dataset.index = i;

        const img = document.createElement('img');
        img.src = src;
        img.alt = `thumb ${i + 1}`;
        img.loading = 'lazy';
        img.decoding = 'async';

        const badge = document.createElement('span');
        badge.className = 'idx';
        badge.textContent = i + 1;

        btn.append(img, badge);
        frag.append(btn);
      });
      scroller.replaceChildren(frag);
      scroller.dataset.carouselBound = '1';   // CSS hook
    }

    // ---- Minimal v0 behavior only
    // Show the carousel and stop there.
    document.body.classList.add('show-carousel');

    // Keep one active thumb so existing CSS still has a target
    const btns = Array.from(scroller.children);
    let i = 0;
    if (btns[i]) btns[i].classList.add('active');

    function showCarousel() {
      document.body.classList.add('show-carousel');
    }

    function hideCarousel() {
      document.body.classList.remove('show-carousel');
    }

        // restore old global API so existing controls keep working
    window.__carousel = window.__carousel || {};
    window.__carousel.show = showCarousel;
    window.__carousel.hide = hideCarousel;
    window.__carousel.setIndex = setActive;

    function setActive(j) {
      i = Math.max(0, Math.min(j, btns.length - 1));
      btns.forEach((b, k) => b.classList.toggle('active', k === i));
    }

    // Optional simple click behavior:
    // clicking a thumbnail only changes the active outline
   function onThumbClick(e) {
  const btn = e.target.closest('.hpanel');
  if (!btn) return;

  const idx = Number(btn.dataset.index);
  if (!Number.isFinite(idx)) return;

  setActive(idx);

  // call into fader
  window.jumpToImage?.(idx);
}
    scroller.addEventListener('click', onThumbClick);

    return {
      show: showCarousel,
      hide: hideCarousel,
      setIndex: setActive,
      teardown() {
        scroller.removeEventListener('click', onThumbClick);
        scroller.replaceChildren();
        delete scroller.dataset.carouselBound;
      }
    };
  }; // END initCarousel
})();



// (function () {
//   // avoid double-defining across hot reloads
//   if (window.initCarousel) return;

//   // Public API
//   window.initCarousel = function initCarousel(opts = {}) {
//     const {
//       images,
//       scrollerId = 'hscroll',
//       prevId     = 'prevBtn',
//       nextId     = 'nextBtn',
//       imgAId     = 'imgA',
//       imgBId     = 'imgB',
//       autoHideMs = 2000,
//     } = opts;

//     // DOM deps
//     const scroller = document.getElementById(scrollerId);
//     const prev     = document.getElementById(prevId);
//     const next     = document.getElementById(nextId);
//     const A        = document.getElementById(imgAId);
//     const B        = document.getElementById(imgBId);
//     const imageContainer = document.getElementById('image-container');

//     if (!Array.isArray(images) || !images.length || !scroller || !A || !B) {
//       console.warn('[carousel] missing deps or empty images');
//       return { teardown(){} };
//     }

//     // ---- Build thumbnails once
//     {
//       const frag = document.createDocumentFragment();
//       images.forEach((src, i) => {
//         const btn = document.createElement('button');
//         btn.className = 'hpanel';
//         btn.type = 'button';
//         btn.dataset.index = i;

//         const img = document.createElement('img');
//         img.src = src;
//         img.alt = `thumb ${i + 1}`;
//         img.loading = 'lazy';
//         img.decoding = 'async';

//         const badge = document.createElement('span');
//         badge.className = 'idx';
//         badge.textContent = i + 1;

//         btn.append(img, badge);
//         frag.append(btn);
//       });
//       scroller.replaceChildren(frag);
//       scroller.dataset.carouselBound = '1';   // CSS hook
//     }

//     // ---- Carousel state & helpers
//     let i = 0;                                 // current index
//     const N = images.length;
//     const btns = Array.from(scroller.children);
//     const tail = (s) => s.split('/').pop();

//     function getIndexFromTop() {
//       const ao = parseFloat(getComputedStyle(A).opacity || '0');
//       const bo = parseFloat(getComputedStyle(B).opacity || '0');
//       const topImg = (ao === bo) ? B : (ao > bo ? A : B);
//       const shown  = tail(topImg.src);
//       return images.findIndex((p) => shown.endsWith(tail(p)));
//     }

//     // Center active thumb (vertical-aware; wrap jump uses scrollTop)
//     function setActive(j, center = true) {
//       const prevIdx = i;
//       i = (j + N) % N;

//       btns.forEach((b, k) => b.classList.toggle('active', k === i));
//       if (!center) return;

//       const wrappedFwd  = (prevIdx === N - 1 && i === 0);
//       const wrappedBack = (prevIdx === 0     && i === N - 1);

//       if (wrappedFwd || wrappedBack) {
//         const endTop = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
//         const oldSnap = scroller.style.scrollSnapType;
//         scroller.style.scrollSnapType = 'none';
//         scroller.scrollTop = wrappedFwd ? 0 : endTop; // jump to start/end vertically
//         requestAnimationFrame(() => {
//           scroller.style.scrollSnapType = oldSnap || '';
//           btns[i]?.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'auto' });
//         });
//       } else {
//         btns[i]?.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' });
//       }
//     }

//     //Drive ONE slideshow step
//     function step(d) {
//       if (!d) return;
//       const btn = d > 0 ? next : prev;     // prefer transport buttons
//       if (btn) {
//         btn.click();
//       } else if (typeof window.manualShift === 'function') {
//         window.manualShift(d);
//       } else {
//         setActive(i + d);
//         return;
//       }
//       // sync highlight next frame
//       requestAnimationFrame(() => {
//         const idx = getIndexFromTop();
//         if (idx >= 0) setActive(idx);
//       });
//     }

//     // ---- Show / Hide with one global timer
//     window.__carousel = window.__carousel || {};
//     const AUTO_HIDE_MS = autoHideMs;
//     window.__carousel.show = showCarousel;
//     window.__carousel.hide = hideCarousel;

//     function isVisible() {
//       return document.body.classList.contains('show-carousel');
//     }
//     function resetCarouselHide(ms = AUTO_HIDE_MS) {
//       if (!isVisible()) return;
//       clearTimeout(window.__carousel.hideTimer);
//       window.__carousel.hideTimer = setTimeout(hideCarousel, ms);
//     }

//     function showCarousel() {
//       const wasHidden = !document.body.classList.contains('show-carousel');
//       if (wasHidden) {
//         document.body.classList.add('show-carousel');

//         const oldSnap = scroller.style.scrollSnapType;
//         scroller.style.scrollSnapType = 'none';

//         const idxNow = getIndexFromTop();
//         if (idxNow >= 0) setActive(idxNow, /*center*/ false);

//         const active = scroller.querySelector('.hpanel.active');
//         active?.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'auto' });

//         requestAnimationFrame(() => { scroller.style.scrollSnapType = oldSnap || ''; });
//         disarmWakeWheel(); // don’t leave global wheel armed while visible
//       }
//       resetCarouselHide();
//     }

//     function hideCarousel() {
//       clearTimeout(window.__carousel.hideTimer);
//       document.body.classList.remove('show-carousel');
//       armWakeWheel(); // re-arm so next wheel can re-open
//     }

//     // ---- Keep-open while in use
//     const pauseHide = () => clearTimeout(window.__carousel?.hideTimer);
//     const pokeHide  = () => resetCarouselHide();

//     scroller.addEventListener('mouseenter', pauseHide);
//     scroller.addEventListener('mouseleave', pokeHide);
//     ['wheel','pointerdown','pointerup','pointermove','keydown'].forEach(ev =>
//       scroller.addEventListener(ev, pokeHide, { passive:false })
//     );

//     // ---- Click: shortest path → step hops
//     const onThumbClick = (e) => {
//       const btn = e.target.closest('.hpanel');
//       if (!btn) return;

//       e.preventDefault();
//       showCarousel();
//       resetCarouselHide();

//       const t = btns.indexOf(btn);
//       if (t < 0) return;

//       const f = (t - i + N) % N;
//       const r = (i - t + N) % N;
//       const hops = Math.min(f, r);

//       if (hops === 0) { resetCarouselHide(); return; }

//       const dir = (f <= r) ? +1 : -1;
//       let n = 0;
//       const hopOnce = () => {
//         if (n >= hops) {
//           requestAnimationFrame(() => setActive(t));
//           resetCarouselHide();
//           return;
//         }
//         step(dir);
//         n += 1;
//         resetCarouselHide();
//         setTimeout(hopOnce, 0); // yield for fader DOM updates
//       };
//       hopOnce();
//     };
//     scroller.addEventListener('click', onThumbClick);

//     // ---- Wheel: one step per gesture (vertical)
//     let wheelLock = 0;
//     const QUIET = 350; // 300–600ms
//     function onWheel(e) {
//       const d = Math.sign(e.deltaY);     // vertical only
//       if (!d || wheelLock) return;
//       e.preventDefault();
//       showCarousel();
//       resetCarouselHide();
//       wheelLock = 1;
//       step(d);
//       setTimeout(() => (wheelLock = 0), QUIET);
//     }

//     // Bind wheel on scroller exactly once (no globals, no TDZ)
//     function bindScrollerWheelOnce() {
//       if (scroller.dataset.wheelBound === '1') return;
//       scroller.dataset.wheelBound = '1';

//       const ctlKey = '__wheelCtl';      // store per-element
//       try { scroller[ctlKey]?.abort?.(); } catch {}
//       scroller[ctlKey] = new AbortController();

//       scroller.addEventListener('wheel', onWheel, {
//         passive: false,
//         signal: scroller[ctlKey].signal
//       });

//       console.debug('[carousel] wheel bound once');
//     }
//     bindScrollerWheelOnce();

//     // Also allow wheel over the main image area (while visible)
//     if (imageContainer && imageContainer.dataset.wheelBound !== '1') {
//       imageContainer.dataset.wheelBound = '1';
//       imageContainer.addEventListener('wheel', onWheel, { passive: false, capture: true });
//     }

//     // ---- Wake-once wheel while hidden (because #hscroll is display:none)
//     function armWakeWheel() {
//       if (window.__wakeWheel) return;
//       window.__wakeWheel = function wakeOnWheel(e) {
//         if (document.body.classList.contains('show-carousel')) {
//           disarmWakeWheel(); return;
//         }
//         if (!e.target.closest?.('#image-container')) return;
//         const d = Math.sign(e.deltaY);
//         e.preventDefault();
//         showCarousel(); resetCarouselHide();
//         if (d) step(d);
//         disarmWakeWheel();
//       };
//       window.addEventListener('wheel', window.__wakeWheel, { capture:true, passive:false });
//     }
//     function disarmWakeWheel() {
//       if (!window.__wakeWheel) return;
//       window.removeEventListener('wheel', window.__wakeWheel, true);
//       window.__wakeWheel = null;
//     }

//     // ---- Stay in sync with fader (no fader edits needed)
//     if (scroller.dataset.thumbSyncBound !== '1') {
//       scroller.dataset.thumbSyncBound = '1';
//       let raf = 0;
//       const scheduleSync = () => {
//         if (raf) return;
//         raf = requestAnimationFrame(() => {
//           raf = 0;
//           const idx = getIndexFromTop();
//           if (idx >= 0 && idx !== i) setActive(idx);
//         });
//       };
//       const mo = new MutationObserver(scheduleSync);
//       mo.observe(A, { attributes:true, attributeFilter:['src','style'] });
//       mo.observe(B, { attributes:true, attributeFilter:['src','style'] });

//       // --- initial paint ---
//       i = Math.max(0, getIndexFromTop());
//       setActive(i, /*center*/ false);
//       armWakeWheel();

//       // Expose teardown
//       return {
//         show: showCarousel,
//         hide: hideCarousel,
//         setIndex: (idx) => setActive(idx),
//         teardown() {
//           scroller.removeEventListener('click', onThumbClick);
//           scroller.removeEventListener('mouseenter', pauseHide);
//           scroller.removeEventListener('mouseleave', pokeHide);
//           ['wheel','pointerdown','pointerup','pointermove','keydown'].forEach(ev =>
//             scroller.removeEventListener(ev, pokeHide, { passive:false })
//           );
//           // abort per-element wheel binding
//           scroller['__wheelCtl']?.abort?.();
//           // unbind image-container wheel
//           if (imageContainer) {
//             imageContainer.removeEventListener('wheel', onWheel, { capture:true });
//             delete imageContainer.dataset.wheelBound;
//           }
//           window.removeEventListener('wheel', window.__wakeWheel, true);
//           delete scroller.dataset.carouselBound;
//           delete scroller.dataset.thumbSyncBound;
//           delete scroller.dataset.wheelBound;
//           mo.disconnect();
//         }
//       };
//     }

//     // Fallback (if thumbSync already bound)
//     return {
//       show: showCarousel,
//       hide: hideCarousel,
//       setIndex: (idx) => setActive(idx),
//       teardown() {}
//     };
//   }; // END initCarousel
// })();
