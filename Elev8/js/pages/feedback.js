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


