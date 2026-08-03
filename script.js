/* ==========================================================================
   AeroBridge — Aviation Maintenance Referral Network
   script.js
   Vanilla JS, no dependencies, no build step.
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
     CONFIG — where the referral form posts.
     Leave empty ('') to run in demo mode: the form validates and shows a
     confirmation without sending anything anywhere. Set it to your form
     endpoint (Formspree, Basin, a Vercel serverless route like
     '/api/request', etc.) to send real submissions.
  ------------------------------------------------------------------ */
  var FORM_ENDPOINT = '';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* Mark that JS is running (CSS falls back to fully visible without it). */
  document.documentElement.classList.remove('no-js');

  /* ==================================================================
     1. Scroll reveal — fade + slide, fast and subtle
     ================================================================== */
  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    /* Reduced motion or no IntersectionObserver: show everything at once. */
    if (reduceMotion.matches || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible', 'is-done'); });
      return;
    }

    /* data-delay drives a small stagger inside each group (0–5 → 0–275ms). */
    items.forEach(function (el) {
      var d = parseInt(el.getAttribute('data-delay'), 10);
      if (d > 0) el.style.setProperty('--reveal-delay', String(Math.min(d, 6)));
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add('is-visible');
        observer.unobserve(el);
        el.addEventListener('transitionend', function onEnd() {
          el.classList.add('is-done');
          el.removeEventListener('transitionend', onEnd);
        });
      });
    }, {
      /* Fire slightly before the element is fully on screen so it feels
         responsive rather than late, and trigger early on short screens. */
      rootMargin: '0px 0px -8% 0px',
      threshold: 0.06
    });

    items.forEach(function (el) { observer.observe(el); });

    /* Reveal anything already within the viewport without waiting for a
       scroll. Run this more than once: a page opened in a background tab has
       throttled rAF and no IntersectionObserver delivery until it is shown,
       so without the visibilitychange pass the first screenful could stay
       blank when the user finally switches to it. */
    function sweep() {
      items.forEach(function (el) {
        if (el.classList.contains('is-visible')) return;
        var rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.classList.add('is-visible');
          observer.unobserve(el);
        }
      });
    }

    requestAnimationFrame(sweep);
    window.addEventListener('load', sweep);
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible') sweep();
    });

    /* If the user turns reduced motion on mid-session, stop animating. */
    var onChange = function () {
      if (!reduceMotion.matches) return;
      items.forEach(function (el) { el.classList.add('is-visible', 'is-done'); });
    };
    if (reduceMotion.addEventListener) reduceMotion.addEventListener('change', onChange);
    else if (reduceMotion.addListener) reduceMotion.addListener(onChange);
  }

  /* ==================================================================
     2. Smooth scrolling (hero CTA + in-page links), header-aware
     ================================================================== */
  function headerOffset() {
    var header = document.getElementById('siteHeader');
    return header ? header.offsetHeight + 12 : 0;
  }

  function scrollToTarget(target) {
    var top = window.pageYOffset + target.getBoundingClientRect().top - headerOffset();
    /* 'instant' forces an immediate jump; 'auto' would defer to the CSS
       scroll-behavior, so it is not a substitute here. Browsers that reject
       'instant' throw on the dictionary conversion and fall through to the
       two-argument form, which is also immediate. */
    var behavior = reduceMotion.matches ? 'instant' : 'smooth';

    try {
      window.scrollTo({ top: Math.max(top, 0), behavior: behavior });
    } catch (e) {
      window.scrollTo(0, Math.max(top, 0)); /* very old browsers */
    }

    /* Move keyboard focus to the destination without a second jump. */
    var hadTabindex = target.hasAttribute('tabindex');
    if (!hadTabindex) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    if (!hadTabindex) {
      target.addEventListener('blur', function onBlur() {
        target.removeAttribute('tabindex');
        target.removeEventListener('blur', onBlur);
      });
    }
  }

  function initSmoothScroll() {
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;

      var hash = link.getAttribute('href');
      if (!hash || hash === '#') return;

      var target = document.querySelector(hash);
      if (!target) return;

      e.preventDefault();
      closeNav();
      scrollToTarget(target);

      /* Keep the URL shareable without triggering a native jump. */
      if (window.history && history.pushState) history.pushState(null, '', hash);
    });
  }

  /* ==================================================================
     3. Mobile navigation
     ================================================================== */
  var navToggle = document.getElementById('navToggle');
  var primaryNav = document.getElementById('primaryNav');

  function closeNav() {
    if (!navToggle || !primaryNav) return;
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
    primaryNav.classList.remove('is-open');
  }

  function initNav() {
    if (!navToggle || !primaryNav) return;

    navToggle.addEventListener('click', function () {
      var open = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!open));
      navToggle.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
      primaryNav.classList.toggle('is-open', !open);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && primaryNav.classList.contains('is-open')) {
        closeNav();
        navToggle.focus();
      }
    });

    window.addEventListener('resize', function () {
      /* Must match the nav collapse breakpoint in styles.css. */
      if (window.innerWidth > 900) closeNav();
    });
  }

  /* ==================================================================
     4. Header state on scroll
     ================================================================== */
  function initHeaderScroll() {
    var header = document.getElementById('siteHeader');
    if (!header) return;

    var ticking = false;
    function update() {
      header.classList.toggle('is-scrolled', window.pageYOffset > 12);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }, { passive: true });
    update();
  }

  /* ==================================================================
     5. FAQ accordion (accessible, one open at a time)
     ================================================================== */
  function initFaq() {
    var buttons = document.querySelectorAll('.faq-q');
    if (!buttons.length) return;

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var panel = document.getElementById(btn.getAttribute('aria-controls'));
        var isOpen = btn.getAttribute('aria-expanded') === 'true';

        /* Close siblings for a tidy, scannable list. */
        buttons.forEach(function (other) {
          if (other === btn) return;
          other.setAttribute('aria-expanded', 'false');
          var otherPanel = document.getElementById(other.getAttribute('aria-controls'));
          if (otherPanel) otherPanel.hidden = true;
        });

        btn.setAttribute('aria-expanded', String(!isOpen));
        if (panel) panel.hidden = isOpen;
      });
    });
  }

  /* ==================================================================
     6. Referral request form
     ================================================================== */
  var FIELD_LABELS = {
    name: 'Please enter your name.',
    email: 'Please enter a valid email address.',
    phone: 'Please enter a phone number we can reach you at.',
    location: 'Please tell us the airport or location of the aircraft.',
    aircraftType: 'Please select an aircraft type.',
    maintenanceNeeded: 'Please select the type of maintenance needed.',
    urgency: 'Please select how urgent this is.',
    consent: 'Please confirm we may share your request with providers.'
  };

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function showError(id, message) {
    var errEl = document.getElementById(id + '-err');
    var input = document.getElementById(id) ||
                document.querySelector('[name="' + id + '"]');
    if (errEl) {
      errEl.textContent = message;
      errEl.hidden = false;
    }
    if (input) input.setAttribute('aria-invalid', 'true');
  }

  function clearError(id) {
    var errEl = document.getElementById(id + '-err');
    var input = document.getElementById(id) ||
                document.querySelector('[name="' + id + '"]');
    if (errEl) { errEl.hidden = true; errEl.textContent = ''; }
    if (input) input.removeAttribute('aria-invalid');
  }

  function setStatus(el, type, title, message) {
    el.className = 'form-status is-' + type;
    el.innerHTML = '';
    var strong = document.createElement('strong');
    strong.textContent = title;
    var span = document.createElement('span');
    span.textContent = message;
    el.appendChild(strong);
    el.appendChild(span);
    el.hidden = false;
  }

  function initForm() {
    var form = document.getElementById('requestForm');
    if (!form) return;

    var statusEl = document.getElementById('formStatus');
    var submitBtn = document.getElementById('submitBtn');

    /* Clear a field's error as soon as the user starts fixing it. */
    Object.keys(FIELD_LABELS).forEach(function (id) {
      var el = form.elements[id];
      if (!el) return;
      var nodes = el.length && !el.tagName ? Array.prototype.slice.call(el) : [el];
      nodes.forEach(function (node) {
        node.addEventListener('input', function () { clearError(id); });
        node.addEventListener('change', function () { clearError(id); });
      });
    });

    function validate() {
      var data = new FormData(form);
      var errors = [];

      function val(k) { return (data.get(k) || '').toString().trim(); }

      if (!val('name')) errors.push('name');
      if (!EMAIL_RE.test(val('email'))) errors.push('email');
      /* Loose phone check: at least 7 digits, any common formatting. */
      if (val('phone').replace(/\D/g, '').length < 7) errors.push('phone');
      if (!val('location')) errors.push('location');
      if (!val('aircraftType')) errors.push('aircraftType');
      if (!val('maintenanceNeeded')) errors.push('maintenanceNeeded');
      if (!val('urgency')) errors.push('urgency');
      if (!form.elements.consent.checked) errors.push('consent');

      Object.keys(FIELD_LABELS).forEach(clearError);
      errors.forEach(function (id) { showError(id, FIELD_LABELS[id]); });

      return { ok: errors.length === 0, first: errors[0], data: data };
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var result = validate();

      if (!result.ok) {
        setStatus(statusEl, 'error', 'Please check the highlighted fields.',
          'A few required details are missing or incomplete.');
        var firstEl = document.getElementById(result.first) ||
                      form.querySelector('[name="' + result.first + '"]');
        if (firstEl) {
          scrollToTarget(firstEl.closest('.field, .fieldset') || firstEl);
          firstEl.focus({ preventScroll: true });
        }
        return;
      }

      /* Honeypot: silently accept and drop obvious bot submissions. */
      if ((result.data.get('company') || '').toString().trim() !== '') {
        form.reset();
        setStatus(statusEl, 'success', 'Request received.',
          'Thank you — we will be in touch shortly.');
        return;
      }

      var payload = {};
      result.data.forEach(function (value, key) {
        if (key !== 'company') payload[key] = value;
      });
      payload.submittedAt = new Date().toISOString();

      submitBtn.disabled = true;
      var originalLabel = submitBtn.textContent;
      submitBtn.textContent = 'Sending…';

      function succeed() {
        form.reset();
        Object.keys(FIELD_LABELS).forEach(clearError);
        setStatus(statusEl, 'success', 'Request received.',
          'Thanks — we\'ll review your request and follow up with matched ' +
          'maintenance providers. AOG requests are triaged first.');
        statusEl.focus && statusEl.focus();
        scrollToTarget(statusEl);
      }

      function fail() {
        setStatus(statusEl, 'error', 'That didn\'t go through.',
          'Please try again, or email dispatch@example.com with your aircraft ' +
          'type, location, and what you need.');
      }

      function done() {
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
      }

      /* Demo mode: no endpoint configured yet. */
      if (!FORM_ENDPOINT) {
        console.info('[AeroBridge] Demo mode — no FORM_ENDPOINT set. Payload:', payload);
        window.setTimeout(function () { succeed(); done(); }, 450);
        return;
      }

      fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          if (!res.ok) throw new Error('Request failed: ' + res.status);
          succeed();
        })
        .catch(function (err) {
          console.error('[AeroBridge] Submission failed:', err);
          fail();
        })
        .then(done);
    });
  }

  /* ==================================================================
     7. Footer year
     ================================================================== */
  function initYear() {
    var el = document.getElementById('year');
    if (el) el.textContent = String(new Date().getFullYear());
  }

  /* ==================================================================
     Boot
     ================================================================== */
  function init() {
    initReveal();
    initSmoothScroll();
    initNav();
    initHeaderScroll();
    initFaq();
    initForm();
    initYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
