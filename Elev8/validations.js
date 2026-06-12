/* ========================================
   ELEV8 WEBSITE - JAVASCRIPT VALIDATIONS
   ======================================== */

/* ========================================
   1. STAR RATING SYSTEM
   ======================================== */

/**
 * Initialize star rating system with emoji feedback
 * Adds click and hover event listeners to star elements
 */
function initStarRating() {
  const stars = document.querySelectorAll('.star');
  if (stars.length === 0) return;

  const ratingValue = document.getElementById('ratingValue');
  const ratingFeedback = document.getElementById('ratingFeedback');

  // Rating feedback messages for each star level
  const ratingMessages = {
    1: '😢 Very Bad - We\'re sorry to hear that!',
    2: '😞 Poor - Please tell us how we can improve',
    3: '😐 Average - What can we do better?',
    4: '😊 Good - Great to hear!',
    5: '😄 Excellent - Thank you so much!'
  };

  // Handle star click
  stars.forEach(star => {
    star.addEventListener('click', function() {
      const value = this.dataset.value;
      ratingValue.value = value;

      // Remove error message if it was showing
      const ratingError = document.getElementById('ratingError');
      if (ratingError) {
        ratingError.classList.remove('show');
      }

      // Update star appearance (fill selected stars)
      stars.forEach(s => {
        if (s.dataset.value <= value) {
          s.classList.add('active');
        } else {
          s.classList.remove('active');
        }
      });

      // Show appropriate feedback message
      ratingFeedback.textContent = ratingMessages[value];
      ratingFeedback.style.display = 'block';
    });

    // Handle hover effect
    star.addEventListener('mouseenter', function() {
      const value = this.dataset.value;
      stars.forEach(s => {
        if (s.dataset.value <= value) {
          s.style.filter = 'grayscale(0%)';
        } else {
          s.style.filter = 'grayscale(100%)';
        }
      });
    });
  });

  // Reset hover effect when mouse leaves rating area
  const starRating = document.getElementById('starRating');
  if (starRating) {
    starRating.addEventListener('mouseleave', function() {
      stars.forEach(s => {
        if (s.classList.contains('active')) {
          s.style.filter = 'grayscale(0%)';
        } else {
          s.style.filter = 'grayscale(100%)';
        }
      });
    });
  }
}

/* ========================================
   2. AVERAGE RATING CALCULATION
   ======================================== */

/**
 * Calculate and display average rating
 * Updates the average rating display on feedback page
 */
function updateAverageRating() {
  const avgRating = document.getElementById('avgRating');
  if (!avgRating) return;

  // Simulated ratings data - replace with actual data from backend
  const ratings = [5, 4, 5, 3, 4, 5, 4, 4, 5, 5];
  const average = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);
  
  document.getElementById('avgRating').textContent = average;
  document.getElementById('ratingCount').textContent = ratings.length;
}

/**
 * Parse fetch response as JSON safely
 * @param {Response} response - Fetch response object
 * @returns {Promise<Object>} Parsed JSON payload
 */
function parseJsonResponse(response) {
  return response.text().then((text) => {
    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error(text || 'Invalid JSON response from server');
    }
  });
}

/**
 * Show auth message above form submit button
 * @param {string} containerId - Message element id
 * @param {string} message - Message text
 * @param {boolean} isSuccess - True for success style
 */
function showAuthMessage(containerId, message, isSuccess) {
  const box = document.getElementById(containerId);
  if (!box) return;

  box.className = isSuccess ? 'alert alert-success mt-3 mb-2' : 'alert alert-danger mt-3 mb-2';
  box.textContent = message;
  box.style.display = 'block';
}

/* ========================================
   3. SIGN UP FORM VALIDATION
   ======================================== */

/**
 * Validate sign up form
 * Checks: name, email, mobile, password, gender, terms
 * @param {Event} event - Form submit event
 */
