/**
 * Barath B — Obsidian & White-Milk Portfolio Script
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initNavUnderline();
  initMobileMenu();
  initScrollObserver();
  initHeroArtifactStage();
  initGallerySwitchers();
  initConnectLnxProtocolStepper();
  initExperienceTraceTabs();
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
      href: '#chapter-hostel',
    },
    connectlnx: {
      caption: 'Kotlin Multiplatform · Java NIO · mDNS · ML Kit QR',
      href: '#chapter-connectlnx',
    },
    aztrox: {
      caption: 'Bash 5.3 · JDK 17 · fastlane · SQLite · gh · ShellCheck',
      href: '#chapter-aztrox',
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

function initGallerySwitchers() {
  const buttons = document.querySelectorAll('[data-gallery-target]');
  if (!buttons.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-gallery-target');
      const imgSrc = btn.getAttribute('data-img');
      const imgAlt = btn.getAttribute('data-alt');
      if (!target || !imgSrc) return;

      const stageImg = document.getElementById(`${target}-stage-img`);
      if (stageImg) {
        stageImg.src = imgSrc;
        if (imgAlt) stageImg.alt = imgAlt;
        stageImg.closest('[data-img-container]')?.classList.remove('img-fallback-active');
      }

      document
        .querySelectorAll(`[data-gallery-target="${target}"]`)
        .forEach((sibling) => {
          sibling.classList.toggle('is-active', sibling === btn);
        });
    });
  });
}

function initConnectLnxProtocolStepper() {
  const buttons = document.querySelectorAll('[data-protocol-step]');
  const detail = document.getElementById('protocol-step-detail');
  if (!buttons.length || !detail) return;

  const descriptions = {
    discovery:
      'Zero-config mDNS peer discovery with ML Kit QR pairing fallback on restricted networks.',
    handshake:
      'Compact binary frame negotiates metadata, SHA checksum headers, and chunk offsets.',
    multiplex:
      'Payload stripes across 5 concurrent Java NIO SocketChannels over local LAN.',
  };

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-protocol-step');
      if (!key || !descriptions[key]) return;

      buttons.forEach((b) => b.classList.toggle('is-active', b === btn));
      detail.textContent = descriptions[key];
    });
  });
}

function initExperienceTraceTabs() {
  const tabs = document.querySelectorAll('[data-exp-tab]');
  const panels = document.querySelectorAll('[data-exp-panel]');
  if (!tabs.length || !panels.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-exp-tab');

      tabs.forEach((t) => {
        const active = t === tab;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-selected', String(active));
      });

      panels.forEach((panel) => {
        panel.classList.toggle('hidden', panel.getAttribute('data-exp-panel') !== target);
      });
    });
  });
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
