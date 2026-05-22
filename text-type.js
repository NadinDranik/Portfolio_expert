/**
 * Мягкое появление: fade-in, stagger hero, счётчик опыта
 */
(function () {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initFadeIn() {
    document.querySelectorAll('[data-fade-in]').forEach((el) => {
      if (reduced) {
        el.classList.add('is-faded-in');
        return;
      }
      requestAnimationFrame(() => el.classList.add('is-faded-in'));
    });
  }

  function initHeroStagger() {
    const stagger = document.querySelector('.hero__stagger');
    if (!stagger) return;
    if (reduced) {
      stagger.classList.add('is-staggered');
      return;
    }
    requestAnimationFrame(() => {
      setTimeout(() => stagger.classList.add('is-staggered'), 80);
    });
  }

  function animateCount(el, target, duration) {
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = String(target);
    };
    requestAnimationFrame(tick);
  }

  function initCounters() {
    if (reduced) {
      document.querySelectorAll('[data-count]').forEach((el) => {
        el.textContent = el.dataset.count;
      });
      return;
    }

    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length || !('IntersectionObserver' in window)) {
      counters.forEach((el) => {
        el.textContent = el.dataset.count;
      });
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = parseInt(el.dataset.count, 10);
          if (!Number.isFinite(target)) return;
          animateCount(el, target, 1200);
          io.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((el) => io.observe(el));
  }

  function boot() {
    initFadeIn();
    initHeroStagger();
    initCounters();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
