/**
 * AURUM RESORT & SPA — script.js
 * --------------------------------
 * Features:
 *  1. Navbar scroll-state + mobile toggle
 *  2. Smooth scroll for anchor links
 *  3. Scroll-reveal animations (Intersection Observer)
 *  4. Booking form validation & confirmation
 *  5. Contact form validation & confirmation
 *  6. "Book Now" room buttons → pre-fill booking form
 *  7. Date input defaults & min-date enforcement
 */

/* ============================================================
   1. NAVBAR — scroll state & mobile toggle
   ============================================================ */
(function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const toggle    = document.getElementById('navToggle');
  const navLinks  = document.getElementById('navLinks');
  const allLinks  = navLinks.querySelectorAll('.nav-link');

  // Scrolled class
  function handleScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // run once on load

  // Mobile hamburger
  toggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    toggle.classList.toggle('active', isOpen);
    // Prevent body scroll when menu is open
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close mobile menu when a link is clicked
  allLinks.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      toggle.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
})();


/* ============================================================
   2. SMOOTH SCROLL for all internal anchor links
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 72; // navbar height
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


/* ============================================================
   3. SCROLL-REVEAL — Intersection Observer
   ============================================================ */
(function initReveal() {
  const revealElements = document.querySelectorAll(
    '.room-card, .about-text-col, .about-image-col, .booking-text, .booking-form, .contact-item, .contact-form, .section-header'
  );

  // Add base hidden state
  revealElements.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = `opacity 0.7s ease ${i % 3 * 0.12}s, transform 0.7s ease ${i % 3 * 0.12}s`;
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity  = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  revealElements.forEach(el => observer.observe(el));
})();


/* ============================================================
   4. DATE HELPERS — set today as min, default check-in/out
   ============================================================ */
(function initDates() {
  const checkinInput  = document.getElementById('checkin');
  const checkoutInput = document.getElementById('checkout');
  if (!checkinInput || !checkoutInput) return;

  const today    = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const dayAfter = new Date(today);
  dayAfter.setDate(today.getDate() + 2);

  const fmt = d => d.toISOString().split('T')[0];

  checkinInput.min   = fmt(today);
  checkinInput.value = fmt(tomorrow);

  checkoutInput.min   = fmt(tomorrow);
  checkoutInput.value = fmt(dayAfter);

  // When check-in changes, ensure check-out is at least one day later
  checkinInput.addEventListener('change', () => {
    const ci = new Date(checkinInput.value);
    const minCo = new Date(ci);
    minCo.setDate(ci.getDate() + 1);
    checkoutInput.min = fmt(minCo);
    if (new Date(checkoutInput.value) <= ci) {
      checkoutInput.value = fmt(minCo);
    }
  });
})();


/* ============================================================
   5. ROOM CARDS — "Book Now" pre-fills booking form
   ============================================================ */
document.querySelectorAll('.room-book-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const roomName   = btn.getAttribute('data-room');
    const roomSelect = document.getElementById('roomSelect');
    const booking    = document.getElementById('booking');

    if (roomSelect && roomName) {
      roomSelect.value = roomName;
    }

    if (booking) {
      const offset = 72;
      const top = booking.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});


/* ============================================================
   6. FORM VALIDATION — shared helpers
   ============================================================ */

/**
 * Show or clear an error on a field.
 * @param {HTMLElement} field   - The input/select/textarea
 * @param {HTMLElement} errorEl - The span for the error message
 * @param {string}      msg     - Empty string clears the error
 */
function setFieldError(field, errorEl, msg) {
  if (msg) {
    field.classList.add('error');
    errorEl.textContent = msg;
  } else {
    field.classList.remove('error');
    errorEl.textContent = '';
  }
}

/** Basic email format check */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/** Show booking / contact confirmation banner */
function showConfirmation(el, html) {
  el.innerHTML = html;
  el.classList.add('visible');
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}


/* ============================================================
   7. BOOKING FORM — validate & confirm
   ============================================================ */
