/**
 * 3DBarath Portfolio - Pro Animation Suite
 * Powered by GSAP & Anime.js v4 Patterns
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
});

/**
 * Advanced Cinematic Cursor (The Worm)
 * Inspired by GSAP/Anime.js v4 physics
 */
function initCustomCursor() {
    const cursor = document.getElementById('custom-cursor');
    const dot = document.getElementById('custom-cursor-dot');
    if (!cursor || !dot) return;

    // Create segments for the "worm" trail
    const segments = 6;
    const trail = [];
    for (let i = 0; i < segments; i++) {
        const seg = document.createElement('div');
        seg.className = 'cursor-trail fixed top-0 left-0 w-2 h-2 bg-brand-accent/20 rounded-full pointer-events-none z-[99] mix-blend-difference';
        document.body.appendChild(seg);
        trail.push(seg);
    }

    let mouseX = 0, mouseY = 0;
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        gsap.to(dot, {
            x: mouseX - 2,
            y: mouseY - 2,
            duration: 0.1
        });

        gsap.to(cursor, {
            x: mouseX - 16,
            y: mouseY - 16,
            duration: 0.6,
            ease: "power2.out"
        });

        // Staggered trail elements
        trail.forEach((seg, i) => {
            gsap.to(seg, {
                x: mouseX - 4,
                y: mouseY - 4,
                duration: 0.4 + (i * 0.05),
                ease: "power3.out"
            });
        });
    });

    // Magnetic physics for elements (Buttons, Nav, Toggle)
    const magneticElements = document.querySelectorAll('.btn, nav a, #theme-toggle');
    magneticElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            gsap.to(el, {
                x: x * 0.4,
                y: y * 0.4,
                duration: 0.4,
                ease: "power2.out"
            });

            if (el.classList.contains('card')) return;
            
            gsap.to(cursor, {
                scale: 1.8,
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                duration: 0.3
            });
        });

        el.addEventListener('mouseleave', () => {
            gsap.to(el, {
                x: 0,
                y: 0,
                duration: 0.6,
                ease: "elastic.out(1, 0.3)"
            });
            gsap.to(cursor, {
                scale: 1,
                backgroundColor: "transparent",
                duration: 0.3
            });
        });
    });
}

/**
 * Cinematic Hero Entrance
 * Includes SplitText emulation & Scramble effect
 */
function initHeroAnimations() {
    const title = document.querySelector('.hero-title');
    const subtitle = document.querySelector('.hero-subtitle');
    
    if (!title || !subtitle) return;

    // 1. Split Text Emulation for Title
    const titleText = title.innerText;
    title.innerHTML = titleText.split('').map(char => 
        `<span class="inline-block opacity-0 translate-y-full">${char === ' ' ? '&nbsp;' : char}</span>`
    ).join('');

    // 2. Clean reveal for Subtitle
    gsap.set(['.sub-description', '.hero-section .btn', '.ticker-wrapper', subtitle], { opacity: 0, y: 30 });

    const tl = gsap.timeline();

    tl.to('.hero-title span', {
        opacity: 1,
        y: 0,
        stagger: 0.03,
        duration: 0.8,
        ease: "power4.out"
    })
    .to(subtitle, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out"
    }, "-=0.4")
    .to('.sub-description', {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out"
    }, "-=0.6")
    .to('.btn', {
        y: 0,
        opacity: 1,
        stagger: 0.2,
        duration: 0.8,
        ease: "back.out(1.7)"
    }, "-=0.5")
    .to('.ticker-wrapper', {
        opacity: 1,
        duration: 1
    }, "-=0.5");
}

/**
 * Infinite Logo Ticker
 */
function initTicker() {
    const ticker = document.querySelector('.ticker-content');
    if (!ticker) return;

    gsap.to(ticker, {
        xPercent: -50, // Move half (since it's duplicated)
        repeat: -1,
        duration: 30,
        ease: "none"
    });
}

