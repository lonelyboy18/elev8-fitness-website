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

function initSignUpForm() {
  var form = document.getElementById('signupForm');
  if (!form) return;

  initPasswordStrength();

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    clearFormErrors(form);

    var name     = (document.getElementById('su-name')     || {}).value || '';
    var email    = (document.getElementById('su-email')    || {}).value || '';
    var mobile   = (document.getElementById('su-mobile')   || {}).value || '';
    var password = (document.getElementById('su-password') || {}).value || '';
    var planEl   = form.querySelector('input[name="plan"]:checked');
    var plan     = planEl ? planEl.value : '';
    var btn      = document.getElementById('signupBtn');

    name   = name.trim();
    email  = email.trim();
    mobile = mobile.trim();

    // ── Frontend validation ──────────────────────────────────
    var hasErr = false;

    if (!name) {
      showFieldError('su-nameErr', 'Full name is required.'); hasErr = true;
    }
    if (!email) {
      showFieldError('su-emailErr', 'Email is required.'); hasErr = true;
    } else if (!isValidEmail(email)) {
      showFieldError('su-emailErr', 'Enter a valid email address.'); hasErr = true;
    }
    if (!mobile) {
      showFieldError('su-mobileErr', 'Mobile number is required.'); hasErr = true;
    } else if (!isValidMobile(mobile)) {
      showFieldError('su-mobileErr', 'Enter a valid 10-digit Indian mobile number.'); hasErr = true;
    }
    if (!password) {
      showFieldError('su-passwordErr', 'Password is required.'); hasErr = true;
    } else if (password.length < 8) {
      showFieldError('su-passwordErr', 'Password must be at least 8 characters.'); hasErr = true;
    }
    if (!plan) {
      showFieldError('su-planErr', 'Please choose a program.'); hasErr = true;
    }

    if (hasErr) return;

    // ── Submit ───────────────────────────────────────────────
    setButtonLoading(btn, true);
    try {
      var data = await postJSON('../php/register.php', {
        name: name, email: email, mobile: mobile, password: password, plan: plan
      });

      if (data.success) {
        showToast(data.message, 'success', 3000);
        setTimeout(function () {
          window.location.href = data.redirect || 'index.html';
        }, 1600);
      } else if (data.errors) {
        applyServerErrors(data.errors);
      } else {
        showToast(data.message || 'Registration failed. Please try again.', 'error');
      }
    } catch (err) {
      showToast('Network error — is XAMPP running?', 'error');
    } finally {
      setButtonLoading(btn, false);
    }
  });
}


// ============================================================
// Sign-In Form
// ============================================================

function initSignInForm() {
  var form = document.getElementById('signinForm');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    clearFormErrors(form);

    var email    = ((document.getElementById('si-email')    || {}).value || '').trim();
    var password = ((document.getElementById('si-password') || {}).value || '');
    var btn      = document.getElementById('signinBtn');

    var hasErr = false;
    if (!email) {
      showFieldError('si-emailErr', 'Email is required.'); hasErr = true;
    } else if (!isValidEmail(email)) {
      showFieldError('si-emailErr', 'Enter a valid email address.'); hasErr = true;
    }
    if (!password) {
      showFieldError('si-passwordErr', 'Password is required.'); hasErr = true;
    }
    if (hasErr) return;

    setButtonLoading(btn, true);
    try {
      var data = await postJSON('../php/login.php', { email: email, password: password });

      if (data.success) {
        showToast(data.message, 'success', 2500);
        setTimeout(function () {
          window.location.href = data.redirect || 'index.html';
        }, 1200);
      } else if (data.errors) {
        applyServerErrors(data.errors);
      } else {
        showToast(data.message || 'Sign-in failed. Please try again.', 'error');
      }
    } catch (err) {
      showToast('Network error — is XAMPP running?', 'error');
    } finally {
      setButtonLoading(btn, false);
    }
  });
}


// ============================================================
// Emoji Star Rating (Feedback page)
// ============================================================

function initStarRating() {
  var stars       = document.querySelectorAll('.star');
  var ratingInput = document.getElementById('ratingValue');
  var ratingMsg   = document.getElementById('ratingFeedback');
  if (!stars.length || !ratingInput) return;

  var messages = {
    '1': '😢  Very Bad — we\'re sorry to hear that!',
    '2': '😞  Poor — please tell us how we can improve.',
    '3': '😐  Average — what can we do better?',
    '4': '😊  Good — great to hear!',
    '5': '😄  Excellent — thank you so much!'
  };

  function setRating(val) {
    ratingInput.value = val;
    stars.forEach(function (s) {
      s.classList.toggle('active', s.dataset.value <= val);
      s.style.filter = s.dataset.value <= val
        ? 'grayscale(0%) opacity(1)'
        : 'grayscale(100%) opacity(0.45)';
    });
    if (ratingMsg) {
      ratingMsg.textContent = messages[val] || '';
      ratingMsg.style.display = val ? 'block' : 'none';
    }
    var errEl = document.getElementById('fb-ratingErr');
    if (errEl) errEl.textContent = '';
  }

  stars.forEach(function (star) {
    star.addEventListener('click',   function () { setRating(this.dataset.value); });
    star.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setRating(this.dataset.value); }
    });
    star.addEventListener('mouseenter', function () {
      var val = this.dataset.value;
      stars.forEach(function (s) {
        s.style.filter = s.dataset.value <= val
          ? 'grayscale(0%) opacity(1)'
          : 'grayscale(100%) opacity(0.45)';
      });
    });
  });

  var container = document.getElementById('starRating');
  if (container) {
    container.addEventListener('mouseleave', function () {
      var selected = ratingInput.value;
      stars.forEach(function (s) {
        s.style.filter = (selected && s.dataset.value <= selected)
          ? 'grayscale(0%) opacity(1)'
          : 'grayscale(100%) opacity(0.45)';
      });
    });
  }
}


