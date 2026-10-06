/**
 * AURELIA OCEANIC VOYAGES — DASHBOARDS ENGINE
 * Interactive filters, Chart.js integrations, modal dialogs, status updates, and countdown
 */

document.addEventListener('DOMContentLoaded', () => {
  initDashboardSidebar();
  initDashboardUserSession();
  initDashboardViewTabs();
  initDashboardCharts();
  initTableFilters();
  initDashboardModals();
  initVoyageCountdown();
  initQuickActions();
  initDashboardCtaRedirects();
});

// Dashboard View Tab Configuration
const DASHBOARD_TAB_MAP = {
  // Admin Operations Tabs
  'sec-overview': ['sec-overview', 'sec-revenue', 'sec-occupancy', 'sec-activity', 'sec-quick-actions', 'sec-system'],
  'sec-fleet': ['sec-fleet', 'sec-active-voyages', 'sec-departures'],
  'sec-packages': ['sec-packages', 'sec-destinations'],
  'sec-bookings': ['sec-bookings', 'sec-payments', 'sec-reports'],
  'sec-customers': ['sec-customers', 'sec-feedback', 'sec-staff', 'sec-notifications', 'sec-email'],

  // Customer Voyager Tabs
  'cust-welcome': ['cust-welcome', 'cust-overview', 'cust-summary', 'cust-history', 'cust-calendar'],
  'cust-upcoming': ['cust-upcoming', 'cust-itinerary', 'cust-destinations', 'cust-excursions'],
  'cust-cabin': ['cust-cabin', 'cust-companions'],
  'cust-boarding': ['cust-boarding', 'cust-spending', 'cust-documents', 'cust-email'],
  'cust-profile': ['cust-profile', 'cust-requests', 'cust-messages', 'cust-notifications', 'cust-support']
};

// Dashboard View Switching (Sidebar Navigation Panes)
function initDashboardViewTabs() {
  const sidebarLinks = document.querySelectorAll('.dashboard-sidebar .sidebar-menu a.sidebar-link');
  const allSections = document.querySelectorAll('.dashboard-content > section');
  if (!sidebarLinks.length || !allSections.length) return;

  function switchTab(targetHash, updateHistory = true) {
    if (!targetHash) return;
    const cleanId = targetHash.replace(/^#/, '');

    // Check if cleanId is a recognized tab key
    let activeTabKey = null;
    if (DASHBOARD_TAB_MAP[cleanId]) {
      activeTabKey = cleanId;
    } else {
      // Find which tab key contains this section
      for (const [key, sectionIds] of Object.entries(DASHBOARD_TAB_MAP)) {
        if (sectionIds.includes(cleanId)) {
          activeTabKey = key;
          break;
        }
      }
    }

    if (!activeTabKey || !DASHBOARD_TAB_MAP[activeTabKey]) return;

    const visibleSectionIds = DASHBOARD_TAB_MAP[activeTabKey];

    // 1. Show only sections belonging to this tab, hide the rest
    allSections.forEach(section => {
      if (visibleSectionIds.includes(section.id)) {
        section.classList.remove('dash-section-hidden');
        section.classList.add('dash-section-visible');
      } else {
        section.classList.add('dash-section-hidden');
        section.classList.remove('dash-section-visible');
      }
    });

    // 2. Highlight corresponding sidebar link
    sidebarLinks.forEach(link => {
      const linkHref = link.getAttribute('href') || '';
      const linkClean = linkHref.replace(/^#/, '');
      if (linkClean === activeTabKey) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // 3. Update URL hash cleanly
    if (updateHistory) {
      try {
        history.pushState(null, '', `#${activeTabKey}`);
      } catch (e) {
        window.location.hash = `#${activeTabKey}`;
      }
    }

    // 4. Scroll smoothly to top of dashboard content
    const mainContent = document.querySelector('.dashboard-main') || document.querySelector('.dashboard-content') || window;
    if (mainContent.scrollTo) {
      mainContent.scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 5. Close mobile sidebar and overlay if open, restore scroll
    closeDashboardSidebar();

    // 6. Resize charts inside newly revealed sections
    setTimeout(() => {
      if (window.dashboardChartInstances && window.dashboardChartInstances.length) {
        window.dashboardChartInstances.forEach(chart => {
          try {
            chart.resize();
            chart.update();
          } catch (e) {}
        });
      }
      window.dispatchEvent(new Event('resize'));
    }, 60);
  }

  // Bind click handlers to sidebar links
  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        switchTab(href, true);
      }
    });
  });

  // Also bind any buttons with data-switch-tab or data-switch-view
  document.querySelectorAll('[data-switch-tab], [data-switch-view]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = btn.dataset.switchTab || btn.dataset.switchView;
      if (target) switchTab(target, true);
    });
  });

  // Handle initial page load with hash or default to first sidebar link
  const currentHash = window.location.hash;
  if (currentHash) {
    const cleanHash = currentHash.replace(/^#/, '');
    if (DASHBOARD_TAB_MAP[cleanHash]) {
      switchTab(cleanHash, false);
      return;
    }
  }

  // Default to first sidebar link
  const firstLink = sidebarLinks[0];
  if (firstLink) {
    const firstHref = firstLink.getAttribute('href');
    if (firstHref && firstHref.startsWith('#')) {
      switchTab(firstHref, false);
    }
  }

  // Handle browser back/forward buttons
  window.addEventListener('popstate', () => {
    if (window.location.hash) {
      switchTab(window.location.hash, false);
    }
  });
}

