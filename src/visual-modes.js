/**
 * Barath B — Serene Atmospheric WebGL Aurora & Optical Silk Engine
 * Five calm, volumetric, low-noise atmospheric light shaders toggleable via a
 * sleek collapsible dock — each crafted for both Arctic Night (Dark Mode) and
 * Serene Polar Daylight (Light Mode):
 *   01 · Borealis — True Multi-Curtain Polar Aurora Borealis with silky vertical rays (Default)
 *   02 · Silk     — Signature Sweeping Optical Silk Glass Ribbon (Previous Favorite)
 *   03 · Corona   — High-Altitude Polar Dusk Curtains (Electric Sapphire, Periwinkle & Twilight Rose)
 *   04 · Zenith   — Serene Overhead Cathedral Light Rays & Translucent Polar Mist
 *   05 · Horizon   — Layered Liquid-Glass Twilight Silk Waves gliding horizontally
 *   06 · Signature — Single Signature Aurora: one unbroken sweeping optical aurora arc
 */

const SHADER_PRESETS = [
  { id: 'borealis', code: '01', label: 'Borealis', desc: 'Multi-curtain polar aurora with vertical rays' },
  { id: 'silk', code: '02', label: 'Silk', desc: 'Signature sweeping optical silk glass arc' },
  { id: 'corona', code: '03', label: 'Corona', desc: 'High-altitude sapphire & twilight violet aurora' },
  { id: 'zenith', code: '04', label: 'Zenith', desc: 'Diagonal volumetric cathedral light shafts' },
  { id: 'horizon', code: '05', label: 'Horizon', desc: 'Layered liquid-glass twilight silk ribbons' },
  { id: 'signature', code: '06', label: 'Signature', desc: 'Single signature unbroken sweeping aurora ribbon' },
];

const SHADER_STORAGE_KEY = 'portfolio-aurora-v4';

const CHAPTER_TINTS = {
  hero: [0.24, 0.64, 0.98],       // Arctic Sapphire-Cyan
  '01': [0.16, 0.78, 0.76],       // Polar Emerald-Teal (GCES Hostel)
  '02': [0.28, 0.58, 1.00],       // Electric Cobalt (ConnectLnx)
  '03': [0.18, 0.82, 0.64],       // Borealis Mint-Emerald (aztrox-release)
  '04': [0.46, 0.56, 0.96],       // Twilight Indigo-Sapphire (Expense Tracker)
  '05': [0.38, 0.52, 0.94],       // Deep Slate Sapphire (Stockfish)
};

let _shaderController = null;

export function initAtmosphere() {
  const initialShader = getSavedShader();
  ensureAtmosphereDOM();
  _shaderController = createAuroraController(initialShader);
  initShaderControls(initialShader);
  initSpecularPointerTracking();

  const themeObserver = new MutationObserver(() => {
    _shaderController?.syncTheme();
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });
}

export function setAtmosphereChapter(chapterKey) {
  const tint = CHAPTER_TINTS[chapterKey] || CHAPTER_TINTS.hero;
  _shaderController?.setTint(tint);
}

export function setAtmosphereShader(shaderId) {
  const valid = SHADER_PRESETS.some((p) => p.id === shaderId) ? shaderId : 'borealis';
  try {
    localStorage.setItem(SHADER_STORAGE_KEY, valid);
  } catch {}
  document.documentElement.setAttribute('data-shader', valid);
  _shaderController?.setShader(valid);
  syncShaderControlsUI(valid);
}

function getSavedShader() {
  try {
    const saved = localStorage.getItem(SHADER_STORAGE_KEY);
    if (saved && SHADER_PRESETS.some((p) => p.id === saved)) return saved;
  } catch {}
  return 'borealis';
}

function ensureAtmosphereDOM() {
  if (!document.getElementById('atmosphere-root')) {
    const root = document.createElement('div');
    root.id = 'atmosphere-root';
    root.className = 'atmosphere-root';
    root.setAttribute('aria-hidden', 'true');
    root.innerHTML = `
      <canvas id="hero-shader-canvas" class="atmosphere-shader-canvas"></canvas>
      <div class="atmosphere-zenith-glow"></div>
      <div class="atmosphere-grid-field"></div>
      <div class="atmosphere-grain"></div>
    `;
    document.body.prepend(root);
  }
}

/* ==========================================================================
   Top Bar Atmosphere Dropdown & Mobile Drawer Switcher
   ========================================================================== */
const CHECK_ICON_SVG = `
  <svg class="shader-dropdown-check" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24" aria-hidden="true">
    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
  </svg>
`;

const WAVE_ICON_SVG = `
  <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" aria-hidden="true">
    <path stroke-linecap="round" stroke-linejoin="round" d="M3 15c2.2-2.2 4.4-2.2 6.6 0s4.4 2.2 6.6 0 4.4-2.2 4.8-1.8M3 10c2.2-2.2 4.4-2.2 6.6 0s4.4 2.2 6.6 0 4.4-2.2 4.8-1.8" />
  </svg>
`;

const CHEVRON_ICON_SVG = `
  <svg class="shader-dropdown-chevron" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
`;

function buildDropdownMenuHTML(activeId) {
  const itemsHtml = SHADER_PRESETS.map(
    (preset) => `
      <button
        type="button"
        role="menuitemradio"
        class="shader-dropdown-item${preset.id === activeId ? ' is-active' : ''}"
        data-shader-option="${preset.id}"
        aria-checked="${preset.id === activeId ? 'true' : 'false'}"
      >
        <span class="shader-dropdown-item-main">
          <span class="shader-dropdown-item-title">
            <span class="shader-dropdown-code">${preset.code}</span>
            <span>${preset.label}</span>
          </span>
          <span class="shader-dropdown-desc">${preset.desc}</span>
        </span>
        ${CHECK_ICON_SVG}
      </button>
    `
  ).join('');

  return `
    <div class="shader-dropdown-header">
      <span>Background Shader</span>
      <span class="shader-dropdown-shortcut">[ / ]</span>
    </div>
    <div class="shader-dropdown-list">
      ${itemsHtml}
    </div>
  `;
}

function mountHeaderShaderDropdown(initialShader) {
  const activePreset = SHADER_PRESETS.find((p) => p.id === initialShader) || SHADER_PRESETS[0];
  let dropdown = document.getElementById('shader-dropdown');

  if (!dropdown) {
    const themeToggle = document.getElementById('theme-toggle');
    const actionBar = themeToggle?.parentElement;
    if (!actionBar) return null;

    if (!actionBar.classList.contains('gap-2') && !actionBar.classList.contains('gap-2.5')) {
      actionBar.classList.add('gap-2');
    }

    dropdown = document.createElement('div');
    dropdown.id = 'shader-dropdown';
    dropdown.className = 'shader-dropdown';
    dropdown.innerHTML = `
      <button
        id="shader-dropdown-trigger"
        type="button"
        class="btn-outline shader-dropdown-trigger whitespace-nowrap shrink-0"
        aria-haspopup="menu"
        aria-expanded="false"
        aria-controls="shader-dropdown-menu"
        aria-label="Change background shader: ${activePreset.label}"
        title="Change background shader"
      >
        ${WAVE_ICON_SVG}
        <span id="shader-dropdown-label" class="hidden sm:inline">${activePreset.label}</span>
        ${CHEVRON_ICON_SVG}
      </button>
      <div
        id="shader-dropdown-menu"
        class="shader-dropdown-menu"
        role="menu"
        aria-label="Select background shader"
        aria-hidden="true"
      ></div>
    `;
    actionBar.insertBefore(dropdown, themeToggle);
  }

  const menu = dropdown.querySelector('#shader-dropdown-menu');
  if (menu) {
    menu.innerHTML = buildDropdownMenuHTML(initialShader);
  }

  return dropdown;
}

