/**
 * 3DBarath Portfolio - Clean, Zero-Dependency Script
 * Native IntersectionObserver, accessible controls, smooth theme switching
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initMobileMenu();
  initScrollObserver();
  initEmailCopy();
  initLightbox();
});

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

  themeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('light-theme');
    const isLight = document.documentElement.classList.contains('light-theme');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    updateIcons();
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
    menuToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    mobileMenu.classList.add('hidden');
    mobileMenu.classList.remove('flex');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

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
  if (!copyBtn) return;

  copyBtn.addEventListener('click', async () => {
    const email = 'barathjack77@gmail.com';
    try {
      await navigator.clipboard.writeText(email);
      if (copyTooltip) {
        copyTooltip.classList.remove('opacity-0', 'pointer-events-none');
        copyTooltip.classList.add('opacity-100');
        setTimeout(() => {
          copyTooltip.classList.remove('opacity-100');
          copyTooltip.classList.add('opacity-0', 'pointer-events-none');
        }, 2200);
      }
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
    overlay.className =
      'fixed inset-0 z-50 bg-black/90 backdrop-blur-md hidden items-center justify-center p-4 cursor-zoom-out';
    overlay.innerHTML = `
      <div class="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
        <button id="lightbox-close-btn" class="absolute -top-10 right-0 text-white/80 hover:text-white text-sm font-mono p-2 cursor-pointer focus:outline-none" aria-label="Close image preview">Close &times;</button>
        <img id="lightbox-img" src="" alt="Enlarged preview" class="max-w-full max-h-[82vh] rounded-lg border border-white/10 shadow-2xl object-contain">
        <p id="lightbox-caption" class="text-xs text-white/70 font-mono mt-3 text-center"></p>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.addEventListener('click', (e) => {
      if (e.target.id !== 'lightbox-img') {
        overlay.classList.add('hidden');
        overlay.classList.remove('flex');
        document.body.style.overflow = '';
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !overlay.classList.contains('hidden')) {
        overlay.classList.add('hidden');
        overlay.classList.remove('flex');
        document.body.style.overflow = '';
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
      overlay.classList.remove('hidden');
      overlay.classList.add('flex');
      document.body.style.overflow = 'hidden';
    });
  });
}