// ============================================================
// Live Rating Stats (fetched from rating_stats.php)
// ============================================================

async function loadRatingStats() {
  var avgEl   = document.getElementById('liveAvg');
  var countEl = document.getElementById('liveCount');
  if (!avgEl && !countEl) return;

  try {
    var res  = await fetch('../php/rating_stats.php', { credentials: 'include' });
    var data = await res.json();
    if (data.success) {
      if (avgEl) {
        avgEl.textContent = data.count > 0
          ? data.average + ' / 5'
          : 'No ratings yet';
      }
      if (countEl) {
        countEl.textContent = data.count > 0
          ? 'Based on ' + data.count + ' review' + (data.count !== 1 ? 's' : '')
          : '';
      }
    }
  } catch (e) {
    if (avgEl)   avgEl.textContent   = '—';
    if (countEl) countEl.textContent = '';
  }
}


// ============================================================
// Feedback Form
// ============================================================

function initFeedbackForm() {
  var form = document.getElementById('feedbackForm');
  if (!form) return;

  loadRatingStats();

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    clearFormErrors(form);

    var name     = ((document.getElementById('fb-name')     || {}).value || '').trim();
    var email    = ((document.getElementById('fb-email')    || {}).value || '').trim();
    var rating   = parseInt((document.getElementById('ratingValue') || {}).value || '0', 10);
    var feedback = ((document.getElementById('fb-feedback') || {}).value || '').trim();
    var btn      = document.getElementById('feedbackBtn');

    var hasErr = false;
    if (!name) {
      showFieldError('fb-nameErr', 'Your name is required.'); hasErr = true;
    }
    if (!email) {
      showFieldError('fb-emailErr', 'Email is required.'); hasErr = true;
    } else if (!isValidEmail(email)) {
      showFieldError('fb-emailErr', 'Enter a valid email address.'); hasErr = true;
    }
    if (!rating || rating < 1 || rating > 5) {
      showFieldError('fb-ratingErr', 'Please rate your experience.'); hasErr = true;
    }
    if (!feedback) {
      showFieldError('fb-feedbackErr', 'Please write your feedback.'); hasErr = true;
    } else if (feedback.length < 10) {
      showFieldError('fb-feedbackErr', 'Feedback must be at least 10 characters.'); hasErr = true;
    }
    if (hasErr) return;

    setButtonLoading(btn, true);
    try {
      var data = await postJSON('../php/submit_feedback.php', {
        name: name, email: email, rating: rating, feedback: feedback
      });

      if (data.success) {
        showToast(data.message, 'success', 5000);
        form.reset();
        document.querySelectorAll('.star').forEach(function (s) {
          s.classList.remove('active');
          s.style.filter = '';
        });
        var ratingFeedbackEl = document.getElementById('ratingFeedback');
        if (ratingFeedbackEl) { ratingFeedbackEl.textContent = ''; ratingFeedbackEl.style.display = 'none'; }
        var ratingValueEl = document.getElementById('ratingValue');
        if (ratingValueEl) ratingValueEl.value = '';
        loadRatingStats();
      } else if (data.errors) {
        applyServerErrors(data.errors);
      } else {
        showToast(data.message || 'Submission failed. Please try again.', 'error');
      }
    } catch (err) {
      showToast('Network error — is XAMPP running?', 'error');
    } finally {
      setButtonLoading(btn, false);
    }
  });
}


// ============================================================
// Delete Account Form
// ============================================================

function initDeleteAccountForm() {
  var form = document.getElementById('deleteAccountForm');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    clearFormErrors(form);

    var email    = ((document.getElementById('da-email')    || {}).value || '').trim();
    var password = ((document.getElementById('da-password') || {}).value || '');
    var confirmEl = document.getElementById('da-confirm');
    var confirm  = confirmEl ? confirmEl.checked : false;
    var btn      = document.getElementById('deleteBtn');

    var hasErr = false;
    if (!email) {
      showFieldError('da-emailErr', 'Email is required.'); hasErr = true;
    } else if (!isValidEmail(email)) {
      showFieldError('da-emailErr', 'Enter a valid email address.'); hasErr = true;
    }
    if (!password) {
      showFieldError('da-passwordErr', 'Password is required.'); hasErr = true;
    }
    if (!confirm) {
      showFieldError('da-confirmErr', 'Please tick the confirmation checkbox.'); hasErr = true;
    }
    if (hasErr) return;

    setButtonLoading(btn, true);
    try {
      var data = await postJSON('../php/delete_account.php', {
        email: email, password: password, confirm: confirm
      });

      if (data.success) {
        showToast(data.message, 'info', 4000);
        setTimeout(function () {
          window.location.href = data.redirect || 'index.html';
        }, 2000);
      } else if (data.errors) {
        applyServerErrors(data.errors);
      } else {
        showToast(data.message || 'Deletion failed. Please try again.', 'error');
      }
    } catch (err) {
      showToast('Network error — is XAMPP running?', 'error');
    } finally {
      setButtonLoading(btn, false);
    }
  });
}


// ============================================================
// Initialization
// ============================================================

function initEnhancements() {
  initNavbarScroll();
  initReveal();
  initCounters();
  initMobileNavClose();
}

function initForms() {
  initSignUpForm();
  initSignInForm();
  initStarRating();
  initFeedbackForm();
  initDeleteAccountForm();
}

// Enhancements fire on DOMContentLoaded (or immediately if already parsed)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEnhancements);
} else {
  initEnhancements();
}

// Forms and nav highlighting fire after all resources are loaded
window.addEventListener('load', function () {
  highlightActiveNav();
  initForms();
  initDashboard();
  initBlogPage();
  initBlogPostPage();
  initContactPage();
  initBlogAdmin();
});


// ============================================================
// Helpers — GET request (no CSRF needed)
// ============================================================

