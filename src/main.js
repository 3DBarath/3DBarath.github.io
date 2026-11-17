/**
 * Barath B — Obsidian & White-Milk Portfolio Script
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initNavUnderline();
  initScrollProgressAndSpy();
  initMobileMenu();
  preloadPortfolioFrames();
  initHeroArtifactStage();
  initScrollytellingStage();
  initGallerySwitchers();
  initConnectLnxProtocolStepper();
  initExperienceTraceTabs();
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
              duration: 460,
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
      const id = link.getAttribute('href')?.replace('#', '');
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
      const marker = window.scrollY + 140;
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

function initHeroArtifactStage() {
  const tabs = document.querySelectorAll('[data-hero-tab]');
  const panels = document.querySelectorAll('[data-hero-panel]');
  const caption = document.getElementById('hero-stage-caption');
  const link = document.getElementById('hero-stage-link');
  if (!tabs.length || !panels.length) return;

  const meta = {
    hostel: {
      caption: 'Kotlin · Jetpack Compose · Spring Boot 3.5 · PostgreSQL',
      href: '#work-hostel',
    },
    connectlnx: {
      caption: 'Kotlin Multiplatform · Java NIO · mDNS · ML Kit QR',
      href: '#work-connectlnx',
    },
    aztrox: {
      caption: 'Bash 5.3 · JDK 17 · fastlane · SQLite · gh · ShellCheck',
      href: '#work-aztrox',
    },
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-hero-tab');

      tabs.forEach((t) => {
        const active = t === tab;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-selected', String(active));
      });

      panels.forEach((panel) => {
        const match = panel.getAttribute('data-hero-panel') === target;
        panel.classList.toggle('hidden', !match);
        panel.classList.toggle('flex', match);
      });

      if (target && meta[target]) {
        if (caption) caption.textContent = meta[target].caption;
        if (link) link.setAttribute('href', meta[target].href);
      }
    });
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
      ]
    : [];

  const domUrls = Array.from(document.querySelectorAll('.hardware-screen img, [data-lightbox]')).map((img) =>
    img.getAttribute('src')
  );

  const uniqueUrls = Array.from(new Set([...priorityUrls, ...domUrls])).filter(Boolean);

  // Warm browser fetch + GPU bitmap decode immediately after initial paint
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

const HOSTEL_LABELS = ['Dashboard', 'Weekly Menu', 'Food Analytics'];
const EXPENSE_LABELS = ['Balance Ledger', 'Canvas Charts', 'Categories'];
const CONNECTLNX_DESCRIPTIONS = [
  'Zero-config mDNS peer discovery with ML Kit QR pairing fallback on restricted networks.',
  'Compact binary frame negotiates metadata, SHA checksum headers, and chunk offsets.',
  'Payload stripes across 5 concurrent Java NIO SocketChannels over local LAN.',
];

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

  const kicker = document.getElementById('stage-kicker');
  const activeStep = document.querySelector('.story-step.is-active-beat')?.getAttribute('data-story-step');
  if (kicker && group === 'hostel' && activeStep === '01') {
    kicker.textContent = `01 · GCES Hostel · ${HOSTEL_LABELS[index] || 'Dashboard'}`;
  }
  if (kicker && group === 'expense' && activeStep === '05') {
    kicker.textContent = `05 · Smart Expense Tracker · ${EXPENSE_LABELS[index] || 'Balance Ledger'}`;
  }
}

function activateConnectLnxStep(index) {
  const idx = Math.max(0, Math.min(CONNECTLNX_DESCRIPTIONS.length - 1, Number(index) || 0));
  const idxStr = String(idx);

  document.querySelectorAll('[data-sync-group="connectlnx"][data-protocol-index]').forEach((btn) => {
    const active = btn.getAttribute('data-protocol-index') === idxStr;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-selected', String(active));
  });

  document.querySelectorAll('[data-protocol-detail="connectlnx"]').forEach((detail) => {
    if (detail.textContent.trim() === CONNECTLNX_DESCRIPTIONS[idx]) return;
    detail.textContent = CONNECTLNX_DESCRIPTIONS[idx];
    detail.classList.remove('stage-view-enter');
    void detail.offsetWidth;
    detail.classList.add('stage-view-enter');
  });
}

function initScrollytellingStage() {
  const steps = Array.from(document.querySelectorAll('[data-story-step]'));
  const navButtons = Array.from(document.querySelectorAll('[data-story-nav]'));
  const views = Array.from(document.querySelectorAll('[data-stage-view]'));
  const stageWrap = document.getElementById('work-sticky-stage');
  const subProgressBar = document.getElementById('stage-subprogress');
  const kicker = document.getElementById('stage-kicker');
  const caption = document.getElementById('stage-caption');
  const link = document.getElementById('stage-link');
  if (!steps.length || !views.length) return;

  const meta = {
    '01': {
      kicker: '01 · GCES Hostel · Dashboard',
      caption: 'Kotlin · Jetpack Compose · :app / :common / :server',
      href: 'gceshostel/',
      label: 'Open Case Study →',
      display: 'flex',
    },
    '02': {
      kicker: '02 · Production Scale · Midnight & Rush',
      caption: 'Spring Boot 3.5 · ShedLock JDBC · Bucket4j · PostgreSQL',
      href: 'gceshostel/',
      label: 'Screens & Specs →',
      display: 'grid',
    },
    '03': {
      kicker: '03 · ConnectLnx · 5× Java NIO TCP',
      caption: 'Kotlin Multiplatform · mDNS · ML Kit QR Pairing',
      href: 'connectlnx/',
      label: 'Technical Breakdown →',
      display: 'flex',
    },
    '04': {
      kicker: '04 · aztrox-release · 9 Products',
      caption: 'Bash 5.3 · fastlane · SQLite history.db · LIFO Rollbacks',
      href: '',
      label: '',
      display: 'block',
    },
    '05': {
      kicker: '05 · Smart Expense Tracker · Balance Ledger',
      caption: 'Room + Flow · Compose Canvas · WorkManager',
      href: 'smart-expense-tracker/',
      label: '11-Screen Walkthrough →',
      display: 'flex',
    },
  };

  let currentId = null;

  function setStage(id) {
    if (!id || id === currentId) return;
    currentId = id;

    steps.forEach((step) => {
      step.classList.toggle('is-active-beat', step.getAttribute('data-story-step') === id);
    });

    navButtons.forEach((btn) => {
      const active = btn.getAttribute('data-story-nav') === id;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', String(active));
    });

    views.forEach((view) => {
      const match = view.getAttribute('data-stage-view') === id;
      const mode = meta[id]?.display || 'flex';
      view.classList.toggle('hidden', !match);
      view.classList.remove('flex', 'grid', 'block', 'stage-view-enter');
      if (match) {
        view.classList.add(mode, 'stage-view-enter');
      }
    });

    if (meta[id]) {
      if (kicker) kicker.textContent = meta[id].kicker;
      if (caption) caption.textContent = meta[id].caption;
      if (link) {
        link.classList.toggle('hidden', !meta[id].href);
        if (meta[id].href) {
          link.setAttribute('href', meta[id].href);
          link.textContent = meta[id].label;
        }
      }
    }
  }

  const lastSubBucket = {};

  function activateSubStep(id, bucket) {
    if (lastSubBucket[id] === bucket) return;
    lastSubBucket[id] = bucket;

    if (id === '01') activateFrameGroup('hostel', bucket);
    if (id === '03') activateConnectLnxStep(bucket);
    if (id === '05') activateFrameGroup('expense', bucket);
  }

  let ticking = false;
  function updateByScroll() {
    ticking = false;
    const isDesktop = window.innerWidth >= 1024;
    let focalY;

    if (isDesktop) {
      focalY = window.innerHeight * 0.42;
    } else {
      const stageBottom = stageWrap ? stageWrap.getBoundingClientRect().bottom : 290;
      const readingSpace = Math.max(120, window.innerHeight - stageBottom);
      focalY = stageBottom + Math.min(110, readingSpace * 0.30);
    }

    let closest = steps[0];
    let closestDist = Infinity;

    for (const step of steps) {
      const rect = step.getBoundingClientRect();
      const center = rect.top + rect.height * 0.35;
      const dist = Math.abs(center - focalY);
      if (dist < closestDist) {
        closestDist = dist;
        closest = step;
      }
    }

    if (closest) {
      const id = closest.getAttribute('data-story-step');
      setStage(id);

      const rect = closest.getBoundingClientRect();
      const progress = Math.min(0.999, Math.max(0, (focalY - rect.top) / Math.max(1, rect.height)));
      if (subProgressBar) {
        subProgressBar.style.transform = `scaleX(${progress.toFixed(3)})`;
      }

      if (id === '01' || id === '03' || id === '05') {
        const bucket = progress < 0.34 ? 0 : progress < 0.67 ? 1 : 2;
        activateSubStep(id, bucket);
      }
    }
  }

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateByScroll);
      }
    },
    { passive: true }
  );

  navButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-story-nav');
      const targetStep = steps.find((s) => s.getAttribute('data-story-step') === id);
      if (targetStep) {
        const isDesktop = window.innerWidth >= 1024;
        const clearance = isDesktop ? 104 : (stageWrap ? stageWrap.offsetHeight : 230) + 74;
        const y = targetStep.getBoundingClientRect().top + window.scrollY - clearance;
        window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
        setStage(id);
      }
    });
  });

  setStage('01');
  updateByScroll();
  if (window.location.hash) {
    requestAnimationFrame(updateByScroll);
  }
}

function initGallerySwitchers() {
  // Primary zero-latency synced layered switchers
  document.querySelectorAll('[data-sync-group][data-frame-index]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const group = btn.getAttribute('data-sync-group');
      const idx = Number(btn.getAttribute('data-frame-index') || 0);
      if (group) activateFrameGroup(group, idx);
    });
  });

  // Legacy fallback for subpages if any use data-gallery-target
  document.querySelectorAll('[data-gallery-target]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-gallery-target');
      const imgSrc = btn.getAttribute('data-img');
      const imgAlt = btn.getAttribute('data-alt');
      if (!target || !imgSrc) return;

      const stageImg = document.getElementById(`${target}-stage-img`);
      if (stageImg && stageImg.getAttribute('src') !== imgSrc) {
        stageImg.src = imgSrc;
        if (imgAlt) stageImg.alt = imgAlt;
        stageImg.closest('[data-img-container]')?.classList.remove('img-fallback-active');
      }

      document.querySelectorAll(`[data-gallery-target="${target}"]`).forEach((sibling) => {
        sibling.classList.toggle('is-active', sibling === btn);
      });
    });
  });
}

function initConnectLnxProtocolStepper() {
  document.querySelectorAll('[data-sync-group="connectlnx"][data-protocol-index]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.getAttribute('data-protocol-index') || 0);
      activateConnectLnxStep(idx);
    });
  });
}

function initExperienceTraceTabs() {
  const tabs = Array.from(document.querySelectorAll('[data-exp-tab]'));
  const panels = Array.from(document.querySelectorAll('[data-exp-panel]'));
  if (!tabs.length || !panels.length) return;

  function selectExpTab(tab) {
    const target = tab.getAttribute('data-exp-tab');

    tabs.forEach((t) => {
      const active = t === tab;
      t.classList.toggle('is-active', active);
      t.setAttribute('aria-selected', String(active));
    });

    panels.forEach((panel) => {
      const match = panel.getAttribute('data-exp-panel') === target;
      panel.classList.toggle('hidden', !match);
      panel.classList.remove('stage-view-enter');
      if (match) {
        void panel.offsetWidth;
        panel.classList.add('stage-view-enter');
      }
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => selectExpTab(tab));
  });

  const runway = document.getElementById('experience-runway');
  const stickyEl = document.getElementById('experience-sticky');
  const expProgress = document.getElementById('exp-subprogress');
  if (!runway || !stickyEl) return;

  let lastExpBucket = 0;
  let ticking = false;

  const updateExpScroll = () => {
    ticking = false;
    const rRect = runway.getBoundingClientRect();
    const stickyTop = window.innerWidth >= 1024 ? 112 : 80;
    const travel = Math.max(1, runway.offsetHeight - stickyEl.offsetHeight);
    const progress = Math.min(0.999, Math.max(0, (stickyTop - rRect.top) / travel));

    if (expProgress) {
      expProgress.style.transform = `scaleX(${progress.toFixed(3)})`;
    }

    const bucket = progress < 0.33 ? 0 : progress < 0.66 ? 1 : 2;

    if (bucket !== lastExpBucket) {
      lastExpBucket = bucket;
      const targetTab = tabs[bucket];
      if (targetTab) selectExpTab(targetTab);
    }
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateExpScroll);
      }
    },
    { passive: true }
  );
  updateExpScroll();
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
    { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
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

  let overlay = document.getElementById('site-lightbox');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'site-lightbox';
    overlay.className = 'site-lightbox-overlay';
    overlay.innerHTML = `
      <div class="site-lightbox-content relative max-w-4xl max-h-[90vh] flex flex-col items-center">
        <button id="lightbox-close-btn" type="button" class="absolute -top-10 right-0 text-white/85 hover:text-white text-sm font-mono p-2 cursor-pointer transition-colors" aria-label="Close preview">Close &times;</button>
        <img id="lightbox-img" src="" alt="Enlarged project preview" referrerpolicy="no-referrer" class="max-w-full max-h-[82vh] rounded-xl border border-white/15 shadow-2xl object-contain">
        <p id="lightbox-caption" class="text-xs text-white/75 font-mono mt-3 text-center max-w-xl"></p>
      </div>
    `;
    document.body.appendChild(overlay);

    function closeLightbox() {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
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

  images.forEach((img) => {
    img.addEventListener('click', () => {
      const src = img.getAttribute('data-large') || img.src;
      const caption = img.alt || '';
      const targetImg = document.getElementById('lightbox-img');
      const targetCaption = document.getElementById('lightbox-caption');
      if (targetImg) targetImg.src = src;
      if (targetCaption) targetCaption.textContent = caption;
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
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
