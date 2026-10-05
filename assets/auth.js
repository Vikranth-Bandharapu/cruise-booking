/**
 * AURELIA OCEANIC VOYAGES — AUTHENTICATION SYSTEM
 * Simple demonstration authentication: 2 roles (Customer, Admin).
 * Accepts ANY email and ANY password for instant, frictionless sign-in.
 * Immediately redirects to customer-dashboard.html or admin-dashboard.html based on role.
 * Never stores passwords in localStorage or sessionStorage.
 */

function startAuth() {
  initLoginForm();
  initLogoutButtons();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startAuth);
} else {
  startAuth();
}

// Initialize Login Form
function initLoginForm() {
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return;

  loginForm.addEventListener('submit', handleLoginSubmit);

  // Also attach directly to the button if present to prevent any event failure
  const submitBtn = loginForm.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.addEventListener('click', (e) => {
      // Allow form submission or handle directly
    });
  }
}

function handleLoginSubmit(e) {
  if (e && typeof e.preventDefault === 'function') {
    e.preventDefault();
  }

  const emailInput = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');
  const roleSelect = document.getElementById('loginRole');

  const rawEmail = emailInput ? emailInput.value.trim() : '';
  const rawPassword = passwordInput ? passwordInput.value : '';

  let selectedRole = 'customer';
  if (roleSelect && roleSelect.value) {
    selectedRole = roleSelect.value.toLowerCase();
  } else if (rawEmail && rawEmail.toLowerCase().includes('admin')) {
    selectedRole = 'admin';
  } else {
    selectedRole = 'customer';
  }

  const email = rawEmail || (selectedRole === 'admin' ? 'admin@stackly.com' : 'voyager@stackly.com');
  const password = rawPassword || 'demo123';

  // Determine display name from email or role
  let displayName = 'Guest Voyager';
  if (selectedRole === 'admin') {
    displayName = 'Fleet Administrator';
  } else if (rawEmail && rawEmail.includes('@')) {
    const userPart = rawEmail.split('@')[0];
    displayName = userPart.charAt(0).toUpperCase() + userPart.slice(1);
  } else if (rawEmail) {
    displayName = rawEmail.charAt(0).toUpperCase() + rawEmail.slice(1);
  }

  // Store safe non-sensitive session metadata (never store password)
  try {
    const safeSession = {
      role: selectedRole,
      name: displayName,
      email: email,
      timestamp: Date.now()
    };
    sessionStorage.setItem('aurelia_session', JSON.stringify(safeSession));
    localStorage.setItem('aurelia_session', JSON.stringify(safeSession));
    localStorage.setItem('aurelia_user_email', email);
    localStorage.setItem('aurelia_user_name', displayName);
    localStorage.setItem('aurelia_user_role', selectedRole);
  } catch (err) {
    console.warn('Storage unavailable:', err);
  }

  // Target dashboard
  const targetDashboard = selectedRole === 'admin' ? 'admin-dashboard.html' : 'customer-dashboard.html';

  // Show welcome toast if toast system is loaded
  try {
    if (typeof window.showToast === 'function') {
      const roleTitle = selectedRole === 'admin' ? 'Admin' : 'Customer';
      window.showToast('success', 'Sign In Successful', `Welcome, ${displayName}! Opening ${roleTitle} portal...`);
    }
  } catch (err) {
    // Continue navigation regardless
  }

  // Navigate directly to the dashboard
  window.location.href = targetDashboard;
}

// Global Logout Handler
function initLogoutButtons() {
  const logoutButtons = document.querySelectorAll('.logout-btn, [data-action="logout"]');

  logoutButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      try {
        sessionStorage.clear();
        localStorage.removeItem('aurelia_session');
        localStorage.removeItem('aurelia_user_email');
        localStorage.removeItem('aurelia_user_name');
        localStorage.removeItem('aurelia_user_role');
      } catch (err) {}

      // Immediately navigate to index.html with zero delay
      window.location.href = 'index.html';
    });
  });
}

// Helper validation error setters
function setError(inputElement, message) {
  if (!inputElement) return;
  inputElement.classList.add('is-invalid');
  const errorContainer = inputElement.parentElement.querySelector('.error-feedback');
  if (errorContainer) {
    errorContainer.textContent = message;
    errorContainer.classList.add('active');
  }
}

function clearErrors(form) {
  if (!form) return;
  form.querySelectorAll('.is-invalid').forEach((el) => el.classList.remove('is-invalid'));
  form.querySelectorAll('.error-feedback').forEach((el) => {
    el.textContent = '';
    el.classList.remove('active');
  });
}
