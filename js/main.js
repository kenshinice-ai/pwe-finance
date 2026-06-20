/* ============================================
   PWE FINANCE — Multi-page JavaScript
   ============================================ */

(function () {
  'use strict';

  // ---------- Mobile Navigation Toggle ----------
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('mainNav');

  if (hamburger && nav) {
    hamburger.addEventListener('click', function () {
      var isOpen = nav.classList.contains('open');
      nav.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', !isOpen);
      document.body.classList.toggle('nav-open');

      // Animate hamburger icon
      if (!isOpen) {
        this.children[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        this.children[1].style.opacity = '0';
        this.children[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
      } else {
        this.children[0].style.transform = '';
        this.children[1].style.opacity = '';
        this.children[2].style.transform = '';
      }
    });

    // Close nav on link click
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        if (this.classList.contains('nav-dropdown-btn')) {
          return;
        }

        if (nav.classList.contains('open')) {
          hamburger.click();
        }
      });
    });

    // Mobile dropdown toggle
    var dropdownBtns = nav.querySelectorAll('.nav-dropdown-btn');
    dropdownBtns.forEach(function (btn) {
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
        hamburger.click();
      }
    });
  }

  // ---------- Back to Top Button ----------
  var backToTop = document.getElementById('backToTop');

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

      this.querySelectorAll('.error-msg').forEach(function (msg) { msg.textContent = ''; });
      this.querySelectorAll('input, textarea').forEach(function (field) { field.classList.remove('error'); });

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

      if (isValid) {
        var submitBtn = contactForm.querySelector('button[type="submit"]');
        var originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Enquiry Sent!';
        submitBtn.disabled = true;
        submitBtn.style.background = '#27ae60';
        submitBtn.style.borderColor = '#27ae60';

        setTimeout(function () {
          contactForm.reset();
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
          submitBtn.style.background = '';
          submitBtn.style.borderColor = '';
        }, 3000);
      }
    });

    function showError(field, message) {
      field.classList.add('error');
      var errorSpan = field.parentElement.querySelector('.error-msg');
      if (errorSpan) errorSpan.textContent = message;
    }
  }

})();
