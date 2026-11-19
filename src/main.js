/**
 * Barath B — Android & Systems Engineer Portfolio Script
 * Scroll-Driven Exhibition Choreography + Interactive Engineering Artifacts
 */

import { initAtmosphere, setAtmosphereChapter } from './visual-modes.js?v=27';

let setExpenseFanFocus = null;
let activateConnectLnxStep = null;
let activateAztroxView = null;

document.addEventListener('DOMContentLoaded', () => {
  initAtmosphere();
  initThemeToggle();
  initNavUnderline();
  initScrollProgressAndSpy();
  initMobileMenu();
  preloadPortfolioFrames();
  initGallerySwitchers();
  activateConnectLnxStep = initConnectLnxProtocolStepper();
  activateAztroxView = initAztroxStageSwitcher();
  setExpenseFanFocus = initExpenseFanStage();
  initScrollCinema();
  initScrollObserver();
  initEmailCopy();
  initImageFallbacks();
  initLightbox();
});

initPageTransitions();

function initThemeToggle() {
  const buttons = document.querySelectorAll('#theme-toggle, [data-theme-switch]');
  if (!buttons.length) return;

  function syncThemeUI() {
    const isLight = document.documentElement.classList.contains('light-theme');
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');
    const label = document.getElementById('theme-label');

    if (sunIcon && moonIcon) {
      sunIcon.classList.toggle('hidden', isLight);
      moonIcon.classList.toggle('hidden', !isLight);
    }
    if (label) {
      label.textContent = isLight ? 'Dark mode' : 'Light mode';
    }
  }

  syncThemeUI();

  buttons.forEach((btn) => {
    btn.addEventListener('click', (event) => {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const canTransition = Boolean(document.startViewTransition) && !reducedMotion;

      const performToggle = () => {
        document.documentElement.classList.toggle('light-theme');
        const isLight = document.documentElement.classList.contains('light-theme');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        syncThemeUI();
      };

      if (!canTransition) {
        performToggle();
        return;
      }

      const rect = btn.getBoundingClientRect();
      const x = event.clientX || rect.left + rect.width / 2;
      const y = event.clientY || rect.top + rect.height / 2;
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      document.documentElement.classList.add('theme-toggle-active');
      const transition = document.startViewTransition(performToggle);

      transition.ready
        .then(() => {
          document.documentElement.animate(
            {
              clipPath: [
                `circle(0px at ${x}px ${y}px)`,
                `circle(${endRadius}px at ${x}px ${y}px)`,
              ],
            },
            {
              duration: 420,
              easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
              fill: 'both',
              pseudoElement: '::view-transition-new(root)',
            }
          );
        })
        .catch(() => {});

      transition.finished.finally(() => {
        document.documentElement.classList.remove('theme-toggle-active');
      });
    });
  });
}

function initNavUnderline() {
  const nav = document.getElementById('desktop-nav');
  const bar = document.getElementById('nav-underline');
  if (!nav || !bar) return;

  nav.querySelectorAll('.nav-link').forEach((link) => {
    const moveBar = () => {
      bar.style.width = `${link.offsetWidth}px`;
      bar.style.transform = `translate3d(${link.offsetLeft}px, 0, 0)`;
      bar.style.opacity = '1';
    };
    link.addEventListener('pointerenter', moveBar);
    link.addEventListener('focusin', moveBar);
  });

  nav.addEventListener('pointerleave', () => {
    bar.style.opacity = '0';
  });

  nav.addEventListener('focusout', (e) => {
    if (!nav.contains(e.relatedTarget)) {
      bar.style.opacity = '0';
    }
  });
}

