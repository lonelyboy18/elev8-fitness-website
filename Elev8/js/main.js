/* ==========================================================================
   ELEV8 CALISTHENICS & FITNESS STUDIO — MAIN JAVASCRIPT
   Combined: validations.js + enhance.js
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
    if (window.scrollY > 24) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

function initMobileNavClose() {
  var links = document.querySelectorAll('.navbar-nav .nav-link');
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

function highlightActiveNav() {
  var links = document.querySelectorAll('.navbar-nav .nav-link');
  var current = window.location.pathname.split('/').pop();
  links.forEach(function (link) {
    var href = link.getAttribute('href');
    if (href === current) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}


// ============================================================
// Animations
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

function animateCount(el) {
  var target = parseFloat(el.getAttribute('data-count'));
  var decimals = (el.getAttribute('data-decimals') || '0') | 0;
  var suffix = el.getAttribute('data-suffix') || '';
  if (isNaN(target)) return;

  if (reduceMotion) {
    el.textContent = target.toFixed(decimals) + suffix;
    return;
  }

  var dur = 1400, start = null;
  function step(ts) {
    if (!start) start = ts;
    var p = Math.min((ts - start) / dur, 1);
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
// Forms
// ============================================================


function validateSignUp(event) {
  event.preventDefault();

  var name = document.getElementById('name');
  var email = document.getElementById('email');
  var mobile = document.getElementById('mobile');
  var password = document.getElementById('password');
  var confirmPassword = document.getElementById('confirmPassword');
  var gender = document.getElementsByName('gender');
  var terms = document.getElementById('terms');

  var nameError = document.getElementById('nameError');
  var emailError = document.getElementById('emailError');
  var mobileError = document.getElementById('mobileError');
  var passwordError = document.getElementById('passwordError');
  var confirmPasswordError = document.getElementById('confirmPasswordError');
  var genderError = document.getElementById('genderError');
  var termsError = document.getElementById('termsError');

  emailError.textContent = 'Email is required!';
  mobileError.textContent = 'Mobile number is required!';
  passwordError.textContent = 'Password is required!';
  confirmPasswordError.textContent = 'Please confirm password!';

  var messageBox = document.getElementById('signupMessage');
  if (messageBox) { messageBox.style.display = 'none'; messageBox.textContent = ''; }

  var isValid = true;

  [nameError, emailError, mobileError, passwordError, confirmPasswordError, genderError, termsError].forEach(function (el) {
    el.classList.remove('show');
  });
  [name, email, mobile, password, confirmPassword].forEach(function (el) {
    el.classList.remove('is-invalid');
  });

  if (name.value.trim() === '') {
    nameError.classList.add('show');
    name.classList.add('is-invalid');
    isValid = false;
  }

  if (email.value.trim() === '') {
    emailError.classList.add('show');
    email.classList.add('is-invalid');
    isValid = false;
  } else if (!isValidEmail(email.value)) {
    emailError.textContent = 'Please enter a valid email!';
    emailError.classList.add('show');
    email.classList.add('is-invalid');
    isValid = false;
  }

  if (mobile.value.trim() === '') {
    mobileError.classList.add('show');
    mobile.classList.add('is-invalid');
    isValid = false;
  } else if (!isValidMobile(mobile.value)) {
    mobileError.textContent = 'Please enter a valid mobile number!';
    mobileError.classList.add('show');
    mobile.classList.add('is-invalid');
    isValid = false;
  }

  if (password.value === '') {
    passwordError.classList.add('show');
    password.classList.add('is-invalid');
    isValid = false;
  } else if (password.value.length < 6) {
    passwordError.textContent = 'Password must be at least 6 characters!';
    passwordError.classList.add('show');
    password.classList.add('is-invalid');
    isValid = false;
  }

  if (confirmPassword.value === '') {
    confirmPasswordError.classList.add('show');
    confirmPassword.classList.add('is-invalid');
    isValid = false;
  } else if (confirmPassword.value !== password.value) {
    confirmPasswordError.textContent = 'Passwords do not match!';
    confirmPasswordError.classList.add('show');
    confirmPassword.classList.add('is-invalid');
    isValid = false;
  }

  var genderSelected = false;
  for (var i = 0; i < gender.length; i++) {
    if (gender[i].checked) { genderSelected = true; break; }
  }
  if (!genderSelected) { genderError.classList.add('show'); isValid = false; }

  if (!terms.checked) { termsError.classList.add('show'); isValid = false; }

  if (isValid) {
    var modal = new bootstrap.Modal(document.getElementById('successModal'));
    modal.show();
    document.getElementById('signupForm').reset();
    modal._element.addEventListener('hidden.bs.modal', function () {
      window.location.href = 'sign_in.html';
    }, { once: true });
  }

  return false;
}

function validateSignIn(event) {
  event.preventDefault();

  var email = document.getElementById('email');
  var password = document.getElementById('password');
  var emailError = document.getElementById('emailError');
  var passwordError = document.getElementById('passwordError');

  emailError.textContent = 'Email is required!';

  var messageBox = document.getElementById('signinMessage');
  if (messageBox) { messageBox.style.display = 'none'; messageBox.textContent = ''; }

  var isValid = true;

  emailError.classList.remove('show');
  passwordError.classList.remove('show');
  email.classList.remove('is-invalid');
  password.classList.remove('is-invalid');

  if (email.value.trim() === '') {
    emailError.classList.add('show');
    email.classList.add('is-invalid');
    isValid = false;
  } else if (!isValidEmail(email.value)) {
    emailError.textContent = 'Please enter a valid email!';
    emailError.classList.add('show');
    email.classList.add('is-invalid');
    isValid = false;
  }

  if (password.value === '') {
    passwordError.classList.add('show');
    password.classList.add('is-invalid');
    isValid = false;
  }

  if (isValid) {
    var modal = new bootstrap.Modal(document.getElementById('successModal'));
    modal.show();
    modal._element.addEventListener('hidden.bs.modal', function () {
      window.location.href = 'index.html';
    }, { once: true });
  }

  return false;
}

function validateDeleteAccount(event) {
  event.preventDefault();

  var email = document.getElementById('email');
  var password = document.getElementById('password');
  var confirmDelete = document.getElementById('confirmDelete');
  var emailError = document.getElementById('emailError');
  var passwordError = document.getElementById('passwordError');
  var confirmDeleteError = document.getElementById('confirmDeleteError');

  emailError.textContent = 'Email is required!';

  var messageBox = document.getElementById('deleteMessage');
  if (messageBox) { messageBox.style.display = 'none'; messageBox.textContent = ''; }

  var isValid = true;

  emailError.classList.remove('show');
  passwordError.classList.remove('show');
  confirmDeleteError.classList.remove('show');
  email.classList.remove('is-invalid');
  password.classList.remove('is-invalid');

  if (email.value.trim() === '') {
    emailError.classList.add('show');
    email.classList.add('is-invalid');
    isValid = false;
  } else if (!isValidEmail(email.value)) {
    emailError.textContent = 'Please enter a valid email!';
    emailError.classList.add('show');
    email.classList.add('is-invalid');
    isValid = false;
  }

  if (password.value === '') {
    passwordError.classList.add('show');
    password.classList.add('is-invalid');
    isValid = false;
  }

  if (!confirmDelete.checked) {
    confirmDeleteError.classList.add('show');
    isValid = false;
  }

  if (isValid) {
    var modal = new bootstrap.Modal(document.getElementById('successModal'));
    modal.show();
    document.getElementById('deleteAccountForm').reset();
  }

  return false;
}

function validateFeedbackForm() {
  var firstName = document.getElementById('firstName');
  var middleName = document.getElementById('middleName');
  var lastName = document.getElementById('lastName');
  var age = document.getElementById('age');
  var dob = document.getElementById('dob');
  var email = document.getElementById('email');
  var phone = document.getElementById('phone');
  var category = document.getElementById('suggestionCategory');
  var ratingValue = document.getElementById('ratingValue');
  var feedback = document.getElementById('feedback');

  var firstNameError = document.getElementById('firstNameError');
  var middleNameError = document.getElementById('middleNameError');
  var lastNameError = document.getElementById('lastNameError');
  var ageError = document.getElementById('ageError');
  var dobError = document.getElementById('dobError');
  var emailError = document.getElementById('emailError');
  var phoneError = document.getElementById('phoneError');
  var categoryError = document.getElementById('categoryError');
  var ratingError = document.getElementById('ratingError');
  var feedbackError = document.getElementById('feedbackError');

  if (!firstName || !middleName || !lastName || !age || !dob || !email || !phone || !category || !ratingValue || !feedback) {
    return false;
  }

  var isValid = true;

  middleNameError.textContent = 'Middle name should contain only letters!';
  ageError.textContent = 'Please enter a valid age between 10 and 100!';
  emailError.textContent = 'Email is required!';
  phoneError.textContent = 'Phone number is required!';
  feedbackError.textContent = 'Feedback is required!';

  [firstNameError, middleNameError, lastNameError, ageError, dobError, emailError, phoneError, categoryError, ratingError, feedbackError].forEach(function (el) {
    el.classList.remove('show');
  });
  [firstName, middleName, lastName, age, dob, email, phone, category, feedback].forEach(function (el) {
    el.classList.remove('is-invalid');
  });

  if (firstName.value.trim() === '') {
    firstNameError.classList.add('show');
    firstName.classList.add('is-invalid');
    isValid = false;
  }

  if (middleName.value.trim() !== '' && !/^[A-Za-z\s]+$/.test(middleName.value.trim())) {
    middleNameError.classList.add('show');
    middleName.classList.add('is-invalid');
    isValid = false;
  }

  if (lastName.value.trim() === '') {
    lastNameError.classList.add('show');
    lastName.classList.add('is-invalid');
    isValid = false;
  }

  if (age.value.trim() !== '') {
    var ageNumber = parseInt(age.value, 10);
    if (isNaN(ageNumber) || ageNumber < 10 || ageNumber > 100) {
      ageError.classList.add('show');
      age.classList.add('is-invalid');
      isValid = false;
    }
  }

  if (dob.value.trim() === '') {
    dobError.classList.add('show');
    dob.classList.add('is-invalid');
    isValid = false;
  }

  if (email.value.trim() === '') {
    emailError.classList.add('show');
    email.classList.add('is-invalid');
    isValid = false;
  } else if (!isValidEmail(email.value)) {
    emailError.textContent = 'Please enter a valid email!';
    emailError.classList.add('show');
    email.classList.add('is-invalid');
    isValid = false;
  }

  if (phone.value.trim() === '') {
    phoneError.classList.add('show');
    phone.classList.add('is-invalid');
    isValid = false;
  } else if (!isValidMobile(phone.value)) {
    phoneError.textContent = 'Please enter a valid 10-digit phone number!';
    phoneError.classList.add('show');
    phone.classList.add('is-invalid');
    isValid = false;
  }

  if (category.value.trim() === '') {
    categoryError.classList.add('show');
    category.classList.add('is-invalid');
    isValid = false;
  }

  if (ratingValue.value.trim() === '') {
    ratingError.classList.add('show');
    isValid = false;
  }

  if (feedback.value.trim() === '') {
    feedbackError.classList.add('show');
    feedback.classList.add('is-invalid');
    isValid = false;
  } else if (feedback.value.trim().length < 10) {
    feedbackError.textContent = 'Feedback must be at least 10 characters!';
    feedbackError.classList.add('show');
    feedback.classList.add('is-invalid');
    isValid = false;
  }

  return isValid;
}

function submitFeedbackForm(event) {
  event.preventDefault();
  if (!validateFeedbackForm()) return false;

  var form = document.getElementById('feedbackForm');
  form.reset();

  var stars = document.querySelectorAll('.star');
  stars.forEach(function (s) { s.classList.remove('active'); s.style.filter = ''; });
  var ratingFeedback = document.getElementById('ratingFeedback');
  if (ratingFeedback) { ratingFeedback.textContent = ''; ratingFeedback.style.display = 'none'; }
  var ratingValue = document.getElementById('ratingValue');
  if (ratingValue) ratingValue.value = '';

  alert('Thank you! Your feedback has been submitted successfully.');
}


// ============================================================
// Gallery
// ============================================================

function initStarRating() {
  var stars = document.querySelectorAll('.star');
  if (stars.length === 0) return;

  var ratingValue = document.getElementById('ratingValue');
  var ratingFeedback = document.getElementById('ratingFeedback');

  var ratingMessages = {
    1: '😢 Very Bad - We\'re sorry to hear that!',
    2: '😞 Poor - Please tell us how we can improve',
    3: '😐 Average - What can we do better?',
    4: '😊 Good - Great to hear!',
    5: '😄 Excellent - Thank you so much!'
  };

  stars.forEach(function (star) {
    star.addEventListener('click', function () {
      var value = this.dataset.value;
      ratingValue.value = value;

      var ratingError = document.getElementById('ratingError');
      if (ratingError) ratingError.classList.remove('show');

      stars.forEach(function (s) {
        if (s.dataset.value <= value) s.classList.add('active');
        else s.classList.remove('active');
      });

      ratingFeedback.textContent = ratingMessages[value];
      ratingFeedback.style.display = 'block';
    });

    star.addEventListener('mouseenter', function () {
      var value = this.dataset.value;
      stars.forEach(function (s) {
        s.style.filter = s.dataset.value <= value ? 'grayscale(0%)' : 'grayscale(100%)';
      });
    });
  });

  var starRating = document.getElementById('starRating');
  if (starRating) {
    starRating.addEventListener('mouseleave', function () {
      stars.forEach(function (s) {
        s.style.filter = s.classList.contains('active') ? 'grayscale(0%)' : 'grayscale(100%)';
      });
    });
  }
}

function updateAverageRating() {
  var avgRating = document.getElementById('avgRating');
  if (!avgRating) return;

  var ratings = [5, 4, 5, 3, 4, 5, 4, 4, 5, 5];
  var average = (ratings.reduce(function (a, b) { return a + b; }, 0) / ratings.length).toFixed(1);
  document.getElementById('avgRating').textContent = average;
  document.getElementById('ratingCount').textContent = ratings.length;
}


// ============================================================
// Chatbot
// (Reserved for future implementation)
// ============================================================


// ============================================================
// Utilities
// ============================================================

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidMobile(mobile) {
  return /^[0-9]{10}$/.test(mobile.replace(/\D/g, ''));
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

window.addEventListener('load', function () {
  initStarRating();
  updateAverageRating();
  highlightActiveNav();
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEnhancements);
} else {
  initEnhancements();
}
