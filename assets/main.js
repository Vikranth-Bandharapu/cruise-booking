/**
 * AURELIA OCEANIC VOYAGES — MAIN SCRIPT
 * Global navigation, drawer, FAQ accordions, tabs, toasts, and UI helpers
 */

function startMain() {
  initHeaderScroll();
  initMobileDrawer();
  initAccordions();
  initTabs();
  initNewsletterForms();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startMain);
} else {
  startMain();
}

// Sticky header scroll behavior
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

// Mobile Slide-out Drawer
function initMobileDrawer() {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const drawer = document.querySelector('.mobile-drawer');
  const overlay = document.querySelector('.mobile-drawer-overlay');
  const closeBtn = document.querySelector('.drawer-close-btn');

  if (!toggleBtn || !drawer || !overlay) return;

  const openDrawer = () => {
    drawer.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    drawer.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  toggleBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('active')) {
      closeDrawer();
    }
  });
}

// Interactive FAQ Accordions
function initAccordions() {
  const accordions = document.querySelectorAll('.accordion-item');

  accordions.forEach((item) => {
    const header = item.querySelector('.accordion-header');
    const content = item.querySelector('.accordion-content');

    if (!header || !content) return;

    header.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close sibling items within the same accordion-group
      const parentGroup = item.closest('.accordion-group');
      if (parentGroup) {
        parentGroup.querySelectorAll('.accordion-item').forEach((sibling) => {
          if (sibling !== item) {
            sibling.classList.remove('active');
            const siblingContent = sibling.querySelector('.accordion-content');
            if (siblingContent) siblingContent.style.maxHeight = null;
          }
        });
      }

      if (isActive) {
        item.classList.remove('active');
        content.style.maxHeight = null;
      } else {
        item.classList.add('active');
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });
}

// Interactive Tabs (e.g. cabin selector, blog filters)
function initTabs() {
  const tabContainers = document.querySelectorAll('[data-tabs]');

  tabContainers.forEach((container) => {
    const buttons = container.querySelectorAll('[data-tab-target]');
    const contentContainers = document.querySelectorAll(`[data-tab-content="${container.dataset.tabs}"]`);

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.tabTarget;

        buttons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        contentContainers.forEach((content) => {
          if (content.id === targetId) {
            content.style.display = 'block';
            content.classList.add('active');
          } else {
            content.style.display = 'none';
            content.classList.remove('active');
          }
        });
      });
    });
  });
}

// Global Toast System
window.showToast = function (type, title, message) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconClass = type === 'success' 
    ? 'fa-solid fa-circle-check' 
    : type === 'error' 
      ? 'fa-solid fa-circle-exclamation' 
      : 'fa-solid fa-circle-info';

  toast.innerHTML = `
    <div class="toast-icon"><i class="${iconClass}"></i></div>
    <div class="toast-body">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close" aria-label="Close Notification"><i class="fa-solid fa-xmark"></i></button>
  `;

  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  const closeToast = () => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 400);
  };

  toast.querySelector('.toast-close').addEventListener('click', closeToast);
  setTimeout(closeToast, 5000);
};

// Footer newsletter subscriptions with validation and 404 redirection
function initNewsletterForms() {
  document.querySelectorAll('.footer-newsletter-form').forEach((form) => {
    form.setAttribute('novalidate', 'true');
    const input = form.querySelector('input[type="email"], input[type="text"]');
    if (!input) return;

    // Clear validation error styling as user types
    input.addEventListener('input', () => {
      input.style.borderColor = '';
      input.style.boxShadow = '';
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const val = input.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

      // 1. Validate email first
      if (!val || !emailRegex.test(val)) {
        input.style.borderColor = '#EF4444';
        input.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.25)';
        input.focus();
        if (typeof window.showToast === 'function') {
          window.showToast('error', 'Invalid Email', 'Please provide a valid email address (e.g. name@domain.com).');
        }
        return; // Stay on the page if validation fails
      }

      // 2. Successful validation: visual confirmation and redirect to 404.html
      input.style.borderColor = '#22C55E';
      input.style.boxShadow = '0 0 0 3px rgba(34, 197, 94, 0.25)';
      if (typeof window.showToast === 'function') {
        window.showToast('success', 'Email Verified', 'Subscription confirmed! Redirecting...');
      }

      setTimeout(() => {
        window.location.href = '404.html';
      }, 400);
    });
  });
}
