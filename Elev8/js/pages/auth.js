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