async function getJSON(url) {
  try {
    var res = await fetch(url, { credentials: 'include' });
    return res.json();
  } catch (e) {
    return { success: false, message: 'Network error' };
  }
}


// ============================================================
// Dashboard — Client-side pricing (mirrors config/razorpay.php)
// ============================================================

var DASH_PRICING = {
  bft: {
    1:  { amount: 210000,  label: '₹2,100',  save: 'Save ₹200'   },
    3:  { amount: 580000,  label: '₹5,800',  save: 'Save ₹1,100' },
    6:  { amount: 1080000, label: '₹10,800', save: 'Save ₹3,000' },
    12: { amount: 2000000, label: '₹20,000', save: 'Save ₹7,600' },
  },
  cst: {
    1:  { amount: 230000,  label: '₹2,300',  save: 'Save ₹200'   },
    3:  { amount: 600000,  label: '₹6,000',  save: 'Save ₹1,500' },
    6:  { amount: 1150000, label: '₹11,500', save: 'Save ₹3,500' },
    12: { amount: 2200000, label: '₹22,000', save: 'Save ₹8,000' },
  },
};

var _dashUser     = null;   // cached profile after session check
var _dashBookings = [];     // cached bookings list


// ============================================================
// Dashboard — Main Init
// ============================================================

async function initDashboard() {
  var guard   = document.getElementById('authGuard');
  var content = document.getElementById('dashContent');
  if (!guard || !content) return;   // not on dashboard page

  // 1. Check session
  var session = await getJSON('../php/session_status.php');
  if (!session.success) {
    window.location.replace('sign_in.html');
    return;
  }

  _dashUser = session.user;

  // 2. Reveal content
  guard.style.display   = 'none';
  content.style.display = 'block';
  content.removeAttribute('aria-hidden');

  // 3. Render static user info immediately
  renderDashHeader(_dashUser);

  // 4. Load bookings + payments in parallel
  var bookData, payData;
  try {
    var results = await Promise.all([
      getJSON('../php/get_bookings.php'),
      getJSON('../php/get_payments.php'),
    ]);
    bookData = results[0];
    payData  = results[1];
  } catch (e) {
    showToast('Could not load dashboard data — is XAMPP running?', 'error');
    return;
  }

  _dashBookings = (bookData.success && bookData.data) ? bookData.data : [];
  var payments  = (payData.success  && payData.data)  ? payData.data  : [];

  renderStats(_dashUser, _dashBookings);
  renderBookingsList(_dashBookings);
  renderPaymentsList(payments);

  // 5. Init interactive sections
  initBookingForm(_dashUser);
  initPaymentForm(_dashUser);
  initProfileForm(_dashUser);
  initDashLogout();
}


// ============================================================
// Dashboard — Render Header
// ============================================================

function renderDashHeader(user) {
  var initial = (user.name || '?').charAt(0).toUpperCase();

  var avatarEl  = document.getElementById('dashAvatar');
  var nameEl    = document.getElementById('dashName');
  var greetEl   = document.getElementById('dashGreeting');
  var planEl    = document.getElementById('dashPlanPill');
  var profAvEl  = document.getElementById('profileAvatarLg');
  var profNameEl = document.getElementById('pf-name');
  var profEmail  = document.getElementById('pf-email');
  var profMobile = document.getElementById('pf-mobile');

  if (avatarEl)   avatarEl.textContent  = initial;
  if (nameEl)     nameEl.textContent    = user.name || '—';
  if (profAvEl)   profAvEl.textContent  = initial;
  if (greetEl) {
    var h = new Date().getHours();
    greetEl.textContent = h < 12 ? 'Good morning,' : h < 17 ? 'Good afternoon,' : 'Good evening,';
  }
  if (planEl) {
    var planNames = { bft: 'BFT', cst: 'CST' };
    planEl.textContent = planNames[user.plan] || user.plan.toUpperCase();
    if (user.subscription_status === 'active') {
      planEl.classList.add('active-pill');
    }
  }
  if (profNameEl)   profNameEl.value  = user.name   || '';
  if (profEmail)    profEmail.value   = user.email  || '';
  if (profMobile)   profMobile.value  = user.mobile || '';
}


// ============================================================
// Dashboard — Render Stats Strip
// ============================================================

function renderStats(user, bookings) {
  var now      = new Date();
  var thisMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');

  var bkMonth = bookings.filter(function (b) {
    return b.status === 'confirmed' && b.class_date.startsWith(thisMonth);
  }).length;

  var subEl    = document.getElementById('statSubStatus');
  var expEl    = document.getElementById('statExpiry');
  var sinceEl  = document.getElementById('statMemberSince');
  var bkMonEl  = document.getElementById('statBkMonth');

  if (bkMonEl)  bkMonEl.textContent  = bkMonth;
  if (sinceEl)  sinceEl.textContent  = user.member_since || '—';

  if (subEl) {
    var st = user.subscription_status;
    subEl.textContent = st === 'active' ? 'Active' : st === 'expired' ? 'Expired' : 'Inactive';
    subEl.style.color = st === 'active' ? '#86efac' : '#fca5a5';
  }

  if (expEl) {
    if (user.subscription_expires) {
      var d   = new Date(user.subscription_expires);
      var opts = { day: 'numeric', month: 'short', year: '2-digit' };
      expEl.textContent = d.toLocaleDateString('en-IN', opts);
    } else {
      expEl.textContent = 'N/A';
    }
  }
}


// ============================================================
// Dashboard — Render Bookings List
// ============================================================

