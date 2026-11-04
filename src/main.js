/**
 * 3DBarath Portfolio - Clean, Zero-Dependency Script
 * Native IntersectionObserver, accessible controls, smooth theme switching
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initNavPill();
  initMobileMenu();
  initScrollObserver();
  initEmailCopy();
  initLightbox();
});

// Initialize view transitions immediately for earliest event capture
initPageTransitions();

/**
 * Dark / Light Theme Manager
 */
function initThemeToggle() {
  const themeToggle = document.getElementById('theme-toggle');
  const sunIcon = document.getElementById('sun-icon');
  const moonIcon = document.getElementById('moon-icon');
  if (!themeToggle) return;

  function updateIcons() {
    const isLight = document.documentElement.classList.contains('light-theme');
    if (sunIcon && moonIcon) {
      if (isLight) {
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
      } else {
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
      }
    }
  }

  updateIcons();

  themeToggle.addEventListener('click', (event) => {
    const isAppearanceTransition =
      document.startViewTransition &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const performToggle = () => {
      document.documentElement.classList.toggle('light-theme');
      const isLight = document.documentElement.classList.contains('light-theme');
      localStorage.setItem('theme', isLight ? 'light' : 'dark');
      updateIcons();
    };

    if (!isAppearanceTransition) {
      performToggle();
      return;
    }

    const rect = themeToggle.getBoundingClientRect();
    const x = event.clientX || (rect.left + rect.width / 2);
    const y = event.clientY || (rect.top + rect.height / 2);

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    document.documentElement.classList.add('theme-toggle-active');
    const transition = document.startViewTransition(() => {
      performToggle();
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`
          ]
        },
        {
          duration: 580,
          easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
          fill: 'both',
          pseudoElement: '::view-transition-new(root)'
        }
      );
    }).catch(() => {});

    transition.finished.finally(() => {
      document.documentElement.classList.remove('theme-toggle-active');
    });
  });
}

/**
 * Shared Sliding Pill ("Magic Hover") Navigation Indicator
 */
function initNavPill() {
  const nav = document.getElementById('desktop-nav');
  const pill = document.getElementById('nav-pill');
  if (!nav || !pill) return;

  const links = nav.querySelectorAll('.nav-link');
  let currentLink = null;
  let isNavActive = false;

  function handleEnter(link) {
    const isFirst = !isNavActive;
    isNavActive = true;

    if (currentLink && currentLink !== link) {
      currentLink.classList.remove('nav-link-active');
    }
    currentLink = link;
    currentLink.classList.add('nav-link-active');

    const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = link;

    if (isFirst) {
      // First hover: snap instantly to link position at scale(0)
      pill.classList.add('no-transition');
      pill.style.transform = `translate3d(${offsetLeft}px, ${offsetTop}px, 0) scale(0)`;
      pill.style.width = `${offsetWidth}px`;
      pill.style.height = `${offsetHeight}px`;
      pill.style.opacity = '0';
      void pill.offsetWidth; // Force synchronous layout reflow
      pill.classList.remove('no-transition');

      // Expand smoothly from scale(0) to scale(1)
      requestAnimationFrame(() => {
        pill.style.transform = `translate3d(${offsetLeft}px, ${offsetTop}px, 0) scale(1)`;
        pill.style.opacity = '1';
      });
    } else {
      // Subsequent hovers: smoothly glide across at scale(1)
      pill.style.transform = `translate3d(${offsetLeft}px, ${offsetTop}px, 0) scale(1)`;
      pill.style.width = `${offsetWidth}px`;
      pill.style.height = `${offsetHeight}px`;
      pill.style.opacity = '1';
    }
  }

  function handleLeave() {
    if (currentLink) {
      const { offsetLeft, offsetTop } = currentLink;
      pill.style.transform = `translate3d(${offsetLeft}px, ${offsetTop}px, 0) scale(0)`;
      currentLink.classList.remove('nav-link-active');
      currentLink = null;
    }
    pill.style.opacity = '0';
    isNavActive = false;
  }

  links.forEach((link) => {
    link.addEventListener('pointerenter', () => handleEnter(link));
    link.addEventListener('focusin', () => handleEnter(link));
  });

  nav.addEventListener('pointerleave', handleLeave);

  nav.addEventListener('focusout', (event) => {
    if (!nav.contains(event.relatedTarget)) {
      handleLeave();
    }
  });

  window.addEventListener('resize', () => {
    if (isNavActive && currentLink) {
      const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = currentLink;
      pill.classList.add('no-transition');
      pill.style.transform = `translate3d(${offsetLeft}px, ${offsetTop}px, 0) scale(1)`;
      pill.style.width = `${offsetWidth}px`;
      pill.style.height = `${offsetHeight}px`;
      void pill.offsetWidth;
      pill.classList.remove('no-transition');
    }
  });
}

/**
 * Mobile Navigation Drawer
 */
function initMobileMenu() {
  const menuToggle = document.getElementById('mobile-menu-toggle');
  const menuClose = document.getElementById('mobile-menu-close');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!menuToggle || !mobileMenu) return;

  function openMenu() {
    mobileMenu.classList.remove('hidden');
    mobileMenu.classList.add('flex');
    requestAnimationFrame(() => {
      mobileMenu.classList.add('menu-open');
    });
    menuToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    mobileMenu.classList.remove('menu-open');
    setTimeout(() => {
      if (!mobileMenu.classList.contains('menu-open')) {
        mobileMenu.classList.add('hidden');
        mobileMenu.classList.remove('flex');
      }
    }, 450);
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  // Ensure menu starts closed on all screens
  closeMenu();

  menuToggle.addEventListener('click', openMenu);
  if (menuClose) menuClose.addEventListener('click', closeMenu);

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
      closeMenu();
    }
  });
}

/**
 * Native Intersection Observer for Content Reveals
 */
function initScrollObserver() {
  const revealElements = document.querySelectorAll('.reveal-init');
  if (!revealElements.length) return;

  // If user prefers reduced motion, show immediately
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
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
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  revealElements.forEach((el) => observer.observe(el));
}

/**
 * Interactive Email Copy to Clipboard
 */
function initEmailCopy() {
  const copyBtn = document.getElementById('copy-email-btn');
  const copyTooltip = document.getElementById('copy-tooltip');
  const copyIcon = document.getElementById('copy-icon');
  const checkIcon = document.getElementById('check-icon');
  const copyBtnText = document.getElementById('copy-btn-text');
  if (!copyBtn) return;

  let resetTimeout = null;

  copyBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const email = 'barathjack77@gmail.com';
    try {
      await navigator.clipboard.writeText(email);

      // Icon & text feedback
      if (copyIcon && checkIcon) {
        copyIcon.classList.add('hidden');
        checkIcon.classList.remove('hidden');
      }
      if (copyBtnText) {
        copyBtnText.textContent = 'Copied!';
      }
      copyBtn.classList.add('copied');

      // Floating tooltip
      if (copyTooltip) {
        copyTooltip.classList.add('show');
      }

      if (resetTimeout) clearTimeout(resetTimeout);
      resetTimeout = setTimeout(() => {
        if (copyIcon && checkIcon) {
          copyIcon.classList.remove('hidden');
          checkIcon.classList.add('hidden');
        }
        if (copyBtnText) {
          copyBtnText.textContent = 'Copy';
        }
        copyBtn.classList.remove('copied');
        if (copyTooltip) {
          copyTooltip.classList.remove('show');
        }
      }, 2000);
    } catch (err) {
      console.warn('Clipboard write failed, opening mailto:', err);
      window.location.href = `mailto:${email}`;
    }
  });
}

/**
 * Clean Lightbox for Project Screenshots
 */
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
        <button id="lightbox-close-btn" class="absolute -top-10 right-0 text-white/80 hover:text-white text-sm font-mono p-2 cursor-pointer focus:outline-none transition-colors" aria-label="Close image preview">Close &times;</button>
        <img id="lightbox-img" src="" alt="Enlarged preview" class="max-w-full max-h-[82vh] rounded-lg border border-white/10 shadow-2xl object-contain">
        <p id="lightbox-caption" class="text-xs text-white/70 font-mono mt-3 text-center"></p>
      </div>
    `;
    document.body.appendChild(overlay);

    function closeLightbox() {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }

    overlay.addEventListener('click', (e) => {
      if (e.target.id !== 'lightbox-img') {
        closeLightbox();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('active')) {
        closeLightbox();
      }
    });
  }

  images.forEach((img) => {
    img.style.cursor = 'zoom-in';
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

  document.querySelectorAll('.project-image-box').forEach((box) => {
    box.addEventListener('click', (e) => {
      const img = box.querySelector('img[data-lightbox]');
      if (img && e.target !== img) {
        img.click();
      }
    });
  });
}

/**
 * Milky Page-to-Page Navigation Transitions
 * Seamless cross-document transitions, shared hero container transforms & back-gesture handling
 */
function initPageTransitions() {
  const supportsCrossDoc = 'onpagereveal' in window;

  function syncArrival(vt) {
    const navDir = sessionStorage.getItem('nav-direction');
    if (navDir === 'back') {
      document.documentElement.dataset.navDir = 'back';
      if (vt?.types) {
        try {
          vt.types.add('page-back');
        } catch (_) {}
      }
    } else {
      document.documentElement.removeAttribute('data-nav-dir');
    }

    const activeProject = sessionStorage.getItem('active-project');
    if (activeProject) {
      const isHome = document.body?.dataset?.projectPage === 'home';
      if (isHome) {
        const homeImg = document.querySelector(`[data-project-hero="${activeProject}"]`);
        if (homeImg) {
          homeImg.style.viewTransitionName = 'hero-active';
        }
      }
    }

    setTimeout(() => {
      document.documentElement.removeAttribute('data-nav-dir');
      sessionStorage.removeItem('nav-direction');
      sessionStorage.removeItem('active-project');
      document.querySelectorAll('[style*="view-transition-name"]').forEach((el) => {
        const page = document.body?.dataset?.projectPage;
        if (page !== 'gceshostel' && page !== 'connectlnx') {
          el.style.viewTransitionName = '';
        }
      });
    }, 600);
  }

  if (supportsCrossDoc) {
    window.addEventListener('pagereveal', (e) => {
      syncArrival(e.viewTransition);
    });

    window.addEventListener('pageswap', () => {
      const activeProject = sessionStorage.getItem('active-project');
      if (activeProject && document.body?.dataset?.projectPage === 'home') {
        const homeImg = document.querySelector(`[data-project-hero="${activeProject}"]`);
        if (homeImg) {
          homeImg.style.viewTransitionName = 'hero-active';
        }
      }
    });
  } else {
    syncArrival(null);
  }

  window.addEventListener('pageshow', (e) => {
    if (e.persisted) {
      document.documentElement.removeAttribute('data-nav-dir');
      document.body.classList.remove('page-milky-fallback-exit');
    }
  });

  document.addEventListener('click', (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || link.target === '_blank') {
      return;
    }

    let url;
    try {
      url = new URL(link.href, window.location.href);
    } catch {
      return;
    }
    if (url.origin !== window.location.origin) return;

    const linkText = link.textContent || '';
    const isBack = href === '../' || href === './' || link.getAttribute('aria-label')?.includes('Back') || linkText.includes('←') || linkText.includes('&larr;');
    const isProject = href.includes('gceshostel') || href.includes('connectlnx') || href.includes('smart-expense-tracker') || href.includes('chessgame') || href.includes('two-player-games');

    if (isBack) {
      sessionStorage.setItem('nav-direction', 'back');
      document.documentElement.dataset.navDir = 'back';
      const currentPage = document.body?.dataset?.projectPage;
      if (currentPage && currentPage !== 'home') {
        sessionStorage.setItem('active-project', currentPage);
      }
    } else if (isProject) {
      sessionStorage.setItem('nav-direction', 'forward');
      document.documentElement.removeAttribute('data-nav-dir');
      let projectKey = '';
      if (href.includes('gceshostel')) projectKey = 'gceshostel';
      else if (href.includes('connectlnx')) projectKey = 'connectlnx';
      else if (href.includes('smart-expense-tracker')) projectKey = 'smartexpense';
      else if (href.includes('chessgame')) projectKey = 'chessgame';
      else if (href.includes('two-player-games')) projectKey = 'two-player-games';

      if (projectKey) {
        sessionStorage.setItem('active-project', projectKey);
        const card = link.closest('.project-card');
        const cardImg = card?.querySelector(`[data-project-hero="${projectKey}"]`) ||
                        document.querySelector(`[data-project-hero="${projectKey}"]`);
        if (cardImg) {
          cardImg.style.viewTransitionName = 'hero-active';
        }
      }
    }

    if (!supportsCrossDoc && !document.startViewTransition) {
      e.preventDefault();
      document.body.classList.add('page-milky-fallback-exit');
      setTimeout(() => {
        window.location.href = link.href;
      }, 220);
    }
  });
}
