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

  function initArticleAnalytics() {
    const article = document.querySelector('[data-article-content]');
    if (!(article instanceof HTMLElement)) return;

    const umamiTrack =
      window.umami && typeof window.umami.track === 'function'
        ? window.umami.track.bind(window.umami)
        : null;
    if (!umamiTrack) return;

    const context = {
      slug: article.dataset.articleSlug || window.location.pathname,
      title: article.dataset.articleTitle || document.title,
      reading_time: article.dataset.articleReadingTime || '',
    };

    const articleState = initArticleScrollDepth(article, context, umamiTrack);
    initArticleEngagedTime(context, umamiTrack, articleState);
  }

  function initArticleScrollDepth(article, context, umamiTrack) {
    const thresholds = [25, 50, 75, 100];
    const reached = new Set();
    let rafId = 0;
    let maxDepth = 0;

    const getProgress = () => {
      const articleTop = article.getBoundingClientRect().top + window.scrollY;
      const articleHeight = article.offsetHeight;
      if (articleHeight <= 0) return 0;

      const viewportBottom = window.scrollY + window.innerHeight;
      const rawProgress = ((viewportBottom - articleTop) / articleHeight) * 100;
      return Math.max(0, Math.min(100, rawProgress));
    };

    const trackDepth = () => {
      rafId = 0;
      const progress = getProgress();
      maxDepth = Math.max(maxDepth, progress);

      thresholds.forEach((threshold) => {
        if (progress < threshold || reached.has(threshold)) return;
        reached.add(threshold);
        umamiTrack('article_scroll_depth', {
          ...context,
          depth: threshold,
        });
      });
    };

    const scheduleTrackDepth = () => {
      if (rafId !== 0) return;
      rafId = window.requestAnimationFrame(trackDepth);
    };

    window.addEventListener('scroll', scheduleTrackDepth, { passive: true });
    window.addEventListener('resize', scheduleTrackDepth);
    window.addEventListener('load', scheduleTrackDepth);
    scheduleTrackDepth();

    return {
      getMaxDepth() {
        return Math.round(maxDepth);
      },
    };
  }

  function initArticleEngagedTime(context, umamiTrack, articleState) {
    const activeWindowMs = 15000;
    const tickIntervalMs = 5000;
    const minReportableSeconds = 5;
    const trackedEvents = ['scroll', 'pointermove', 'keydown', 'touchstart'];
    let engagedMs = 0;
    let lastActiveAt = Date.now();
    let lastTickAt = Date.now();
    let lastReportedSeconds = 0;
    let hasActivity = false;

    const getSecondsBucket = (seconds) => {
      if (seconds < 30) return '0-29';
      if (seconds < 60) return '30-59';
      if (seconds < 120) return '60-119';
      if (seconds < 300) return '120-299';
      return '300+';
    };

    const isEngaged = (now) => {
      if (document.visibilityState !== 'visible') return false;
      if (typeof document.hasFocus === 'function' && !document.hasFocus()) return false;
      return hasActivity && now - lastActiveAt <= activeWindowMs;
    };

    const updateEngagedTime = () => {
      const now = Date.now();
      const delta = now - lastTickAt;
      lastTickAt = now;

      if (delta <= 0) return;
      if (isEngaged(now)) engagedMs += delta;
    };

    const reportEngagedTime = (force = false) => {
      updateEngagedTime();

      const seconds = Math.floor(engagedMs / 1000);
      if (!force && seconds < minReportableSeconds) return;
      if (seconds <= lastReportedSeconds) return;

      lastReportedSeconds = seconds;
      umamiTrack('article_engaged_time', {
        ...context,
        seconds,
        seconds_bucket: getSecondsBucket(seconds),
        max_depth: articleState.getMaxDepth(),
      });
    };

    const markActivity = () => {
      hasActivity = true;
      lastActiveAt = Date.now();
    };

    trackedEvents.forEach((eventName) => {
      window.addEventListener(eventName, markActivity, { passive: true });
    });

    markActivity();

    window.setInterval(() => {
      reportEngagedTime(false);
    }, tickIntervalMs);

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        reportEngagedTime(true);
        return;
      }

      lastTickAt = Date.now();
      markActivity();
    });

    window.addEventListener('pagehide', () => {
      reportEngagedTime(true);
    });
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
    initArticleAnalytics();
  });
})();