// Background Scroll Lock Helpers for Mobile Sidebar & Drawers
function openDashboardSidebar() {
  const sidebar = document.querySelector('.dashboard-sidebar');
  const overlay = document.querySelector('.dashboard-sidebar-overlay');
  if (sidebar) sidebar.classList.add('open');
  if (overlay) overlay.classList.add('active');
  document.body.classList.add('sidebar-open');
  document.documentElement.classList.add('sidebar-open');
  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';
}

function closeDashboardSidebar() {
  const sidebar = document.querySelector('.dashboard-sidebar');
  const overlay = document.querySelector('.dashboard-sidebar-overlay');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('active');
  document.body.classList.remove('sidebar-open');
  document.documentElement.classList.remove('sidebar-open');
  document.body.style.overflow = '';
  document.documentElement.style.overflow = '';
}

// Mobile Sidebar Toggle
function initDashboardSidebar() {
  const toggleBtn = document.querySelector('.sidebar-toggle-btn');
  const sidebar = document.querySelector('.dashboard-sidebar');
  const overlay = document.querySelector('.dashboard-sidebar-overlay');

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (sidebar.classList.contains('open')) {
        closeDashboardSidebar();
      } else {
        openDashboardSidebar();
      }
    });

    if (overlay) {
      overlay.addEventListener('click', () => {
        closeDashboardSidebar();
      });

      // Prevent background touch scrolling through overlay
      overlay.addEventListener('touchmove', (e) => {
        e.preventDefault();
      }, { passive: false });
    }

    // Close when clicking outside on mobile
    document.addEventListener('click', (e) => {
      if (
        window.innerWidth <= 1024 &&
        sidebar.classList.contains('open') &&
        !sidebar.contains(e.target) &&
        !toggleBtn.contains(e.target)
      ) {
        closeDashboardSidebar();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && sidebar.classList.contains('open')) {
        closeDashboardSidebar();
      }
    });
  }
}