function initScrollProgressAndSpy() {
  const progressBar = document.getElementById('scroll-progress');
  const navLinks = Array.from(document.querySelectorAll('#desktop-nav .nav-link'));
  const sections = navLinks
    .map((link) => {
      const href = link.getAttribute('href') || '';
      if (!href.startsWith('#')) return null;
      const id = href.slice(1);
      const el = id ? document.getElementById(id) : null;
      return el ? { link, el } : null;
    })
    .filter(Boolean);

  if (!progressBar && !sections.length) return;

  let ticking = false;
  const update = () => {
    ticking = false;
    if (progressBar) {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const ratio = Math.min(1, Math.max(0, window.scrollY / maxScroll));
      progressBar.style.transform = `scaleX(${ratio.toFixed(4)})`;
    }

    if (sections.length) {
      const marker = window.scrollY + 160;
      let activeLink = null;
      for (const item of sections) {
        if (item.el.offsetTop <= marker) activeLink = item.link;
      }
      sections.forEach(({ link }) => link.classList.toggle('is-current', link === activeLink));
    }
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true }
  );
  update();
}

function initMobileMenu() {
  const menuToggle = document.getElementById('mobile-menu-toggle');
  const menuClose = document.getElementById('mobile-menu-close');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!menuToggle || !mobileMenu) return;

  function openMenu() {
    mobileMenu.classList.add('menu-open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    menuToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    mobileMenu.classList.remove('menu-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  closeMenu();
  menuToggle.addEventListener('click', openMenu);
  if (menuClose) menuClose.addEventListener('click', closeMenu);

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('menu-open')) {
      closeMenu();
    }
  });
}

const _decodedFrameCache = new Set();

function preloadPortfolioFrames() {
  const isHome = document.body?.getAttribute('data-project-page') === 'home';
  const priorityUrls = isHome
    ? [
        'assets/hostelapp/hostel_1.jpg',
        'assets/hostelapp/hostel_3.jpg',
        'assets/hostelapp/hostel_4.jpg',
        'assets/hostelapp/hostel_6.jpg',
        'assets/connectlnx/connectlnx_send.jpg',
        'assets/connectlnx/connectlnx_receive.jpg',
        'assets/smartexpense/expense_1.jpg',
        'assets/smartexpense/expense_3.jpg',
        'assets/smartexpense/expense_4.jpg',
        'assets/aztrox/aztrox_tui.png',
      ]
    : [];

  const domUrls = Array.from(document.querySelectorAll('.hardware-screen img, [data-lightbox]')).map((img) =>
    img.getAttribute('src')
  );

  const uniqueUrls = Array.from(new Set([...priorityUrls, ...domUrls])).filter(Boolean);

  const warmAll = () => {
    uniqueUrls.forEach((url) => {
      if (_decodedFrameCache.has(url)) return;
      _decodedFrameCache.add(url);
      const preloader = new Image();
      preloader.decoding = 'async';
      preloader.src = url;
      if (typeof preloader.decode === 'function') {
        preloader.decode().catch(() => {});
      }
    });
  };

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(warmAll, { timeout: 250 });
  } else {
    setTimeout(warmAll, 40);
  }
}

function activateFrameGroup(group, index) {
  const idxStr = String(index);

  document.querySelectorAll(`.hardware-screen[data-frame-group="${group}"]`).forEach((screen) => {
    screen.querySelectorAll('img[data-frame-index]').forEach((img) => {
      const match = img.getAttribute('data-frame-index') === idxStr;
      img.classList.toggle('is-active-frame', match);
    });
  });

  document.querySelectorAll(`[data-sync-group="${group}"][data-frame-index]`).forEach((btn) => {
    const active = btn.getAttribute('data-frame-index') === idxStr;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-selected', String(active));
  });
}

function initGallerySwitchers() {
  document.querySelectorAll('[data-sync-group][data-frame-index]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const group = btn.getAttribute('data-sync-group');
      const idx = Number(btn.getAttribute('data-frame-index') || 0);
      if (group) activateFrameGroup(group, idx);
    });
  });
}

