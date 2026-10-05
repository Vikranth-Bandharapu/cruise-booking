/**
 * AURELIA OCEANIC VOYAGES — FORM VALIDATION MODULE
 * Rigorous client-side validation for Signup, Contact, and General forms.
 * Inline real-time feedback, toasts, no browser alert().
 */

document.addEventListener('DOMContentLoaded', () => {
  initSignupValidation();
  initContactValidation();
});

// ==========================================================================
// SIGNUP VALIDATION
// ==========================================================================
function initSignupValidation() {
  const signupForm = document.getElementById('signupForm');
  if (!signupForm) return;

  const nameInput = document.getElementById('signupName');
  const emailInput = document.getElementById('signupEmail');
  const phoneInput = document.getElementById('signupPhone');
  const passInput = document.getElementById('signupPassword');
  const confirmInput = document.getElementById('signupConfirmPassword');

  // Real-time input validation listeners
  if (nameInput) {
    nameInput.addEventListener('input', () => validateName(nameInput));
  }
  if (emailInput) {
    emailInput.addEventListener('input', () => validateEmail(emailInput));
  }
  if (phoneInput) {
    phoneInput.addEventListener('input', () => validatePhone(phoneInput));
  }
  if (passInput) {
    passInput.addEventListener('input', () => {
      validatePassword(passInput);
      if (confirmInput.value) validateConfirmPassword(passInput, confirmInput);
    });
  }
  if (confirmInput) {
    confirmInput.addEventListener('input', () => validateConfirmPassword(passInput, confirmInput));
  }

  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const isNameValid = validateName(nameInput);
    const isEmailValid = validateEmail(emailInput);
    const isPhoneValid = validatePhone(phoneInput);
    const isPassValid = validatePassword(passInput);
    const isConfirmValid = validateConfirmPassword(passInput, confirmInput);

    if (!isNameValid || !isEmailValid || !isPhoneValid || !isPassValid || !isConfirmValid) {
      window.showToast('error', 'Validation Notice', 'Please correct the highlighted errors before registering.');
      return;
    }

    // Never store passwords in localStorage/sessionStorage
    const safeRegisteredUser = {
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      phone: phoneInput.value.trim(),
      role: 'Customer',
      registeredAt: new Date().toISOString()
    };

    // Show success feedback
    window.showToast(
      'success',
      'Registration Successful',
      `Welcome to Aurelia, ${safeRegisteredUser.name}! Your account has been registered. Redirecting to login...`
    );

    // Flow requirement: Redirect to login.html
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1800);
  });
}

// ==========================================================================
// CONTACT FORM VALIDATION
// ==========================================================================
function initContactValidation() {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;

  const nameInput = document.getElementById('contactName');
  const emailInput = document.getElementById('contactEmail');
  const phoneInput = document.getElementById('contactPhone');
  const inquirySelect = document.getElementById('contactInquiryType');
  const destinationSelect = document.getElementById('contactDestination');
  const dateInput = document.getElementById('contactDate');
  const guestsInput = document.getElementById('contactGuests');
  const messageInput = document.getElementById('contactMessage');

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    let valid = true;

    // Validate Name
    if (!nameInput.value.trim()) {
      setFieldError(nameInput, 'Full Name is required.');
      valid = false;
    } else {
      setFieldSuccess(nameInput);
    }

    // Validate Email
    if (!emailInput.value.trim()) {
      setFieldError(emailInput, 'Email address is required.');
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) {
      setFieldError(emailInput, 'Please provide a valid email address.');
      valid = false;
    } else {
      setFieldSuccess(emailInput);
    }

    // Validate Phone
    if (!phoneInput.value.trim()) {
      setFieldError(phoneInput, 'Telephone number is required.');
      valid = false;
    } else if (!/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{7,15}$/.test(phoneInput.value.trim())) {
      setFieldError(phoneInput, 'Please enter a valid telephone number format.');
      valid = false;
    } else {
      setFieldSuccess(phoneInput);
    }

    // Validate Inquiry Type
    if (!inquirySelect.value) {
      setFieldError(inquirySelect, 'Please select an inquiry category.');
      valid = false;
    } else {
      setFieldSuccess(inquirySelect);
    }

    // Validate Preferred Destination
    if (!destinationSelect.value) {
      setFieldError(destinationSelect, 'Please choose a voyage destination.');
      valid = false;
    } else {
      setFieldSuccess(destinationSelect);
    }

    // Validate Travel Date
    if (!dateInput.value) {
      setFieldError(dateInput, 'Please specify an intended departure date.');
      valid = false;
    } else {
      setFieldSuccess(dateInput);
    }

    // Validate Number of Guests
    if (!guestsInput.value || parseInt(guestsInput.value, 10) < 1) {
      setFieldError(guestsInput, 'Please enter at least 1 guest.');
      valid = false;
    } else {
      setFieldSuccess(guestsInput);
    }

    // Validate Message
    if (!messageInput.value.trim() || messageInput.value.trim().length < 15) {
      setFieldError(messageInput, 'Please provide a detailed inquiry message (minimum 15 characters).');
      valid = false;
    } else {
      setFieldSuccess(messageInput);
    }

    if (!valid) {
      window.showToast('error', 'Inquiry Incomplete', 'Please fill in all required fields accurately.');
      return;
    }

    // Notice: Client-side demo disclosure
    window.showToast(
      'success',
      'Inquiry Logged (Demo Mode)',
      `Thank you, ${nameInput.value.trim()}. Your demo inquiry for ${destinationSelect.value} has been recorded in the demonstration portal.`
    );

    contactForm.reset();
    clearAllValidationStates(contactForm);
  });
}

