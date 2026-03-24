// ── Scroll Progress Bar ──
const scrollBar = document.getElementById('scroll-bar');
function updateScrollBar() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  if (scrollBar) scrollBar.style.width = scrollPct + '%';
}
window.addEventListener('scroll', updateScrollBar, { passive: true });

// Navbar scroll effect and active states

const navbar = document.querySelector('.navbar');
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('section, header');


window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}, { passive: true });


// Mobile menu toggle
const hamburger = document.querySelector('.hamburger');
const navLinksContainer = document.querySelector('.nav-links');

if (hamburger) {
  hamburger.addEventListener('click', () => {
    navLinksContainer.style.display = navLinksContainer.style.display === 'flex' ? 'none' : 'flex';
    navLinksContainer.style.flexDirection = 'column';
    navLinksContainer.style.position = 'absolute';
    navLinksContainer.style.top = '100%';
    navLinksContainer.style.left = '0';
    navLinksContainer.style.width = '100%';
    navLinksContainer.style.background = 'var(--glass-bg)';
    navLinksContainer.style.padding = '2rem 0';
    navLinksContainer.style.backdropFilter = 'blur(10px)';
  });
}

// ── Certificate Carousel ──
let certIdx = 0;
const track = document.getElementById('cert-track');
const cards = track ? track.querySelectorAll('.cert-card') : [];
const dotsContainer = document.getElementById('cert-dots');
let cardsPerView = getCardsPerView();
let totalPages = cards.length ? Math.ceil(cards.length / cardsPerView) : 0;

function getCardsPerView() {
  if (window.innerWidth < 640) return 1;
  if (window.innerWidth < 900) return 2;
  return 3;
}

function buildDots() {
  if (!dotsContainer) return;
  dotsContainer.innerHTML = '';
  for (let i = 0; i < totalPages; i++) {
    const d = document.createElement('div');
    d.className = 'dot' + (i === 0 ? ' active' : '');
    d.onclick = () => { certIdx = i; updateCarousel(); };
    dotsContainer.appendChild(d);
  }
}

function updateCarousel() {
  if (!track || cards.length === 0) return;
  const cardWidth = cards[0].offsetWidth + 24;
  track.style.transform = `translateX(-${certIdx * cardsPerView * cardWidth}px)`;
  document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === certIdx));
}

window.moveCarousel = function (dir) {
  if (totalPages === 0) return;
  certIdx = Math.max(0, Math.min(totalPages - 1, certIdx + dir));
  updateCarousel();
};

if (track && dotsContainer) {
  buildDots();
  window.addEventListener('resize', () => {
    cardsPerView = getCardsPerView();
    totalPages = Math.ceil(cards.length / cardsPerView);
    certIdx = 0;
    buildDots();
    updateCarousel();
  });
}

// ── Theme Toggle Logic ──
const themeToggleBtn = document.getElementById('theme-toggle');
const qlThemeToggle = document.getElementById('ql-theme-toggle');
const body = document.body;

function applyTheme(theme) {
  if (theme === 'light') {
    body.setAttribute('data-theme', 'light');
    if (themeToggleBtn) themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
    if (qlThemeToggle) qlThemeToggle.innerHTML = '<i class="fas fa-moon"></i>';
  } else {
    body.removeAttribute('data-theme');
    if (themeToggleBtn) themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
    if (qlThemeToggle) qlThemeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  }
  localStorage.setItem('theme', theme);
}

function toggleTheme() {
  const current = body.getAttribute('data-theme');
  applyTheme(current === 'light' ? 'dark' : 'light');
}

// Boot: restore saved theme
const savedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
applyTheme(savedTheme || (prefersDark ? 'dark' : 'light'));

if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);
if (qlThemeToggle) qlThemeToggle.addEventListener('click', toggleTheme);