/**
 * Enhanced Scroll Animations (Parallax & Scrubbing)
 */
function initScrollAnimations() {
    // Subtle parallax for background elements
    gsap.to('.noise-bg', {
        yPercent: 20,
        ease: "none",
        scrollTrigger: {
            trigger: 'body',
            start: "top top",
            end: "bottom bottom",
            scrub: true
        }
    });

    // Reveal project cards with staggered lift
    gsap.utils.toArray('.card').forEach((card, i) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: "top bottom-=100",
                toggleActions: "play none none reverse"
            },
            y: 100,
            opacity: 0,
            rotateX: 10,
            duration: 1.2,
            ease: "power3.out"
        });
    });

    // Research Write-ups with line draw-on
    gsap.utils.toArray('#research a').forEach((item) => {
        gsap.from(item, {
            scrollTrigger: {
                trigger: item,
                start: "top bottom-=50",
            },
            opacity: 0,
            x: -30,
            duration: 1,
            ease: "power2.out"
        });
    });
}

/**
 * Advanced 3D Tilt for Cards
 */
function initCardEffects() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 25; // Softened from 15
            const rotateY = (centerX - x) / 25; // Softened from 15
            
            gsap.to(card, {
                rotateX: rotateX,
                rotateY: rotateY,
                duration: 0.5,
                ease: "power2.out",
                transformPerspective: 1000
            });

            // Parallax effect for the image inside
            const img = card.querySelector('img');
            if (img) {
                gsap.to(img, {
                    x: (x - centerX) / 10,
                    y: (y - centerY) / 10,
                    duration: 0.5
                });
            }
        });
        
        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                rotateX: 0,
                rotateY: 0,
                duration: 0.5,
                ease: "power2.out"
            });
            const img = card.querySelector('img');
            if (img) gsap.to(img, { x: 0, y: 0, duration: 0.5 });
        });
    });
}

/**
 * Three.js Particle Field with Mouse Interaction
 */
function init3DBackground() {
    try {
        if (typeof THREE === 'undefined') return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        document.body.prepend(renderer.domElement);
        
        renderer.domElement.style.position = 'fixed';
        renderer.domElement.style.top = '0';
        renderer.domElement.style.left = '0';
        renderer.domElement.style.zIndex = '-2';
        renderer.domElement.style.pointerEvents = 'none';

        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        for (let i = 0; i < 800; i++) {
            vertices.push(
                THREE.MathUtils.randFloatSpread(2000),
                THREE.MathUtils.randFloatSpread(2000),
                THREE.MathUtils.randFloatSpread(2000)
            );
        }
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        
        const material = new THREE.PointsMaterial({ 
            color: document.documentElement.classList.contains('light-theme') ? 0x000000 : 0xffffff, 
            size: 1.5, 
            transparent: true, 
            opacity: 0.15 
        });
        
        const points = new THREE.Points(geometry, material);
        scene.add(points);

        camera.position.z = 1000;

        let targetX = 0, targetY = 0;
        window.addEventListener('mousemove', (e) => {
            targetX = (e.clientX - window.innerWidth / 2) * 0.05;
            targetY = (e.clientY - window.innerHeight / 2) * 0.05;
        });

        function animate() {
            requestAnimationFrame(animate);
            points.rotation.x += 0.0002;
            points.rotation.y += 0.0002;
            
            // Mouse react
            points.position.x += (targetX - points.position.x) * 0.05;
            points.position.y += (-targetY - points.position.y) * 0.05;
            
            renderer.render(scene, camera);
        }

        animate();

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Theme sync
        const observer = new MutationObserver(() => {
            const isLight = document.documentElement.classList.contains('light-theme');
            gsap.to(material.color, {
                r: isLight ? 0 : 1, g: isLight ? 0 : 1, b: isLight ? 0 : 1,
                duration: 1
            });
        });
        observer.observe(document.documentElement, { attributes: true });
    } catch (e) {
        console.error(e);
    }
}
