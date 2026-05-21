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
});

/**
 * GPU-Accelerated Custom Cursor (LERP Interpolated for Peak Performance)
 */
function initCustomCursor() {
    const cursor = document.getElementById('custom-cursor');
    const dot = document.getElementById('custom-cursor-dot');
    if (!cursor || !dot) return;

    // Create segments for trail
    const segmentsCount = 4;
    const trail = [];
    for (let i = 0; i < segmentsCount; i++) {
        const seg = document.createElement('div');
        seg.className = 'cursor-trail fixed top-0 left-0 w-1.5 h-1.5 bg-brand-accent/20 rounded-full pointer-events-none z-[99] mix-blend-difference';
        seg.style.willChange = 'transform';
        document.body.appendChild(seg);
        trail.push(seg);
    }

    // Hide custom cursor initially
    gsap.set([cursor, dot, ...trail], { opacity: 0 });

    let mouseX = 0, mouseY = 0;
    let dotX = 0, dotY = 0;
    let cursorX = 0, cursorY = 0;
    let hasMoved = false;
    let isHovering = false;

    // Trail elements LERP tracking
    const trailPositions = [];
    for (let i = 0; i < segmentsCount; i++) {
        trailPositions.push({ x: 0, y: 0 });
    }

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
            trailPositions.forEach(pos => {
                pos.x = mouseX;
                pos.y = mouseY;
            });
            gsap.to([cursor, dot, ...trail], { opacity: 1, duration: 0.3 });
        }
    });

    document.addEventListener('mouseleave', () => {
        gsap.to([cursor, dot, ...trail], { opacity: 0, duration: 0.3 });
        hasMoved = false;
    });

    // High performance LERP render loop running on requestAnimationFrame
    function updateCursor() {
        if (hasMoved) {
            // Lerp dot
            dotX += (mouseX - dotX) * 0.35;
            dotY += (mouseY - dotY) * 0.35;
            dot.style.transform = `translate3d(${dotX - 3}px, ${dotY - 3}px, 0)`;

            // Lerp outer halo
            cursorX += (mouseX - cursorX) * 0.15;
            cursorY += (mouseY - cursorY) * 0.15;
            cursor.style.transform = `translate3d(${cursorX - 16}px, ${cursorY - 16}px, 0)`;

            // Lerp trail (only active when not hovering over buttons to keep it clean)
            if (!isHovering) {
                let prevX = mouseX;
                let prevY = mouseY;
                trail.forEach((seg, i) => {
                    const pos = trailPositions[i];
                    pos.x += (prevX - pos.x) * (0.24 - i * 0.04);
                    pos.y += (prevY - pos.y) * (0.24 - i * 0.04);
                    seg.style.transform = `translate3d(${pos.x - 3}px, ${pos.y - 3}px, 0)`;
                    prevX = pos.x;
                    prevY = pos.y;
                });
            }
        }
        requestAnimationFrame(updateCursor);
    }
    requestAnimationFrame(updateCursor);

    // Magnetic interaction on buttons, links, and cards
    const interactives = document.querySelectorAll('a, button, .bento-card, #theme-toggle');
    interactives.forEach(el => {
        el.addEventListener('mouseenter', () => {
            isHovering = true;
            gsap.to(cursor, {
                scale: 1.8,
                borderColor: 'var(--color-emerald-accent)',
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                duration: 0.3,
                ease: "power2.out"
            });
            gsap.to(dot, {
                scale: 0,
                duration: 0.2
            });
            gsap.to(trail, {
                opacity: 0,
                scale: 0,
                duration: 0.2
            });
        });

        el.addEventListener('mouseleave', () => {
            isHovering = false;
            gsap.to(cursor, {
                scale: 1,
                borderColor: 'var(--brand-accent)',
                backgroundColor: 'transparent',
                duration: 0.3,
                ease: "power2.out"
            });
            gsap.to(dot, {
                scale: 1,
                duration: 0.2
            });
            gsap.to(trail, {
                opacity: 1,
                scale: 1,
                duration: 0.2
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
                ease: "power2.out"
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
                ease: "elastic.out(1, 0.3)"
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
 * 3D Parallax Tilt for Bento Cards (Optimized with force3D)
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

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Subtle rotation ratios
            const rotateX = (y - centerY) / 25;
            const rotateY = (centerX - x) / 25;
            
            gsap.to(card, {
                rotateX: rotateX,
                rotateY: rotateY,
                duration: 0.4,
                ease: "power2.out",
                force3D: true,
                transformPerspective: 1000
            });

            // Parallel shifts inside
            const img = card.querySelector('.bento-image-container img');
            if (img) {
                gsap.to(img, {
                    x: (x - centerX) * 0.05,
                    y: (y - centerY) * 0.05,
                    force3D: true,
                    duration: 0.4
                });
            }
        });
        
        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                rotateX: 0,
                rotateY: 0,
                duration: 0.5,
                force3D: true,
                ease: "power2.out"
            });
            const img = card.querySelector('.bento-image-container img');
            if (img) gsap.to(img, { x: 0, y: 0, force3D: true, duration: 0.5 });
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
        });

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
