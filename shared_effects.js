/* ═══════════════════════════════════════════════════════════════
   shared_effects.js  —  Ambient Interactions & Modern FX
   Cursor glow · Scroll reveals · Magnetic buttons · 3D card tilt
   ═══════════════════════════════════════════════════════════════ */

(function(){
  'use strict';

  /* ─── 1. CUSTOM CURSOR GLOW ─── */
  const cursorGlow = document.createElement('div');
  cursorGlow.id = 'cursor-glow';
  Object.assign(cursorGlow.style, {
    position:'fixed', top:'0', left:'0', width:'300px', height:'300px',
    borderRadius:'50%', pointerEvents:'none', zIndex:'9998',
    background:'radial-gradient(circle, rgba(0,240,255,0.08) 0%, transparent 70%)',
    transform:'translate(-50%, -50%)', transition:'opacity 0.3s',
    opacity:'0', willChange:'transform'
  });
  document.body.appendChild(cursorGlow);

  let mouseX = -999, mouseY = -999;
  let glowActive = false;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX; mouseY = e.clientY;
    if (!glowActive) { glowActive = true; cursorGlow.style.opacity = '1'; }
  });
  document.addEventListener('mouseleave', () => { cursorGlow.style.opacity = '0'; glowActive = false; });

  function updateGlow() {
    cursorGlow.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    requestAnimationFrame(updateGlow);
  }
  requestAnimationFrame(updateGlow);

  /* ─── 2. SCROLL REVEAL (IntersectionObserver) ─── */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  function initScrollReveal() {
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
  }

  /* Add reveal CSS dynamically */
  const revealCSS = document.createElement('style');
  revealCSS.textContent = `
    .reveal { opacity: 0; transform: translateY(30px); transition: opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1); }
    .reveal.revealed { opacity: 1; transform: translateY(0); }
    .reveal-delay-1 { transition-delay: 0.1s !important; }
    .reveal-delay-2 { transition-delay: 0.2s !important; }
    .reveal-delay-3 { transition-delay: 0.3s !important; }
    .reveal-delay-4 { transition-delay: 0.4s !important; }
    .reveal-delay-5 { transition-delay: 0.5s !important; }
  `;
  document.head.appendChild(revealCSS);

  /* ─── 3. 3D TILT ON CARDS ─── */
  function initTiltCards() {
    document.querySelectorAll('.tilt-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2, cy = rect.height / 2;
        const rotateX = ((y - cy) / cy) * -8;
        const rotateY = ((x - cx) / cx) * 8;
        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02,1.02,1.02)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale3d(1,1,1)';
      });
      card.style.transition = 'transform 0.15s ease-out';
    });
  }

  /* ─── 4. MAGNETIC BUTTONS ─── */
  function initMagneticButtons() {
    document.querySelectorAll('.magnetic').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0,0)';
        btn.style.transition = 'transform 0.4s cubic-bezier(0.22,1,0.36,1)';
      });
      btn.addEventListener('mouseenter', () => { btn.style.transition = 'none'; });
    });
  }

  /* ─── 5. SMOOTH SECTION SCROLL (for anchor links) ─── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ─── 6. TYPING EFFECT UTILITY ─── */
  window.typeWriter = function(element, text, speed = 40) {
    return new Promise(resolve => {
      element.textContent = '';
      let i = 0;
      function type() {
        if (i < text.length) {
          element.textContent += text.charAt(i);
          i++;
          setTimeout(type, speed);
        } else { resolve(); }
      }
      type();
    });
  };

  /* ─── 7. NUMBER COUNT-UP ANIMATION ─── */
  window.animateCount = function(element, target, duration = 1200) {
    const start = performance.now();
    const from = parseInt(element.textContent) || 0;
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      element.textContent = Math.round(from + (target - from) * ease);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  };

  /* ─── 8. SPOTLIGHT GRADIENT ON CARDS ─── */
  function initSpotlight() {
    document.querySelectorAll('.spotlight').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--spotlight-x', x + '%');
        card.style.setProperty('--spotlight-y', y + '%');
      });
    });
  }

  /* ─── 9. KINETIC SCROLL PROGRESS ─── */
  const scrollBar = document.createElement('div');
  scrollBar.id = 'scroll-progress';
  Object.assign(scrollBar.style, {
    position:'fixed', top:'0', left:'0', height:'2px', zIndex:'10001',
    background:'linear-gradient(90deg, var(--accent-cyan), var(--accent-purple), var(--accent-pink))',
    width:'0%', transition:'width 0.1s linear'
  });
  document.body.appendChild(scrollBar);

  window.addEventListener('scroll', () => {
    const p = window.scrollY / (document.body.scrollHeight - window.innerHeight);
    scrollBar.style.width = (p * 100) + '%';
  }, { passive: true });

  /* ─── INIT ─── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initScrollReveal(); initTiltCards(); initMagneticButtons(); initSpotlight();
    });
  } else {
    initScrollReveal(); initTiltCards(); initMagneticButtons(); initSpotlight();
  }

})();
