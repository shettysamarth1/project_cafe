/**
 * COVERSE CAFE, MANGALURU
 * Master Atmospheric & Scroll-Linked Photo Engine
 * Reversible scroll scrubbing across 3 authentic Coverse scenes,
 * organic lighting transitions, and minimal editorial interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const header = document.getElementById('siteHeader');
  const journeySection = document.getElementById('journey');
  const slides = document.querySelectorAll('.journey-slide');
  const hudIndicator = document.getElementById('hudIndicator');
  const hudPills = document.querySelectorAll('.hud-pill');
  const categoryBtns = document.querySelectorAll('.category-btn');
  const activeCategoryTitle = document.getElementById('activeCategoryTitle');
  const ambienceToggle = document.getElementById('ambienceToggle');
  const ambienceText = document.getElementById('ambienceText');
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerLinks = document.querySelectorAll('.drawer-link');
  const navItems = document.querySelectorAll('.nav-item');

  // Gentle acoustic feedback for ambience switch
  let audioCtx = null;
  function playAcousticChime(isSunlit) {
    try {
      if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();

      osc.type = 'sine';
      const start = isSunlit ? 380 : 480;
      const end = isSunlit ? 560 : 320;

      osc.frequency.setValueAtTime(start, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(end, audioCtx.currentTime + 0.3);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1100, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.06, audioCtx.currentTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.45);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      // Audio not supported or blocked, continue silently
    }
  }

  // =========================================================================
  // 1. HEADER COMPACTION & SECTION ACTIVE TRACKING
  // =========================================================================
  function handleHeaderState() {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Active Section Tracking
    const sections = ['home', 'journey', 'menu', 'reviews', 'visit'];
    let current = 'home';
    const checkPoint = window.scrollY + window.innerHeight * 0.35;

    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        const top = el.offsetTop;
        const height = el.offsetHeight;
        if (checkPoint >= top && checkPoint < top + height) {
          current = id;
        }
      }
    });

    navItems.forEach(item => {
      const sec = item.getAttribute('data-section');
      if (sec === current) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  window.addEventListener('scroll', handleHeaderState, { passive: true });
  handleHeaderState();

  // =========================================================================
  // 2. CONTINUOUS SCROLL-LINKED PHOTO EXPERIENCE (3 AUTHENTIC SCENES)
  // Reversible, smooth, strictly linked to scroll position
  // =========================================================================
  let targetProgress = 0;
  let currentProgress = 0;
  const numSlides = slides.length; // 3 authentic Coverse scenes

  function calculateScrollProgress() {
    if (!journeySection) return;
    const scrollableDistance = journeySection.offsetHeight - window.innerHeight;
    if (scrollableDistance <= 0) return;

    const journeyTop = window.scrollY - journeySection.offsetTop;
    let progress = journeyTop / scrollableDistance;

    // Clamp strictly between 0 and 1
    targetProgress = Math.max(0, Math.min(1, progress));
  }

  // Linear Interpolation (Lerp) Frame Loop
  function renderJourneyFrame() {
    // Smooth lerp easing
    currentProgress += (targetProgress - currentProgress) * 0.12;

    // Segment length = 1 / (numSlides - 1) = 0.5 for 3 slides
    const segmentLength = 1 / (numSlides - 1);
    const virtualIndex = currentProgress / segmentLength; // 0.0 to 2.0
    const baseIndex = Math.min(Math.floor(virtualIndex), numSlides - 2);
    const segmentRatio = (currentProgress - (baseIndex * segmentLength)) / segmentLength;
    const clampedRatio = Math.max(0, Math.min(1, segmentRatio));

    // Update HUD Indicator Line
    if (hudIndicator) {
      hudIndicator.style.width = `${currentProgress * 100}%`;
    }

    // Update HUD Active Pill
    const activePillIndex = Math.round(virtualIndex);
    hudPills.forEach((pill, idx) => {
      pill.classList.toggle('active', idx === activePillIndex);
    });

    // Update individual slide opacities, transforms, and blur
    slides.forEach((slide, index) => {
      const photo = slide.querySelector('.slide-photo');
      const caption = slide.querySelector('.slide-caption');

      let opacity = 0;
      let scale = 1.05;
      let translateY = 0;
      let blur = 0;

      if (index === baseIndex) {
        // Exiting slide as user scrolls down
        opacity = 1 - clampedRatio;
        scale = 1.0 + (0.05 * (1 - clampedRatio));
        translateY = -22 * clampedRatio;
        blur = clampedRatio * 2.5;
      } else if (index === baseIndex + 1) {
        // Entering slide as user scrolls down
        opacity = clampedRatio;
        scale = 1.05 - (0.05 * clampedRatio);
        translateY = 22 * (1 - clampedRatio);
        blur = (1 - clampedRatio) * 2.5;
      } else {
        opacity = 0;
        scale = 1.05;
        translateY = 25;
        blur = 3;
      }

      slide.style.opacity = opacity.toFixed(4);
      slide.style.visibility = opacity > 0.005 ? 'visible' : 'hidden';

      if (photo) {
        photo.style.transform = `scale(${scale.toFixed(3)}) translateY(${translateY.toFixed(1)}px)`;
        photo.style.filter = `contrast(1.06) brightness(0.82) blur(${blur.toFixed(1)}px)`;
      }

      if (caption) {
        caption.style.opacity = Math.pow(opacity, 1.3).toFixed(3);
        caption.style.transform = `translateY(${(translateY * 0.6).toFixed(1)}px)`;
      }
    });

    requestAnimationFrame(renderJourneyFrame);
  }

  window.addEventListener('scroll', calculateScrollProgress, { passive: true });
  window.addEventListener('resize', calculateScrollProgress);
  calculateScrollProgress();
  requestAnimationFrame(renderJourneyFrame);

  // Click on HUD pills to jump directly to that stage
  hudPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      const step = parseInt(pill.getAttribute('data-step'), 10);
      if (!journeySection) return;
      const scrollableDistance = journeySection.offsetHeight - window.innerHeight;
      const segment = 1 / (numSlides - 1);
      const targetScroll = journeySection.offsetTop + (step * segment * scrollableDistance) + 5;
      window.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
    });
  });

  // =========================================================================
  // 3. EDITORIAL MENU CATEGORY TABS
  // =========================================================================
  const categoryNames = {
    'coffee': 'Artisanal Coffee',
    'cold-coffee': 'Slow-Brewed Cold Coffee',
    'tea': 'Single Estate & Botanical Teas',
    'food': 'Social Dining & Fresh Plates',
    'desserts': 'House Artisanal Desserts'
  };

  categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.getAttribute('data-category');

      // Update active tab
      categoryBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      // Update title with smooth fade
      if (activeCategoryTitle && categoryNames[category]) {
        activeCategoryTitle.style.opacity = '0';
        setTimeout(() => {
          activeCategoryTitle.textContent = categoryNames[category];
          activeCategoryTitle.style.opacity = '1';
        }, 150);
      }
    });
  });

  // =========================================================================
  // 4. INTERACTIVE ATMOSPHERE SWITCH (PHOTO 2 ON SWITCH)
  // =========================================================================
  if (ambienceToggle) {
    ambienceToggle.addEventListener('click', () => {
      const isSunlit = document.body.classList.toggle('theme-sunlit');
      playAcousticChime(isSunlit);

      if (ambienceText) {
        ambienceText.textContent = isSunlit ? 'SUNLIT' : 'EVENING';
      }
    });
  }

  // =========================================================================
  // 5. MOBILE DRAWER NAVIGATION
  // =========================================================================
  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.toggle('open');
      mobileToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    drawerLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
});
