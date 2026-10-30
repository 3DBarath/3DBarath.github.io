/**
 * 3DBarath Portfolio - Premium Animation Suite
 * Powered by GSAP & Three.js
 */

document.addEventListener('DOMContentLoaded', () => {
    // Register GSAP Plugins
    gsap.registerPlugin(ScrollTrigger);

    initCustomCursor();
    initHeroAnimations();
    initTicker();
    initScrollAnimations();
    initCardEffects();
    init3DBackground();
    initEmailCopy();
    initLightbox();
});

/**
 * GPU-Accelerated Custom Cursor (LERP Interpolated for Peak Performance)
 */
function initCustomCursor() {
    const cursor = document.getElementById('custom-cursor');
    const dot = document.getElementById('custom-cursor-dot');
    if (!cursor || !dot) return;

    // Hide custom cursor initially
    gsap.set([cursor, dot], { opacity: 0 });

    let mouseX = 0, mouseY = 0;
    let dotX = 0, dotY = 0;
    let cursorX = 0, cursorY = 0;
    let hasMoved = false;
    let isHovering = false;
    let isRafActive = false;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        if (!hasMoved) {
            hasMoved = true;
            // Snaps positions initially to avoid slide-in from top-left
            dotX = mouseX;
            dotY = mouseY;
            cursorX = mouseX;
            cursorY = mouseY;
            gsap.to([cursor, dot], { opacity: 1, duration: 0.3 });
        }

        if (!isRafActive) {
            isRafActive = true;
            requestAnimationFrame(updateCursor);
        }
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
        gsap.to([cursor, dot], { opacity: 0, duration: 0.3 });
        hasMoved = false;
    });

    // High performance LERP render loop - pauses automatically when idle
    function updateCursor() {
        if (hasMoved) {
            // Lerp dot
            dotX += (mouseX - dotX) * 0.35;
            dotY += (mouseY - dotY) * 0.35;
            dot.style.transform = `translate3d(${dotX - 3}px, ${dotY - 3}px, 0)`;

            // Lerp outer halo
            cursorX += (mouseX - cursorX) * 0.18;
            cursorY += (mouseY - cursorY) * 0.18;
            cursor.style.transform = `translate3d(${cursorX - 16}px, ${cursorY - 16}px, 0)`;

            // If resting within sub-pixel threshold, snap and pause loop to free CPU/GPU
            const dotDist = Math.abs(mouseX - dotX) + Math.abs(mouseY - dotY);
            const cursorDist = Math.abs(mouseX - cursorX) + Math.abs(mouseY - cursorY);
            if (dotDist < 0.1 && cursorDist < 0.1) {
                dotX = mouseX;
                dotY = mouseY;
                cursorX = mouseX;
                cursorY = mouseY;
                dot.style.transform = `translate3d(${dotX - 3}px, ${dotY - 3}px, 0)`;
                cursor.style.transform = `translate3d(${cursorX - 16}px, ${cursorY - 16}px, 0)`;
                isRafActive = false;
                return;
            }
        }
        requestAnimationFrame(updateCursor);
    }

    // Magnetic interaction on buttons, links, and cards
    const interactives = document.querySelectorAll('a, button, .bento-card, #theme-toggle');
    interactives.forEach(el => {
        el.addEventListener('mouseenter', () => {
            isHovering = true;
            gsap.to(cursor, {
                scale: 1.8,
                borderColor: 'var(--color-emerald-accent)',
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                duration: 0.25,
                ease: "power2.out",
                overwrite: "auto"
            });
            gsap.to(dot, {
                scale: 0,
                duration: 0.2,
                overwrite: "auto"
            });
        });

        el.addEventListener('mouseleave', () => {
            isHovering = false;
            gsap.to(cursor, {
                scale: 1,
                borderColor: 'var(--brand-accent)',
                backgroundColor: 'transparent',
                duration: 0.25,
                ease: "power2.out",
                overwrite: "auto"
            });
            gsap.to(dot, {
                scale: 1,
                duration: 0.2,
                overwrite: "auto"
            });
        });

        // Slight magnetic pull on hover (only for standard interactive buttons, not cards/writeups/emails)
        el.addEventListener('mousemove', (e) => {
            if (el.classList.contains('bento-card') || 
                el.classList.contains('journal-item') || 
                el.getAttribute('href')?.startsWith('mailto:')) return;
            
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            gsap.to(el, {
                x: x * 0.25,
                y: y * 0.25,
                duration: 0.3,
                ease: "power2.out",
                overwrite: "auto"
            });
        });

        el.addEventListener('mouseleave', () => {
            if (el.classList.contains('bento-card') || 
                el.classList.contains('journal-item') || 
                el.getAttribute('href')?.startsWith('mailto:')) return;
            gsap.to(el, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: "elastic.out(1, 0.3)",
                overwrite: "auto"
            });
        });
    });
}