(function initBookingForm() {
  const form         = document.getElementById('bookingForm');
  if (!form) return;

  const fields = {
    guestName:  { el: document.getElementById('guestName'),  err: document.getElementById('guestNameError')  },
    guestEmail: { el: document.getElementById('guestEmail'), err: document.getElementById('guestEmailError') },
    roomSelect: { el: document.getElementById('roomSelect'), err: document.getElementById('roomSelectError') },
    guests:     { el: document.getElementById('guests'),     err: document.getElementById('guestsError')     },
    checkin:    { el: document.getElementById('checkin'),    err: document.getElementById('checkinError')    },
    checkout:   { el: document.getElementById('checkout'),   err: document.getElementById('checkoutError')   },
  };

  const confirmation = document.getElementById('bookingConfirmation');

  // Clear errors on input
  Object.values(fields).forEach(({ el, err }) => {
    el.addEventListener('input',  () => setFieldError(el, err, ''));
    el.addEventListener('change', () => setFieldError(el, err, ''));
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    confirmation.classList.remove('visible');

    let valid = true;

    // Name
    if (!fields.guestName.el.value.trim()) {
      setFieldError(fields.guestName.el, fields.guestName.err, 'Please enter your full name.');
      valid = false;
    }

    // Email
    if (!fields.guestEmail.el.value.trim()) {
      setFieldError(fields.guestEmail.el, fields.guestEmail.err, 'Please enter your email address.');
      valid = false;
    } else if (!isValidEmail(fields.guestEmail.el.value)) {
      setFieldError(fields.guestEmail.el, fields.guestEmail.err, 'Please enter a valid email address.');
      valid = false;
    }

    // Room
    if (!fields.roomSelect.el.value) {
      setFieldError(fields.roomSelect.el, fields.roomSelect.err, 'Please select a room or suite.');
      valid = false;
    }

    // Guests
    const guestCount = parseInt(fields.guests.el.value, 10);
    if (!fields.guests.el.value || isNaN(guestCount) || guestCount < 1) {
      setFieldError(fields.guests.el, fields.guests.err, 'Please enter at least 1 guest.');
      valid = false;
    } else if (guestCount > 6) {
      setFieldError(fields.guests.el, fields.guests.err, 'Maximum 6 guests per booking. Contact us for groups.');
      valid = false;
    }

    // Check-in
    if (!fields.checkin.el.value) {
      setFieldError(fields.checkin.el, fields.checkin.err, 'Please select a check-in date.');
      valid = false;
    }

    // Check-out
    if (!fields.checkout.el.value) {
      setFieldError(fields.checkout.el, fields.checkout.err, 'Please select a check-out date.');
      valid = false;
    } else if (fields.checkin.el.value && fields.checkout.el.value <= fields.checkin.el.value) {
      setFieldError(fields.checkout.el, fields.checkout.err, 'Check-out must be after check-in.');
      valid = false;
    }

    if (!valid) return;

    // Calculate nights
    const ci     = new Date(fields.checkin.el.value);
    const co     = new Date(fields.checkout.el.value);
    const nights = Math.round((co - ci) / (1000 * 60 * 60 * 24));

    // Price lookup
    const prices = {
      'Deluxe Ocean Room':   320,
      'Garden Villa Suite':  480,
      'Penthouse Sky Suite': 890,
    };
    const roomName  = fields.roomSelect.el.value;
    const total     = (prices[roomName] || 0) * nights;
    const totalFmt  = total.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });

    // Format dates nicely
    const fmtDate = d => d.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });

    // Success message
    showConfirmation(confirmation, `
      <strong>🎉 Reservation Confirmed!</strong><br/>
      Thank you, <strong>${escapeHtml(fields.guestName.el.value)}</strong>. 
      Your booking for the <strong>${escapeHtml(roomName)}</strong> has been received.<br/>
      <br/>
      📅 <strong>${fmtDate(ci)}</strong> → <strong>${fmtDate(co)}</strong> · ${nights} night${nights !== 1 ? 's' : ''} · ${guestCount} guest${guestCount !== 1 ? 's' : ''}<br/>
      💰 Estimated total: <strong>${totalFmt}</strong><br/>
      <br/>
      A confirmation has been sent to <strong>${escapeHtml(fields.guestEmail.el.value)}</strong>. 
      Our concierge will contact you within 2 hours to finalise your stay.
    `);

    form.reset();
  });
})();


/* ============================================================
   8. CONTACT FORM — validate & confirm
   ============================================================ */
(function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const nameEl  = document.getElementById('contactName');
  const emailEl = document.getElementById('contactEmail');
  const msgEl   = document.getElementById('contactMsg');
  const nameErr = document.getElementById('contactNameError');
  const emailErr= document.getElementById('contactEmailError');
  const msgErr  = document.getElementById('contactMsgError');
  const confirm = document.getElementById('contactConfirmation');

  [nameEl, emailEl, msgEl].forEach((el, i) => {
    const err = [nameErr, emailErr, msgErr][i];
    el.addEventListener('input', () => setFieldError(el, err, ''));
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    confirm.classList.remove('visible');
    let valid = true;

    if (!nameEl.value.trim()) {
      setFieldError(nameEl, nameErr, 'Please enter your name.'); valid = false;
    }
    if (!emailEl.value.trim()) {
      setFieldError(emailEl, emailErr, 'Please enter your email.'); valid = false;
    } else if (!isValidEmail(emailEl.value)) {
      setFieldError(emailEl, emailErr, 'Please enter a valid email.'); valid = false;
    }
    if (!msgEl.value.trim()) {
      setFieldError(msgEl, msgErr, 'Please enter a message.'); valid = false;
    }

    if (!valid) return;

    showConfirmation(confirm, `
      <strong>✉️ Message Received!</strong><br/>
      Thank you, <strong>${escapeHtml(nameEl.value)}</strong>. 
      Our team will respond to <strong>${escapeHtml(emailEl.value)}</strong> within 24 hours.
    `);

    form.reset();
  });
})();


/* ============================================================
   9. UTILITY — HTML escaping to prevent XSS
   ============================================================ */
function escapeHtml(str) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(str).replace(/[&<>"']/g, c => map[c]);
}