const CONNECTLNX_PHASES = [
  {
    top: 'mDNS / QR PAIR',
    bottom: 'Zero-Config LAN',
    detail: 'Zero-config mDNS peer discovery across local subnets, falling back to ML Kit QR pairing when campus Wi-Fi isolates multicast.',
  },
  {
    top: 'HDR · 0xC1 FRAME',
    bottom: 'SHA-256 Checksum',
    detail: 'Compact binary frame negotiates file metadata, SHA-256 checksum headers, and chunk offsets before opening data lanes.',
  },
  {
    top: '5× NIO TCP',
    bottom: 'Parallel Striping',
    detail: 'Payload stripes across 5 concurrent Java NIO SocketChannels, saturating full local Wi-Fi bandwidth with zero cloud relay.',
  },
];

function initConnectLnxProtocolStepper() {
  const buttons = document.querySelectorAll('[data-sync-group="connectlnx"][data-protocol-index]');
  if (!buttons.length) return () => {};

  const stageEl = document.getElementById('connectlnx-stage');
  const topLabel = document.getElementById('connectlnx-bridge-top');
  const bottomLabel = document.getElementById('connectlnx-bridge-bottom');

  function setStep(idx) {
    const safeIdx = Math.max(0, Math.min(CONNECTLNX_PHASES.length - 1, Number(idx) || 0));
    const idxStr = String(safeIdx);
    const phase = CONNECTLNX_PHASES[safeIdx];

    if (stageEl) stageEl.setAttribute('data-proto-phase', idxStr);
    if (topLabel) topLabel.textContent = phase.top;
    if (bottomLabel) bottomLabel.textContent = phase.bottom;

    buttons.forEach((b) => {
      const active = b.getAttribute('data-protocol-index') === idxStr;
      b.classList.toggle('is-active', active);
      b.setAttribute('aria-selected', String(active));
    });

    document.querySelectorAll('[data-protocol-detail="connectlnx"]').forEach((detail) => {
      detail.textContent = phase.detail;
      detail.classList.remove('stage-view-enter');
      void detail.offsetWidth;
      detail.classList.add('stage-view-enter');
    });
  }

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      setStep(Number(btn.getAttribute('data-protocol-index') || 0));
    });
  });

  setStep(0);
  return setStep;
}

/* ==========================================================================
   Interactive 3-View Stage Switcher (aztrox-release CLI Exhibition)
   ========================================================================== */
const AZTROX_VIEWS = [
  'Real CachyOS dashboard · 136 runs in history.db',
  'Preflight · Parallel Gradle · 4-surface fan-out',
  'LIFO EXIT rollbacks · Telegram QA · 3-node probes',
];

function initAztroxStageSwitcher() {
  const stage = document.getElementById('aztrox-stage');
  const tabs = document.querySelectorAll('[data-sync-group="aztrox"][data-aztrox-index]');
  const panels = document.querySelectorAll('[data-aztrox-panel]');
  const detailEl = document.getElementById('aztrox-stage-detail');
  if (!tabs.length || !panels.length) return () => {};

  function setView(idx) {
    const safeIdx = Math.max(0, Math.min(AZTROX_VIEWS.length - 1, Number(idx) || 0));
    const idxStr = String(safeIdx);

    if (stage) stage.setAttribute('data-aztrox-view', idxStr);

    tabs.forEach((tab) => {
      const active = tab.getAttribute('data-aztrox-index') === idxStr;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
    });

    panels.forEach((panel) => {
      const match = panel.getAttribute('data-aztrox-panel') === idxStr;
      panel.classList.toggle('hidden', !match);
      if (match) {
        panel.classList.remove('stage-view-enter');
        void panel.offsetWidth;
        panel.classList.add('stage-view-enter');
      }
    });

    if (detailEl && AZTROX_VIEWS[safeIdx]) {
      detailEl.textContent = AZTROX_VIEWS[safeIdx];
    }
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      setView(Number(tab.getAttribute('data-aztrox-index') || 0));
    });
  });

  setView(0);
  return setView;
}