function renderBookingsList(bookings) {
  var container = document.getElementById('bookingsList');
  if (!container) return;

  if (!bookings.length) {
    container.innerHTML = '<div class="dash-empty">No bookings yet. Hit <strong>+ Book a Class</strong> to get started!</div>';
    return;
  }

  var slotLabels = {
    '05:30': '5:30 AM', '06:30': '6:30 AM', '07:30': '7:30 AM',
    '17:00': '5:00 PM', '18:00': '6:00 PM', '19:00': '7:00 PM',
  };
  var typeNames = { bft: 'Bodyweight Functional Training', cst: 'Calisthenics Skill Training' };

  var today = new Date().toISOString().split('T')[0];

  container.innerHTML = bookings.map(function (b) {
    var d     = new Date(b.class_date + 'T00:00:00');
    var dFmt  = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
    var isUpcoming = b.class_date >= today && b.status === 'confirmed';
    var cancelBtn  = isUpcoming
      ? '<button class="btn-cancel-bk" data-id="' + b.id + '" aria-label="Cancel booking">Cancel</button>'
      : '';
    return [
      '<div class="booking-item' + (b.status === 'cancelled' ? ' cancelled' : '') + '">',
      '  <div>',
      '    <div class="bk-date-time">' + dFmt + ' &bull; ' + (slotLabels[b.time_slot] || b.time_slot) + '</div>',
      '    <div class="bk-meta">' + (typeNames[b.class_type] || b.class_type.toUpperCase()) + '</div>',
      '  </div>',
      '  <div class="bk-actions">',
      '    <span class="bk-badge ' + b.status + '">' + b.status + '</span>',
      '    ' + cancelBtn,
      '  </div>',
      '</div>',
    ].join('');
  }).join('');

  container.querySelectorAll('.btn-cancel-bk').forEach(function (btn) {
    btn.addEventListener('click', function () {
      handleCancelBooking(parseInt(this.dataset.id, 10), this);
    });
  });
}


// ============================================================
// Dashboard — Cancel Booking
// ============================================================

async function handleCancelBooking(bookingId, btn) {
  if (!confirm('Cancel this booking? This cannot be undone.')) return;
  btn.disabled = true;
  btn.textContent = '…';

  var data = await postJSON('../php/cancel_booking.php', { booking_id: bookingId });
  if (data.success) {
    showToast('Booking cancelled.', 'info', 3000);
    // Refresh list
    var fresh = await getJSON('../php/get_bookings.php');
    _dashBookings = (fresh.success && fresh.data) ? fresh.data : [];
    renderBookingsList(_dashBookings);
    renderStats(_dashUser, _dashBookings);
  } else {
    showToast(data.message || 'Could not cancel booking.', 'error');
    btn.disabled = false;
    btn.textContent = 'Cancel';
  }
}


// ============================================================
// Dashboard — Render Payments List
// ============================================================

function renderPaymentsList(payments) {
  var container = document.getElementById('paymentsList');
  if (!container) return;

  if (!payments.length) {
    container.innerHTML = '<div class="dash-empty">No payments yet. Hit <strong>+ Subscribe</strong> to activate your membership.</div>';
    return;
  }

  var planNames = { bft: 'BFT — Bodyweight Functional', cst: 'CST — Calisthenics Skill' };

  container.innerHTML = payments.map(function (p) {
    var amtRs = '₹' + (parseInt(p.amount_paise, 10) / 100).toLocaleString('en-IN');
    var durStr = p.duration_months + ' month' + (p.duration_months > 1 ? 's' : '');
    var dateStr = p.paid_at
      ? new Date(p.paid_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      : new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    var txRef = p.razorpay_payment_id ? ' &bull; ' + p.razorpay_payment_id.slice(-8) : '';
    return [
      '<div class="payment-item">',
      '  <div>',
      '    <div class="pay-item-label">' + amtRs + ' &bull; ' + durStr + '</div>',
      '    <div class="pay-item-meta">' + (planNames[p.plan] || p.plan.toUpperCase()) + ' &bull; ' + dateStr + txRef + '</div>',
      '  </div>',
      '  <span class="pay-badge ' + p.status + '">' + p.status + '</span>',
      '</div>',
    ].join('');
  }).join('');
}


// ============================================================
// Dashboard — Booking Form (modal)
// ============================================================

function initBookingForm(user) {
  var form = document.getElementById('bookingForm');
  if (!form) return;

  // Pre-select class type based on user plan
  var defaultType = document.querySelector('input[name="bk-classType"][value="' + (user.plan || 'bft') + '"]');
  if (defaultType) defaultType.checked = true;

  // Set date constraints
  var dateInput = document.getElementById('bk-date');
  if (dateInput) {
    var today   = new Date().toISOString().split('T')[0];
    var maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    dateInput.setAttribute('min', today);
    dateInput.setAttribute('max', maxDate.toISOString().split('T')[0]);
    dateInput.addEventListener('change', function () {
      fetchSlotAvailability(this.value);
    });
  }

  // Slot selection
  var slotInput = document.getElementById('bk-timeSlot');
  document.querySelectorAll('.slot-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.slot-btn').forEach(function (b) { b.classList.remove('selected'); });
      this.classList.add('selected');
      if (slotInput) slotInput.value = this.dataset.slot;
      var errEl = document.getElementById('bk-slotErr');
      if (errEl) errEl.textContent = '';
    });
  });

  // Submit
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    var typeEl    = document.querySelector('input[name="bk-classType"]:checked');
    var dateEl    = document.getElementById('bk-date');
    var slotEl    = document.getElementById('bk-timeSlot');
    var btn       = document.getElementById('bookBtn');
    var hasErr    = false;

    if (!typeEl) {
      showFieldError('bk-typeErr', 'Please select a class type.'); hasErr = true;
    }
    if (!dateEl || !dateEl.value) {
      showFieldError('bk-dateErr', 'Please select a class date.'); hasErr = true;
    }
    if (!slotEl || !slotEl.value) {
      showFieldError('bk-slotErr', 'Please select a time slot.'); hasErr = true;
    }
    if (hasErr) return;

    setButtonLoading(btn, true);
    var data = await postJSON('../php/create_booking.php', {
      class_type: typeEl.value,
      date:       dateEl.value,
      time_slot:  slotEl.value,
    });
    setButtonLoading(btn, false);

    if (data.success) {
      showToast(data.message, 'success', 5000);
      // Close modal
      var modal = bootstrap.Modal.getInstance(document.getElementById('bookModal'));
      if (modal) modal.hide();
      // Reset form
      form.reset();
      document.querySelectorAll('.slot-btn').forEach(function (b) { b.classList.remove('selected'); });
      if (slotEl) slotEl.value = '';
      // Refresh list
      var fresh = await getJSON('../php/get_bookings.php');
      _dashBookings = (fresh.success && fresh.data) ? fresh.data : [];
      renderBookingsList(_dashBookings);
      renderStats(_dashUser, _dashBookings);
    } else if (data.errors) {
      applyServerErrors(data.errors);
    } else {
      showToast(data.message || 'Booking failed. Please try again.', 'error');
    }
  });
}