function mountMobileShaderSection(initialShader) {
  const mobileMenu = document.getElementById('mobile-menu');
  if (!mobileMenu || document.getElementById('mobile-shader-section')) return;

  const activePreset = SHADER_PRESETS.find((p) => p.id === initialShader) || SHADER_PRESETS[0];
  const section = document.createElement('div');
  section.id = 'mobile-shader-section';
  section.className = 'mobile-shader-section';
  section.setAttribute('aria-label', 'Background shader options');

  const buttonsHtml = SHADER_PRESETS.map(
    (preset) => `
      <button
        type="button"
        class="mobile-shader-btn${preset.id === initialShader ? ' is-active' : ''}"
        data-shader-option="${preset.id}"
        aria-pressed="${preset.id === initialShader ? 'true' : 'false'}"
      >
        <span class="mobile-shader-btn-label">
          <span class="shader-dropdown-code">${preset.code}</span>
          <span>${preset.label}</span>
        </span>
        ${CHECK_ICON_SVG}
      </button>
    `
  ).join('');

  section.innerHTML = `
    <div class="mobile-shader-header">
      <span class="font-medium text-ink-secondary">Background Shader</span>
      <span id="mobile-shader-current" class="font-mono text-xs text-ink-muted">${activePreset.label}</span>
    </div>
    <div class="mobile-shader-grid" role="group" aria-label="Select background shader">
      ${buttonsHtml}
    </div>
  `;

  const footerRow = mobileMenu.querySelector('.border-t');
  if (footerRow) {
    mobileMenu.insertBefore(section, footerRow);
  } else {
    mobileMenu.appendChild(section);
  }
}

function initShaderControls(initialShader) {
  document.documentElement.setAttribute('data-shader', initialShader);

  // Remove any legacy floating dock if present
  document.getElementById('shader-switcher-dock')?.remove();

  const dropdown = mountHeaderShaderDropdown(initialShader);
  mountMobileShaderSection(initialShader);

  const trigger = dropdown?.querySelector('#shader-dropdown-trigger');
  const menu = dropdown?.querySelector('#shader-dropdown-menu');

  function setDropdownOpen(open) {
    if (!dropdown || !trigger || !menu) return;
    dropdown.classList.toggle('is-open', open);
    trigger.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
  }

  if (dropdown && trigger && menu) {
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const willOpen = !dropdown.classList.contains('is-open');
      setDropdownOpen(willOpen);
      if (willOpen) {
        const activeBtn = menu.querySelector('.shader-dropdown-item.is-active') || menu.querySelector('[data-shader-option]');
        activeBtn?.focus({ preventScroll: true });
      }
    });

    menu.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-shader-option]');
      if (!btn) return;
      const id = btn.getAttribute('data-shader-option');
      if (id) {
        setAtmosphereShader(id);
        setDropdownOpen(false);
        trigger.focus({ preventScroll: true });
      }
    });

    menu.addEventListener('keydown', (e) => {
      const items = Array.from(menu.querySelectorAll('[data-shader-option]'));
      if (!items.length) return;
      const idx = items.indexOf(document.activeElement);

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        items[(idx + 1 + items.length) % items.length]?.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        items[(idx - 1 + items.length) % items.length]?.focus();
      } else if (e.key === 'Home') {
        e.preventDefault();
        items[0]?.focus();
      } else if (e.key === 'End') {
        e.preventDefault();
        items[items.length - 1]?.focus();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setDropdownOpen(false);
        trigger.focus({ preventScroll: true });
      }
    });

    document.addEventListener('click', (e) => {
      if (dropdown.classList.contains('is-open') && !dropdown.contains(e.target)) {
        setDropdownOpen(false);
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && dropdown.classList.contains('is-open')) {
        setDropdownOpen(false);
        trigger.focus({ preventScroll: true });
      }
    });

    // Close top bar dropdown when mobile navigation drawer opens
    document.getElementById('mobile-menu-toggle')?.addEventListener('click', () => {
      setDropdownOpen(false);
    });
  }

  // Bind mobile drawer shader picker buttons
  const mobileSection = document.getElementById('mobile-shader-section');
  if (mobileSection) {
    mobileSection.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-shader-option]');
      if (!btn) return;
      const id = btn.getAttribute('data-shader-option');
      if (id) setAtmosphereShader(id);
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
    if (e.key !== '[' && e.key !== ']') return;
    const currentId = document.documentElement.getAttribute('data-shader') || 'borealis';
    const idx = SHADER_PRESETS.findIndex((p) => p.id === currentId);
    const nextIdx =
      e.key === ']'
        ? (idx + 1) % SHADER_PRESETS.length
        : (idx - 1 + SHADER_PRESETS.length) % SHADER_PRESETS.length;
    setAtmosphereShader(SHADER_PRESETS[nextIdx].id);
  });

  syncShaderControlsUI(initialShader);
}

function syncShaderControlsUI(activeId) {
  const found = SHADER_PRESETS.find((p) => p.id === activeId) || SHADER_PRESETS[0];

  document.querySelectorAll('#shader-dropdown-menu [data-shader-option]').forEach((btn) => {
    const active = btn.getAttribute('data-shader-option') === activeId;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-checked', String(active));
  });

  document.querySelectorAll('#mobile-shader-section [data-shader-option]').forEach((btn) => {
    const active = btn.getAttribute('data-shader-option') === activeId;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-pressed', String(active));
  });

  const label = document.getElementById('shader-dropdown-label');
  if (label && found) {
    label.textContent = found.label;
  }

  const trigger = document.getElementById('shader-dropdown-trigger');
  if (trigger && found) {
    trigger.setAttribute('aria-label', `Change background shader: ${found.label}`);
  }

  const mobileCurrent = document.getElementById('mobile-shader-current');
  if (mobileCurrent && found) {
    mobileCurrent.textContent = found.label;
  }
}

/* ==========================================================================
   Full-Viewport Scroll- & Cursor-Reactive Multi-Program WebGL Engine
   ========================================================================== */
