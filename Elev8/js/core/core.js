/* ==========================================================================
   ELEV8 CALISTHENICS & FITNESS STUDIO — MAIN JAVASCRIPT
   ========================================================================== */

'use strict';

var reduceMotion = window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;


// ============================================================
// Navigation
// ============================================================

function initNavbarScroll() {
  var nav = document.querySelector('.navbar');
  if (!nav) return;
  var onScroll = function () {
    nav.classList.toggle('scrolled', window.scrollY > 24);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

function initMobileNavClose() {
  var links    = document.querySelectorAll('.navbar-nav .nav-link');
  var collapse = document.getElementById('menu');
  if (!collapse) return;
  links.forEach(function (link) {
    link.addEventListener('click', function () {
      if (collapse.classList.contains('show') && window.bootstrap) {
        var inst = window.bootstrap.Collapse.getInstance(collapse);
        if (inst) inst.hide();
      }
    });
  });
}

// Sets .active on the nav link whose href matches the current page filename.
// Replaces the old pattern of hardcoding class="active" in each HTML file.
function highlightActiveNav() {
  var current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar-nav .nav-link').forEach(function (link) {
    link.classList.toggle('active', link.getAttribute('href') === current);
  });
}


// ============================================================
// Scroll Reveal
// ============================================================

function initReveal() {
  var items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  if (reduceMotion || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
    return;
  }

  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  items.forEach(function (el) { obs.observe(el); });
}


// ============================================================
// Animated Counters
// ============================================================

function animateCount(el) {
  var target   = parseFloat(el.getAttribute('data-count'));
  var decimals = (el.getAttribute('data-decimals') || '0') | 0;
  var suffix   = el.getAttribute('data-suffix') || '';
  if (isNaN(target)) return;

  if (reduceMotion) {
    el.textContent = target.toFixed(decimals) + suffix;
    return;
  }

  var dur = 1400, start = null;
  function step(ts) {
    if (!start) start = ts;
    var p     = Math.min((ts - start) / dur, 1);
    var eased = 1 - Math.pow(1 - p, 3);
    el.textContent = (target * eased).toFixed(decimals) + suffix;
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function initCounters() {
  var nums = document.querySelectorAll('[data-count]');
  if (!nums.length) return;

  if (!('IntersectionObserver' in window)) {
    nums.forEach(animateCount);
    return;
  }

  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  nums.forEach(function (el) { obs.observe(el); });
}


// ============================================================
// Toast Notifications
// ============================================================

function showToast(message, type, duration) {
  type     = type     || 'success';
  duration = duration || 4000;

  var rack = document.getElementById('toast-rack');
  if (!rack) {
    rack    = document.createElement('div');
    rack.id = 'toast-rack';
    document.body.appendChild(rack);
  }

  var icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';

  var toast = document.createElement('div');
  toast.className = 'elev8-toast elev8-toast--' + type;
  toast.innerHTML =
    '<span class="toast-icon">' + icon + '</span>' +
    '<span class="toast-msg">'  + message + '</span>';

  rack.appendChild(toast);

  // Two rAF calls ensure the transition fires after the element is painted
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { toast.classList.add('visible'); });
  });

  setTimeout(function () {
    toast.classList.add('hiding');
    toast.classList.remove('visible');
    setTimeout(function () { if (toast.parentNode) toast.remove(); }, 400);
  }, duration);
}


// ============================================================
// Button Loading State
// ============================================================

function setButtonLoading(btn, loading) {
  if (!btn) return;
  if (loading) {
    btn.dataset.origText = btn.innerHTML;
    btn.innerHTML = '<span class="btn-spinner"></span>Please wait…';
    btn.disabled  = true;
  } else {
    btn.innerHTML = btn.dataset.origText || btn.innerHTML;
    btn.disabled  = false;
  }
}


// ============================================================
// Field Error Helpers
// ============================================================

function showFieldError(errId, message) {
  var errEl = document.getElementById(errId);
  if (!errEl) return;
  errEl.textContent = message;

  // Walk up to the nearest .elev8-field wrapper to add red border
  var field = errEl.closest('.elev8-field');
  if (field) field.classList.add('has-error');
}