// ============================================================
// Dashboard — Slot Availability Check
// ============================================================

async function fetchSlotAvailability(date) {
  if (!date) return;
  var typeEl = document.querySelector('input[name="bk-classType"]:checked');
  var classType = typeEl ? typeEl.value : 'bft';

  var hint = document.getElementById('slotHint');
  if (hint) hint.textContent = 'Checking…';

  // Reset slot buttons to loading state
  document.querySelectorAll('.slot-btn').forEach(function (b) {
    b.disabled = false;
    var inner = b.getAttribute('aria-label') || b.textContent.split('\n')[0];
    b.innerHTML = inner + '<span class="slot-avail"></span>';
    b.classList.remove('selected');
  });
  var slotInput = document.getElementById('bk-timeSlot');
  if (slotInput) slotInput.value = '';

  var data = await getJSON('../php/slot_availability.php?date=' + date + '&class_type=' + classType);
  if (!data.success || !data.slots) { if (hint) hint.textContent = ''; return; }

  var timeLabels = {
    '05:30': '5:30 AM', '06:30': '6:30 AM', '07:30': '7:30 AM',
    '17:00': '5:00 PM', '18:00': '6:00 PM', '19:00': '7:00 PM',
  };

  data.slots.forEach(function (slot) {
    var btn = document.querySelector('.slot-btn[data-slot="' + slot.time + '"]');
    if (!btn) return;
    btn.disabled = slot.full;
    btn.innerHTML = (timeLabels[slot.time] || slot.time) +
      '<span class="slot-avail">' + (slot.full ? 'Full' : slot.available + ' left') + '</span>';
  });

  var fullCount = data.slots.filter(function (s) { return s.full; }).length;
  if (hint) hint.textContent = fullCount === data.slots.length ? '— all slots full' : '';
}


// ============================================================
// Dashboard — Payment Form + Razorpay
// ============================================================

function initPaymentForm(user) {
  var payNowBtn    = document.getElementById('payNowBtn');
  var priceBox     = document.getElementById('payPriceBox');
  var priceAmount  = document.getElementById('payPriceAmount');
  var priceSave    = document.getElementById('payPriceSave');
  if (!payNowBtn) return;

  var selectedPlan = user.plan || 'bft';
  var selectedDur  = 0;

  // Pre-select plan radio
  var planRadio = document.querySelector('input[name="pay-plan"][value="' + selectedPlan + '"]');
  if (planRadio) planRadio.checked = true;

  function updatePrice() {
    if (!selectedPlan || !selectedDur) {
      if (priceBox) priceBox.style.display = 'none';
      payNowBtn.disabled = true;
      return;
    }
    var p = DASH_PRICING[selectedPlan] && DASH_PRICING[selectedPlan][selectedDur];
    if (!p) return;
    if (priceBox)    priceBox.style.display = 'block';
    if (priceAmount) priceAmount.textContent = p.label;
    if (priceSave)   priceSave.textContent   = p.save;
    payNowBtn.disabled = false;
  }

  // Plan radios
  document.querySelectorAll('input[name="pay-plan"]').forEach(function (radio) {
    radio.addEventListener('change', function () {
      selectedPlan = this.value;
      updatePrice();
    });
  });

  // Duration buttons
  document.querySelectorAll('.duration-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.duration-btn').forEach(function (b) { b.classList.remove('selected'); });
      this.classList.add('selected');
      selectedDur = parseInt(this.dataset.months, 10);
      updatePrice();
    });
  });

  // Pay Now
  payNowBtn.addEventListener('click', async function () {
    if (!selectedPlan || !selectedDur) return;

    setButtonLoading(payNowBtn, true);
    var orderData = await postJSON('../php/razorpay_order.php', {
      plan:     selectedPlan,
      duration: selectedDur,
    });
    setButtonLoading(payNowBtn, false);

    if (!orderData.success) {
      showToast(orderData.message || 'Could not initiate payment.', 'error');
      return;
    }

    var options = {
      key:         orderData.key_id,
      amount:      orderData.amount,
      currency:    orderData.currency,
      name:        'ELEV8 Fitness Studio',
      description: orderData.description,
      order_id:    orderData.order_id,
      image:       '../assets/images/common/elev8-icon-symbol.png',
      prefill: {
        name:  user.name  || '',
        email: user.email || '',
        contact: user.mobile || '',
      },
      theme:        { color: '#FF4B1F' },
      modal:        { ondismiss: function () { showToast('Payment cancelled.', 'info', 2500); } },
      handler: async function (response) {
        var verify = await postJSON('../php/razorpay_verify.php', {
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id:   response.razorpay_order_id,
          razorpay_signature:  response.razorpay_signature,
        });
        if (verify.success) {
          showToast('Payment successful! Your subscription is now active.', 'success', 6000);
          var modal = bootstrap.Modal.getInstance(document.getElementById('payModal'));
          if (modal) modal.hide();
          // Reload to refresh subscription status
          setTimeout(function () { window.location.reload(); }, 2500);
        } else {
          showToast(verify.message || 'Payment verification failed. Contact support.', 'error', 6000);
        }
      },
    };

    if (typeof Razorpay === 'undefined') {
      showToast('Razorpay script not loaded. Check your internet connection.', 'error');
      return;
    }

    var rzp = new Razorpay(options);
    rzp.on('payment.failed', function (resp) {
      showToast('Payment failed: ' + (resp.error.description || 'Unknown error.'), 'error', 6000);
    });
    rzp.open();
  });
}


