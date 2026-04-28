/**
 * 3DBarath Portfolio - Main Animation Engine
 * Powered by GSAP & Anime.js
 */

document.addEventListener('DOMContentLoaded', () => {
    // Register GSAP Plugins
    gsap.registerPlugin(ScrollTrigger);

    initCustomCursor();
    initHeroAnimations();
    initScrollAnimations();
    initCardEffects();
    init3DBackground();
});

/**
 * Custom Cinematic Cursor with Magnetic Effects
 */
function initCustomCursor() {
    const cursor = document.getElementById('custom-cursor');
    const dot = document.getElementById('custom-cursor-dot');
    
    if (!cursor || !dot) return;

    let mouseX = 0, mouseY = 0;
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        gsap.to(cursor, {
            x: mouseX - 16,
            y: mouseY - 16,
            duration: 0.5,
            ease: "power2.out"
        });
        gsap.to(dot, {
            x: mouseX - 2,
            y: mouseY - 2,
            duration: 0.1
        });
    });

    // Magnetic Effect for Buttons & Links
    const magneticElements = document.querySelectorAll('.btn, nav a, #theme-toggle');
    magneticElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            gsap.to(el, {
                x: x * 0.3,
                y: y * 0.3,
                duration: 0.3,
                ease: "power2.out"
            });
            
            gsap.to(cursor, {
                scale: 1.5,
                x: e.clientX - 16,
                y: e.clientY - 16,
                duration: 0.3
            });
        });

        el.addEventListener('mouseleave', () => {
            gsap.to(el, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: "elastic.out(1, 0.3)"
            });
            gsap.to(cursor, {
                scale: 1,
                duration: 0.3
            });
        });
    });

    // Hover effects for cards
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            gsap.to(cursor, {
                scale: 2,
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                duration: 0.3
            });
        });
        card.addEventListener('mouseleave', () => {
            gsap.to(cursor, {
                scale: 1,
                backgroundColor: "transparent",
                duration: 0.3
            });
        });
    });
}

/**
 * Hero Section Entrance
 */
function initHeroAnimations() {
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    const subDescription = document.querySelector('.sub-description');
    
    // Set initial state in JS to avoid FOUC but keep it safe if JS fails
    gsap.set(['.hero-title', '.hero-subtitle', '.sub-description', '.hero-section .btn', '.grayscale span'], {
        opacity: 0,
        y: 30
    });

    const tl = gsap.timeline();

    tl.to('.hero-title', {
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: "power4.out"
    })
    .to('.hero-subtitle', {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out"
    }, "-=0.8")
    .to('.sub-description', {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out"
    }, "-=0.8")
    .to('.btn', {
        y: 0,
        opacity: 1,
        stagger: 0.2,
        duration: 0.8,
        ease: "back.out(1.7)"
    }, "-=0.5")
    .to('.grayscale span', {
        opacity: 0.3, // Match original opacity
        y: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: "power2.out"
    }, "-=0.5");
}

/**
 * Scroll-triggered Reveals
 */
function initScrollAnimations() {
    // Hide cards initially in JS
    gsap.set('.card', { opacity: 0, y: 60 });

    // Reveal project cards on scroll
    gsap.utils.toArray('.card').forEach((card, i) => {
        gsap.to(card, {
            scrollTrigger: {
                trigger: card,
                start: "top bottom-=100",
                toggleActions: "play none none reverse"
            },
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            delay: i % 3 * 0.1 
        });
    });

    // Hide research items initially
    gsap.set('#research a', { opacity: 0, x: -50 });

    // Reveal research items
    gsap.utils.toArray('#research a').forEach((item) => {
        gsap.to(item, {
            scrollTrigger: {
                trigger: item,
                start: "top bottom-=50",
            },
            x: 0,
            opacity: 1,
            duration: 1,
            ease: "power2.out"
        });
    });
}

/**
 * 3D Tilt Effect for Project Cards
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
            
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            gsap.to(card, {
                rotateX: rotateX,
                rotateY: rotateY,
                duration: 0.5,
                ease: "power2.out",
                transformPerspective: 1000
            });
        });
        
        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                rotateX: 0,
                rotateY: 0,
                duration: 0.5,
                ease: "power2.out"
            });
        });
    });
}

/**
 * Subtle 3D Background with Three.js
 */
function init3DBackground() {
    try {
        if (typeof THREE === 'undefined') {
            console.warn('Three.js not loaded, skipping background.');
            return;
        }

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        document.body.prepend(renderer.domElement); // Use prepend to ensure it's at the back
        
        renderer.domElement.style.position = 'fixed';
        renderer.domElement.style.top = '0';
        renderer.domElement.style.left = '0';
        renderer.domElement.style.zIndex = '-2'; // Lower than noise-bg
        renderer.domElement.style.pointerEvents = 'none';

        // Create particles
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        for (let i = 0; i < 1000; i++) {
            vertices.push(
                THREE.MathUtils.randFloatSpread(2000),
                THREE.MathUtils.randFloatSpread(2000),
                THREE.MathUtils.randFloatSpread(2000)
            );
        }
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        
        const material = new THREE.PointsMaterial({ 
            color: document.documentElement.classList.contains('light-theme') ? 0x000000 : 0xffffff, 
            size: 2, 
            transparent: true, 
            opacity: 0.2 
        });
        
        const points = new THREE.Points(geometry, material);
        scene.add(points);

        camera.position.z = 1000;

        function animate() {
            requestAnimationFrame(animate);
            points.rotation.x += 0.0003;
            points.rotation.y += 0.0003;
            renderer.render(scene, camera);
        }

        animate();

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // React to theme change
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    const isLight = document.documentElement.classList.contains('light-theme');
                    gsap.to(material.color, {
                        r: isLight ? 0 : 1,
                        g: isLight ? 0 : 1,
                        b: isLight ? 0 : 1,
                        duration: 0.5
                    });
                }
            });
        });
        observer.observe(document.documentElement, { attributes: true });
    } catch (e) {
        console.error('Error initializing 3D background:', e);
    }
}