function validateSignUp(event) {
  event.preventDefault();
  
  // Get form elements
  const name = document.getElementById('name');
  const email = document.getElementById('email');
  const mobile = document.getElementById('mobile');
  const password = document.getElementById('password');
  const confirmPassword = document.getElementById('confirmPassword');
  const gender = document.getElementsByName('gender');
  const terms = document.getElementById('terms');
  
  // Get error display elements
  const nameError = document.getElementById('nameError');
  const emailError = document.getElementById('emailError');
  const mobileError = document.getElementById('mobileError');
  const passwordError = document.getElementById('passwordError');
  const confirmPasswordError = document.getElementById('confirmPasswordError');
  const genderError = document.getElementById('genderError');
  const termsError = document.getElementById('termsError');

  // Reset dynamic message text
  emailError.textContent = 'Email is required!';
  mobileError.textContent = 'Mobile number is required!';
  passwordError.textContent = 'Password is required!';
  confirmPasswordError.textContent = 'Please confirm password!';

  const messageBox = document.getElementById('signupMessage');
  if (messageBox) {
    messageBox.style.display = 'none';
    messageBox.textContent = '';
  }
  
  let isValid = true;
  
  // Hide all errors initially
  nameError.classList.remove('show');
  emailError.classList.remove('show');
  mobileError.classList.remove('show');
  passwordError.classList.remove('show');
  confirmPasswordError.classList.remove('show');
  genderError.classList.remove('show');
  termsError.classList.remove('show');
  
  // Remove invalid styling
  name.classList.remove('is-invalid');
  email.classList.remove('is-invalid');
  mobile.classList.remove('is-invalid');
  password.classList.remove('is-invalid');
  confirmPassword.classList.remove('is-invalid');
  
  // Validate Name
  if (name.value.trim() === '') {
    nameError.classList.add('show');
    name.classList.add('is-invalid');
    isValid = false;
  }
  
  // Validate Email
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
  
  // Validate Mobile Number
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
  
  // Validate Password
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
  
  // Validate Confirm Password
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
  
  // Validate Gender selection
  let genderSelected = false;
  for (let i = 0; i < gender.length; i++) {
    if (gender[i].checked) {
      genderSelected = true;
      break;
    }
  }
  if (!genderSelected) {
    genderError.classList.add('show');
    isValid = false;
  }
  
  // Validate Terms and Conditions acceptance
  if (!terms.checked) {
    termsError.classList.add('show');
    isValid = false;
  }
  
  // Submit to backend if all validations pass
  if (isValid) {
    const form = document.getElementById('signupForm');
    const formData = new FormData(form);

    fetch('php/register_user.php', {
      method: 'POST',
      body: formData
    })
    .then(parseJsonResponse)
    .then((data) => {
      if (!data.success) {
        showAuthMessage('signupMessage', data.message || 'Registration failed', false);
        return;
      }

      showAuthMessage('signupMessage', data.message || 'Registration successful', true);

      const modal = new bootstrap.Modal(document.getElementById('successModal'));
      modal.show();
      form.reset();

      modal._element.addEventListener('hidden.bs.modal', () => {
        window.location.href = 'sign_in.html';
      }, { once: true });
    })
    .catch((error) => {
      console.error('Error:', error);
      showAuthMessage('signupMessage', 'Registration failed. Please check XAMPP Apache/MySQL and try again. Details: ' + error.message, false);
    });

    return false;
  }
  
  return false;
}

/* ========================================
   4. SIGN IN FORM VALIDATION
   ======================================== */

/**
 * Validate sign in form
 * Checks: email and password
 * @param {Event} event - Form submit event
 */
function validateSignIn(event) {
  event.preventDefault();
  
  // Get form elements
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  
  // Get error elements
  const emailError = document.getElementById('emailError');
  const passwordError = document.getElementById('passwordError');

  // Reset dynamic message text
  emailError.textContent = 'Email is required!';

  const messageBox = document.getElementById('signinMessage');
  if (messageBox) {
    messageBox.style.display = 'none';
    messageBox.textContent = '';
  }
  
  let isValid = true;
  
  // Hide all errors
  emailError.classList.remove('show');
  passwordError.classList.remove('show');
  
  // Remove invalid styling
  email.classList.remove('is-invalid');
  password.classList.remove('is-invalid');
  
  // Validate Email
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
  
  // Validate Password
  if (password.value === '') {
    passwordError.classList.add('show');
    password.classList.add('is-invalid');
    isValid = false;
  }
  
  // Submit to backend if validation passes
  if (isValid) {
    const form = document.getElementById('signinForm');
    const formData = new FormData(form);

    fetch('php/login_user.php', {
      method: 'POST',
      body: formData
    })
    .then(parseJsonResponse)
    .then((data) => {
      if (!data.success) {
        showAuthMessage('signinMessage', data.message || 'Sign in failed', false);
        return;
      }

      showAuthMessage('signinMessage', data.message || 'Sign in successful', true);

      const modal = new bootstrap.Modal(document.getElementById('successModal'));
      modal.show();

      // Redirect to home after modal is closed
      modal._element.addEventListener('hidden.bs.modal', () => {
        window.location.href = 'index.html';
      }, { once: true });
    })
    .catch((error) => {
      console.error('Error:', error);
      showAuthMessage('signinMessage', 'Sign in failed. Please check XAMPP Apache/MySQL and try again. Details: ' + error.message, false);
    });

    return false;
  }
  
  return false;
}

