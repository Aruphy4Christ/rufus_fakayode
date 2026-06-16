/* ============================================================
   Rufus — Portfolio site logic
   Handles: nav state, scroll reveals, hero terminal typing,
   skill bar animation, portfolio filtering, contact form
   validation + simulated submit, live clock in status bar.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- mobile nav toggle ---------- */
  const navToggle = document.getElementById('navToggle');
  const navLinks  = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => navLinks.classList.remove('open'));
    });
  }

  /* ---------- mark active nav link ---------- */
  const current = (location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('.navlinks a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === current || (current === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  /* ---------- live status clock (uptime feel) ---------- */
  const clockEl = document.getElementById('liveClock');
  if (clockEl) {
    const tick = () => {
      const now = new Date();
      clockEl.textContent = now.toLocaleTimeString('en-GB', { hour12: false });
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  /* ---------- proficiency bar fill on view ---------- */
  const bars = document.querySelectorAll('.barfill');
  if ('IntersectionObserver' in window && bars.length) {
    const barIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target.getAttribute('data-fill') || '0';
          entry.target.style.width = target + '%';
          barIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    bars.forEach(b => barIO.observe(b));
  } else {
    bars.forEach(b => { b.style.width = (b.getAttribute('data-fill') || '0') + '%'; });
  }

  /* ---------- hero terminal: typed command sequence ---------- */
  const termBody = document.getElementById('termBody');
  if (termBody) {
    const lines = [
      { type: 'cmd', text: 'whoami' },
      { type: 'out', text: 'rufus — it technologist' },
      { type: 'cmd', text: 'cat roles.txt' },
      { type: 'out', text: 'network engineer · cloud engineer · web developer' },
      { type: 'cmd', text: 'systemctl status uptime' },
      { type: 'out', text: 'active (running) — always learning, always shipping', cyan: true },
    ];

    termBody.innerHTML = '';
    let lineIndex = 0;

    function typeLine() {
      if (lineIndex >= lines.length) {
        const cur = document.createElement('span');
        cur.className = 'cursor';
        termBody.appendChild(cur);
        return;
      }
      const line = lines[lineIndex];
      const row = document.createElement('div');
      row.style.marginBottom = '10px';

      if (line.type === 'cmd') {
        const prompt = document.createElement('span');
        prompt.className = 'promptline';
        prompt.textContent = 'rufus@portfolio:~$ ';
        const cmdSpan = document.createElement('span');
        row.appendChild(prompt);
        row.appendChild(cmdSpan);
        termBody.appendChild(row);

        let i = 0;
        const typeChar = () => {
          if (i <= line.text.length) {
            cmdSpan.textContent = line.text.slice(0, i);
            i++;
            setTimeout(typeChar, 38);
          } else {
            lineIndex++;
            setTimeout(typeLine, 220);
          }
        };
        typeChar();
      } else {
        row.className = line.cyan ? 'cyan' : 'out';
        row.textContent = line.text;
        termBody.appendChild(row);
        lineIndex++;
        setTimeout(typeLine, 260);
      }
    }
    typeLine();
  }

  /* ---------- animated stat counters ---------- */
  const counters = document.querySelectorAll('[data-counter]');
  if (counters.length) {
    const counterIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-counter'), 10) || 0;
        const duration = 1200;
        const start = performance.now();
        const suffix = el.getAttribute('data-suffix') || '';

        function step(ts) {
          const progress = Math.min((ts - start) / duration, 1);
          const value = Math.floor(progress * target);
          el.textContent = value + suffix;
          if (progress < 1) requestAnimationFrame(step);
          else el.textContent = target + suffix;
        }
        requestAnimationFrame(step);
        counterIO.unobserve(el);
      });
    }, { threshold: 0.4 });
    counters.forEach(c => counterIO.observe(c));
  }

  /* ---------- portfolio filtering ---------- */
  const filterBtns = document.querySelectorAll('.filterbtn');
  const projectCards = document.querySelectorAll('.pcard');
  if (filterBtns.length && projectCards.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter');

        projectCards.forEach(card => {
          const cat = card.getAttribute('data-cat');
          const show = filter === 'all' || cat === filter;
          card.style.display = show ? '' : 'none';
        });
      });
    });
  }

  /* ---------- contact form validation + simulated send ---------- */
  const form = document.getElementById('contactForm');
  if (form) {
    const statusBox = document.getElementById('formStatus');

    const validators = {
      name: (v) => v.trim().length >= 2 || 'Enter your full name.',
      email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || 'Enter a valid email address.',
      subject: (v) => v.trim().length >= 3 || 'Add a short subject line.',
      message: (v) => v.trim().length >= 10 || 'Message should be at least 10 characters.'
    };

    function validateField(field) {
      const name = field.name;
      const rule = validators[name];
      if (!rule) return true;
      const result = rule(field.value);
      const wrapper = field.closest('.field');
      const errEl = wrapper.querySelector('.err');
      if (result === true) {
        wrapper.classList.remove('invalid');
        return true;
      } else {
        wrapper.classList.add('invalid');
        if (errEl) errEl.textContent = result;
        return false;
      }
    }

    form.querySelectorAll('input, textarea').forEach(field => {
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', () => {
        if (field.closest('.field').classList.contains('invalid')) validateField(field);
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fields = form.querySelectorAll('input, textarea');
      let allValid = true;
      fields.forEach(f => { if (!validateField(f)) allValid = false; });

      if (!allValid) {
        statusBox.className = 'show';
        statusBox.style.background = 'rgba(255,92,92,0.08)';
        statusBox.style.border = '1px solid #FF5C5C';
        statusBox.style.color = '#FF5C5C';
        statusBox.textContent = '✕ fix the highlighted fields above';
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'sending...';
      submitBtn.disabled = true;

      setTimeout(() => {
        statusBox.className = 'show ok';
        statusBox.textContent = '✓ message queued — rufus will respond within 24h';
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        form.reset();
      }, 900);
    });
  }

});
