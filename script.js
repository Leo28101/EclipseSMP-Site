document.body.classList.add('intro-lock');

const intro = document.getElementById('intro');
const site = document.getElementById('site');
const menuBtn = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');
const toast = document.getElementById('toast');

window.addEventListener('load', () => {
  setTimeout(() => {
    intro.classList.add('hide');
    site.classList.remove('site-hidden');
    site.classList.add('site-show');
    document.body.classList.remove('intro-lock');

    setTimeout(() => {
      intro.remove();
    }, 1200);
  }, 3600);
});

if (menuBtn && navLinks) {
  menuBtn.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1800);
}

document.querySelectorAll('[data-ip]').forEach(btn => {
  btn.addEventListener('click', async () => {
    const ip = btn.dataset.ip;
    try {
      await navigator.clipboard.writeText(ip);
      showToast('IP copiée : ' + ip);
    } catch {
      showToast('IP : ' + ip);
    }
  });
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: .12 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

const stars = document.getElementById('stars');
if (stars) {
  for (let i = 0; i < 65; i++) {
    const s = document.createElement('span');
    s.className = 'star';
    s.style.left = Math.random() * 100 + '%';
    s.style.top = Math.random() * 100 + '%';
    s.style.animationDelay = Math.random() * 3 + 's';
    s.style.animationDuration = (2 + Math.random() * 4) + 's';
    stars.appendChild(s);
  }
}
