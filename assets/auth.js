/**
 * AURELIA OCEANIC VOYAGES — AUTHENTICATION SYSTEM
 * Single Login Form with 2 Roles (Customer, Admin).
 * Accepts ANY email and ANY password for instant, frictionless sign-in.
 * Immediately redirects to customer-dashboard.html or admin-dashboard.html based on role.
 * Whichever email is entered is preserved and displayed in that dashboard's sidebar.
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

// Perform login and redirect
function performLogin(email, role, customName) {
  const selectedRole = (role || 'customer').toLowerCase();
  const defaultEmail = selectedRole === 'admin' ? 'admin@stackly.com' : 'voyager@stackly.com';
  const finalEmail = (email && email.trim()) ? email.trim() : defaultEmail;

  // Determine display name from customName, email, or role
  let displayName = customName;
  if (!displayName) {
    if (selectedRole === 'admin') {
      displayName = 'Fleet Administrator';
    } else if (finalEmail && finalEmail.includes('@')) {
      const userPart = finalEmail.split('@')[0];
      displayName = userPart.charAt(0).toUpperCase() + userPart.slice(1);
    } else if (finalEmail) {
      displayName = finalEmail.charAt(0).toUpperCase() + finalEmail.slice(1);
    } else {
      displayName = 'Guest Voyager';
    }
  }

  // Store safe non-sensitive session metadata (never store password)
  try {
    const safeSession = {
      role: selectedRole,
      name: displayName,
      email: finalEmail,
      timestamp: Date.now()
    };
    sessionStorage.setItem('aurelia_session', JSON.stringify(safeSession));
    localStorage.setItem('aurelia_session', JSON.stringify(safeSession));
    localStorage.setItem('aurelia_user_email', finalEmail);
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
      const roleTitle = selectedRole === 'admin' ? 'Admin Dashboard' : 'Customer Dashboard';
      window.showToast('success', 'Sign In Successful', `Welcome, ${displayName}! Opening ${roleTitle}...`);
    }
  } catch (err) {
    // Continue navigation regardless
  }

  // Navigate directly to target dashboard
  window.location.href = targetDashboard;
}

// Initialize Single Login Form with 2 Roles
function initLoginForm() {
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return;

  const roleSelect = document.getElementById('loginRole');
  const roleBtnCustomer = document.getElementById('roleBtnCustomer');
  const roleBtnAdmin = document.getElementById('roleBtnAdmin');
  const submitBtnText = document.getElementById('submitBtnText');
  const emailInput = document.getElementById('loginEmail');

  function setRole(role) {
    const isCustomer = (role === 'customer');
    if (roleSelect) roleSelect.value = isCustomer ? 'customer' : 'admin';

    if (roleBtnCustomer && roleBtnAdmin) {
      if (isCustomer) {
        roleBtnCustomer.classList.add('active');
        roleBtnCustomer.style.background = 'rgba(197, 168, 128, 0.1)';
        roleBtnCustomer.style.borderColor = 'var(--color-accent-gold)';
        roleBtnCustomer.style.color = '#08162B';

        roleBtnAdmin.classList.remove('active');
        roleBtnAdmin.style.background = '#FFFFFF';
        roleBtnAdmin.style.borderColor = 'var(--border-subtle)';
        roleBtnAdmin.style.color = 'var(--color-text-muted)';
      } else {
        roleBtnAdmin.classList.add('active');
        roleBtnAdmin.style.background = 'rgba(8, 22, 43, 0.08)';
        roleBtnAdmin.style.borderColor = '#08162B';
        roleBtnAdmin.style.color = '#08162B';

        roleBtnCustomer.classList.remove('active');
        roleBtnCustomer.style.background = '#FFFFFF';
        roleBtnCustomer.style.borderColor = 'var(--border-subtle)';
        roleBtnCustomer.style.color = 'var(--color-text-muted)';
      }
    }

    if (submitBtnText) {
      submitBtnText.textContent = isCustomer ? 'Sign In as Customer' : 'Sign In as Admin';
    }

    
  }

  if (roleBtnCustomer) {
    roleBtnCustomer.addEventListener('click', () => setRole('customer'));
  }
  if (roleBtnAdmin) {
    roleBtnAdmin.addEventListener('click', () => setRole('admin'));
  }

  // Handle native select changes if triggered
  if (roleSelect) {
    roleSelect.addEventListener('change', () => setRole(roleSelect.value));
  }

  // Handle Form Submission
  loginForm.addEventListener('submit', (e) => {
    if (!loginForm.checkValidity()) { return; } // Allow native browser validation
    if (e && typeof e.preventDefault === 'function') { e.preventDefault(); }

    let role = 'customer';
    if (roleSelect && roleSelect.value) {
      role = roleSelect.value;
    } else if (roleBtnAdmin && roleBtnAdmin.classList.contains('active')) {
      role = 'admin';
    }

    const email = emailInput ? emailInput.value.trim() : '';
    performLogin(email, role);
  });

  // Handle One-Click Demo Buttons
  document.querySelectorAll('.quick-demo-btn, [data-quick-demo]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const role = btn.dataset.role || 'customer';
      const email = btn.dataset.email || (role === 'admin' ? 'admin@stackly.com' : 'voyager@stackly.com');
      setRole(role);
      if (emailInput) emailInput.value = email;
      performLogin(email, role);
    });
  });
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


