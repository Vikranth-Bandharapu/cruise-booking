/**
 * AURELIA OCEANIC VOYAGES — MOTION DESIGN & ANIMATIONS
 * AOS & GSAP + ScrollTrigger integration with prefers-reduced-motion support.
 */

document.addEventListener('DOMContentLoaded', () => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Initialize AOS (Animate on Scroll)
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: prefersReduced ? 0 : 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 60,
      disable: prefersReduced
    });
  }

  // 2. Initialize GSAP & ScrollTrigger if loaded and not reduced motion
  if (typeof gsap !== 'undefined' && !prefersReduced) {
    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }

    initHeroAnimation();
    initCounterAnimations();
    initParallaxElements();
  }
});

// GSAP Hero Stagger Reveal
function initHeroAnimation() {
  const heroBadge = document.querySelector('.hero-badge');
  const heroTitle = document.querySelector('.hero-title');
  const heroDesc = document.querySelector('.hero-desc');
  const heroActions = document.querySelector('.hero-actions');

  if (heroTitle) {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (heroBadge) {
      tl.fromTo(heroBadge, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 });
    }
    tl.fromTo(heroTitle, { opacity: 0, y: 35 }, { opacity: 1, y: 0, duration: 1 }, '-=0.4');
    if (heroDesc) {
      tl.fromTo(heroDesc, { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.6');
    }
    if (heroActions) {
      tl.fromTo(heroActions, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.5');
    }
  }
}

// Numerical Stat Counters
function initCounterAnimations() {
  const counters = document.querySelectorAll('[data-counter]');

  counters.forEach((counter) => {
    const target = parseFloat(counter.getAttribute('data-counter'));
    const suffix = counter.getAttribute('data-suffix') || '';
    const prefix = counter.getAttribute('data-prefix') || '';

    ScrollTrigger.create({
      trigger: counter,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 2,
          ease: 'power2.out',
          onUpdate: () => {
            if (target % 1 === 0) {
              counter.textContent = prefix + Math.floor(obj.val).toLocaleString() + suffix;
            } else {
              counter.textContent = prefix + obj.val.toFixed(1) + suffix;
            }
          }
        });
      }
    });
  });
}

// Subtle Hero and Image Parallax
function initParallaxElements() {
  const parallaxBg = document.querySelector('.hero-parallax-bg');
  if (parallaxBg) {
    gsap.to(parallaxBg, {
      yPercent: 20,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });
  }
}
