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
    '05:30': '5:30 AM', '06:30': '6:30 AM', '07:30': '7:30 AM', '09:00': '9:00 AM',
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
    '05:30': '5:30 AM', '06:30': '6:30 AM', '07:30': '7:30 AM', '09:00': '9:00 AM',
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
      image:       '../assets/images/icon/elev8_icon.jpg',
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
// Task 5 — Dashboard Stat Counter
// Animates a plain numeric string from 0 to its final value.
// Non-numeric values (e.g. "Active", "—") are set directly.
// ============================================================

function animateDashStatValue(el, finalText) {
  if (!el) return;
  if (reduceMotion) { el.textContent = finalText; return; }

  var num = parseFloat(finalText);
  if (isNaN(num) || num === 0) {
    el.textContent = finalText;
    return;
  }

  var suffix = finalText.replace(/[\d.,]+/, '');
  var start  = null;
  var dur    = 900;

  function step(ts) {
    if (!start) start = ts;
    var p     = Math.min((ts - start) / dur, 1);
    var eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(num * eased) + suffix;
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}


// ============================================================
// Dashboard — Render Stats Strip
// ============================================================

function renderStats(user, bookings) {
  var now       = new Date();
  var thisMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');

  var bkMonth = bookings.filter(function (b) {
    return b.status === 'confirmed' && b.class_date.startsWith(thisMonth);
  }).length;

  var subEl   = document.getElementById('statSubStatus');
  var expEl   = document.getElementById('statExpiry');
  var sinceEl = document.getElementById('statMemberSince');
  var bkMonEl = document.getElementById('statBkMonth');

  // Animate the numeric booking count
  animateDashStatValue(bkMonEl, String(bkMonth));

  if (sinceEl) sinceEl.textContent = user.member_since || '—';

  if (subEl) {
    var st = user.subscription_status;
    subEl.textContent = st === 'active' ? 'Active' : st === 'expired' ? 'Expired' : 'Inactive';
    subEl.style.color = st === 'active' ? '#86efac' : '#fca5a5';
  }

  if (expEl) {
    if (user.subscription_expires) {
      expEl.textContent = new Date(user.subscription_expires)
        .toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' });
    } else {
      expEl.textContent = 'N/A';
    }
  }
}



/* ===========================================================
   Gallery category filter
   =========================================================== */
