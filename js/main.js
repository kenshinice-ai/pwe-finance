/* ============================================
   PWE FINANCE — Multi-page JavaScript
   ============================================ */

(function () {
  'use strict';

  /**
   * Keeps the mobile navigation state and its accessibility attributes in sync.
   * The site is static, so interaction errors are handled visibly in the UI
   * instead of relying on route changes or framework state.
   */
  function setMobileNavOpen(isOpen, hamburger, nav) {
    nav.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('nav-open', isOpen);

    hamburger.children[0].style.transform = isOpen ? 'rotate(45deg) translate(5px, 5px)' : '';
    hamburger.children[1].style.opacity = isOpen ? '0' : '';
    hamburger.children[2].style.transform = isOpen ? 'rotate(-45deg) translate(5px, -5px)' : '';
  }

  // ---------- Mobile Navigation Toggle ----------
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('mainNav');

  if (hamburger && nav) {
    hamburger.addEventListener('click', function () {
      setMobileNavOpen(!nav.classList.contains('open'), hamburger, nav);
    });

    // Close nav on link click
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        if (this.classList.contains('nav-dropdown-btn')) {
          return;
        }

        if (nav.classList.contains('open')) {
          setMobileNavOpen(false, hamburger, nav);
        }
      });
    });

    // Mobile dropdown toggle
    var dropdownBtns = nav.querySelectorAll('.nav-dropdown-btn');
    dropdownBtns.forEach(function (btn) {
      btn.setAttribute('aria-expanded', 'false');

      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var parentItem = this.closest('.nav-item');
        if (parentItem) {
          var isDropdownOpen = parentItem.classList.toggle('dropdown-open');
          this.setAttribute('aria-expanded', isDropdownOpen);
        }
      });
    });

    // Close nav on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        setMobileNavOpen(false, hamburger, nav);
      }
    });
  }

  // ---------- Back to Top Button ----------
  var backToTop = document.getElementById('backToTop');

  if (backToTop) {
    backToTop.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  window.addEventListener('scroll', function () {
    if (backToTop) {
      if (window.pageYOffset > 600) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    }
  }, { passive: true });

  // ---------- FAQ Accordion ----------
  var faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach(function (question) {
    question.addEventListener('click', function () {
      var answer = this.nextElementSibling;
      var isOpen = this.getAttribute('aria-expanded') === 'true';

      // Close all other FAQs
      faqQuestions.forEach(function (otherQ) {
        if (otherQ !== question) {
          otherQ.setAttribute('aria-expanded', 'false');
          otherQ.nextElementSibling.classList.remove('open');
        }
      });

      this.setAttribute('aria-expanded', !isOpen);
      answer.classList.toggle('open');
    });
  });

  // ---------- Contact Form Validation (if on contact page) ----------
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var isValid = true;
      var submitBtn = contactForm.querySelector('button[type="submit"]');
      var statusBox = document.getElementById('contactFormStatus');
      var originalText = submitBtn ? submitBtn.innerHTML : '';

      this.querySelectorAll('.error-msg').forEach(function (msg) { msg.textContent = ''; });
      this.querySelectorAll('input, textarea').forEach(function (field) { field.classList.remove('error'); });
      setFormStatus(statusBox, '', '');

      // First Name
      var firstName = document.getElementById('firstName');
      if (!firstName.value.trim()) { showError(firstName, 'First name is required'); isValid = false; }
      else if (firstName.value.trim().length < 2) { showError(firstName, 'Name must be at least 2 characters'); isValid = false; }

      // Last Name
      var lastName = document.getElementById('lastName');
      if (!lastName.value.trim()) { showError(lastName, 'Last name is required'); isValid = false; }
      else if (lastName.value.trim().length < 2) { showError(lastName, 'Name must be at least 2 characters'); isValid = false; }

      // Email
      var email = document.getElementById('email');
      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.value.trim()) { showError(email, 'Email is required'); isValid = false; }
      else if (!emailRegex.test(email.value.trim())) { showError(email, 'Please enter a valid email address'); isValid = false; }

      // Phone
      var phone = document.getElementById('phone');
      var phoneDigits = phone.value.replace(/\D/g, '');
      if (!phone.value.trim()) { showError(phone, 'Phone number is required'); isValid = false; }
      else if (phoneDigits.length < 9) { showError(phone, 'Please enter a valid phone number'); isValid = false; }

      // Message
      var message = document.getElementById('message');
      if (!message.value.trim()) { showError(message, 'Message is required'); isValid = false; }
      else if (message.value.trim().length < 10) { showError(message, 'Please enter at least 10 characters'); isValid = false; }

      if (!isValid) {
        setFormStatus(statusBox, 'Please fix the highlighted fields before submitting.', 'error');
        return;
      }

      submitContactForm(contactForm, submitBtn, originalText, statusBox);
    });

    function showError(field, message) {
      field.classList.add('error');
      var errorSpan = field.parentElement.querySelector('.error-msg');
      if (errorSpan) errorSpan.textContent = message;
    }

    /**
     * Sends the validated static-site enquiry to the configured Formspree form.
     * Failures are shown to the user so the form never silently pretends to send.
     */
    function submitContactForm(form, submitBtn, originalText, statusBox) {
      var endpoint = form.getAttribute('action');
      if (!endpoint || endpoint.indexOf('formspree.io/f/') === -1) {
        setFormStatus(statusBox, 'This form is not configured yet. Please call or email us instead.', 'error');
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
      }
      setFormStatus(statusBox, 'Sending your enquiry...', 'info');

      fetch(endpoint, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      })
        .then(function (response) {
          if (!response.ok) {
            throw new Error('Formspree returned ' + response.status);
          }

          form.reset();
          setFormStatus(statusBox, 'Thanks, your enquiry has been sent. We will be in touch soon.', 'success');
          if (submitBtn) {
            submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Enquiry Sent';
            setTimeout(function () {
              submitBtn.disabled = false;
              submitBtn.innerHTML = originalText;
            }, 4000);
          }
        })
        .catch(function () {
          setFormStatus(statusBox, 'Sorry, your enquiry could not be sent. Please try again, call us, or email info@pwefinance.com.au.', 'error');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
          }
        });
    }

    function setFormStatus(statusBox, message, type) {
      if (!statusBox) return;
      statusBox.textContent = message;
      statusBox.className = type ? 'form-status ' + type : 'form-status';
    }
  }

})();
