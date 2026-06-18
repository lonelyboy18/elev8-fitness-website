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



// Character counter for contact form message field
(function () {
  var ta = document.getElementById('ct-message');
  var counter = document.getElementById('ct-messageCount');
  if (!ta || !counter) return;
  var max = parseInt(ta.getAttribute('maxlength'), 10) || 500;
  ta.addEventListener('input', function () {
    var len = ta.value.length;
    counter.textContent = len + '/' + max;
    counter.classList.toggle('near-limit', len >= max * 0.8 && len < max);
    counter.classList.toggle('at-limit', len >= max);
  });
}());

// Reviews pagination — 3 cards per page
(function () {
  var grid = document.getElementById('reviewsGrid');
  if (!grid) return;

  var cards = Array.prototype.slice.call(grid.querySelectorAll('.review-card'));
  var btns  = Array.prototype.slice.call(document.querySelectorAll('.reviews-pg-btn'));
  var current = 1;

  function showPage(page) {
    cards.forEach(function (card) {
      if (parseInt(card.dataset.page, 10) === page) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
    btns.forEach(function (btn) {
      btn.classList.toggle('active', parseInt(btn.dataset.page, 10) === page);
    });
    current = page;
  }

  btns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var page = parseInt(btn.dataset.page, 10);
      if (page === current) return;
      showPage(page);
      // Smooth scroll to section heading
      var section = document.getElementById('reviews');
      if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // Init — show page 1, hide page 2
  showPage(1);
}());