/**
 * Premium Hero Entrance Animation
 */
function initHeroAnimations() {
    const elementsToReveal = document.querySelectorAll('#hero .reveal-on-scroll');
    if (elementsToReveal.length === 0) return;

    // Reset initial states
    gsap.set(elementsToReveal, { opacity: 0, y: 40 });

    const tl = gsap.timeline();

    tl.to(elementsToReveal, {
        opacity: 1,
        y: 0,
        stagger: 0.1,
        duration: 1.2,
        ease: "power4.out"
    });
}

/**
 * Infinite Logo Ticker Animation
 */
function initTicker() {
    const tickers = document.querySelectorAll('.ticker-content');
    if (tickers.length === 0) return;

    tickers.forEach(ticker => {
        // Ensure wrapper is visible
        const wrapper = ticker.closest('.ticker-wrapper');
        if (wrapper) gsap.set(wrapper, { opacity: 1 });

        // Smooth continuous loop
        gsap.to(ticker, {
            xPercent: -50,
            repeat: -1,
            duration: 25,
            ease: "none"
        });
    });
}

/**
 * Enhanced Scroll Animations (Optimized for performance)
 */
function initScrollAnimations() {
    // Parallax background grid movement (Uses Translate3d via GSAP for GPU support)
    gsap.to('.grid-overlay', {
        yPercent: 12,
        force3D: true,
        ease: "none",
        scrollTrigger: {
            trigger: 'body',
            start: "top top",
            end: "bottom bottom",
            scrub: true
        }
    });

    // Staggered reveal for bento grid cards (Runs once and destroys trigger for garbage cleanup)
    const bentoCards = gsap.utils.toArray('.bento-card');
    bentoCards.forEach((card) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: "top bottom-=80",
                once: true
            },
            y: 60,
            opacity: 0,
            force3D: true,
            duration: 1,
            ease: "power3.out"
        });
    });

    // Staggered reveal for journal/research items
    const journalItems = gsap.utils.toArray('.journal-item');
    journalItems.forEach((item) => {
        gsap.from(item, {
            scrollTrigger: {
                trigger: item,
                start: "top bottom-=50",
                once: true
            },
            opacity: 0,
            x: -20,
            force3D: true,
            duration: 0.8,
            ease: "power2.out"
        });
    });
}

/**
 * 3D Parallax Tilt for Bento Cards (Optimized with force3D and cached bounds)
 */
function initCardEffects() {
    const cards = document.querySelectorAll('.bento-card');
    cards.forEach(card => {
        const mainLink = card.querySelector('.primary-project-link');
        if (mainLink) {
            card.style.cursor = 'pointer';
            card.addEventListener('click', (e) => {
                const clickedLink = e.target.closest('a');
                if (clickedLink) {
                    // Let any direct links (Explore, Web, PlayStore) click naturally
                    return;
                }
                
                // Handle keyboard modifiers for tab opening
                if (e.metaKey || e.ctrlKey || e.button === 1) {
                    window.open(mainLink.href, '_blank');
                } else {
                    mainLink.click();
                }
            });
        }

        let rect = null;
        card.addEventListener('mouseenter', () => {
            rect = card.getBoundingClientRect();
        });

        card.addEventListener('mousemove', (e) => {
            if (!rect) rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Normalize tilt using card dimensions to keep max tilt constant (6 deg) regardless of card size
            const maxTilt = 6;
            const rotateX = ((y - centerY) / centerY) * maxTilt;
            const rotateY = ((centerX - x) / centerX) * maxTilt;
            
            gsap.to(card, {
                rotateX: rotateX,
                rotateY: rotateY,
                duration: 0.3,
                ease: "power2.out",
                force3D: true,
                transformPerspective: 1000,
                overwrite: "auto"
            });

            // Normalize parallel shifts inside (max 8px shift)
            const img = card.querySelector('.bento-image-container img');
            if (img) {
                const maxShift = 8;
                gsap.to(img, {
                    x: ((x - centerX) / centerX) * maxShift,
                    y: ((y - centerY) / centerY) * maxShift,
                    force3D: true,
                    duration: 0.3,
                    overwrite: "auto"
                });
            }
        });
        
        card.addEventListener('mouseleave', () => {
            rect = null;
            gsap.to(card, {
                rotateX: 0,
                rotateY: 0,
                duration: 0.4,
                force3D: true,
                ease: "power2.out",
                overwrite: "auto"
            });
            const img = card.querySelector('.bento-image-container img');
            if (img) gsap.to(img, { x: 0, y: 0, force3D: true, duration: 0.4, overwrite: "auto" });
        });
    });
}