// ============================================================
// Dashboard — Profile Form
// ============================================================

function initProfileForm(user) {
  var form = document.getElementById('profileForm');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    clearFormErrors(form);

    var nameEl   = document.getElementById('pf-name');
    var mobileEl = document.getElementById('pf-mobile');
    var btn      = document.getElementById('profileBtn');
    var name     = nameEl   ? nameEl.value.trim()   : '';
    var mobile   = mobileEl ? mobileEl.value.trim() : '';

    if (!name) {
      showFieldError('pf-nameErr', 'Name is required.'); return;
    }

    setButtonLoading(btn, true);
    var data = await postJSON('../php/update_profile.php', { name: name, mobile: mobile });
    setButtonLoading(btn, false);

    if (data.success) {
      showToast('Profile updated successfully.', 'success', 3000);
      _dashUser.name = data.name || name;
      renderDashHeader(_dashUser);
    } else if (data.errors) {
      applyServerErrors(data.errors);
    } else {
      showToast(data.message || 'Update failed. Please try again.', 'error');
    }
  });
}


// ============================================================
// Dashboard — Logout
// ============================================================

function initDashLogout() {
  ['dashLogoutBtn', 'navLogoutBtn'].forEach(function (id) {
    var btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener('click', async function () {
      this.disabled = true;
      var data = await postJSON('../php/logout.php', {});
      if (data.redirect) {
        window.location.replace(data.redirect);
      } else {
        window.location.replace('sign_in.html');
      }
    });
  });
}


// ============================================================
// Blog Listing Page
// ============================================================

var _blogPage     = 1;
var _blogCategory = '';
var _blogSearch   = '';
var _blogDebounce = null;

function initBlogPage() {
  if (!document.getElementById('blogGrid')) return;

  loadBlogPosts();

  var searchEl = document.getElementById('blogSearch');
  if (searchEl) {
    searchEl.addEventListener('input', function () {
      clearTimeout(_blogDebounce);
      _blogDebounce = setTimeout(function () {
        _blogSearch = searchEl.value.trim();
        _blogPage   = 1;
        loadBlogPosts();
      }, 380);
    });
  }
}