/* ==========================================================================
   Interactive 3-Screen Fanned Hardware Stage (Smart Expense Tracker)
   ========================================================================== */
function initExpenseFanStage() {
  const stage = document.getElementById('expense-fan-stage');
  if (!stage) return () => {};

  const cards = Array.from(stage.querySelectorAll('[data-fan-card]'));
  const captionEl = document.getElementById('expense-fan-caption');
  const captions = {
    '0': 'Room Flow reactive balance & daily limits',
    '1': '60fps Jetpack Compose Canvas analytics',
    '2': 'On-device spending breakdown by category',
  };

  function setFocus(focusIdx) {
    stage.setAttribute('data-center', String(focusIdx));
    cards.forEach((card) => {
      const idx = Number(card.getAttribute('data-fan-card'));
      card.classList.remove('fan-left', 'fan-center', 'fan-right');
      if (idx === focusIdx) {
        card.classList.add('fan-center');
      } else if ((idx + 1) % 3 === focusIdx) {
        card.classList.add('fan-left');
      } else {
        card.classList.add('fan-right');
      }
    });

    if (captionEl && captions[String(focusIdx)]) {
      captionEl.textContent = captions[String(focusIdx)];
    }

    document.querySelectorAll('[data-fan-select]').forEach((btn) => {
      const active = Number(btn.getAttribute('data-fan-select')) === focusIdx;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', String(active));
    });
  }

  cards.forEach((card) => {
    card.addEventListener('click', (e) => {
      const idx = Number(card.getAttribute('data-fan-card'));
      if (!card.classList.contains('fan-center')) {
        e.stopPropagation();
        e.preventDefault();
        setFocus(idx);
      }
    });
  });

  document.querySelectorAll('[data-fan-select]').forEach((btn) => {
    btn.addEventListener('click', () => {
      setFocus(Number(btn.getAttribute('data-fan-select') || 0));
    });
  });

  setFocus(0);
  return setFocus;
}

/* ==========================================================================
   Scroll-Driven Cinema Exhibition Controller
   Automatically morphs exhibition panels, hardware screens, active tabs,
   and WebGL shader hue as the reader scrolls through work chapters.
   ========================================================================== */