/**
 * Elegant Three.js Particle Field (GPU-Accelerated Rotation - 60 FPS Locked)
 */
function init3DBackground() {
    try {
        if (typeof THREE === 'undefined') return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 1, 2000);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false }); // Disable antialias for performance boost
        
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Caps pixel ratio to 1.5 for faster rendering
        document.body.prepend(renderer.domElement);
        
        renderer.domElement.style.position = 'fixed';
        renderer.domElement.style.top = '0';
        renderer.domElement.style.left = '0';
        renderer.domElement.style.zIndex = '-3';
        renderer.domElement.style.pointerEvents = 'none';

        const count = 400; // Reduced point count slightly for speed
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = THREE.MathUtils.randFloatSpread(1600);
            positions[i * 3 + 1] = THREE.MathUtils.randFloatSpread(1000);
            positions[i * 3 + 2] = THREE.MathUtils.randFloatSpread(1000);
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const isLightTheme = document.documentElement.classList.contains('light-theme');
        const material = new THREE.PointsMaterial({ 
            color: isLightTheme ? 0x059669 : 0x10b981,
            size: 2.2, 
            transparent: true, 
            opacity: 0.18 
        });
        
        const points = new THREE.Points(geometry, material);
        scene.add(points);

        camera.position.z = 800;

        let targetX = 0, targetY = 0;
        window.addEventListener('mousemove', (e) => {
            targetX = (e.clientX - window.innerWidth / 2) * 0.04;
            targetY = (e.clientY - window.innerHeight / 2) * 0.04;
        }, { passive: true });

        const clock = new THREE.Clock();

        function animate() {
            requestAnimationFrame(animate);
            
            const time = clock.getElapsedTime();
            
            // Orbiting system (GPU rotation, extremely cheap, zero memory transfer)
            points.rotation.y = time * 0.015;
            points.rotation.x = time * 0.01;
            
            // Mouse ease response
            points.position.x += (targetX - points.position.x) * 0.04;
            points.position.y += (-targetY - points.position.y) * 0.04;
            
            renderer.render(scene, camera);
        }

        animate();

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Theme Mutation Sync
        const observer = new MutationObserver(() => {
            const isLight = document.documentElement.classList.contains('light-theme');
            const targetColor = new THREE.Color(isLight ? 0x059669 : 0x10b981);
            gsap.to(material.color, {
                r: targetColor.r,
                g: targetColor.g,
                b: targetColor.b,
                duration: 1
            });
            material.opacity = isLight ? 0.22 : 0.18;
        });
        observer.observe(document.documentElement, { attributes: true });
    } catch (e) {
        console.error("Three.js setup failed: ", e);
    }
}

/**
 * Interactive Contact Email Copy to Clipboard (with success check)
 */
function initEmailCopy() {
    const copyBtn = document.getElementById('copy-email-btn');
    const tooltip = document.getElementById('copy-tooltip');
    if (!copyBtn || !tooltip) return;

    copyBtn.addEventListener('click', () => {
        const email = 'barathjack77@gmail.com';
        navigator.clipboard.writeText(email).then(() => {
            // Trigger feedback animations on tooltip
            tooltip.classList.remove('opacity-0', 'translate-y-1', 'pointer-events-none');
            tooltip.classList.add('opacity-100', 'translate-y-0');
            
            // Add a subtle bounce and color change to copy icon
            gsap.fromTo(copyBtn, 
                { scale: 0.8, color: '#10b981' }, 
                { scale: 1, color: 'var(--brand-accent)', duration: 0.6, ease: "elastic.out(1, 0.3)" }
            );

            // Revert tooltip after 2.5 seconds
            setTimeout(() => {
                tooltip.classList.remove('opacity-100', 'translate-y-0');
                tooltip.classList.add('opacity-0', 'translate-y-1', 'pointer-events-none');
            }, 2500);
        }).catch(err => {
            console.error('Failed to copy email: ', err);
        });
    });
}

/**
 * Dynamic Lightbox Gallery with Boundary Check for Project Detail Pages
 */