function clearFormErrors(formEl) {
  if (!formEl) return;
  formEl.querySelectorAll('.field-err').forEach(function (el) {
    el.textContent = '';
  });
  formEl.querySelectorAll('.elev8-field').forEach(function (el) {
    el.classList.remove('has-error');
  });
}

// Maps server-returned { field: message } to the correct error <span>.
// Tries prefixes used by each form (su-, si-, fb-, da-) before falling back to bare id.
function applyServerErrors(errors) {
  if (!errors || typeof errors !== 'object') return;
  var prefixes = ['su-', 'si-', 'fb-', 'da-', ''];
  Object.keys(errors).forEach(function (field) {
    for (var i = 0; i < prefixes.length; i++) {
      var candidateId = prefixes[i] + field + 'Err';
      if (document.getElementById(candidateId)) {
        showFieldError(candidateId, errors[field]);
        return;
      }
    }
  });
}


// ============================================================
// Validation Utilities
// ============================================================

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidMobile(mobile) {
  var cleaned = mobile.replace(/\D/g, '');
  if (cleaned.length === 12 && cleaned.slice(0, 2) === '91') {
    cleaned = cleaned.slice(2);
  }
  return /^[6-9]\d{9}$/.test(cleaned);
}


// ============================================================
// Password Strength Meter
// ============================================================

function checkPasswordStrength(password) {
  var score = 0;
  if (password.length >= 8)          score++;
  if (password.length >= 12)         score++;
  if (/[A-Z]/.test(password))        score++;
  if (/[0-9]/.test(password))        score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  var labels  = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  var classes = ['', 'very-weak',  'weak', 'fair', 'strong', 'very-strong'];

  return { score: score, label: labels[score] || '', cls: classes[score] || '' };
}

function initPasswordStrength() {
  var input = document.getElementById('su-password');
  var bar   = document.getElementById('strengthBar');
  var label = document.getElementById('strengthLabel');
  if (!input || !bar || !label) return;

  input.addEventListener('input', function () {
    if (!this.value) {
      bar.className   = 'strength-bar';
      label.textContent = '';
      return;
    }
    var result      = checkPasswordStrength(this.value);
    bar.className   = 'strength-bar' + (result.cls ? ' ' + result.cls : '');
    label.textContent = result.label;
  });
}


// ============================================================
// CSRF Token + AJAX Helpers
// ============================================================

var _csrfToken = null;

async function getCSRFToken() {
  if (_csrfToken) return _csrfToken;
  try {
    var res  = await fetch('../php/csrf.php', { credentials: 'include' });
    var data = await res.json();
    _csrfToken = data.token || '';
  } catch (e) {
    _csrfToken = '';
  }
  return _csrfToken;
}

async function postJSON(url, payload) {
  var token = await getCSRFToken();
  var res   = await fetch(url, {
    method:      'POST',
    credentials: 'include',
    headers: {
      'Content-Type':  'application/json',
      'X-CSRF-Token':  token
    },
    body: JSON.stringify(payload)
  });
  return res.json();
}


// ============================================================
// Sign-Up Form
// ============================================================


// ============================================================
// Initialization
// ============================================================

function initPageTransitions() {
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href]');
    if (!link) return;
    var href = link.getAttribute('href');
    if (!href ||
        href.charAt(0) === '#' ||
        link.target === '_blank' ||
        /^(https?:|mailto:|tel:|javascript:)/i.test(href) ||
        document.body.classList.contains('page-leaving')) return;
    if (link.href === window.location.href) return;
    e.preventDefault();
    document.body.classList.add('page-leaving');
    var dest = link.href;
    setTimeout(function () { window.location.href = dest; }, 200);
  });
}

function initEnhancements() {
  initNavbarScroll();
  initReveal();
  initCounters();
  initMobileNavClose();
  initPageTransitions();
}

function initForms() {
  if (typeof initSignUpForm === 'function') initSignUpForm();
  if (typeof initSignInForm === 'function') initSignInForm();
  if (typeof initStarRating === 'function') initStarRating();
  if (typeof initFeedbackForm === 'function') initFeedbackForm();
  if (typeof initDeleteAccountForm === 'function') initDeleteAccountForm();
}

// Enhancements fire on DOMContentLoaded (or immediately if already parsed)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEnhancements);
} else {
  initEnhancements();
}