// ── Quick-Links active tracking ──
const qlLinks = document.querySelectorAll('.ql-link');
function updateActiveQL() {
  let current = '';
  document.querySelectorAll('section[id], div[id="home"]').forEach(sec => {
    if (window.scrollY + window.innerHeight * 0.4 >= sec.offsetTop) {
      current = sec.id;
    }
  });
  // Update navbar active link
  document.querySelectorAll('.nl-link').forEach(link => {
    const href = link.getAttribute('href').replace('#', '');
    link.classList.toggle('active', href === current || (current === '' && href === 'home'));
  });
}
window.addEventListener('scroll', updateActiveQL, { passive: true });
updateActiveQL();


// ── Scroll Animations (Intersection Observer) ──
const observerOptions = {
  root: null,
  rootMargin: '0px 0px -60px 0px',
  threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
  let delay = 0;
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Element entered viewport → animate IN with stagger
      const el = entry.target;
      setTimeout(() => {
        el.classList.add('is-visible');
      }, delay);
      delay += 80;
    } else {
      // Element left viewport → reset so it re-animates next time
      entry.target.classList.remove('is-visible');
    }
  });
}, observerOptions);

document.querySelectorAll('.fade-up, .fade-in, .slide-in-left, .slide-in-right').forEach((el) => {
  observer.observe(el);
});


// ── Contact Form — EmailJS Integration ──
window.handleContactSubmit = function (e) {
  e.preventDefault();
  const form = document.getElementById('contactForm');
  const success = document.getElementById('contactSuccess');
  const submitBtn = form.querySelector('.contact-submit');
  if (!form || !success || !submitBtn) return;

  // Show loading state
  const originalBtnText = submitBtn.innerHTML;
  submitBtn.innerHTML = 'Sending... <i class="fas fa-spinner fa-spin"></i>';
  submitBtn.disabled = true;

  // Prepare parameters matching your EmailJS template variables
  const templateParams = {
    name: document.getElementById('c-name').value,
    email: document.getElementById('c-email').value,
    message: document.getElementById('c-message').value,
  };

  // Send via EmailJS (Service ID, Template ID, Params)
  emailjs.send('service_mgivs84', 'template_j19bq2p', templateParams)
    .then(() => {
      // Fade form to invisible
      form.style.transition = 'opacity 0.35s ease';
      form.style.opacity = '0';
      form.style.pointerEvents = 'none';

      setTimeout(() => {
        success.classList.add('is-visible');
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
      }, 350);

      // Reset & restore form after 5 seconds
      setTimeout(() => {
        success.classList.remove('is-visible');
        setTimeout(() => {
          form.reset();
          form.style.opacity = '1';
          form.style.pointerEvents = '';
        }, 400);
      }, 5000);
    }, (error) => {
      console.error('FAILED...', error);
      alert('There was an error sending your message. Please try again later.');
      submitBtn.innerHTML = originalBtnText;
      submitBtn.disabled = false;
    });
};

// ── Hero Typing Effect ──
const typedRoleEl = document.querySelector('.hero-typed-role');
const roles = ["Data & AI Enthusiast", "Aspiring Software Developer"];
let roleIdx = 0;
let charIdx = 0;
let isDeleting = false;
let typeSpeed = 100;

function typeEffect() {
  const currentRole = roles[roleIdx];

  if (isDeleting) {
    typedRoleEl.textContent = currentRole.substring(0, charIdx - 1);
    charIdx--;
    typeSpeed = 50;
  } else {
    typedRoleEl.textContent = currentRole.substring(0, charIdx + 1);
    charIdx++;
    typeSpeed = 150;
  }

  if (!isDeleting && charIdx === currentRole.length) {
    isDeleting = true;
    typeSpeed = 2000; // Pause at the end of word
  } else if (isDeleting && charIdx === 0) {
    isDeleting = false;
    roleIdx = (roleIdx + 1) % roles.length;
    typeSpeed = 500; // Pause before typing next word
  }

  setTimeout(typeEffect, typeSpeed);
}

document.addEventListener('DOMContentLoaded', () => {
  if (typedRoleEl) {
    setTimeout(typeEffect, 1000);
  }
});