function initLightbox() {
    const isProjectPage = window.location.pathname.includes('/connectlnx/') || 
                          window.location.pathname.includes('/gceshostel/') || 
                          window.location.pathname.includes('/smart-expense-tracker/');
                          
    if (!isProjectPage) return;

    // 1. Inject Lightbox CSS
    const style = document.createElement('style');
    style.textContent = `
        #lightbox-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(10, 10, 12, 0.94);
            backdrop-filter: blur(12px);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
        }
        #lightbox-overlay.active {
            opacity: 1;
            pointer-events: auto;
        }
        #lightbox-container {
            position: relative;
            max-width: 90%;
            max-height: 85%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        #lightbox-image {
            max-width: 100%;
            max-height: 80vh;
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
            transform: scale(0.96);
            transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        #lightbox-overlay.active #lightbox-image {
            transform: scale(1);
        }
        .lightbox-btn {
            position: absolute;
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.08);
            color: var(--brand-accent, #ffffff);
            width: 50px;
            height: 50px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
            backdrop-filter: blur(8px);
            user-select: none;
            z-index: 10010;
        }
        .lightbox-btn:hover {
            background: rgba(255, 255, 255, 0.08);
            border-color: var(--color-emerald-accent, #10b981);
            color: var(--color-emerald-accent, #10b981);
            transform: scale(1.05);
        }
        .lightbox-btn.disabled {
            opacity: 0.15;
            pointer-events: none;
            border-color: rgba(255, 255, 255, 0.04);
        }
        #lightbox-close {
            top: -64px;
            right: 0;
        }
        #lightbox-prev {
            left: -80px;
        }
        #lightbox-next {
            right: -80px;
        }
        @media (max-width: 992px) {
            #lightbox-prev {
                left: 12px;
                bottom: -80px;
                position: fixed;
            }
            #lightbox-next {
                right: 12px;
                bottom: -80px;
                position: fixed;
            }
            #lightbox-close {
                right: 12px;
                top: 12px;
                position: fixed;
            }
        }
    `;
    document.head.appendChild(style);

    // 2. Inject Lightbox HTML Structure
    const overlay = document.createElement('div');
    overlay.id = 'lightbox-overlay';
    overlay.innerHTML = `
        <div id="lightbox-container">
            <button id="lightbox-close" class="lightbox-btn" aria-label="Close Lightbox">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            <button id="lightbox-prev" class="lightbox-btn" aria-label="Previous Image">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <img id="lightbox-image" src="" alt="Walkthrough screenshot">
            <button id="lightbox-next" class="lightbox-btn" aria-label="Next Image">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    `;
    document.body.appendChild(overlay);

    const lightboxImg = document.getElementById('lightbox-image');
    const closeBtn = document.getElementById('lightbox-close');
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');

    // 3. Find unique target images (exclude favicon/logos)
    const seenSrcs = new Set();
    const images = Array.from(document.querySelectorAll('main img, .card img, .reveal-on-scroll img')).filter(img => {
        if (!img.src || img.src.includes('favicon')) return false;
        if (seenSrcs.has(img.src)) return false;
        seenSrcs.add(img.src);
        return true;
    });

    let currentIndex = -1;

    function openLightbox(index) {
        currentIndex = index;
        updateImage();
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    function updateImage() {
        if (currentIndex < 0 || currentIndex >= images.length) return;
        const targetImg = images[currentIndex];
        lightboxImg.src = targetImg.src;
        lightboxImg.alt = targetImg.alt || 'Project Screenshot';

        // Boundary arrow states ("until hit wall")
        if (currentIndex === 0) {
            prevBtn.classList.add('disabled');
        } else {
            prevBtn.classList.remove('disabled');
        }

        if (currentIndex === images.length - 1) {
            nextBtn.classList.add('disabled');
        } else {
            nextBtn.classList.remove('disabled');
        }
    }

    function showPrev() {
        if (currentIndex > 0) {
            currentIndex--;
            updateImage();
        }
    }

    function showNext() {
        if (currentIndex < images.length - 1) {
            currentIndex++;
            updateImage();
        }
    }

    // Attach click triggers
    images.forEach((img, index) => {
        img.style.cursor = 'pointer';
        img.addEventListener('click', (e) => {
            e.stopPropagation();
            openLightbox(index);
        });
    });

    // Control triggers
    closeBtn.addEventListener('click', closeLightbox);
    
    // Close on overlay backdrop click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay || e.target === document.getElementById('lightbox-container')) {
            closeLightbox();
        }
    });

    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showPrev();
    });

    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showNext();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!overlay.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') showPrev();
        if (e.key === 'ArrowRight') showNext();
    });
}
