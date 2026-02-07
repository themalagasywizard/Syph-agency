/* ============================================
   SYPH AGENCY — Interaction & Animation Engine
   ============================================ */

// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches || window.innerWidth <= 768;

  // --- Smooth Scrolling with Lenis (desktop only) ---
  let lenis = null;
  if (!isTouch && !prefersReducedMotion) {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Connect Lenis to GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // --- Preloader ---
  const preloader = document.getElementById('preloader');
  const preloaderLetters = document.querySelectorAll('.preloader-letter');
  const preloaderProgress = document.getElementById('preloader-progress');

  if (prefersReducedMotion) {
    preloader.style.display = 'none';
    initPageAnimations(true);
  } else {
    const preloaderTl = gsap.timeline({
      onComplete: () => {
        gsap.to(preloader, {
          yPercent: -100,
          duration: 0.8,
          ease: 'power4.inOut',
          onComplete: () => {
            preloader.style.display = 'none';
            initPageAnimations();
          }
        });
      }
    });

    preloaderTl
      .to(preloaderLetters, {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power3.out',
      })
      .to(preloaderProgress, {
        width: '100%',
        duration: 1.2,
        ease: 'power2.inOut',
      }, '-=0.2')
      .to(preloaderLetters, {
        y: -20,
        opacity: 0,
        duration: 0.4,
        stagger: 0.04,
        ease: 'power3.in',
      }, '+=0.3');
  }

  // --- Custom Cursor ---
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');
  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;
  let followerX = 0, followerY = 0;

  if (!isTouch) {
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function updateCursor() {
      // Main cursor - fast follow
      cursorX += (mouseX - cursorX) * 0.25;
      cursorY += (mouseY - cursorY) * 0.25;
      cursor.style.transform = `translate(${cursorX - 4}px, ${cursorY - 4}px)`;

      // Follower - slower, smoother
      followerX += (mouseX - followerX) * 0.08;
      followerY += (mouseY - followerY) * 0.08;
      follower.style.transform = `translate(${followerX - 20}px, ${followerY - 20}px)`;

      requestAnimationFrame(updateCursor);
    }
    updateCursor();

    // Cursor hover effects
    const hoverElements = document.querySelectorAll('a, button, [data-magnetic], .work-card, .tech-logo');
    hoverElements.forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('hover');
        follower.classList.add('hover');
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('hover');
        follower.classList.remove('hover');
      });
    });
  }

  // --- Magnetic Buttons ---
  const magneticElements = document.querySelectorAll('[data-magnetic]');
  if (!isTouch) {
    magneticElements.forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(el, {
          x: x * 0.3,
          y: y * 0.3,
          duration: 0.4,
          ease: 'power2.out',
        });
      });

      el.addEventListener('mouseleave', () => {
        gsap.to(el, {
          x: 0,
          y: 0,
          duration: 0.6,
          ease: 'elastic.out(1, 0.5)',
        });
      });
    });
  }

  // --- Navigation ---
  const nav = document.getElementById('nav');
  const hamburger = document.getElementById('nav-hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
  });

  // Close mobile menu on link click
  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        if (lenis) {
          lenis.scrollTo(target, { offset: -80 });
        } else {
          const top = target.getBoundingClientRect().top + window.pageYOffset - 80;
          window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        }
      }
    });
  });

  // --- Page Animations (after preloader) ---
  function initPageAnimations(isReduced = false) {
    if (isReduced) {
      document.querySelectorAll('.hero-anim').forEach(el => {
        el.style.opacity = 1;
      });
      document.querySelectorAll('.title-line.hero-anim > span').forEach(el => {
        el.style.transform = 'translateY(0)';
      });
      document.querySelectorAll('.reveal-up').forEach(el => {
        el.style.opacity = 1;
        el.style.transform = 'translateY(0)';
      });
      return;
    }

    // Hero entrance
    const heroTl = gsap.timeline();
    heroTl
      .fromTo('.hero-badge',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
      )
      .fromTo('.title-line.hero-anim > span',
        { y: '110%' },
        { y: '0%', duration: 1, stagger: 0.12, ease: 'power4.out' },
        '-=0.4'
      )
      .fromTo('.title-line.hero-anim',
        { opacity: 0 },
        { opacity: 1, duration: 0.01 },
        '<'
      )
      .fromTo('.hero-sub',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
        '-=0.7'
      )
      .fromTo('.hero-ctas',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
        '-=0.5'
      )
      .fromTo('.hero-stats',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
        '-=0.4'
      )
      .fromTo('.scroll-indicator',
        { opacity: 0 },
        { opacity: 1, duration: 1, ease: 'power2.out' },
        '-=0.3'
      );

    // Counter animation
    animateCounters();

    // Scroll-triggered reveals
    initScrollReveals();

    // Process line animation
    initProcessLine();

    // Parallax orbs
    initParallax();

    // Card tilt effect
    initCardTilt();

    // Rotating headline text
    initRotatingText();
  }

  // --- Counter Animation ---
  function animateCounters() {
    document.querySelectorAll('[data-count]').forEach(counter => {
      const target = parseFloat(counter.getAttribute('data-count'));
      const isDecimal = target % 1 !== 0;

      ScrollTrigger.create({
        trigger: counter,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          gsap.to({ val: 0 }, {
            val: target,
            duration: 2,
            ease: 'power2.out',
            onUpdate: function () {
              counter.textContent = isDecimal
                ? this.targets()[0].val.toFixed(1)
                : Math.round(this.targets()[0].val);
            }
          });
        }
      });
    });
  }

  // --- Scroll Reveal ---
  function initScrollReveals() {
    const revealElements = document.querySelectorAll('.reveal-up');

    revealElements.forEach((el, i) => {
      // Skip hero elements (they're animated by the hero timeline)
      if (el.closest('.hero')) return;

      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(el, {
            y: 0,
            opacity: 1,
            duration: 0.8,
            delay: el.dataset.delay || 0,
            ease: 'power3.out',
          });
        }
      });
    });
  }

  // --- Process Line Fill ---
  function initProcessLine() {
    const processSection = document.querySelector('.process-timeline');
    if (!processSection) return;

    const lineFill = document.getElementById('process-line-fill');
    const steps = document.querySelectorAll('.process-step');

    ScrollTrigger.create({
      trigger: processSection,
      start: 'top 60%',
      end: 'bottom 40%',
      scrub: 1,
      onUpdate: (self) => {
        lineFill.style.height = `${self.progress * 100}%`;

        steps.forEach((step, i) => {
          const threshold = (i + 0.5) / steps.length;
          if (self.progress >= threshold) {
            step.classList.add('active');
          } else {
            step.classList.remove('active');
          }
        });
      }
    });
  }

  // --- Parallax ---
  function initParallax() {
    if (isTouch) return;
    gsap.to('.orb-1', {
      y: -100,
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      }
    });

    gsap.to('.orb-2', {
      y: -80,
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      }
    });

    gsap.to('.orb-3', {
      y: -60,
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      }
    });
  }

  // --- Card Tilt Effect ---
  function initCardTilt() {
    if (window.innerWidth <= 768) return;

    document.querySelectorAll('[data-tilt]').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        gsap.to(card, {
          rotateY: x * 5,
          rotateX: -y * 5,
          transformPerspective: 1000,
          duration: 0.4,
          ease: 'power2.out',
        });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          rotateY: 0,
          rotateX: 0,
          duration: 0.6,
          ease: 'elastic.out(1, 0.5)',
        });
      });
    });
  }

  // --- Rotating Text Animation ---
  function initRotatingText() {
    const words = document.querySelectorAll('.rotating-word');
    if (!words.length) return;

    let current = 0;
    const total = words.length;
    const stayDuration = 2.5; // seconds each word stays visible
    const animDuration = 0.6;

    function cycleWord() {
      const currentWord = words[current];
      const nextIndex = (current + 1) % total;
      const nextWord = words[nextIndex];

      // Animate current word out (slide up + fade)
      gsap.to(currentWord, {
        y: '-100%',
        rotateX: 40,
        opacity: 0,
        duration: animDuration,
        ease: 'power3.in',
        onComplete: () => {
          currentWord.classList.remove('active');
          // Reset position below for next cycle
          gsap.set(currentWord, { y: '100%', rotateX: -40, opacity: 0 });
        }
      });

      // Animate next word in (slide up from below)
      nextWord.classList.add('active');
      gsap.fromTo(nextWord,
        { y: '100%', rotateX: -40, opacity: 0 },
        {
          y: '0%',
          rotateX: 0,
          opacity: 1,
          duration: animDuration,
          ease: 'power3.out',
          delay: 0.1,
        }
      );

      current = nextIndex;
    }

    // Make sure the first word is visible
    gsap.set(words[0], { y: '0%', rotateX: 0, opacity: 1 });
    for (let i = 1; i < total; i++) {
      gsap.set(words[i], { y: '100%', rotateX: -40, opacity: 0 });
    }

    // Start cycling
    setInterval(cycleWord, (stayDuration + animDuration) * 1000);
  }

  // --- Flip Card ---
  document.querySelectorAll('[data-flip]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const cardInner = document.getElementById(btn.getAttribute('data-flip'));
      if (cardInner) {
        cardInner.classList.toggle('flipped');
      }
    });
  });

  // --- Marquee pause on hover ---
  const marqueeTrack = document.querySelector('.marquee-track');
  if (marqueeTrack) {
    marqueeTrack.addEventListener('mouseenter', () => {
      marqueeTrack.style.animationPlayState = 'paused';
    });
    marqueeTrack.addEventListener('mouseleave', () => {
      marqueeTrack.style.animationPlayState = 'running';
    });
  }

});