// Chart.js Visualizations
function initDashboardCharts() {
  if (typeof Chart === 'undefined') return;

  window.dashboardChartInstances = window.dashboardChartInstances || [];

  // Chart defaults for luxury styling
  Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";
  Chart.defaults.color = '#64748B';

  // 1. Admin Revenue Chart
  const revCanvas = document.getElementById('adminRevenueChart');
  if (revCanvas) {
    const revChart = new Chart(revCanvas.getContext('2d'), {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: '2026 Fleet Revenue ($M)',
            data: [4.2, 5.1, 6.8, 8.4, 9.2, 11.6, 13.8, 14.2, 10.5, 9.1, 7.8, 12.4],
            borderColor: '#C5A880',
            backgroundColor: 'rgba(197, 168, 128, 0.12)',
            borderWidth: 2.5,
            fill: true,
            tension: 0.35,
            pointBackgroundColor: '#08162B',
            pointBorderColor: '#C5A880',
            pointRadius: 4
          },
          {
            label: '2025 Prior Year ($M)',
            data: [3.8, 4.4, 5.2, 6.9, 7.8, 9.4, 11.2, 11.8, 8.9, 7.4, 6.5, 10.1],
            borderColor: 'rgba(2, 128, 144, 0.7)',
            borderDash: [5, 5],
            borderWidth: 2,
            fill: false,
            tension: 0.35,
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', align: 'end' }
        },
        scales: {
          y: {
            grid: { color: '#F1F5F9' },
            ticks: { callback: (val) => '$' + val + 'M' }
          },
          x: { grid: { display: false } }
        }
      }
    });
    window.dashboardChartInstances.push(revChart);
  }

  // 2. Admin Fleet Occupancy Chart
  const occCanvas = document.getElementById('adminOccupancyChart');
  if (occCanvas) {
    const occChart = new Chart(occCanvas.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: ['Owner Residences', 'Penthouse Suites', 'Veranda Cabins', 'Interior Suites'],
        datasets: [
          {
            data: [98, 94, 91, 86],
            backgroundColor: ['#C5A880', '#028090', '#08162B', '#94A3B8'],
            borderWidth: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
    window.dashboardChartInstances.push(occChart);
  }

  // 3. Customer Spending Folio Chart
  const folioCanvas = document.getElementById('customerSpendingChart');
  if (folioCanvas) {
    const folioChart = new Chart(folioCanvas.getContext('2d'), {
      type: 'bar',
      data: {
        labels: ['Dining & Wine', 'Spa & Wellness', 'Shore Excursions', 'Boutique & Art', 'Photography'],
        datasets: [
          {
            label: 'Onboard Folio Spend ($)',
            data: [1850, 720, 1450, 480, 220],
            backgroundColor: '#028090',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            grid: { color: '#F1F5F9' },
            ticks: { callback: (val) => '$' + val }
          },
          x: { grid: { display: false } }
        }
      }
    });
    window.dashboardChartInstances.push(folioChart);
  }
}

// Table Search & Filter Capabilities
function initTableFilters() {
  const packageSearch = document.getElementById('packageSearchInput');
  const packageFilter = document.getElementById('packageStatusFilter');
  const packageRows = document.querySelectorAll('#packageTableBody tr');

  if (packageSearch && packageRows.length > 0) {
    const filterPackages = () => {
      const query = packageSearch.value.toLowerCase().trim();
      const status = packageFilter ? packageFilter.value.toLowerCase() : 'all';

      packageRows.forEach((row) => {
        const text = row.textContent.toLowerCase();
        const rowStatus = row.dataset.status ? row.dataset.status.toLowerCase() : '';

        const matchesQuery = !query || text.includes(query);
        const matchesStatus = status === 'all' || rowStatus === status;

        row.style.display = matchesQuery && matchesStatus ? '' : 'none';
      });
    };

    packageSearch.addEventListener('input', filterPackages);
    if (packageFilter) packageFilter.addEventListener('change', filterPackages);
  }

  // Customer Excursion Tab Filter
  const excursionTabs = document.querySelectorAll('.excursion-filter-btn');
  const excursionCards = document.querySelectorAll('.excursion-item-card');

  if (excursionTabs.length > 0 && excursionCards.length > 0) {
    excursionTabs.forEach((btn) => {
      btn.addEventListener('click', () => {
        excursionTabs.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.dataset.category;

        excursionCards.forEach((card) => {
          if (cat === 'all' || card.dataset.category === cat) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }
}

// Dashboard Modals
function initDashboardModals() {
  const modalOpenButtons = document.querySelectorAll('[data-modal-open]');
  const modalCloseButtons = document.querySelectorAll('[data-modal-close]');

  modalOpenButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const modalId = btn.dataset.modalOpen;
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.add('show');
        document.body.classList.add('sidebar-open');
        document.documentElement.classList.add('sidebar-open');
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
      }
    });
  });

  modalCloseButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.dash-modal-backdrop');
      if (modal) {
        modal.classList.remove('show');
        document.body.classList.remove('sidebar-open');
        document.documentElement.classList.remove('sidebar-open');
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
      }
    });
  });

  // Close when clicking modal backdrop
  document.querySelectorAll('.dash-modal-backdrop').forEach((backdrop) => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        backdrop.classList.remove('show');
        document.body.classList.remove('sidebar-open');
        document.documentElement.classList.remove('sidebar-open');
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
      }
    });
    // Prevent background scrolling when dragging/touching backdrop
    backdrop.addEventListener('touchmove', (e) => {
      if (e.target === backdrop) {
        e.preventDefault();
      }
    }, { passive: false });
  });
}

