// ===== THEME MANAGEMENT =====
function initTheme() {
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeIcon(theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  updateThemeIcon(next);
}

function updateThemeIcon(theme) {
  const btn = document.querySelector('.theme-toggle');
  if (btn) {
    btn.innerHTML = theme === 'dark' ? '&#9728;' : '&#9790;';
    btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }
}

// ===== NAVBAR =====
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');

  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    });
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(link => {
    const href = link.getAttribute('href');
    if (href && (currentPath === href || (href === '/' && currentPath === '/'))) {
      link.classList.add('active');
    }
  });
}

// ===== SCROLL ANIMATIONS =====
function initScrollAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.animate-in').forEach(el => observer.observe(el));
}

// ===== TOAST NOTIFICATIONS =====
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icons = { success: '&#10003;', error: '&#10007;', info: '&#8505;' };
  toast.innerHTML = `<span>${icons[type] || icons.info}</span> ${message}`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ===== COUNTER ANIMATION =====
function animateCounters() {
  const counters = document.querySelectorAll('.stat-number, .dash-stat-value, .stat-value, .hero-stat .stat-value');
  counters.forEach(counter => {
    const text = counter.textContent.trim();
    const match = text.match(/([\d,]+)/);
    if (!match) return;

    const target = parseInt(match[1].replace(/,/g, ''), 10);
    if (isNaN(target) || target === 0) return;

    const prefix = text.substring(0, text.indexOf(match[1]));
    const suffix = text.substring(text.indexOf(match[1]) + match[1].length);
    const duration = 1500;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);
      counter.textContent = prefix + current.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  });
}

// ===== SEARCH =====
function initSearch() {
  const searchBtn = document.querySelector('.search-btn');
  if (searchBtn) {
    searchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const inputs = document.querySelectorAll('.search-input-group input');
      const query = Array.from(inputs).map(i => i.value.trim()).filter(Boolean).join(' ');
      if (query) {
        showToast(`Searching for "${query}"...`, 'info');
      } else {
        showToast('Enter a search term to find jobs', 'info');
      }
    });
  }
}

// ===== FILTER CHIPS =====
function initFilters() {
  const chips = document.querySelectorAll('.filter-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const wasActive = chip.classList.contains('active');
      if (!chip.closest('.filter-bar')?.dataset.multi) {
        chips.forEach(c => c.classList.remove('active'));
      }
      if (!wasActive) chip.classList.add('active');
    });
  });
}

// ===== FORM HANDLING =====
// LOGIN and REGISTER forms are NOT intercepted here
// They submit normally to Flask via POST
function initForms() {

  // Contact form only
  const contactForm = document.querySelector('#contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('Message sent successfully!', 'success');
      contactForm.reset();
    });
  }

  // Apply form only
  const applyForm = document.querySelector('#apply-form');
  if (applyForm) {
    applyForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('Application submitted successfully!', 'success');
    });
  }
}

// ===== FILE UPLOAD =====
function initFileUpload() {
  const uploadArea = document.querySelector('.file-upload');
  if (uploadArea) {
    uploadArea.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.pdf,.doc,.docx';
      input.addEventListener('change', () => {
        if (input.files.length) {
          const name = input.files[0].name;
          uploadArea.innerHTML = `<div class="upload-icon">&#128196;</div><p><span>${name}</span></p><p style="font-size:var(--fs-xs);color:var(--text-muted);margin-top:4px">Click to change file</p>`;
          showToast('Resume uploaded', 'success');
        }
      });
      input.click();
    });

    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = 'var(--primary)';
      uploadArea.style.background = 'rgba(10, 132, 255, 0.05)';
    });

    uploadArea.addEventListener('dragleave', () => {
      uploadArea.style.borderColor = '';
      uploadArea.style.background = '';
    });

    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = '';
      uploadArea.style.background = '';
      if (e.dataTransfer.files.length) {
        const name = e.dataTransfer.files[0].name;
        uploadArea.innerHTML = `<div class="upload-icon">&#128196;</div><p><span>${name}</span></p><p style="font-size:var(--fs-xs);color:var(--text-muted);margin-top:4px">Click to change file</p>`;
        showToast('Resume uploaded', 'success');
      }
    });
  }
}

// ===== SIDEBAR NAV =====
function initSidebar() {
  const links = document.querySelectorAll('.sidebar-nav a');
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });
}

// ===== SMOOTH SCROLL =====
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavbar();
  initScrollAnimations();
  initSearch();
  initFilters();
  initForms();
  initFileUpload();
  initSidebar();
  initSmoothScroll();

  // Theme toggle button
  const themeBtn = document.querySelector('.theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', toggleTheme);
  }

  // Counter animation
  const statsSection = document.querySelector('.stats-section, .hero-stats');
  if (statsSection) {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        animateCounters();
        observer.disconnect();
      }
    }, { threshold: 0.3 });
    observer.observe(statsSection);
  }
});