/* ========================================
   5. DELETE ACCOUNT VALIDATION
   ======================================== */

/**
 * Validate delete account form
 * Checks: email, password, and confirmation checkbox
 * @param {Event} event - Form submit event
 */
function validateDeleteAccount(event) {
  event.preventDefault();
  
  // Get form elements
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const confirmDelete = document.getElementById('confirmDelete');
  
  // Get error elements
  const emailError = document.getElementById('emailError');
  const passwordError = document.getElementById('passwordError');
  const confirmDeleteError = document.getElementById('confirmDeleteError');

  // Reset dynamic message text
  emailError.textContent = 'Email is required!';

  const messageBox = document.getElementById('deleteMessage');
  if (messageBox) {
    messageBox.style.display = 'none';
    messageBox.textContent = '';
  }
  
  let isValid = true;
  
  // Hide all errors
  emailError.classList.remove('show');
  passwordError.classList.remove('show');
  confirmDeleteError.classList.remove('show');
  
  // Remove invalid styling
  email.classList.remove('is-invalid');
  password.classList.remove('is-invalid');
  
  // Validate Email
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
  
  // Validate Password
  if (password.value === '') {
    passwordError.classList.add('show');
    password.classList.add('is-invalid');
    isValid = false;
  }
  
  // Validate Confirmation checkbox
  if (!confirmDelete.checked) {
    confirmDeleteError.classList.add('show');
    isValid = false;
  }
  
  // Submit to backend if validation passes
  if (isValid) {
    const form = document.getElementById('deleteAccountForm');
    const formData = new FormData(form);

    fetch('php/delete_user.php', {
      method: 'POST',
      body: formData
    })
    .then(parseJsonResponse)
    .then((data) => {
      if (!data.success) {
        showAuthMessage('deleteMessage', data.message || 'Account deletion failed', false);
        return;
      }

      showAuthMessage('deleteMessage', data.message || 'Account deleted successfully', true);

      const modal = new bootstrap.Modal(document.getElementById('successModal'));
      modal.show();
      form.reset();
    })
    .catch((error) => {
      console.error('Error:', error);
      showAuthMessage('deleteMessage', 'Account deletion failed. Please check XAMPP Apache/MySQL and try again. Details: ' + error.message, false);
    });

    return false;
  }
  
  return false;
}

/* ========================================
   6. FEEDBACK FORM VALIDATION
   ======================================== */

/**
 * Validate feedback form
 * Checks: all personal info, category, rating, and feedback text
 * @returns {boolean} - True if valid, false otherwise
 */