// ==========================================================================
// VALIDATION HELPER FUNCTIONS
// ==========================================================================
function validateName(input) {
  if (!input) return false;
  const val = input.value.trim();
  if (!val) {
    setFieldError(input, 'Full Name is required.');
    return false;
  }
  if (val.length < 3) {
    setFieldError(input, 'Full Name must be at least 3 characters.');
    return false;
  }
  setFieldSuccess(input);
  return true;
}

function validateEmail(input) {
  if (!input) return false;
  const val = input.value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!val) {
    setFieldError(input, 'Email is required.');
    return false;
  }
  if (!emailRegex.test(val)) {
    setFieldError(input, 'Please enter a valid email address (e.g. user@domain.com).');
    return false;
  }
  setFieldSuccess(input);
  return true;
}

function validatePhone(input) {
  if (!input) return false;
  const val = input.value.trim();
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{7,15}$/;
  if (!val) {
    setFieldError(input, 'Phone number is required.');
    return false;
  }
  if (!phoneRegex.test(val)) {
    setFieldError(input, 'Enter a valid phone format with country/area code.');
    return false;
  }
  setFieldSuccess(input);
  return true;
}

function validatePassword(input) {
  if (!input) return false;
  const val = input.value;
  if (!val) {
    setFieldError(input, 'Password is required.');
    return false;
  }
  setFieldSuccess(input);
  return true;
}

function validateConfirmPassword(passInput, confirmInput) {
  if (!confirmInput || !passInput) return false;
  const passVal = passInput.value;
  const confirmVal = confirmInput.value;

  if (!confirmVal) {
    setFieldError(confirmInput, 'Please confirm your password.');
    return false;
  }
  if (passVal !== confirmVal) {
    setFieldError(confirmInput, 'Passwords do not match.');
    return false;
  }
  setFieldSuccess(confirmInput);
  return true;
}

function validateRole(select) {
  if (!select) return true;
  const val = select.value;
  if (!val || (val !== 'Customer' && val !== 'Admin')) {
    setFieldError(select, 'Please designate your account role.');
    return false;
  }
  setFieldSuccess(select);
  return true;
}

function setFieldError(input, message) {
  input.classList.add('is-invalid');
  input.classList.remove('is-valid');
  const errorContainer = input.parentElement.querySelector('.error-feedback');
  if (errorContainer) {
    errorContainer.textContent = message;
    errorContainer.classList.add('active');
  }
}

function setFieldSuccess(input) {
  input.classList.remove('is-invalid');
  input.classList.add('is-valid');
  const errorContainer = input.parentElement.querySelector('.error-feedback');
  if (errorContainer) {
    errorContainer.textContent = '';
    errorContainer.classList.remove('active');
  }
}

function clearAllValidationStates(form) {
  form.querySelectorAll('.is-invalid, .is-valid').forEach((el) => {
    el.classList.remove('is-invalid', 'is-valid');
  });
  form.querySelectorAll('.error-feedback').forEach((el) => {
    el.textContent = '';
    el.classList.remove('active');
  });
}
