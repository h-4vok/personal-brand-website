(() => {
  'use strict';

  function hidePreloader() {
    const preloader = document.querySelector('.preloader');
    if (!preloader) return;
    preloader.style.display = 'none';
  }

  function initLazyLoad() {
    if (typeof window.lozad !== 'function') return;
    const observer = window.lozad();
    observer.observe();
  }

  function scrollToTarget(target) {
    const offset = 50;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  function initSmoothScroll() {
    document.addEventListener('click', (event) => {
      const anchor = event.target instanceof Element ? event.target.closest('a') : null;
      if (!anchor) return;

      const classList = anchor.classList;
      const isSmooth =
        anchor.closest('nav') ||
        classList.contains('page-scroll') ||
        classList.contains('js-smooth-scroll');

      if (!isSmooth) return;

      const href = anchor.getAttribute('href') || '';
      if (!href.startsWith('#')) return;

      const target = document.getElementById(href.slice(1)) || document.querySelector(`[name="${href.slice(1)}"]`);
      if (!target) return;

      event.preventDefault();
      scrollToTarget(target);
    });
  }

  function setCollapseExpanded(button, expanded) {
    button.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  }

  function initNavCollapse() {
    const toggle = document.querySelector('[data-nav-toggle]');
    const menu = document.querySelector('[data-nav-menu]');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
      const isOpen = menu.classList.contains('show');
      if (isOpen) {
        menu.classList.remove('show');
        setCollapseExpanded(toggle, false);
      } else {
        menu.classList.add('show');
        setCollapseExpanded(toggle, true);
      }
    });

    menu.addEventListener('click', (event) => {
      const anchor = event.target instanceof Element ? event.target.closest('a') : null;
      if (!anchor) return;
      if (anchor.hasAttribute('data-nav-dropdown-toggle')) return;

      if (menu.classList.contains('show')) {
        menu.classList.remove('show');
        setCollapseExpanded(toggle, false);
      }
    });
  }

  function closeAllNavDropdowns(navRoot) {
    const openDropdowns = navRoot.querySelectorAll('.dropdown.show');
    openDropdowns.forEach((dropdown) => {
      dropdown.classList.remove('show');
      const menu = dropdown.querySelector('.dropdown-menu');
      if (menu) menu.classList.remove('show');
      const toggle = dropdown.querySelector('[data-nav-dropdown-toggle]');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    });
  }

  function initNavDropdowns() {
    const navRoot = document.querySelector('.navigation');
    if (!navRoot) return;

    navRoot.addEventListener('click', (event) => {
      const toggle = event.target instanceof Element ? event.target.closest('[data-nav-dropdown-toggle]') : null;
      if (!toggle) return;

      event.preventDefault();
      const dropdown = toggle.closest('.dropdown');
      if (!dropdown) return;

      const menu = dropdown.querySelector('.dropdown-menu');
      const isOpen = dropdown.classList.contains('show');

      closeAllNavDropdowns(navRoot);

      if (!isOpen) {
        dropdown.classList.add('show');
        if (menu) menu.classList.add('show');
        toggle.setAttribute('aria-expanded', 'true');
      }
    });

    document.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (navRoot.contains(target)) return;
      closeAllNavDropdowns(navRoot);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      closeAllNavDropdowns(navRoot);
    });
  }

  function initCounters() {
    const counters = Array.from(document.querySelectorAll('.count[data-count]'));
    if (counters.length === 0) return;

    let hasRun = false;
    const run = () => {
      if (hasRun) return;
      hasRun = true;

      counters.forEach((counter) => {
        const rawTarget = counter.getAttribute('data-count') || '0';
        const targetValue = Number.parseInt(rawTarget, 10);
        if (!Number.isFinite(targetValue)) return;

        const durationMs = 1000;
        const start = performance.now();
        const startValue = 0;

        const tick = (now) => {
          const progress = Math.min(1, (now - start) / durationMs);
          const current = Math.floor(startValue + (targetValue - startValue) * progress);
          counter.textContent = String(current);
          if (progress < 1) requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
      });
    };

    const first = counters[0];
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          run();
          observer.disconnect();
        }
      },
      { root: null, rootMargin: '0px 0px -20% 0px', threshold: 0.01 },
    );

    observer.observe(first);
  }

  window.addEventListener('load', () => {
    hidePreloader();
    initLazyLoad();
  });

  document.addEventListener('DOMContentLoaded', () => {
    initSmoothScroll();
    initNavCollapse();
    initNavDropdowns();
    initCounters();
  });
})();