// All page inits fire after all resources are loaded
window.addEventListener('load', function () {
  highlightActiveNav();
  initForms();
  if (typeof initDashboard === 'function') initDashboard();
  if (typeof initContactPage === 'function') initContactPage();
  initAutoReveal();
  initFAQ();
  initGalleryFilter();
  initNewsletter();
});

// ============================================================
// Task 5 — Auto-Reveal on Scroll
// Applies .auto-reveal to key selectors without touching HTML.
// Elements already in the viewport on load are marked .in
// immediately so they never flash as hidden.
// ============================================================

function initAutoReveal() {
  if (reduceMotion || !('IntersectionObserver' in window)) return;

  var SELECTORS = [
    '.program-card',
    '.trainer-card',
    '.mem-card',
    '.contact-channel',
    '.dash-stat',
    '.booking-item',
    '.payment-item',
  ];

  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.10, rootMargin: '0px 0px -6% 0px' });

  SELECTORS.forEach(function (sel) {
    // Group by immediate parent so stagger resets per section
    var groups = new Map();
    document.querySelectorAll(sel).forEach(function (el) {
      if (el.classList.contains('reveal') || el.classList.contains('auto-reveal')) return;
      var parent = el.parentElement || document.body;
      if (!groups.has(parent)) groups.set(parent, []);
      groups.get(parent).push(el);
    });

    groups.forEach(function (els) {
      els.forEach(function (el, i) {
        var rect   = el.getBoundingClientRect();
        var inView = rect.top < window.innerHeight && rect.bottom > 0;
        el.classList.add('auto-reveal');
        if (inView) {
          // Already visible — skip hidden state, mark in immediately
          el.classList.add('in');
          return;
        }
        if (i > 0 && i <= 6) el.setAttribute('data-delay', String(i));
        obs.observe(el);
      });
    });
  });
}


// ============================================================
// Task 5 — FAQ Accordion
// Wires up .faq-btn clicks to toggle .faq-body/.faq-item.
// Relies on CSS max-height transition already in place.
// ============================================================

function initFAQ() {
  var items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  items.forEach(function (item) {
    var btn  = item.querySelector('.faq-btn');
    var body = item.querySelector('.faq-body');
    if (!btn || !body) return;

    btn.setAttribute('aria-expanded', 'false');

    btn.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');

      // Collapse every item
      items.forEach(function (other) {
        if (other.classList.contains('open')) {
          other.classList.remove('open');
          var ob = other.querySelector('.faq-body');
          var ob_btn = other.querySelector('.faq-btn');
          if (ob)     ob.classList.remove('open');
          if (ob_btn) ob_btn.setAttribute('aria-expanded', 'false');
        }
      });

      // Open clicked item if it was closed
      if (!isOpen) {
        item.classList.add('open');
        body.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
}


function initGalleryFilter() {
  var bar = document.getElementById('galleryFilterBar');
  if (!bar) return;
  bar.addEventListener('click', function(e) {
    var btn = e.target.closest('.gallery-filter-btn');
    if (!btn) return;
    var cat = btn.dataset.cat;
    bar.querySelectorAll('.gallery-filter-btn').forEach(function(b) {
      b.classList.toggle('active', b === btn);
    });
    document.querySelectorAll('.gallery-item').forEach(function(item) {
      if (cat === 'all' || item.dataset.category === cat) {
        item.style.opacity = '1';
        item.style.display = '';
      } else {
        item.style.opacity = '0';
        setTimeout(function() {
          if (item.style.opacity === '0') item.style.display = 'none';
        }, 320);
      }
    });
  });
}

/* ===========================================================
   Newsletter form — client-side feedback only
   =========================================================== */
function initNewsletter() {
  var form = document.getElementById('newsletterForm');
  if (!form) return;
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var emailEl = form.querySelector('#nl-email');
    var msgEl = document.getElementById('nlMsg');
    var email = emailEl ? emailEl.value.trim() : '';
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (msgEl) { msgEl.textContent = 'Please enter a valid email address.'; msgEl.style.color = '#ef4444'; }
      return;
    }
    if (msgEl) { msgEl.textContent = "You're subscribed! Welcome to the ELEV8 community."; msgEl.style.color = '#22c55e'; }
    if (emailEl) emailEl.value = '';
    var btn = form.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = true; btn.textContent = 'Subscribed!'; }
  });
}