async function loadBlogPosts() {
  var grid = document.getElementById('blogGrid');
  var pag  = document.getElementById('blogPagination');
  if (!grid) return;

  grid.innerHTML = '<div class="blog-state-msg"><strong>Loading…</strong></div>';
  if (pag) pag.innerHTML = '';

  var url = '../php/get_blog_posts.php?page=' + _blogPage;
  if (_blogSearch)   url += '&search='   + encodeURIComponent(_blogSearch);
  if (_blogCategory) url += '&category=' + encodeURIComponent(_blogCategory);

  var data = await getJSON(url);

  if (!data.success) {
    grid.innerHTML = '<div class="blog-state-msg"><strong>Could not load posts.</strong>Check your connection or XAMPP.</div>';
    return;
  }

  // Build category pills (first load only)
  var catsEl = document.getElementById('blogCats');
  if (catsEl && catsEl.children.length === 0 && data.categories && data.categories.length) {
    var allPill = document.createElement('span');
    allPill.className = 'cat-pill active';
    allPill.textContent = 'All';
    allPill.dataset.cat = '';
    catsEl.appendChild(allPill);
    data.categories.forEach(function (cat) {
      var pill = document.createElement('span');
      pill.className = 'cat-pill';
      pill.textContent = cat;
      pill.dataset.cat = cat;
      catsEl.appendChild(pill);
    });
    catsEl.addEventListener('click', function (e) {
      var pill = e.target.closest('.cat-pill');
      if (!pill) return;
      catsEl.querySelectorAll('.cat-pill').forEach(function (p) { p.classList.remove('active'); });
      pill.classList.add('active');
      _blogCategory = pill.dataset.cat;
      _blogPage = 1;
      loadBlogPosts();
    });
  }

  if (!data.posts || data.posts.length === 0) {
    grid.innerHTML = '<div class="blog-state-msg"><strong>No posts found.</strong>Try a different search or category.</div>';
    return;
  }

  grid.innerHTML = data.posts.map(function (p) {
    var dateStr = p.created_at ? new Date(p.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '';
    return '<a class="blog-card" href="blog-post.html?slug=' + encodeURIComponent(p.slug) + '">' +
      '<div class="blog-card-img-placeholder">📝</div>' +
      '<div class="blog-card-body">' +
        '<div class="blog-card-cat">' + (p.category || 'Fitness') + '</div>' +
        '<h2 class="blog-card-title">' + escHtml(p.title) + '</h2>' +
        '<p class="blog-card-excerpt">' + escHtml(p.excerpt || '') + '</p>' +
        '<div class="blog-card-meta">' +
          '<span>' + escHtml(p.author || 'ELEV8 Team') + '</span>' +
          '<span>' + dateStr + '</span>' +
        '</div>' +
      '</div>' +
    '</a>';
  }).join('');

  // Pagination
  if (pag && data.pages > 1) {
    for (var i = 1; i <= data.pages; i++) {
      var btn = document.createElement('button');
      btn.className = 'page-btn' + (i === _blogPage ? ' active' : '');
      btn.textContent = i;
      btn.dataset.page = i;
      btn.addEventListener('click', function () {
        _blogPage = parseInt(this.dataset.page, 10);
        loadBlogPosts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      pag.appendChild(btn);
    }
  }
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}


// ============================================================
// Blog Post Page
// ============================================================

function initBlogPostPage() {
  var loadingEl = document.getElementById('postLoading');
  if (!loadingEl) return;

  var params = new URLSearchParams(window.location.search);
  var slug   = params.get('slug');

  if (!slug) {
    showPostNotFound();
    return;
  }

  loadPost(slug);
}

async function loadPost(slug) {
  var data = await getJSON('../php/get_blog_posts.php?slug=' + encodeURIComponent(slug));

  var loadingEl  = document.getElementById('postLoading');
  var articleEl  = document.getElementById('postArticle');
  var notFoundEl = document.getElementById('postNotFound');

  if (loadingEl) loadingEl.style.display = 'none';

  if (!data.success || !data.post) {
    showPostNotFound();
    return;
  }

  var post = data.post;

  // Update page title
  document.title = escHtml(post.title) + ' — ELEV8 Journal';

  // Populate hero
  var catPill = document.getElementById('postCatPill');
  var titleEl = document.getElementById('postTitle');
  var authorEl= document.getElementById('postAuthor');
  var dateEl  = document.getElementById('postDate');
  if (catPill)  catPill.textContent  = post.category || 'Fitness';
  if (titleEl)  titleEl.textContent  = post.title;
  if (authorEl) authorEl.textContent = 'By ' + (post.author || 'ELEV8 Team');
  if (dateEl)   dateEl.textContent   = post.created_at
    ? new Date(post.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })
    : '';

  // Post body (server-generated HTML content)
  var bodyEl = document.getElementById('postBody');
  if (bodyEl) bodyEl.innerHTML = post.content || '';

  // Hidden post ID for comment form
  var pidEl = document.getElementById('commentPostId');
  if (pidEl) pidEl.value = post.id;

  // Comments
  renderComments(data.comments || []);

  if (articleEl) articleEl.style.display = '';

  // Wire comment form
  initCommentForm(post.id);
}

function renderComments(comments) {
  var countEl = document.getElementById('commentCount');
  var listEl  = document.getElementById('commentsList');
  if (countEl) countEl.textContent = '(' + comments.length + ')';
  if (!listEl) return;

  if (comments.length === 0) {
    listEl.innerHTML = '<p style="color:var(--steel);font-size:0.88rem;">No comments yet. Be the first!</p>';
    return;
  }

  listEl.innerHTML = comments.map(function (c) {
    var dateStr = c.created_at ? new Date(c.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '';
    return '<div class="comment-card">' +
      '<span class="comment-author">' + escHtml(c.name) + '</span>' +
      '<span class="comment-date">' + dateStr + '</span>' +
      '<p class="comment-text">' + escHtml(c.comment) + '</p>' +
    '</div>';
  }).join('');
}

function initCommentForm(postId) {
  var form = document.getElementById('commentForm');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    clearFormErrors(form);

    var nameEl    = document.getElementById('bc-name');
    var emailEl   = document.getElementById('bc-email');
    var commentEl = document.getElementById('bc-comment');
    var btn       = form.querySelector('[type="submit"]');

    var name    = nameEl    ? nameEl.value.trim()    : '';
    var email   = emailEl   ? emailEl.value.trim()   : '';
    var comment = commentEl ? commentEl.value.trim() : '';

    var ok = true;
    if (!name)    { showFieldError('bc-nameErr',    'Name is required.');    ok = false; }
    if (!email)   { showFieldError('bc-emailErr',   'Email is required.');   ok = false; }
    if (!comment) { showFieldError('bc-commentErr', 'Comment is required.'); ok = false; }
    if (!ok) return;

    setButtonLoading(btn, true);
    var data = await postJSON('../php/submit_blog_comment.php', { post_id: postId, name: name, email: email, comment: comment });
    setButtonLoading(btn, false);

    if (data.success) {
      showToast('Comment submitted! Thank you.', 'success', 3500);
      form.reset();
      // Reload comments
      var refreshed = await getJSON('../php/get_blog_posts.php?slug=' + encodeURIComponent(new URLSearchParams(window.location.search).get('slug')));
      if (refreshed.success) renderComments(refreshed.comments || []);
    } else if (data.errors) {
      applyServerErrors(data.errors);
    } else {
      showToast(data.message || 'Could not submit comment.', 'error');
    }
  });
}

function showPostNotFound() {
  var loadingEl  = document.getElementById('postLoading');
  var notFoundEl = document.getElementById('postNotFound');
  if (loadingEl)  loadingEl.style.display  = 'none';
  if (notFoundEl) notFoundEl.style.display = '';
}


// ============================================================
// Contact Page
// ============================================================

function initContactPage() {
  var form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    clearFormErrors(form);

    var nameEl    = document.getElementById('ct-name');
    var emailEl   = document.getElementById('ct-email');
    var phoneEl   = document.getElementById('ct-phone');
    var msgEl     = document.getElementById('ct-message');
    var btn       = document.getElementById('contactBtn');

    var name    = nameEl    ? nameEl.value.trim()    : '';
    var email   = emailEl   ? emailEl.value.trim()   : '';
    var phone   = phoneEl   ? phoneEl.value.trim()   : '';
    var message = msgEl     ? msgEl.value.trim()     : '';

    var ok = true;
    if (!name)    { showFieldError('ct-nameErr',    'Name is required.');    ok = false; }
    if (!email)   { showFieldError('ct-emailErr',   'Email is required.');   ok = false; }
    if (!message) { showFieldError('ct-messageErr', 'Message is required.'); ok = false; }
    if (!ok) return;

    setButtonLoading(btn, true);
    var data = await postJSON('../php/contact_submit.php', { name: name, email: email, phone: phone, message: message });
    setButtonLoading(btn, false);

    if (data.success) {
      showToast("Message sent! We'll get back to you soon.", 'success', 5000);
      form.reset();
    } else if (data.errors) {
      applyServerErrors(data.errors);
    } else {
      showToast(data.message || 'Could not send message. Please try again.', 'error');
    }
  });
}