// Customer Voyage Countdown Clock
function initVoyageCountdown() {
  const daysEl = document.getElementById('countdownDays');
  const hoursEl = document.getElementById('countdownHours');
  const minsEl = document.getElementById('countdownMins');
  const secsEl = document.getElementById('countdownSecs');

  if (!daysEl) return;

  // Set embarkation date 24 days in future
  const embarkDate = new Date();
  embarkDate.setDate(embarkDate.getDate() + 24);
  embarkDate.setHours(16, 0, 0, 0);

  const updateClock = () => {
    const now = new Date().getTime();
    const diff = embarkDate.getTime() - now;

    if (diff <= 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minsEl.textContent = '00';
      secsEl.textContent = '00';
      return;
    }

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    daysEl.textContent = String(d).padStart(2, '0');
    hoursEl.textContent = String(h).padStart(2, '0');
    minsEl.textContent = String(m).padStart(2, '0');
    secsEl.textContent = String(s).padStart(2, '0');
  };

  updateClock();
  setInterval(updateClock, 1000);
}

// Quick Actions Handler (redirect to 404.html)
function initQuickActions() {
  document.querySelectorAll('[data-quick-action]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = '404.html';
    });
  });
}

// Dashboard CTA Buttons Handler (all dashboard action CTAs redirect to 404.html)
function initDashboardCtaRedirects() {
  document.querySelectorAll('.dashboard-content .btn, .dash-modal-footer .btn-primary').forEach((el) => {
    if (el.classList.contains('excursion-filter-btn')) return;
    if (el.hasAttribute('data-modal-close') && !el.classList.contains('btn-primary')) return;
    if (el.hasAttribute('data-switch-tab') || el.hasAttribute('data-switch-view')) return;
    if (el.classList.contains('sidebar-toggle-btn') || el.classList.contains('sidebar-link')) return;

    el.addEventListener('click', (e) => {
      const href = el.getAttribute('href');
      if (href && href === '404.html') {
        return; // standard anchor link will navigate naturally to 404.html
      }
      e.preventDefault();
      window.location.href = '404.html';
    });
  });
}

// User Session and Email Synchronization
function initDashboardUserSession() {
  let session = null;
  try {
    const raw = sessionStorage.getItem('aurelia_session') || localStorage.getItem('aurelia_session');
    if (raw) session = JSON.parse(raw);
  } catch (err) {}

  const isAdminPage = window.location.pathname.includes('admin') || document.title.toLowerCase().includes('admin');
  const defaultEmail = isAdminPage ? 'admin@stackly.com' : 'voyager@stackly.com';
  const defaultName = isAdminPage ? 'Fleet Administrator' : 'Guest Voyager';

  const userEmail = (session && session.email) || localStorage.getItem('aurelia_user_email') || defaultEmail;
  const userName = (session && session.name) || localStorage.getItem('aurelia_user_name') || defaultName;

  // 1. Update text displays for email
  const emailTargets = document.querySelectorAll(
    '.user-display-email, #adminUserEmail, #custUserEmail, #sidebarUserEmail, #adminSidebarEmail, #custSidebarEmail'
  );
  emailTargets.forEach(el => {
    el.textContent = userEmail;
  });

  // 2. Update form inputs with email
  const emailInputs = document.querySelectorAll(
    '#custProfileEmail, input[type="email"].user-profile-input, input[name="profileEmail"]'
  );
  emailInputs.forEach(input => {
    input.value = userEmail;
  });

  // 3. Update text displays for name
  const nameTargets = document.querySelectorAll(
    '.user-display-name, #adminUserName, #custUserName, #sidebarUserName, #adminSidebarName, #custSidebarName'
  );
  nameTargets.forEach(el => {
    el.textContent = userName;
  });

  // 4. Update avatar initials
  let initials = 'U';
  if (userName && userName !== 'Guest Voyager' && userName !== 'Fleet Administrator') {
    const parts = userName.trim().split(/\s+/);
    initials = parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0].substring(0, 2).toUpperCase();
  } else if (userEmail) {
    initials = userEmail.substring(0, 2).toUpperCase();
  }

  const avatarTargets = document.querySelectorAll(
    '.user-avatar, #adminUserAvatar, #custUserAvatar, #adminSidebarAvatar, #custSidebarAvatar'
  );
  avatarTargets.forEach(avatar => {
    avatar.textContent = initials;
  });
}

