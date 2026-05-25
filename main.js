/**
 * Навигация, карусель, FAQ, reveal, scroll spy
 */
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  const burger = document.getElementById('burger');
  const mobileNav = document.getElementById('mobileNav');
  const navOverlay = document.getElementById('navOverlay');
  const header = document.querySelector('.header');
  const headerNav = document.getElementById('headerNav');
  const main = document.querySelector('main');
  const scrollProgress = document.getElementById('scrollProgress');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let scrollLockY = 0;
  let menuOpen = false;

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
    if (open) lockScroll();
    else unlockScroll();
  }

  function closeMenu() {
    if (menuOpen) setMenuOpen(false);
  }

  if (burger) burger.addEventListener('click', () => setMenuOpen(!menuOpen));
  if (navOverlay) navOverlay.addEventListener('click', closeMenu);
  if (mobileNav) {
    mobileNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) closeMenu();
  });

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

  let scrollTicking = false;
  function updateScrollUI() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (header) header.classList.toggle('header--scrolled', y > 24);
    if (scrollProgress && max > 0) {
      scrollProgress.style.width = `${Math.min(100, (y / max) * 100)}%`;
    }
  }
  function onScroll() {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      updateScrollUI();
      scrollTicking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  updateScrollUI();

  const navSections = ['pains', 'benefits', 'topics', 'reviews', 'faq', 'contacts']
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  if (headerNav && navSections.length) {
    const navLinks = headerNav.querySelectorAll('[data-nav]');
    const spyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          navLinks.forEach((link) => {
            link.classList.toggle('is-active', link.dataset.nav === id);
          });
        });
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: 0 }
    );
    navSections.forEach((section) => spyObserver.observe(section));
  }

  function initRevealChildren() {
    const selectors = [
      '.module-card',
      '.task-card',
      '.benefit-module',
      '.topic-group',
      '.reviews-shots__slide',
      '.contact-item',
    ];
    document.querySelectorAll('.section, .reveal').forEach((section) => {
      let i = 0;
      selectors.forEach((sel) => {
        section.querySelectorAll(sel).forEach((el) => {
          el.classList.add('reveal-child');
          el.style.setProperty('--i', String(i++));
        });
      });
    });
  }
  initRevealChildren();

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
      { rootMargin: '0px 0px -6% 0px', threshold: 0.06 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    document.querySelectorAll('.reveal, .section').forEach((el) => el.classList.add('is-visible'));
  }

  const shotsTrack = document.getElementById('reviewsShotsTrack');
  const prevShotBtn = document.getElementById('prevReviewShot');
  const nextShotBtn = document.getElementById('nextReviewShot');
  const shotDotsContainer = document.getElementById('reviewShotDots');

  if (shotsTrack && prevShotBtn && nextShotBtn) {
    const slides = [...shotsTrack.querySelectorAll('.reviews-shots__slide')];
    let activeIndex = 0;

    const getGap = () => parseFloat(getComputedStyle(shotsTrack).gap) || 20;

    const getStep = () => {
      const slide = slides[0];
      if (!slide) return 320;
      return slide.offsetWidth + getGap();
    };

    const scrollToIndex = (index) => {
      activeIndex = Math.max(0, Math.min(index, slides.length - 1));
      shotsTrack.scrollTo({
        left: activeIndex * getStep(),
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });
      updateShotDots();
      updateShotNavState();
    };

    const scrollByStep = (dir) => scrollToIndex(activeIndex + dir);

    function updateShotDots() {
      if (!shotDotsContainer) return;
      shotDotsContainer.querySelectorAll('.carousel-dot').forEach((dot, i) => {
        dot.classList.toggle('is-active', i === activeIndex);
        dot.setAttribute('aria-selected', String(i === activeIndex));
      });
    }

    function updateShotNavState() {
      prevShotBtn.disabled = activeIndex <= 0;
      nextShotBtn.disabled = activeIndex >= slides.length - 1;
    }

    function buildShotDots() {
      if (!shotDotsContainer || slides.length < 2) return;
      shotDotsContainer.innerHTML = '';
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'carousel-dot';
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', `Скриншот ${i + 1}`);
        if (i === 0) {
          dot.classList.add('is-active');
          dot.setAttribute('aria-selected', 'true');
        }
        dot.addEventListener('click', () => scrollToIndex(i));
        shotDotsContainer.appendChild(dot);
      });
    }

    buildShotDots();
    updateShotNavState();
    prevShotBtn.addEventListener('click', () => scrollByStep(-1));
    nextShotBtn.addEventListener('click', () => scrollByStep(1));

    shotsTrack.addEventListener(
      'scroll',
      () => {
        const step = getStep();
        if (step <= 0) return;
        const i = Math.round(shotsTrack.scrollLeft / step);
        if (i !== activeIndex && i >= 0 && i < slides.length) {
          activeIndex = i;
          updateShotDots();
          updateShotNavState();
        }
      },
      { passive: true }
    );

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => scrollToIndex(activeIndex), 150);
    });
  }

  document.querySelectorAll('.faq__item').forEach((item) => {
    item.addEventListener('toggle', () => {
      if (!item.open) return;
      document.querySelectorAll('.faq__item').forEach((other) => {
        if (other !== item && other.open) other.open = false;
      });
    });
  });

  /* ---- 3D-наклон карточек (desktop) ---- */
  if (!prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
    const tiltMax = 8;

    document.querySelectorAll('[data-tilt]').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        el.style.transform = `perspective(700px) rotateX(${-y * tiltMax}deg) rotateY(${x * tiltMax}deg) translateY(-4px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });

    const heroVisual = document.getElementById('heroVisual');
    if (heroVisual) {
      const maxTilt = 6;
      heroVisual.addEventListener('mousemove', (e) => {
        const rect = heroVisual.getBoundingClientRect();
        const dx = (e.clientX - (rect.left + rect.width / 2)) / rect.width;
        const dy = (e.clientY - (rect.top + rect.height / 2)) / rect.height;
        heroVisual.style.transform = `perspective(900px) rotateX(${Math.max(-maxTilt, Math.min(maxTilt, -dy * maxTilt))}deg) rotateY(${Math.max(-maxTilt, Math.min(maxTilt, dx * maxTilt))}deg)`;
      });
      heroVisual.addEventListener('mouseleave', () => {
        heroVisual.style.transform = '';
      });
    }
  }

  /* ---- Цикл подсветки «требования → уверенность» ---- */
  const flowMini = document.getElementById('flowMini');
  if (flowMini && !prefersReducedMotion) {
    const steps = flowMini.querySelectorAll('.flow-mini__step');
    let idx = 0;
    setInterval(() => {
      steps.forEach((s, i) => s.classList.toggle('is-active', i === idx));
      idx = (idx + 1) % steps.length;
    }, 2200);
  }

  /* ---- Подсветка шагов схемы при прокрутке ---- */
  const flowDiagram = document.getElementById('flowDiagram');
  if (flowDiagram && !prefersReducedMotion) {
    const flowSteps = flowDiagram.querySelectorAll('[data-flow-step]');
    let flowIdx = 0;

    const cycleFlow = () => {
      flowSteps.forEach((s, i) => s.classList.toggle('is-lit', i === flowIdx));
      flowIdx = (flowIdx + 1) % flowSteps.length;
    };

    const flowIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            cycleFlow();
            if (!flowDiagram._flowTimer) {
              flowDiagram._flowTimer = setInterval(cycleFlow, 2400);
            }
          } else if (flowDiagram._flowTimer) {
            clearInterval(flowDiagram._flowTimer);
            flowDiagram._flowTimer = null;
            flowSteps.forEach((s) => s.classList.remove('is-lit'));
          }
        });
      },
      { threshold: 0.35 }
    );
    flowIo.observe(flowDiagram);
  }
})();