function createAuroraController(initialShader) {
  const canvas = document.getElementById('hero-shader-canvas');
  if (!canvas) return { syncTheme() {}, setTint() {}, setShader() {} };

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let rafId = 0;
  const startTime = performance.now();
  let lastDraw = 0;
  let activeShader = initialShader;

  let targetMouseX = 0.68;
  let targetMouseY = 0.52;
  let mouseX = 0.68;
  let mouseY = 0.52;

  let targetScroll = 0;
  let currentScroll = 0;
  let targetHeroPresence = 1.0;
  let currentHeroPresence = 1.0;

  let targetTint = [...CHAPTER_TINTS.hero];
  let currentTint = [...CHAPTER_TINTS.hero];

  let targetLight = document.documentElement.classList.contains('light-theme') ? 1.0 : 0.0;
  let currentLight = targetLight;

  const syncScrollMetrics = () => {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    targetScroll = Math.min(1, Math.max(0, window.scrollY / maxScroll));
    const heroFade = Math.min(1, Math.max(0, 1 - window.scrollY / Math.max(520, window.innerHeight * 0.95)));
    targetHeroPresence = 0.54 + heroFade * 0.46;
  };

  window.addEventListener('scroll', syncScrollMetrics, { passive: true });
  syncScrollMetrics();

  window.addEventListener(
    'pointermove',
    (e) => {
      targetMouseX = Math.min(1, Math.max(0, e.clientX / Math.max(1, window.innerWidth)));
      targetMouseY = Math.min(1, Math.max(0, 1.0 - e.clientY / Math.max(1, window.innerHeight)));
    },
    { passive: true }
  );

  const gl =
    canvas.getContext('webgl', { alpha: true, antialias: false, depth: false, preserveDrawingBuffer: false }) ||
    canvas.getContext('experimental-webgl', { alpha: true, antialias: false, depth: false });

  let renderer = gl ? initMultiProgramWebGLRenderer(gl) : null;
  if (!renderer) {
    renderer = initFallback2DRenderer(canvas);
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    const w = Math.max(2, Math.floor(window.innerWidth * dpr));
    const h = Math.max(2, Math.floor(window.innerHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      renderer.resize(w, h);
    }
  }

  function renderFrame(elapsedSeconds) {
    mouseX += (targetMouseX - mouseX) * 0.055;
    mouseY += (targetMouseY - mouseY) * 0.055;
    currentScroll += (targetScroll - currentScroll) * 0.08;
    currentHeroPresence += (targetHeroPresence - currentHeroPresence) * 0.08;
    currentLight += (targetLight - currentLight) * 0.35;

    for (let i = 0; i < 3; i++) {
      currentTint[i] += (targetTint[i] - currentTint[i]) * 0.07;
    }

    renderer.draw({
      shaderId: activeShader,
      time: elapsedSeconds,
      mouseX,
      mouseY,
      scroll: currentScroll,
      presence: currentHeroPresence,
      tint: currentTint,
      light: currentLight,
      width: canvas.width,
      height: canvas.height,
    });
  }

  function render(now) {
    rafId = 0;
    if (document.hidden) {
      rafId = requestAnimationFrame(render);
      return;
    }

    if (now - lastDraw >= 32) {
      lastDraw = now;
      renderFrame((now - startTime) * 0.001);
    }

    if (!reducedMotion.matches) {
      rafId = requestAnimationFrame(render);
    }
  }

  resize();
  if (reducedMotion.matches) {
    renderFrame(6.2);
  } else {
    renderFrame(2.4);
    rafId = requestAnimationFrame(render);
  }

  window.addEventListener('resize', () => {
    resize();
    syncScrollMetrics();
    if (reducedMotion.matches) renderFrame(6.2);
  });

  return {
    syncTheme() {
      targetLight = document.documentElement.classList.contains('light-theme') ? 1.0 : 0.0;
      currentLight = targetLight;
      renderFrame((performance.now() - startTime) * 0.001);
    },
    setTint(rgb) {
      targetTint = [...rgb];
      if (reducedMotion.matches) {
        currentTint = [...rgb];
        renderFrame(6.2);
      }
    },
    setShader(shaderId) {
      activeShader = shaderId;
      renderFrame((performance.now() - startTime) * 0.001);
    },
  };
}

/* ==========================================================================
   Shared Smooth Atmospheric Math Helpers
   ========================================================================== */
const COMMON_GLSL = `
  precision highp float;

  uniform vec2 u_res;
  uniform float u_time;
  uniform vec2 u_mouse;
  uniform float u_scroll;
  uniform float u_presence;
  uniform vec3 u_tint;
  uniform float u_light;

  float hash1(float n) {
    return fract(sin(n) * 43758.5453123);
  }

  float noise1(float x) {
    float i = floor(x);
    float f = fract(x);
    float u = f * f * (3.0 - 2.0 * f);
    return mix(hash1(i), hash1(i + 1.0), u);
  }

  float fbm1(float x) {
    float v = 0.0;
    float a = 0.52;
    for (int i = 0; i < 4; i++) {
      v += a * noise1(x);
      x = x * 2.04 + 13.7;
      a *= 0.48;
    }
    return v;
  }

  float ribbonPath(float x, float t, float seed) {
    return 0.14 * sin(x * 1.18 + t * 0.24 + seed)
         + 0.085 * sin(x * 2.05 - t * 0.19 + seed * 2.4)
         + 0.042 * cos(x * 3.30 + t * 0.14 + seed * 4.1)
         + (fbm1(x * 0.95 + t * 0.08 + seed * 7.3) - 0.5) * 0.11;
  }

  float curtainRays(float x, float y, float t, float seed) {
    float rx = x * 3.6 - y * 0.72;
    float harmonic = 0.5 + 0.5 * sin(rx * 2.6 + sin(rx * 0.85 - t * 0.25) * 1.4 + t * 0.34 + seed * 3.1);
    float fine1 = fbm1(rx * 1.55 - t * 0.18 + seed * 11.4);
    float fine2 = noise1(rx * 5.20 + t * 0.26 + seed * 19.7);
    float shimmer = pow(clamp(harmonic * 0.46 + fine1 * 0.38 + fine2 * 0.20, 0.0, 1.0), 1.45);
    return 0.34 + 0.88 * shimmer;
  }

  vec3 evalCurtain(vec2 p, float baseY, float slope, float heightScale, float speed, float seed, float t) {
    float x = p.x;
    float yCurve = baseY + x * slope + ribbonPath(x, t * speed, seed);
    float dy = p.y - yCurve;

    float lowerEdge = smoothstep(-0.045, 0.032, dy);
    float upwardFeather = exp(-max(dy, 0.0) / heightScale);
    float rimGlow = exp(-pow(dy / 0.042, 2.0));

    float rays = curtainRays(x, p.y, t * speed, seed);
    float raySoft = mix(rays, 0.65 + 0.35 * rays, smoothstep(0.0, heightScale * 1.4, max(dy, 0.0)));

    float swell = 0.42 + 0.58 * (0.5 + 0.5 * sin(x * 0.88 - t * 0.16 * speed + seed * 2.1));

    float body = lowerEdge * upwardFeather * raySoft * swell;
    float rim = rimGlow * (0.55 + 0.55 * rays) * swell;
    float alt = clamp(max(dy, 0.0) / (heightScale * 1.55), 0.0, 1.0);

    return vec3(body, alt, rim);
  }
`;

/* ==========================================================================
   5 Curated Serene Atmospheric Shaders
   ========================================================================== */
const FRAGMENT_SHADERS = {
  /* ------------------------------------------------------------------------
     01 · BOREALIS — True Multi-Curtain Polar Aurora Borealis (Winner #1)
     ------------------------------------------------------------------------ */
  borealis: `
    ${COMMON_GLSL}

    vec3 darkAuroraSpectrum(float alt, vec3 tint) {
      vec3 emeraldAqua = vec3(0.12, 0.94, 0.74);
      vec3 glacierCyan = vec3(0.14, 0.78, 0.98);
      vec3 royalBlue   = mix(vec3(0.24, 0.48, 0.98), tint, 0.42);
      vec3 upperViolet = vec3(0.56, 0.34, 0.92);

      vec3 c1 = mix(emeraldAqua, glacierCyan, smoothstep(0.0, 0.28, alt));
      vec3 c2 = mix(c1, royalBlue, smoothstep(0.22, 0.62, alt));
      return mix(c2, upperViolet, smoothstep(0.55, 0.96, alt) * 0.78);
    }

    vec3 lightAuroraSpectrum(float alt, vec3 tint) {
      vec3 seaMint     = vec3(0.08, 0.70, 0.64);
      vec3 glacialSky  = vec3(0.14, 0.56, 0.88);
      vec3 dawnCobalt  = mix(vec3(0.24, 0.44, 0.90), tint * 0.86, 0.38);
      vec3 dawnIris    = vec3(0.46, 0.36, 0.84);

      vec3 c1 = mix(seaMint, glacialSky, smoothstep(0.0, 0.30, alt));
      vec3 c2 = mix(c1, dawnCobalt, smoothstep(0.24, 0.64, alt));
      return mix(c2, dawnIris, smoothstep(0.58, 0.98, alt) * 0.68);
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_res.xy;
      float aspect = u_res.x / max(1.0, u_res.y);

      vec2 p = vec2((uv.x - 0.5) * aspect, uv.y - 0.5);
      vec2 mOffset = (u_mouse - vec2(0.55, 0.5)) * 0.10;
      p.x -= mOffset.x;
      p.y -= mOffset.y * 0.65;

      float scrollShift = u_scroll * 0.45;
      float t = u_time + 4.5;

      vec3 c1 = evalCurtain(p + vec2(scrollShift * 0.40,  0.04),  0.02,  0.14, 0.36, 0.92, 1.1, t);
      vec3 c2 = evalCurtain(p + vec2(-scrollShift * 0.28, -0.06), 0.16, -0.10, 0.44, 0.72, 3.7, t);
      vec3 c3 = evalCurtain(p + vec2(scrollShift * 0.18,  0.12), -0.18,  0.11, 0.32, 0.62, 6.4, t);

      vec2 mp = vec2((u_mouse.x - 0.5) * aspect, u_mouse.y - 0.5);
      float mouseBreath = exp(-length(p - mp) * 1.65) * 0.22;
      float stageWeight = (0.62 + 0.56 * smoothstep(0.02, 0.76, uv.x) + mouseBreath) * u_presence;

      vec3 skyTop = vec3(0.014, 0.020, 0.036);
      vec3 skyBot = vec3(0.024, 0.030, 0.052);
      vec3 colDark = mix(skyBot, skyTop, smoothstep(0.0, 1.0, uv.y));

      vec3 glow1 = darkAuroraSpectrum(c1.y, u_tint) * (c1.x * 0.56 + c1.z * 0.34);
      vec3 glow2 = darkAuroraSpectrum(c2.y, u_tint) * (c2.x * 0.44 + c2.z * 0.22);
      vec3 glow3 = darkAuroraSpectrum(c3.y, u_tint) * (c3.x * 0.36 + c3.z * 0.20);

      float ignition = clamp(c1.z * 0.65 + c2.z * 0.38 + c3.z * 0.30, 0.0, 1.0);
      vec3 auroraDark = (glow1 + glow2 + glow3) * 0.88
                      + vec3(0.68, 0.99, 0.92) * pow(ignition, 2.2) * 0.24;

      float zenithVignette = smoothstep(-0.08, 0.26, uv.y) * smoothstep(1.08, 0.68, uv.y * 0.82);
      colDark += auroraDark * stageWeight * (0.58 + 0.42 * zenithVignette);

      vec3 dawnTop = vec3(0.958, 0.974, 0.994);
      vec3 dawnBot = vec3(0.984, 0.986, 0.994);
      vec3 colLight = mix(dawnBot, dawnTop, smoothstep(0.0, 1.0, uv.y));

      float w1 = clamp((c1.x * 0.42 + c1.z * 0.24) * stageWeight, 0.0, 0.46);
      float w2 = clamp((c2.x * 0.32 + c2.z * 0.16) * stageWeight, 0.0, 0.36);
      float w3 = clamp((c3.x * 0.26 + c3.z * 0.14) * stageWeight, 0.0, 0.30);

      colLight = mix(colLight, lightAuroraSpectrum(c2.y, u_tint), w2 * 0.78);
      colLight = mix(colLight, lightAuroraSpectrum(c3.y, u_tint), w3 * 0.74);
      colLight = mix(colLight, lightAuroraSpectrum(c1.y, u_tint), w1 * 0.86);
      colLight = mix(colLight, vec3(0.94, 1.0, 0.99), clamp(pow(ignition, 2.0) * stageWeight * 0.38, 0.0, 0.42));

      float lightEditorial = 0.58 + 0.42 * smoothstep(0.06, 0.64, uv.x);
      colLight = mix(dawnBot, colLight, lightEditorial);

      gl_FragColor = vec4(mix(colDark, colLight, u_light), 1.0);
    }
  `,

  /* ------------------------------------------------------------------------
     02 · SILK — Signature Sweeping Optical Silk Glass Arc (Winner #2)
     ------------------------------------------------------------------------ */
  silk: `
    ${COMMON_GLSL}

    vec2 silkWarp(vec2 p, float t) {
      vec2 w = p;
      for (int i = 0; i < 4; i++) {
        float fi = float(i) + 1.0;
        w.x += 0.34 / fi * sin(fi * 1.8 * w.y + t * (0.45 + 0.12 * fi));
        w.y += 0.32 / fi * cos(fi * 1.6 * w.x - t * (0.38 + 0.10 * fi));
      }
      return w;
    }

    float silkField(vec2 p, float t) {
      vec2 w = silkWarp(p, t);
      float fold = sin(w.x * 2.4 + w.y * 1.7 + t * 0.4) * 0.5 + 0.5;
      float caustic = pow(1.0 - abs(sin(w.y * 2.8 - w.x * 1.4)), 3.2);
      return fold * 0.50 + caustic * 0.70;
    }

    float silkRidgeOnly(vec2 p, float t) {
      vec2 w = silkWarp(p, t);
      return pow(1.0 - abs(sin(w.y * 2.8 - w.x * 1.4)), 3.6);
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_res.xy;
      float aspect = u_res.x / max(1.0, u_res.y);

      vec2 p = (uv - vec2(0.58, 0.48)) * vec2(aspect, 1.0) * 1.38;
      p.y -= u_scroll * 1.25;

      vec2 m = (u_mouse - vec2(0.58, 0.48)) * vec2(aspect, 1.0) * 1.38;
      m.y -= u_scroll * 1.25;

      float distM = length(p - m);
      float lens = exp(-distM * 1.45);
      p -= (p - m) * lens * 0.30;

      float t = u_time * 0.34;

      float cR = silkField(p + vec2(0.045, -0.02), t);
      float cG = silkField(p, t);
      float cB = silkField(p - vec2(0.045, 0.02), t);

      float ridge = silkRidgeOnly(p, t);
      float ridgeShift = silkRidgeOnly(p - vec2(0.035, 0.018), t);

      vec3 prism = vec3(
        smoothstep(0.32, 1.05, cR),
        smoothstep(0.28, 0.98, cG),
        smoothstep(0.24, 0.92, cB)
      );

      float veilMask = exp(-length((uv - vec2(0.68, 0.50)) * vec2(0.84, 1.12)) * 1.02);
      float textScrim = smoothstep(0.14, 0.64, uv.x);

      vec3 warmComp = vec3(0.92, 0.54, 0.78);
      vec3 coolComp = mix(vec3(0.22, 0.86, 0.94), u_tint, 0.66);
      vec3 ribbonDark = prism.r * mix(u_tint, warmComp, 0.32) * 0.52
                      + prism.g * coolComp * 0.58
                      + prism.b * vec3(0.46, 0.64, 1.0) * 0.48;

      float boostDark = (0.40 + 0.86 * veilMask + lens * 0.36) * u_presence;

      vec3 darkBase = vec3(0.020, 0.023, 0.036);
      vec3 colDark = darkBase + ribbonDark * boostDark * 0.44;
      float gleamDark = pow(max(cG, 0.0), 4.6) * (0.20 + lens * 0.28) * u_presence;
      colDark += mix(u_tint, vec3(0.95, 0.97, 1.0), 0.58) * gleamDark * 0.48;
      colDark = mix(darkBase, colDark, 0.34 + 0.66 * textScrim);

      vec3 lightBase = vec3(0.980, 0.983, 0.992);
      float softVeil = smoothstep(0.30, 0.94, cG) * 0.22;
      vec3 silverMist = vec3(0.865, 0.900, 0.968);
      float arcCore = smoothstep(0.12, 0.92, ridge);
      vec3 glacierBlue = mix(vec3(0.62, 0.76, 0.96), mix(vec3(0.58, 0.74, 0.96), u_tint, 0.42), 0.55);
      float glassEdge = clamp(ridgeShift - ridge, 0.0, 1.0);
      vec3 iceRim = vec3(0.46, 0.66, 0.94);
      float daylightCrest = pow(clamp(ridge, 0.0, 1.0), 2.8);
      float lightFocus = (0.46 + 0.68 * veilMask + lens * 0.24) * u_presence;

      vec3 colLight = lightBase;
      colLight = mix(colLight, silverMist, clamp(softVeil * lightFocus, 0.0, 0.28));
      colLight = mix(colLight, glacierBlue, clamp(arcCore * lightFocus * 0.44, 0.0, 0.48));
      colLight = mix(colLight, iceRim, clamp(glassEdge * lightFocus * 0.52, 0.0, 0.34));
      colLight = mix(colLight, vec3(1.0, 1.0, 1.0), clamp(daylightCrest * lightFocus * 0.74, 0.0, 0.80));
      colLight = mix(lightBase, colLight, 0.38 + 0.62 * textScrim);

      gl_FragColor = vec4(mix(colDark, colLight, u_light), 1.0);
    }
  `,

  /* ------------------------------------------------------------------------
     03 · CORONA — High-Altitude Polar Dusk Aurora (Sapphire, Periwinkle & Rose-Violet)
     Same serene volumetric vertical-ray curtain physics as Borealis, tuned to rare
     high-altitude Nordic dusk solar curtains (electric blue -> indigo -> dusk rose).
     ------------------------------------------------------------------------ */
  corona: `
    ${COMMON_GLSL}

    vec3 darkCoronaSpectrum(float alt, vec3 tint) {
      vec3 iceBlue      = vec3(0.32, 0.76, 1.00);
      vec3 sapphire     = mix(vec3(0.34, 0.48, 0.98), tint, 0.32);
      vec3 violetIndigo = vec3(0.58, 0.36, 0.96);
      vec3 duskRose     = vec3(0.84, 0.44, 0.78);

      vec3 c1 = mix(iceBlue, sapphire, smoothstep(0.0, 0.26, alt));
      vec3 c2 = mix(c1, violetIndigo, smoothstep(0.22, 0.62, alt));
      return mix(c2, duskRose, smoothstep(0.56, 0.98, alt) * 0.82);
    }

    vec3 lightCoronaSpectrum(float alt, vec3 tint) {
      vec3 skyAzure     = vec3(0.20, 0.54, 0.94);
      vec3 periwinkle   = mix(vec3(0.36, 0.42, 0.90), tint * 0.85, 0.28);
      vec3 dawnLavender = vec3(0.56, 0.38, 0.86);
      vec3 morningBlush = vec3(0.76, 0.44, 0.74);

      vec3 c1 = mix(skyAzure, periwinkle, smoothstep(0.0, 0.28, alt));
      vec3 c2 = mix(c1, dawnLavender, smoothstep(0.24, 0.64, alt));
      return mix(c2, morningBlush, smoothstep(0.58, 0.98, alt) * 0.72);
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_res.xy;
      float aspect = u_res.x / max(1.0, u_res.y);

      vec2 p = vec2((uv.x - 0.5) * aspect, uv.y - 0.5);
      vec2 mOffset = (u_mouse - vec2(0.55, 0.5)) * 0.10;
      p.x -= mOffset.x;
      p.y -= mOffset.y * 0.65;

      // Sweeping grand coronal arch curvature across the upper sky
      float arch = -0.18 * (p.x * p.x) + 0.08;
      vec2 pa = vec2(p.x, p.y - arch);

      float scrollShift = u_scroll * 0.42;
      float t = u_time * 0.90 + 8.2;

      vec3 c1 = evalCurtain(pa + vec2(scrollShift * 0.34,  0.00), -0.02,  0.08, 0.38, 0.85, 2.3, t);
      vec3 c2 = evalCurtain(pa + vec2(-scrollShift * 0.24, -0.04), 0.14, -0.06, 0.46, 0.66, 5.1, t);
      vec3 c3 = evalCurtain(pa + vec2(scrollShift * 0.16,  0.08), -0.20,  0.05, 0.32, 0.58, 8.7, t);

      vec2 mp = vec2((u_mouse.x - 0.5) * aspect, u_mouse.y - 0.5);
      float mouseBreath = exp(-length(p - mp) * 1.65) * 0.22;
      float stageWeight = (0.60 + 0.56 * smoothstep(0.02, 0.74, uv.x) + mouseBreath) * u_presence;

      vec3 skyTop = vec3(0.018, 0.016, 0.038);
      vec3 skyBot = vec3(0.024, 0.024, 0.048);
      vec3 colDark = mix(skyBot, skyTop, smoothstep(0.0, 1.0, uv.y));

      vec3 glow1 = darkCoronaSpectrum(c1.y, u_tint) * (c1.x * 0.56 + c1.z * 0.34);
      vec3 glow2 = darkCoronaSpectrum(c2.y, u_tint) * (c2.x * 0.44 + c2.z * 0.22);
      vec3 glow3 = darkCoronaSpectrum(c3.y, u_tint) * (c3.x * 0.34 + c3.z * 0.18);

      float ignition = clamp(c1.z * 0.64 + c2.z * 0.36 + c3.z * 0.28, 0.0, 1.0);
      vec3 auroraDark = (glow1 + glow2 + glow3) * 0.88
                      + vec3(0.84, 0.92, 1.0) * pow(ignition, 2.2) * 0.24;

      colDark += auroraDark * stageWeight * 0.92;

      vec3 dawnTop = vec3(0.964, 0.968, 0.995);
      vec3 dawnBot = vec3(0.986, 0.985, 0.994);
      vec3 colLight = mix(dawnBot, dawnTop, smoothstep(0.0, 1.0, uv.y));

      float w1 = clamp((c1.x * 0.40 + c1.z * 0.22) * stageWeight, 0.0, 0.44);
      float w2 = clamp((c2.x * 0.30 + c2.z * 0.15) * stageWeight, 0.0, 0.34);
      float w3 = clamp((c3.x * 0.24 + c3.z * 0.12) * stageWeight, 0.0, 0.28);

      colLight = mix(colLight, lightCoronaSpectrum(c2.y, u_tint), w2 * 0.74);
      colLight = mix(colLight, lightCoronaSpectrum(c3.y, u_tint), w3 * 0.70);
      colLight = mix(colLight, lightCoronaSpectrum(c1.y, u_tint), w1 * 0.82);
      colLight = mix(colLight, vec3(0.98, 0.98, 1.0), clamp(pow(ignition, 2.0) * stageWeight * 0.38, 0.0, 0.42));

      float lightEditorial = 0.54 + 0.46 * smoothstep(0.06, 0.64, uv.x);
      colLight = mix(dawnBot, colLight, lightEditorial);

      gl_FragColor = vec4(mix(colDark, colLight, u_light), 1.0);
    }
  `,

  /* ------------------------------------------------------------------------
     04 · ZENITH — Serene Overhead Cathedral Light Shafts & Translucent Polar Mist
     Graceful diagonal volumetric sunbeams / moonlight rays piercing calm mist.
     ------------------------------------------------------------------------ */
  zenith: `
    ${COMMON_GLSL}

    float lightShafts(vec2 uv, float aspect, float t, vec2 origin) {
      vec2 dir = (uv - origin) * vec2(aspect, 1.0);
      float dist = length(dir);
      float angle = atan(dir.y, dir.x);

      // Smooth multi-harmonic volumetric god-ray fans (zero grainy noise!)
      float s1 = pow(0.5 + 0.5 * sin(angle * 7.0 + t * 0.22 + fbm1(angle * 2.2 + t * 0.08) * 1.8), 2.4);
      float s2 = pow(0.5 + 0.5 * sin(angle * 13.0 - t * 0.18 + 1.9), 3.2) * 0.62;
      float s3 = pow(0.5 + 0.5 * cos(angle * 4.5 + t * 0.12 + 0.7), 1.8) * 0.55;

      // Soft radial attenuation from upper-right zenith source
      float radial = exp(-dist * 1.12) * smoothstep(0.02, 0.22, dist);
      return (s1 * 0.58 + s2 * 0.42 + s3 * 0.38) * radial;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_res.xy;
      float aspect = u_res.x / max(1.0, u_res.y);
      float t = u_time * 0.85 + 3.0;

      // Light source anchored serenely above the upper-right hardware stage
      vec2 origin = vec2(0.84 + (u_mouse.x - 0.5) * 0.10, 1.18 - u_scroll * 0.22 + (u_mouse.y - 0.5) * 0.06);

      float shaftA = lightShafts(uv, aspect, t, origin);
      float shaftB = lightShafts(uv + vec2(0.02, -0.01), aspect, t * 0.78 + 2.4, origin + vec2(-0.14, 0.06));

      // Gentle horizontal atmospheric mist veil drifting through the shafts
      float mistWave = 0.5 + 0.5 * sin(uv.x * 3.2 - uv.y * 2.4 + t * 0.22 + fbm1(uv.x * 2.0 + t * 0.1) * 1.4);
      float softMist = exp(-abs(uv.y - (0.48 - uv.x * 0.12 + 0.08 * sin(uv.x * 2.6 + t * 0.18))) * 3.8) * (0.45 + 0.55 * mistWave);

      float beams = shaftA * 0.92 + shaftB * 0.54;
      float textScrim = smoothstep(0.08, 0.62, uv.x);

      /* ---------- DARK MODE: Polar Moonlight Cathedral Rays ---------- */
      vec3 skyTop = vec3(0.014, 0.020, 0.036);
      vec3 skyBot = vec3(0.022, 0.028, 0.046);
      vec3 colDark = mix(skyBot, skyTop, uv.y);

      vec3 beamSapphire = mix(vec3(0.24, 0.58, 1.00), u_tint, 0.45);
      vec3 beamCyan     = vec3(0.20, 0.88, 0.92);
      vec3 beamPearl    = vec3(0.88, 0.96, 1.00);

      vec3 rayGlow = beamSapphire * shaftA * 0.90
                   + beamCyan * shaftB * 0.72
                   + beamPearl * pow(clamp(beams, 0.0, 1.0), 2.4) * 0.42
                   + mix(beamCyan, beamSapphire, 0.5) * softMist * 0.26;

      colDark += rayGlow * (0.48 + 0.68 * textScrim) * u_presence;

      /* ---------- LIGHT MODE: Sunlit Architectural Glass Beams ---------- */
      vec3 paperBase = vec3(0.976, 0.981, 0.992);
      vec3 paperTop  = vec3(0.938, 0.962, 0.994);
      vec3 colLight  = mix(paperBase, paperTop, smoothstep(0.25, 1.0, uv.y));

      vec3 lightBeamSky  = vec3(0.26, 0.56, 0.94);
      vec3 lightBeamAqua = vec3(0.14, 0.70, 0.80);

      colLight = mix(colLight, lightBeamSky, clamp(shaftA * 0.48 * u_presence, 0.0, 0.42));
      colLight = mix(colLight, lightBeamAqua, clamp((shaftB * 0.36 + softMist * 0.16) * u_presence, 0.0, 0.30));
      colLight = mix(colLight, vec3(1.0, 1.0, 1.0), clamp(pow(clamp(beams, 0.0, 1.0), 2.0) * 0.55 * u_presence, 0.0, 0.58));
      colLight = mix(paperBase, colLight, 0.44 + 0.56 * textScrim);

      gl_FragColor = vec4(mix(colDark, colLight, u_light), 1.0);
    }
  `,

  /* ------------------------------------------------------------------------
     05 · HORIZON — Layered Liquid-Glass Twilight Silk Waves
     Four broad, butter-smooth translucent silk ribbons gliding serenely across the
     horizon — clean, calm, architectural, inspired by studio glass wave displays.
     ------------------------------------------------------------------------ */
  horizon: `
    ${COMMON_GLSL}

    // Smooth translucent glass silk wave ribbon with glowing edge highlight
    vec2 silkRibbon(vec2 p, float y0, float amp, float freq, float speed, float phase, float width, float t) {
      float wave = y0
                 + amp * sin(p.x * freq + t * speed + phase)
                 + amp * 0.42 * cos(p.x * (freq * 1.72) - t * (speed * 0.74) + phase * 1.8);
      float d = p.y - wave;

      // Soft translucent silk body tapering gracefully downward + crisp luminous top crest
      float body = exp(-pow(d / width, 2.0));
      float crest = exp(-pow((d - width * 0.18) / (width * 0.24), 2.0));
      return vec2(body, crest);
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_res.xy;
      float aspect = u_res.x / max(1.0, u_res.y);

      vec2 p = vec2((uv.x - 0.5) * aspect, uv.y - 0.5);
      p.y += (u_scroll - 0.15) * 0.28;

      vec2 m = vec2((u_mouse.x - 0.5) * aspect, u_mouse.y - 0.5);
      float lens = exp(-length(p - m) * 1.55);
      p.y -= (p.y - m.y) * lens * 0.12;

      float t = u_time * 0.62 + 2.0;

      // 4 Serene Overlapping Silk Glass Ribbons
      vec2 r1 = silkRibbon(p,  0.20, 0.11, 1.35,  0.34, 0.4, 0.18, t);
      vec2 r2 = silkRibbon(p,  0.04, 0.13, 1.15, -0.28, 2.1, 0.21, t);
      vec2 r3 = silkRibbon(p, -0.12, 0.10, 1.55,  0.24, 4.3, 0.17, t);
      vec2 r4 = silkRibbon(p, -0.26, 0.08, 1.25, -0.22, 5.8, 0.15, t);

      float stageFocus = (0.48 + 0.68 * smoothstep(0.06, 0.72, uv.x) + lens * 0.22) * u_presence;

      /* ---------- DARK MODE: Deep Twilight Liquid-Glass Ribbons ---------- */
      vec3 darkBase = mix(vec3(0.018, 0.022, 0.036), vec3(0.014, 0.018, 0.030), uv.y);

      vec3 c1 = vec3(0.18, 0.78, 0.88);
      vec3 c2 = mix(vec3(0.28, 0.54, 1.00), u_tint, 0.45);
      vec3 c3 = vec3(0.46, 0.42, 0.96);
      vec3 c4 = vec3(0.20, 0.86, 0.76);

      vec3 darkGlow = c1 * (r1.x * 0.30 + r1.y * 0.28)
                    + c2 * (r2.x * 0.34 + r2.y * 0.30)
                    + c3 * (r3.x * 0.28 + r3.y * 0.24)
                    + c4 * (r4.x * 0.24 + r4.y * 0.22);

      float pearlCrest = clamp(r1.y * 0.45 + r2.y * 0.50 + r3.y * 0.38 + r4.y * 0.30, 0.0, 1.0);
      vec3 colDark = darkBase + (darkGlow + vec3(0.86, 0.95, 1.0) * pow(pearlCrest, 2.0) * 0.26) * stageFocus;

      /* ---------- LIGHT MODE: Translucent Porcelain Glass Silk Sheets ---------- */
      vec3 lightBase = vec3(0.978, 0.982, 0.992);
      vec3 colLight = lightBase;

      vec3 lc1 = vec3(0.12, 0.64, 0.76);
      vec3 lc2 = mix(vec3(0.22, 0.48, 0.92), u_tint * 0.88, 0.35);
      vec3 lc3 = vec3(0.42, 0.40, 0.86);
      vec3 lc4 = vec3(0.12, 0.68, 0.66);

      colLight = mix(colLight, lc1, clamp(r1.x * 0.24 * stageFocus, 0.0, 0.28));
      colLight = mix(colLight, lc2, clamp(r2.x * 0.28 * stageFocus, 0.0, 0.32));
      colLight = mix(colLight, lc3, clamp(r3.x * 0.22 * stageFocus, 0.0, 0.26));
      colLight = mix(colLight, lc4, clamp(r4.x * 0.20 * stageFocus, 0.0, 0.24));
      colLight = mix(colLight, vec3(1.0, 1.0, 1.0), clamp(pearlCrest * 0.68 * stageFocus, 0.0, 0.74));

      float lightEditorial = 0.50 + 0.50 * smoothstep(0.08, 0.64, uv.x);
      colLight = mix(lightBase, colLight, lightEditorial);

      gl_FragColor = vec4(mix(colDark, colLight, u_light), 1.0);
    }
  `,

  /* ------------------------------------------------------------------------
     06 · SIGNATURE — Single Signature Aurora
     One unbroken, monumental sweeping aurora ribbon suspended in vast calm
     space — uniform-width perpendicular geometry, silky upward polar veil,
     and subtle optical prism rim in both Dark and Light themes.
     ------------------------------------------------------------------------ */
  signature: `
    ${COMMON_GLSL}

    void main() {
      vec2 uv = gl_FragCoord.xy / u_res.xy;
      float aspect = u_res.x / max(1.0, u_res.y);

      vec2 p = vec2((uv.x - 0.5) * aspect, uv.y - 0.5);
      vec2 m = vec2((u_mouse.x - 0.5) * aspect, u_mouse.y - 0.5);
      float mLens = exp(-length(p - m) * 1.45);
      p.y -= (p.y - m.y) * mLens * 0.14;

      float t = u_time * 0.24 + 1.4;
      float scrollPhase = u_scroll * 1.10;
      float x = p.x;

      // Single unbroken sweeping S-arc trajectory
      float curve = -0.06 + x * 0.24
                  + 0.16 * sin(x * 1.22 - t * 0.52 + scrollPhase)
                  + 0.048 * cos(x * 2.10 + t * 0.34);

      // Analytical derivative for uniform optical ribbon thickness along the curve
      float slope = 0.24
                  + 0.16 * 1.22 * cos(x * 1.22 - t * 0.52 + scrollPhase)
                  - 0.048 * 2.10 * sin(x * 2.10 + t * 0.34);

      float d = (p.y - curve) / sqrt(1.0 + slope * slope);

      // Travelling luminous swell & delicate vertical aurora shimmer along the single arc
      float flow = 0.66 + 0.34 * sin(x * 1.45 - t * 0.78 + 0.55);
      float fineRay = 0.84 + 0.16 * sin(x * 5.2 - d * 2.6 + t * 0.55 + fbm1(x * 1.4 + t * 0.12) * 2.0);
      float energy = flow * fineRay;

      // Sculpted optical cross-section of the single signature ribbon
      float core      = exp(-pow(d / 0.034, 2.0));
      float coreUpper = exp(-pow((d - 0.016) / 0.044, 2.0));
      float coreLower = exp(-pow((d + 0.014) / 0.040, 2.0));
      float innerHalo = exp(-pow(d / 0.115, 2.0));
      float veilUp    = smoothstep(-0.042, 0.036, d) * exp(-max(d, 0.0) / 0.29);
      float softBloom = exp(-pow((d - 0.055) / 0.36, 2.0));

      float alt = clamp(max(d, 0.0) / 0.34, 0.0, 1.0);
      float stageFocus = (0.54 + 0.62 * smoothstep(0.04, 0.72, uv.x) + mLens * 0.24) * u_presence;

      /* ---------- DARK MODE: Obsidian Gallery & Single Luminous Aurora Arc ---------- */
      vec3 darkBase = mix(vec3(0.017, 0.021, 0.035), vec3(0.010, 0.013, 0.025), smoothstep(0.0, 1.0, uv.y));

      vec3 aquaEdge    = vec3(0.16, 0.90, 0.88);
      vec3 sapphireMid = mix(vec3(0.24, 0.56, 1.00), u_tint, 0.45);
      vec3 indigoUpper = vec3(0.42, 0.36, 0.94);
      vec3 pearlCrest  = vec3(0.90, 0.97, 1.00);

      vec3 veilColor = mix(
        mix(aquaEdge, sapphireMid, smoothstep(0.0, 0.42, alt)),
        indigoUpper,
        smoothstep(0.38, 0.96, alt) * 0.80
      );

      vec3 darkRibbon = veilColor * (veilUp * 0.62 + softBloom * 0.20) * energy
                      + sapphireMid * innerHalo * 0.44 * energy
                      + aquaEdge * coreLower * 0.36 * energy
                      + indigoUpper * coreUpper * 0.22 * energy
                      + pearlCrest * pow(core, 1.6) * 0.58 * flow;

      vec3 colDark = darkBase + darkRibbon * stageFocus;

      /* ---------- LIGHT MODE: Crisp Alabaster & Single Translucent Glass Aurora Arc ---------- */
      vec3 lightBase = vec3(0.980, 0.984, 0.993);
      vec3 colLight = lightBase;

      vec3 lightMist   = vec3(0.84, 0.90, 0.98);
      vec3 lightAzure  = mix(vec3(0.26, 0.56, 0.94), u_tint * 0.90, 0.35);
      vec3 lightTeal   = vec3(0.14, 0.68, 0.78);
      vec3 lightIndigo = vec3(0.42, 0.44, 0.88);

      vec3 lightVeilCol = mix(
        mix(lightTeal, lightAzure, smoothstep(0.0, 0.45, alt)),
        lightIndigo,
        smoothstep(0.42, 0.98, alt) * 0.65
      );

      colLight = mix(colLight, lightMist, clamp(softBloom * 0.36 * stageFocus, 0.0, 0.34));
      colLight = mix(colLight, lightVeilCol, clamp((veilUp * 0.34 + innerHalo * 0.22) * energy * stageFocus, 0.0, 0.42));
      colLight = mix(colLight, lightAzure, clamp(coreLower * 0.36 * energy * stageFocus, 0.0, 0.34));
      colLight = mix(colLight, vec3(1.0, 1.0, 1.0), clamp(pow(core, 1.5) * 0.82 * flow * stageFocus, 0.0, 0.86));

      float lightEditorial = 0.48 + 0.52 * smoothstep(0.06, 0.64, uv.x);
      colLight = mix(lightBase, colLight, lightEditorial);

      gl_FragColor = vec4(mix(colDark, colLight, u_light), 1.0);
    }
  `,
};

function initMultiProgramWebGLRenderer(gl) {
  const vertSrc = `
    attribute vec2 a_pos;
    void main() {
      gl_Position = vec4(a_pos, 0.0, 1.0);
    }
  `;

  function compileShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  const vs = compileShader(gl.VERTEX_SHADER, vertSrc);
  if (!vs) return null;

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW
  );

  const programs = {};
  for (const [id, fragSrc] of Object.entries(FRAGMENT_SHADERS)) {
    const fs = compileShader(gl.FRAGMENT_SHADER, fragSrc);
    if (!fs) continue;
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      gl.deleteShader(fs);
      continue;
    }
    programs[id] = {
      program,
      posLoc: gl.getAttribLocation(program, 'a_pos'),
      uRes: gl.getUniformLocation(program, 'u_res'),
      uTime: gl.getUniformLocation(program, 'u_time'),
      uMouse: gl.getUniformLocation(program, 'u_mouse'),
      uScroll: gl.getUniformLocation(program, 'u_scroll'),
      uPresence: gl.getUniformLocation(program, 'u_presence'),
      uTint: gl.getUniformLocation(program, 'u_tint'),
      uLight: gl.getUniformLocation(program, 'u_light'),
    };
  }

  if (!Object.keys(programs).length) return null;
  let boundProgramId = null;

  return {
    resize(w, h) {
      gl.viewport(0, 0, w, h);
    },
    draw({ shaderId, time, mouseX, mouseY, scroll, presence, tint, light, width, height }) {
      const targetId = programs[shaderId] ? shaderId : Object.keys(programs)[0];
      const p = programs[targetId];
      if (!p) return;

      if (boundProgramId !== targetId) {
        boundProgramId = targetId;
        gl.useProgram(p.program);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.enableVertexAttribArray(p.posLoc);
        gl.vertexAttribPointer(p.posLoc, 2, gl.FLOAT, false, 0, 0);
      }

      gl.uniform2f(p.uRes, width, height);
      gl.uniform1f(p.uTime, time);
      gl.uniform2f(p.uMouse, mouseX, mouseY);
      gl.uniform1f(p.uScroll, scroll);
      gl.uniform1f(p.uPresence, presence);
      gl.uniform3f(p.uTint, tint[0], tint[1], tint[2]);
      gl.uniform1f(p.uLight, light);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    },
  };
}

