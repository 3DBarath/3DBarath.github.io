document.addEventListener('DOMContentLoaded', () => {
  // Mobile Menu Toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('nav-active');
    });
  }

  // Active Link State Management
  const currentLocation = window.location.pathname.split('/').pop() || 'index.html';
  const navItems = document.querySelectorAll('.nav-links li a');
  
  navItems.forEach(item => {
    const itemPath = item.getAttribute('href');
    if (itemPath === currentLocation) {
      item.classList.add('active');
    }
  });

  // Scroll Animation using Intersection Observer - Adjusted for a sleeker, slower fade-up
  const scrollElements = document.querySelectorAll('.animate-up');

  const elementInView = (el, dividend = 1) => {
    const elementTop = el.getBoundingClientRect().top;
    return (elementTop <= (window.innerHeight || document.documentElement.clientHeight) / dividend);
  };

  const displayScrollElement = (element) => {
    element.classList.add('is-visible');
  };

  const handleScrollAnimation = () => {
    scrollElements.forEach((el) => {
      if (elementInView(el, 1.1)) {
        displayScrollElement(el);
      }
    })
  }

  // Initial check on load with a slight delay for hero section elements
  setTimeout(() => {
    handleScrollAnimation();
  }, 100);

  // Check on scroll
  window.addEventListener('scroll', () => {
    handleScrollAnimation();
  });
});