// ============================================================
// Blog Admin Page
// ============================================================

var _adminKey = '';

function initBlogAdmin() {
  var loginForm   = document.getElementById('adminLoginForm');
  var adminContent= document.getElementById('adminContent');
  if (!loginForm) return;

  // Restore key from sessionStorage
  var saved = sessionStorage.getItem('elev8AdminKey');
  if (saved) {
    _adminKey = saved;
    showAdminContent();
  }

  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var keyEl = document.getElementById('adminKey');
    if (!keyEl || !keyEl.value.trim()) return;
    _adminKey = keyEl.value.trim();
    sessionStorage.setItem('elev8AdminKey', _adminKey);
    showAdminContent();
  });
}

function showAdminContent() {
  var authWrap    = document.getElementById('adminAuthWrap');
  var adminContent= document.getElementById('adminContent');
  if (authWrap)     authWrap.style.display    = 'none';
  if (adminContent) adminContent.style.display = 'block';
  loadAdminPosts();
  initNewPostForm();
}

async function adminFetch(body) {
  try {
    var token = await getCsrfToken();
    var res = await fetch('../php/blog_admin.php', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': token,
        'X-Admin-Key':  _adminKey,
      },
      body: JSON.stringify(body),
    });
    return res.json();
  } catch (e) {
    return { success: false, message: 'Network error' };
  }
}

async function getCsrfToken() {
  if (window._csrfToken) return window._csrfToken;
  try {
    var res  = await fetch('../php/session_status.php', { credentials: 'include' });
    var data = await res.json();
    window._csrfToken = data.csrf_token || '';
    return window._csrfToken;
  } catch (e) { return ''; }
}

async function loadAdminPosts() {
  var listEl = document.getElementById('adminPostsList');
  if (!listEl) return;

  listEl.innerHTML = '<p style="color:var(--steel);font-size:0.88rem;">Loading…</p>';

  try {
    var token = await getCsrfToken();
    var res = await fetch('../php/blog_admin.php', {
      credentials: 'include',
      headers: { 'X-Admin-Key': _adminKey, 'X-CSRF-Token': token },
    });
    var data = await res.json();

    if (!data.success) {
      if (data.code === 401) {
        sessionStorage.removeItem('elev8AdminKey');
        showToast('Invalid admin key. Please log in again.', 'error');
        location.reload();
        return;
      }
      listEl.innerHTML = '<p style="color:#fca5a5;">' + (data.message || 'Error loading posts.') + '</p>';
      return;
    }

    if (!data.posts || data.posts.length === 0) {
      listEl.innerHTML = '<p style="color:var(--steel);font-size:0.88rem;">No posts yet.</p>';
      return;
    }

    listEl.innerHTML = data.posts.map(function (p) {
      var dateStr = p.created_at ? new Date(p.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '';
      return '<div class="admin-post-item" data-id="' + p.id + '">' +
        '<span class="admin-post-title">' + escHtml(p.title) + '</span>' +
        '<span class="admin-post-meta">' + escHtml(p.category || '') + ' · ' + dateStr + '</span>' +
        '<span class="admin-post-status ' + (p.status === 'published' ? 'published' : 'draft') + '">' + escHtml(p.status) + '</span>' +
        '<div class="admin-post-actions">' +
          '<button class="btn btn-sm btn-outline-warning" onclick="toggleAdminPostStatus(' + p.id + ')">Toggle</button>' +
          '<button class="btn btn-sm btn-outline-danger"  onclick="deleteAdminPost(' + p.id + ')">Delete</button>' +
        '</div>' +
      '</div>';
    }).join('');
  } catch (e) {
    listEl.innerHTML = '<p style="color:#fca5a5;">Network error.</p>';
  }
}

async function toggleAdminPostStatus(id) {
  var data = await adminFetch({ action: 'toggle_status', id: id });
  if (data.success) { showToast('Status updated.', 'success', 2000); loadAdminPosts(); }
  else showToast(data.message || 'Failed.', 'error');
}

async function deleteAdminPost(id) {
  if (!confirm('Delete this post permanently?')) return;
  var data = await adminFetch({ action: 'delete', id: id });
  if (data.success) { showToast('Post deleted.', 'success', 2000); loadAdminPosts(); }
  else showToast(data.message || 'Failed.', 'error');
}

function initNewPostForm() {
  var form = document.getElementById('newPostForm');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    clearFormErrors(form);

    var btn = form.querySelector('[type="submit"]');
    setButtonLoading(btn, true);

    var body = {
      action:   'create',
      title:    (document.getElementById('np-title')    || {}).value || '',
      category: (document.getElementById('np-category') || {}).value || '',
      author:   (document.getElementById('np-author')   || {}).value || '',
      status:   (document.getElementById('np-status')   || {}).value || 'draft',
      excerpt:  (document.getElementById('np-excerpt')  || {}).value || '',
      content:  (document.getElementById('np-content')  || {}).value || '',
    };

    var data = await adminFetch(body);
    setButtonLoading(btn, false);

    if (data.success) {
      showToast('Post created! Slug: ' + (data.slug || ''), 'success', 4000);
      form.reset();
      loadAdminPosts();
    } else if (data.errors) {
      applyServerErrors(data.errors);
    } else {
      showToast(data.message || 'Could not create post.', 'error');
    }
  });

  var refreshBtn = document.getElementById('refreshPostsBtn');
  if (refreshBtn) refreshBtn.addEventListener('click', loadAdminPosts);
}