function initScrollCinema() {
  const cinemaRoot = document.getElementById('work-cinema');
  const stage = document.getElementById('cinema-stage');
  const beats = Array.from(document.querySelectorAll('[data-cinema-beat]'));
  const panels = Array.from(document.querySelectorAll('[data-cinema-panel]'));
  const navButtons = Array.from(document.querySelectorAll('[data-cinema-nav]'));
  const labelEl = document.getElementById('cinema-stage-label');
  const captionEl = document.getElementById('cinema-stage-caption');
  const ctaEl = document.getElementById('cinema-stage-cta');

  if (!cinemaRoot || !stage || !beats.length || !panels.length) return;

  const BEAT_CONFIG = {
    '01a': {
      chapter: '01',
      label: '01 / 05 · GCES Hostel · Home Dashboard',
      caption: 'Kotlin Multi-Module · Jetpack Compose · 1,200 DAU',
      href: 'gceshostel/',
      cta: 'Open Case Study →',
      onEnter: () => activateFrameGroup('hostel', 0),
    },
    '01b': {
      chapter: '01',
      label: '01 / 05 · GCES Hostel · Meal Planner & Rollover',
      caption: 'Spring Boot 3.5 · ShedLock JDBC · Bucket4j <100ms P95',
      href: 'gceshostel/',
      cta: 'Open Case Study →',
      onEnter: () => activateFrameGroup('hostel', 1),
    },
    '01c': {
      chapter: '01',
      label: '01 / 05 · GCES Hostel · Live Mess Menu',
      caption: 'Offline Room Cache · Zero-Update Weekly Schedule Sync',
      href: 'gceshostel/',
      cta: 'Open Case Study →',
      onEnter: () => activateFrameGroup('hostel', 2),
    },
    '01d': {
      chapter: '01',
      label: '01 / 05 · GCES Hostel · Food & Demand Stats',
      caption: 'PostgreSQL Forecast Views · Real-Time Kitchen Headcounts',
      href: 'gceshostel/',
      cta: 'Open Case Study →',
      onEnter: () => activateFrameGroup('hostel', 3),
    },
    '02a': {
      chapter: '02',
      label: '02 / 05 · ConnectLnx · 01. mDNS & QR Discovery',
      caption: 'Kotlin Multiplatform · Play Store, Arch AUR & Windows',
      href: 'connectlnx/',
      cta: 'Technical Breakdown →',
      onEnter: () => activateConnectLnxStep?.(0),
    },
    '02b': {
      chapter: '02',
      label: '02 / 05 · ConnectLnx · 02. Binary Header Handshake',
      caption: 'Compact Binary Framing · Chunk Map & SHA-256 Digests',
      href: 'connectlnx/',
      cta: 'Technical Breakdown →',
      onEnter: () => activateConnectLnxStep?.(1),
    },
    '02c': {
      chapter: '02',
      label: '02 / 05 · ConnectLnx · 03. 5× Java NIO Stream',
      caption: 'Parallel Striping Across 5 Non-Blocking TCP Channels',
      href: 'connectlnx/',
      cta: 'Technical Breakdown →',
      onEnter: () => activateConnectLnxStep?.(2),
    },
    '03a': {
      chapter: '03',
      label: '03 / 05 · aztrox-release · Live TUI Dashboard',
      caption: 'Bash 5.3 · 9 Products · 136 Runs in SQLite history.db',
      href: '#work-aztrox-pipeline',
      cta: 'Inspect Pipeline ↓',
      onEnter: () => activateAztroxView?.(0),
    },
    '03b': {
      chapter: '03',
      label: '03 / 05 · aztrox-release · 4-Surface Pipeline',
      caption: 'Play Store · GitHub + Arch AUR · Firebase · Render & HF',
      href: '#work-aztrox-safety',
      cta: 'Safety & Remote QA ↓',
      onEnter: () => activateAztroxView?.(1),
    },
    '03c': {
      chapter: '03',
      label: '03 / 05 · aztrox-release · Rollbacks & Remote QA',
      caption: 'LIFO EXIT Trap · SQLite Resume · Telegram Bot API',
      href: '#work-expense',
      cta: 'Next: Expense Tracker ↓',
      onEnter: () => activateAztroxView?.(2),
    },
    '04a': {
      chapter: '04',
      label: '04 / 05 · Smart Expense · Room Flow Ledger',
      caption: '100% On-Device SQLite · Biometric Lock · Zero Cloud',
      href: 'smart-expense-tracker/',
      cta: '11-Screen Walkthrough →',
      onEnter: () => setExpenseFanFocus?.(0),
    },
    '04b': {
      chapter: '04',
      label: '04 / 05 · Smart Expense · Compose Canvas Charts',
      caption: '60fps Custom Native Drawing · Tactile Scrub Analytics',
      href: 'smart-expense-tracker/',
      cta: '11-Screen Walkthrough →',
      onEnter: () => setExpenseFanFocus?.(1),
    },
    '04c': {
      chapter: '04',
      label: '04 / 05 · Smart Expense · Category Guardrails',
      caption: 'On-Device Category Breakdown · WorkManager Budget Alerts',
      href: 'smart-expense-tracker/',
      cta: '11-Screen Walkthrough →',
      onEnter: () => setExpenseFanFocus?.(2),
    },
    '05': {
      chapter: '05',
      label: '05 / 05 · Stockfish Interop & Arcade Suite',
      caption: 'C++ GDExtension · Godot Engine · Depth 22 at 60fps',
      href: 'chessgame/',
      cta: 'Chess Engine Case Study →',
      onEnter: () => {},
    },
  };

  let currentBeatId = null;
  let currentChapter = null;

  function activateBeat(beatId, { force = false } = {}) {
    if (!force && beatId === currentBeatId) return;
    const cfg = BEAT_CONFIG[beatId];
    if (!cfg) return;

    currentBeatId = beatId;
    const chapterChanged = cfg.chapter !== currentChapter;
    currentChapter = cfg.chapter;

    stage.setAttribute('data-beat', beatId);
    stage.setAttribute('data-chapter', cfg.chapter);

    beats.forEach((beat) => {
      beat.classList.toggle('is-active', beat.getAttribute('data-cinema-beat') === beatId);
    });

    navButtons.forEach((btn) => {
      const active = btn.getAttribute('data-cinema-nav') === cfg.chapter;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', String(active));
    });

    if (chapterChanged || force) {
      panels.forEach((panel) => {
        const match = panel.getAttribute('data-cinema-panel') === cfg.chapter;
        panel.classList.toggle('is-active', match);
        panel.setAttribute('aria-hidden', String(!match));
      });
    }

    if (labelEl) labelEl.textContent = cfg.label;
    if (captionEl) captionEl.textContent = cfg.caption;
    if (ctaEl) {
      ctaEl.setAttribute('href', cfg.href);
      ctaEl.textContent = cfg.cta;
    }

    cfg.onEnter?.();

    // Update ambient WebGL contour hue if user is inside work section
    const cinemaRect = cinemaRoot.getBoundingClientRect();
    if (cinemaRect.top < window.innerHeight * 0.65 && cinemaRect.bottom > window.innerHeight * 0.25) {
      setAtmosphereChapter(cfg.chapter);
    }
  }

  // Click chapter tabs in sticky stage header to jump smoothly + activate immediately
  navButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const ch = btn.getAttribute('data-cinema-nav');
      const targetBeat = beats.find((b) => b.getAttribute('data-cinema-chapter') === ch);
      if (targetBeat) {
        const beatId = targetBeat.getAttribute('data-cinema-beat');
        if (beatId) activateBeat(beatId, { force: true });
        targetBeat.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });

  // Scroll-linked beat resolution (rAF throttled, zero jank)
  let rafPending = false;
  function evaluateScroll() {
    rafPending = false;
    const cinemaRect = cinemaRoot.getBoundingClientRect();
    const vh = window.innerHeight;

    // Reset shader tint back to Hero sapphire when scrolled to top
    if (window.scrollY < vh * 0.45) {
      setAtmosphereChapter('hero');
    } else if (cinemaRect.bottom < vh * 0.25) {
      setAtmosphereChapter('02');
    }

    const focusY = vh * 0.44;
    let closestBeat = beats[0];
    let minDist = Infinity;

    for (const beat of beats) {
      const rect = beat.getBoundingClientRect();
      const beatCenter = rect.top + rect.height * 0.45;
      const dist = Math.abs(beatCenter - focusY);
      if (dist < minDist) {
        minDist = dist;
        closestBeat = beat;
      }
    }

    const beatId = closestBeat?.getAttribute('data-cinema-beat');
    if (beatId) activateBeat(beatId);
  }

  window.addEventListener(
    'scroll',
    () => {
      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(evaluateScroll);
      }
    },
    { passive: true }
  );

  // Initialize immediately
  activateBeat('01a', { force: true });
  evaluateScroll();
}

