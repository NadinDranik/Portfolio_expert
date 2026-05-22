/**
 * Навигация, блокировка прокрутки, карусель отзывов, FAQ, reveal
 */
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  const burger = document.getElementById('burger');
  const mobileNav = document.getElementById('mobileNav');
  const navOverlay = document.getElementById('navOverlay');
  const header = document.querySelector('.header');
  const main = document.querySelector('main');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let scrollLockY = 0;
  let menuOpen = false;

  /* ---- Scroll lock (без «залипания» на iOS) ---- */
  function lockScroll() {
    scrollLockY = window.scrollY;
    document.body.classList.add('nav-open');
    document.body.style.top = `-${scrollLockY}px`;
  }

  function unlockScroll() {
    document.body.classList.remove('nav-open');
    document.body.style.top = '';
    window.scrollTo(0, scrollLockY);
  }

  /* ---- Mobile menu ---- */
  function setMenuOpen(open) {
    if (!burger || !mobileNav || !navOverlay) return;
    menuOpen = open;

    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    burger.classList.toggle('is-active', open);

    mobileNav.classList.toggle('is-open', open);
    mobileNav.setAttribute('aria-hidden', String(!open));

    navOverlay.classList.toggle('is-open', open);
    navOverlay.setAttribute('aria-hidden', String(!open));

    if (main) main.inert = open;

    if (open) {
      lockScroll();
    } else {
      unlockScroll();
    }
  }

  function toggleMenu() {
    setMenuOpen(!menuOpen);
  }

  function closeMenu() {
    if (menuOpen) setMenuOpen(false);
  }

  if (burger) {
    burger.addEventListener('click', toggleMenu);
  }

  if (navOverlay) {
    navOverlay.addEventListener('click', closeMenu);
  }

  if (mobileNav) {
    mobileNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        closeMenu();
      });
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) closeMenu();
  });

  /* ---- Плавная прокрутка по якорям (без конфликта с меню) ---- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();
      closeMenu();

      requestAnimationFrame(() => {
        target.scrollIntoView({
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
          block: 'start',
        });
      });
    });
  });

  /* ---- Шапка при прокрутке (throttle через rAF) ---- */
  let scrollTicking = false;
  function onScroll() {
    if (!header || scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      header.classList.toggle('header--scrolled', window.scrollY > 24);
      scrollTicking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Карусель отзывов ---- */
  const track = document.querySelector('.reviews-track');
  const prevBtn = document.getElementById('prevReview');
  const nextBtn = document.getElementById('nextReview');

  if (track && prevBtn && nextBtn) {
    const getStep = () => {
      const card = track.querySelector('.card--review');
      if (!card) return 320;
      const gap = parseFloat(getComputedStyle(track).gap) || 20;
      return card.offsetWidth + gap;
    };

    const scrollByStep = (dir) => {
      track.scrollBy({
        left: dir * getStep(),
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });
    };

    prevBtn.addEventListener('click', () => scrollByStep(-1));
    nextBtn.addEventListener('click', () => scrollByStep(1));

    /* Не даём горизонтальной прокрутке «уводить» всю страницу */
    track.addEventListener(
      'wheel',
      (e) => {
        if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
        const atStart = track.scrollLeft <= 0;
        const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;
        if ((e.deltaX < 0 && atStart) || (e.deltaX > 0 && atEnd)) return;
        e.preventDefault();
      },
      { passive: false }
    );
  }

  /* ---- FAQ: только одна открытая панель, плавное закрытие ---- */
  const faqItems = document.querySelectorAll('.faq__item');
  faqItems.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (!item.open) return;
      faqItems.forEach((other) => {
        if (other !== item && other.open) other.open = false;
      });
    });
  });

  /* ---- Появление секций при прокрутке ---- */
  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const revealEls = document.querySelectorAll('.reveal, .section:not(.hero)');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    document.querySelectorAll('.reveal, .section').forEach((el) => {
      el.classList.add('is-visible');
    });
  }
})();
