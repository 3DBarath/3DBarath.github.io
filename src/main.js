/**
 * 3DBarath Portfolio - High Performance Animation Suite
 * Fully GPU-optimized, zero layout-thrashing, native 120 FPS
 */

document.addEventListener('DOMContentLoaded', () => {
    // Register GSAP Plugins
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }

    initHeroAnimations();
    initTicker();
    initScrollAnimations();
    initCardEffects();
    initEmailCopy();
    initLightbox();
});

/**
 * Premium Hero Entrance Animation (Runs once on load)
 */
function initHeroAnimations() {
    if (typeof gsap === 'undefined') return;
    const elementsToReveal = document.querySelectorAll('#hero .reveal-on-scroll');
    if (elementsToReveal.length === 0) return;

    gsap.set(elementsToReveal, { opacity: 0, y: 30 });

    gsap.to(elementsToReveal, {
        opacity: 1,
        y: 0,
        stagger: 0.08,
        duration: 0.9,
        ease: "power3.out",
        clearProps: "transform"
    });
}

/**
 * Infinite Logo Ticker Animation
 */
function initTicker() {
    if (typeof gsap === 'undefined') return;
    const tickers = document.querySelectorAll('.ticker-content');
    if (tickers.length === 0) return;

    tickers.forEach(ticker => {
        const wrapper = ticker.closest('.ticker-wrapper');
        if (wrapper) gsap.set(wrapper, { opacity: 1 });

        gsap.to(ticker, {
            xPercent: -50,
            repeat: -1,
            duration: 25,
            ease: "none"
        });
    });
}

/**
 * Performant Scroll Reveals (Runs once and auto-destroys triggers)
 */
function initScrollAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    // Staggered reveal for bento grid cards
    const bentoCards = gsap.utils.toArray('.bento-card');
    bentoCards.forEach((card) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: "top bottom-=60",
                once: true
            },
            y: 40,
            opacity: 0,
            duration: 0.8,
            ease: "power2.out",
            clearProps: "transform,opacity"
        });
    });

    // Staggered reveal for journal/research items
    const journalItems = gsap.utils.toArray('.journal-item');
    journalItems.forEach((item) => {
        gsap.from(item, {
            scrollTrigger: {
                trigger: item,
                start: "top bottom-=40",
                once: true
            },
            opacity: 0,
            x: -16,
            duration: 0.7,
            ease: "power2.out",
            clearProps: "transform,opacity"
        });
    });
}

/**
 * Smart Bento Card Click Delegation (Zero JS on mousemove; hardware-accelerated CSS hover)
 */
function initCardEffects() {
    const cards = document.querySelectorAll('.bento-card');
    cards.forEach(card => {
        const mainLink = card.querySelector('.primary-project-link');
        if (mainLink) {
            card.style.cursor = 'pointer';
            card.addEventListener('click', (e) => {
                const clickedLink = e.target.closest('a');
                if (clickedLink) return;
                
                if (e.metaKey || e.ctrlKey || e.button === 1) {
                    window.open(mainLink.href, '_blank');
                } else {
                    mainLink.click();
                }
            });
        }
    });
}

/**
 * Interactive Contact Email Copy to Clipboard
 */
function initEmailCopy() {
    const copyBtn = document.getElementById('copy-email-btn');
    const tooltip = document.getElementById('copy-tooltip');
    if (!copyBtn || !tooltip) return;

    copyBtn.addEventListener('click', () => {
        const email = 'barathjack77@gmail.com';
        navigator.clipboard.writeText(email).then(() => {
            tooltip.classList.remove('opacity-0', 'translate-y-1', 'pointer-events-none');
            tooltip.classList.add('opacity-100', 'translate-y-0');
            
            if (typeof gsap !== 'undefined') {
                gsap.fromTo(copyBtn, 
                    { scale: 0.85, color: '#10b981' }, 
                    { scale: 1, color: 'var(--brand-accent)', duration: 0.4, ease: "back.out(2)" }
                );
            }

            setTimeout(() => {
                tooltip.classList.remove('opacity-100', 'translate-y-0');
                tooltip.classList.add('opacity-0', 'translate-y-1', 'pointer-events-none');
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy email: ', err);
        });
    });
}

/**
 * Dynamic Lightbox Gallery for Project Detail Pages
 */
function initLightbox() {
    const isProjectPage = window.location.pathname.includes('/connectlnx/') || 
                          window.location.pathname.includes('/gceshostel/') || 
                          window.location.pathname.includes('/smart-expense-tracker/');
                          
    if (!isProjectPage) return;

    const style = document.createElement('style');
    style.textContent = `
        #lightbox-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(10, 10, 12, 0.94);
            backdrop-filter: blur(8px);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.25s ease;
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
            transition: transform 0.25s ease;
        }
        #lightbox-overlay.active #lightbox-image {
            transform: scale(1);
        }
        .lightbox-btn {
            position: absolute;
            background: rgba(255, 255, 255, 0.06);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: var(--brand-accent, #ffffff);
            width: 46px;
            height: 46px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
            user-select: none;
            z-index: 10010;
        }
        .lightbox-btn:hover {
            background: rgba(255, 255, 255, 0.12);
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
            top: -56px;
            right: 0;
        }
        #lightbox-prev {
            left: -70px;
        }
        #lightbox-next {
            right: -70px;
        }
        @media (max-width: 992px) {
            #lightbox-prev {
                left: 12px;
                bottom: -70px;
                position: fixed;
            }
            #lightbox-next {
                right: 12px;
                bottom: -70px;
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

    images.forEach((img, index) => {
        img.style.cursor = 'pointer';
        img.addEventListener('click', (e) => {
            e.stopPropagation();
            openLightbox(index);
        });
    });

    closeBtn.addEventListener('click', closeLightbox);
    
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

    document.addEventListener('keydown', (e) => {
        if (!overlay.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') showPrev();
        if (e.key === 'ArrowRight') showNext();
    });
}