function initFallback2DRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return { resize() {}, draw() {} };

  return {
    resize() {},
    draw({ time, presence, light, width, height }) {
      const isLight = light > 0.5;
      ctx.fillStyle = isLight ? '#f8fafe' : '#050812';
      ctx.fillRect(0, 0, width, height);

      const bands = isLight
        ? [
            ['rgba(20, 178, 162, 0.22)', 'rgba(36, 142, 224, 0.14)', 'rgba(116, 92, 214, 0.0)'],
            ['rgba(36, 142, 224, 0.18)', 'rgba(116, 92, 214, 0.10)', 'rgba(248, 250, 254, 0.0)'],
          ]
        : [
            ['rgba(30, 240, 188, 0.28)', 'rgba(36, 198, 250, 0.18)', 'rgba(120, 82, 232, 0.0)'],
            ['rgba(48, 140, 255, 0.24)', 'rgba(130, 86, 236, 0.12)', 'rgba(5, 8, 18, 0.0)'],
          ];

      bands.forEach((colors, bIdx) => {
        const y0 = height * (0.48 - bIdx * 0.14);
        const grad = ctx.createLinearGradient(0, y0, 0, y0 - height * 0.36);
        grad.addColorStop(0, colors[0]);
        grad.addColorStop(0.45, colors[1]);
        grad.addColorStop(1, colors[2]);
        ctx.fillStyle = grad;
        ctx.globalAlpha = presence;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        for (let x = 0; x <= width; x += Math.max(24, width / 32)) {
          const nx = x / width;
          const y = y0 + Math.sin(nx * 4.0 + time * 0.3 + bIdx * 2.1) * height * 0.06;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(width, 0);
        ctx.closePath();
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    },
  };
}

/* ==========================================================================
   Real-Time Cursor-Tracked Specular Border Lighting
   ========================================================================== */
function initSpecularPointerTracking() {
  let rafPending = false;
  let lastX = -999;
  let lastY = -999;

  function update() {
    rafPending = false;
    document.querySelectorAll('.specular-surface, .monograph-frame, .hero-glass-plate').forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.bottom < -120 || rect.top > window.innerHeight + 120) return;
      el.style.setProperty('--mx', `${(lastX - rect.left).toFixed(1)}px`);
      el.style.setProperty('--my', `${(lastY - rect.top).toFixed(1)}px`);
    });
  }

  window.addEventListener(
    'pointermove',
    (e) => {
      lastX = e.clientX;
      lastY = e.clientY;
      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true }
  );
}