function validateFeedbackForm() {
  // Get all form elements
  const firstName = document.getElementById('firstName');
  const middleName = document.getElementById('middleName');
  const lastName = document.getElementById('lastName');
  const age = document.getElementById('age');
  const dob = document.getElementById('dob');
  const email = document.getElementById('email');
  const phone = document.getElementById('phone');
  const category = document.getElementById('suggestionCategory');
  const ratingValue = document.getElementById('ratingValue');
  const feedback = document.getElementById('feedback');

  // Get all error display elements
  const firstNameError = document.getElementById('firstNameError');
  const middleNameError = document.getElementById('middleNameError');
  const lastNameError = document.getElementById('lastNameError');
  const ageError = document.getElementById('ageError');
  const dobError = document.getElementById('dobError');
  const emailError = document.getElementById('emailError');
  const phoneError = document.getElementById('phoneError');
  const categoryError = document.getElementById('categoryError');
  const ratingError = document.getElementById('ratingError');
  const feedbackError = document.getElementById('feedbackError');

  // Return false if elements don't exist
  if (!firstName || !middleName || !lastName || !age || !dob || !email || !phone || !category || !ratingValue || !feedback) {
    return false;
  }

  let isValid = true;

  // Reset error messages to default
  middleNameError.textContent = 'Middle name should contain only letters!';
  ageError.textContent = 'Please enter a valid age between 10 and 100!';
  emailError.textContent = 'Email is required!';
  phoneError.textContent = 'Phone number is required!';
  feedbackError.textContent = 'Feedback is required!';

  // Hide all errors
  firstNameError.classList.remove('show');
  middleNameError.classList.remove('show');
  lastNameError.classList.remove('show');
  ageError.classList.remove('show');
  dobError.classList.remove('show');
  emailError.classList.remove('show');
  phoneError.classList.remove('show');
  categoryError.classList.remove('show');
  ratingError.classList.remove('show');
  feedbackError.classList.remove('show');

  // Remove invalid styling
  firstName.classList.remove('is-invalid');
  middleName.classList.remove('is-invalid');
  lastName.classList.remove('is-invalid');
  age.classList.remove('is-invalid');
  dob.classList.remove('is-invalid');
  email.classList.remove('is-invalid');
  phone.classList.remove('is-invalid');
  category.classList.remove('is-invalid');
  feedback.classList.remove('is-invalid');

  // Validate First Name
  if (firstName.value.trim() === '') {
    firstNameError.classList.add('show');
    firstName.classList.add('is-invalid');
    isValid = false;
  }

  // Validate Middle Name only when provided (optional field)
  if (middleName.value.trim() !== '' && !/^[A-Za-z\s]+$/.test(middleName.value.trim())) {
    middleNameError.textContent = 'Middle name should contain only letters!';
    middleNameError.classList.add('show');
    middleName.classList.add('is-invalid');
    isValid = false;
  }

  // Validate Last Name
  if (lastName.value.trim() === '') {
    lastNameError.classList.add('show');
    lastName.classList.add('is-invalid');
    isValid = false;
  }

  // Validate Age only when provided (optional field)
  if (age.value.trim() !== '') {
    const ageNumber = parseInt(age.value, 10);
    if (isNaN(ageNumber) || ageNumber < 10 || ageNumber > 100) {
      ageError.textContent = 'Please enter a valid age between 10 and 100!';
      ageError.classList.add('show');
      age.classList.add('is-invalid');
      isValid = false;
    }
  }

  // Validate Date of Birth
  if (dob.value.trim() === '') {
    dobError.classList.add('show');
    dob.classList.add('is-invalid');
    isValid = false;
  }

  // Validate Email
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

  // Validate Phone Number (10 digits)
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

  // Validate Category
  if (category.value.trim() === '') {
    categoryError.classList.add('show');
    category.classList.add('is-invalid');
    isValid = false;
  }

  // Validate Rating
  if (ratingValue.value.trim() === '') {
    ratingError.classList.add('show');
    isValid = false;
  }

  // Validate Feedback (minimum 10 characters)
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

/* ========================================
   7. FEEDBACK FORM SUBMISSION
   ======================================== */

/**
 * Submit feedback form via AJAX
 * Sends form data to backend and handles response
 * @param {Event} event - Form submit event
 */
function submitFeedbackForm(event) {
  event.preventDefault();

  // Validate form before submission
  if (!validateFeedbackForm()) {
    return false;
  }
  
  // Get form data
  const form = document.getElementById('feedbackForm');
  const formData = new FormData(form);

  // Send data to backend
  fetch('php/create_submission.php', {
    method: 'POST',
    body: formData
  })
  .then(async (response) => {
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error(text || 'Invalid JSON response from server');
    }
  })
  .then(data => {
    if (data.success) {
      // Show success message
      alert('Thank you! Your feedback has been submitted successfully.');
      // Redirect to submissions page
      window.location.href = 'submissions.php';
    } else {
      alert('Error: ' + data.message);
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Submission failed. Please check XAMPP Apache/MySQL and try again. Details: ' + error.message);
  });
}

/* ========================================
   8. UTILITY VALIDATION FUNCTIONS
   ======================================== */

/**
 * Validate email format using regex
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if valid email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate mobile number (10 digits)
 * @param {string} mobile - Mobile number to validate
 * @returns {boolean} - True if valid 10-digit number
 */
function isValidMobile(mobile) {
  const mobileRegex = /^[0-9]{10}$/;
  return mobileRegex.test(mobile.replace(/\D/g, ''));
}

/* ========================================
   9. NAVIGATION HIGHLIGHTING
   ======================================== */

/**
 * Highlight current page link in navbar
 * Adds active class to the current page's navigation link
 */
function highlightActiveNav() {
  const links = document.querySelectorAll('.navbar-nav .nav-link');
  const current = window.location.pathname.split('/').pop();
  
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href === current) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/* ========================================
   10. PAGE LOAD INITIALIZATION
   ======================================== */

/**
 * Initialize all scripts when page loads
 * Runs: star rating, average rating, active nav highlighting
 */
window.addEventListener('load', function() {
  initStarRating();
  updateAverageRating();
  highlightActiveNav();
});

/* ========================================
   END OF VALIDATIONS.JS
   ======================================== */