function initScrollObserver() {
  const revealElements = document.querySelectorAll('.reveal-init');
  if (!revealElements.length) return;

  if (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    !('IntersectionObserver' in window)
  ) {
    revealElements.forEach((el) => el.classList.add('reveal-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.06, rootMargin: '0px 0px -24px 0px' }
  );

  revealElements.forEach((el) => observer.observe(el));
}

function initEmailCopy() {
  const copyBtn = document.getElementById('copy-email-btn');
  const copyBtnText = document.getElementById('copy-btn-text');
  const liveStatus = document.getElementById('copy-live-status');
  if (!copyBtn) return;

  let resetTimeout = null;
  const email = 'barathjack77@gmail.com';

  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(email);
      if (copyBtnText) copyBtnText.textContent = 'Copied';
      if (liveStatus) liveStatus.style.opacity = '1';

      if (resetTimeout) clearTimeout(resetTimeout);
      resetTimeout = setTimeout(() => {
        if (copyBtnText) copyBtnText.textContent = 'Copy Email';
        if (liveStatus) liveStatus.style.opacity = '0';
      }, 2200);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  });
}

function initImageFallbacks() {
  document.querySelectorAll('img').forEach((img) => {
    img.addEventListener('error', () => {
      const box = img.closest('[data-img-container]');
      if (box) box.classList.add('img-fallback-active');
    });
  });
}

