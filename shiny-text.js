/**
 * Shiny text — анимация блика по градиенту (порт ShinyText / motion)
 */
(function () {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function parseNum(value, fallback) {
    const n = parseFloat(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function initShiny(el) {
    const speed = parseNum(el.dataset.shinySpeed, 2);
    const delay = parseNum(el.dataset.shinyDelay, 0);
    const spread = parseNum(el.dataset.shinySpread, 120);
    const color = el.dataset.shinyColor || '#2a3544';
    const shineColor = el.dataset.shinyShine || '#d4567a';
    const direction = el.dataset.shinyDirection === 'right' ? 'right' : 'left';
    const yoyo = el.dataset.shinyYoyo === 'true';
    const disabled = el.dataset.shinyDisabled === 'true';

    const gradient = `linear-gradient(${spread}deg, ${color} 0%, ${color} 35%, ${shineColor} 50%, ${color} 65%, ${color} 100%)`;
    el.style.backgroundImage = gradient;

    if (reduced || disabled) {
      el.style.backgroundPosition = '50% center';
      return;
    }

    const animationDuration = speed * 1000;
    const delayDuration = delay * 1000;
    const directionSign = direction === 'left' ? 1 : -1;

    let elapsed = 0;
    let lastTime = null;
    let rafId = null;

    const setProgress = (p) => {
      el.style.backgroundPosition = `${150 - p * 2}% center`;
    };

    const tick = (time) => {
      if (lastTime === null) {
        lastTime = time;
        rafId = requestAnimationFrame(tick);
        return;
      }

      const delta = time - lastTime;
      lastTime = time;
      elapsed += delta;

      if (yoyo) {
        const cycleDuration = animationDuration + delayDuration;
        const fullCycle = cycleDuration * 2;
        const cycleTime = elapsed % fullCycle;

        if (cycleTime < animationDuration) {
          const p = (cycleTime / animationDuration) * 100;
          setProgress(directionSign === 1 ? p : 100 - p);
        } else if (cycleTime < cycleDuration) {
          setProgress(directionSign === 1 ? 100 : 0);
        } else if (cycleTime < cycleDuration + animationDuration) {
          const reverseTime = cycleTime - cycleDuration;
          const p = 100 - (reverseTime / animationDuration) * 100;
          setProgress(directionSign === 1 ? p : 100 - p);
        } else {
          setProgress(directionSign === 1 ? 0 : 100);
        }
      } else {
        const cycleDuration = animationDuration + delayDuration;
        const cycleTime = elapsed % cycleDuration;

        if (cycleTime < animationDuration) {
          const p = (cycleTime / animationDuration) * 100;
          setProgress(directionSign === 1 ? p : 100 - p);
        } else {
          setProgress(directionSign === 1 ? 100 : 0);
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }

  function boot() {
    document.querySelectorAll('[data-shiny-text]').forEach(initShiny);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