function initLightbox() {
  const images = document.querySelectorAll('[data-lightbox]');
  if (!images.length) return;

  let lastTrigger = null;
  let overlay = document.getElementById('site-lightbox');

  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'site-lightbox';
    overlay.className = 'site-lightbox-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Enlarged screenshot preview');
    overlay.innerHTML = `
      <div class="site-lightbox-content relative max-w-4xl max-h-[90vh] flex flex-col items-center">
        <button id="lightbox-close-btn" type="button" class="absolute -top-11 right-0 text-white/90 hover:text-white text-sm font-mono py-2 px-3 cursor-pointer transition-colors" aria-label="Close preview">Close &times;</button>
        <img id="lightbox-img" alt="Enlarged project preview" referrerpolicy="no-referrer" class="hidden max-w-full max-h-[80vh] rounded-xl border border-white/15 shadow-2xl object-contain">
        <p id="lightbox-caption" class="text-xs text-white/85 font-mono mt-3 text-center max-w-xl"></p>
      </div>
    `;
    document.body.appendChild(overlay);

    function closeLightbox() {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
      const targetImg = document.getElementById('lightbox-img');
      if (targetImg) {
        targetImg.classList.add('hidden');
        targetImg.removeAttribute('src');
      }
      if (lastTrigger && typeof lastTrigger.focus === 'function') {
        lastTrigger.focus();
      }
    }

    overlay.addEventListener('click', (e) => {
      if (e.target.id !== 'lightbox-img') closeLightbox();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('active')) {
        closeLightbox();
      }
    });
  }

  function openLightbox(img) {
    lastTrigger = img;
    const src = img.getAttribute('data-large') || img.src;
    const caption = img.getAttribute('data-caption') || img.alt || '';
    const targetImg = document.getElementById('lightbox-img');
    const targetCaption = document.getElementById('lightbox-caption');
    const closeBtn = document.getElementById('lightbox-close-btn');
    if (targetImg) {
      targetImg.src = src;
      targetImg.classList.remove('hidden');
    }
    if (targetCaption) targetCaption.textContent = caption;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (closeBtn) closeBtn.focus();
  }

  images.forEach((img) => {
    if (!img.hasAttribute('tabindex')) {
      img.setAttribute('tabindex', '0');
    }
    img.addEventListener('click', (e) => {
      const fanParent = img.closest('[data-fan-card]');
      if (fanParent && !fanParent.classList.contains('fan-center')) {
        return;
      }
      e.stopPropagation();
      openLightbox(img);
    });
    img.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(img);
      }
    });
  });
}

function initPageTransitions() {
  document.addEventListener('click', (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    const link = e.target.closest('a');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || link.target === '_blank') {
      return;
    }

    const projectKeys = ['gceshostel', 'connectlnx', 'smart-expense-tracker', 'chessgame', 'two-player-games'];
    const matched = projectKeys.find((k) => href.includes(k));
    if (matched) {
      sessionStorage.setItem('active-project', matched);
    }
  });
}
