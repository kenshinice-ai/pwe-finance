/* ============================================
   PWE FINANCE — Multi-page JavaScript
   ============================================ */

(function () {
  'use strict';

  // Signals that JS is running so the CSS scroll-reveal styles may hide
  // elements pre-reveal. Without JS this class is absent and everything
  // stays visible (no-JS fallback).
  document.documentElement.classList.add('reveal-ready');

  var prefersReducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
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

  // ---------- Scroll Reveal ----------
  // Elements with [data-reveal], plus the direct children of any
  // [data-reveal-group] container (auto-staggered), fade/slide in on scroll.
  var revealTargets = [];

  document.querySelectorAll('[data-reveal]').forEach(function (el) {
    revealTargets.push(el);
  });

  document.querySelectorAll('[data-reveal-group]').forEach(function (group) {
    var children = group.children;
    for (var i = 0; i < children.length; i++) {
      children[i].style.transitionDelay = Math.min(i * 70, 420) + 'ms';
      revealTargets.push(children[i]);
    }
  });

  function revealEverything() {
    revealTargets.forEach(function (el) {
      el.style.transitionDelay = '';
      el.classList.add('is-visible');
    });
  }

  if (revealTargets.length) {
    if (!('IntersectionObserver' in window) || prefersReducedMotion) {
      // CSS also forces visibility under reduced motion; this keeps state consistent.
      revealEverything();
    } else {
      var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

      revealTargets.forEach(function (el) {
        revealObserver.observe(el);
      });
    }
  }

  // ---------- Stats Count-up ----------
  // [data-count-to="90"] (+ optional data-count-suffix="+") animates from 0
  // when scrolled into view; reduced motion just sets the final value.
  var countEls = document.querySelectorAll('[data-count-to]');

  function setFinalCount(el) {
    el.textContent = el.getAttribute('data-count-to') +
      (el.getAttribute('data-count-suffix') || '');
  }

  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count-to'));
    var suffix = el.getAttribute('data-count-suffix') || '';

    if (isNaN(target)) {
      setFinalCount(el);
      return;
    }

    var duration = 800;
    var startTime = null;

    function step(timestamp) {
      if (startTime === null) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = Math.round(target * eased) + suffix;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    }

    window.requestAnimationFrame(step);
  }

  if (countEls.length) {
    if (!('IntersectionObserver' in window) || prefersReducedMotion) {
      countEls.forEach(setFinalCount);
    } else {
      var countObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            countObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });

      countEls.forEach(function (el) {
        countObserver.observe(el);
      });
    }
  }

  // ---------- Contact Form Validation (if on contact page) ----------
  // User-facing form strings follow the page language (zh pages set
  // <html lang="zh-CN">); everything else in this file is language-neutral.
  var IS_ZH = (document.documentElement.lang || '').toLowerCase().indexOf('zh') === 0;
  var FORM_MSG = IS_ZH ? {
    firstNameRequired: '请输入名字',
    lastNameRequired: '请输入姓氏',
    nameMin: '姓名至少需要 2 个字符',
    emailRequired: '请输入电子邮箱',
    emailInvalid: '请输入有效的电子邮箱地址',
    phoneRequired: '请输入电话号码',
    phoneInvalid: '请输入有效的电话号码',
    messageRequired: '请输入留言内容',
    messageMin: '留言内容至少需要 10 个字符',
    fixFields: '请先修正标红的字段，再提交表单。',
    notConfigured: '表单尚未配置完成，请直接致电或发送邮件与我们联系。',
    sendingBtn: '<i class="fa-solid fa-spinner fa-spin"></i> 正在发送…',
    sendingStatus: '正在发送您的咨询…',
    success: '感谢您的咨询，我们已收到您的信息，将尽快与您联系。',
    sentBtn: '<i class="fa-solid fa-check"></i> 已发送',
    error: '抱歉，您的咨询未能发送成功。请重试，或直接致电 / 发送邮件至 info@pwefinance.com.au。'
  } : {
    firstNameRequired: 'First name is required',
    lastNameRequired: 'Last name is required',
    nameMin: 'Name must be at least 2 characters',
    emailRequired: 'Email is required',
    emailInvalid: 'Please enter a valid email address',
    phoneRequired: 'Phone number is required',
    phoneInvalid: 'Please enter a valid phone number',
    messageRequired: 'Message is required',
    messageMin: 'Please enter at least 10 characters',
    fixFields: 'Please fix the highlighted fields before submitting.',
    notConfigured: 'This form is not configured yet. Please call or email us instead.',
    sendingBtn: '<i class="fa-solid fa-spinner fa-spin"></i> Sending...',
    sendingStatus: 'Sending your enquiry...',
    success: 'Thanks, your enquiry has been sent. We will be in touch soon.',
    sentBtn: '<i class="fa-solid fa-check"></i> Enquiry Sent',
    error: 'Sorry, your enquiry could not be sent. Please try again, call us, or email info@pwefinance.com.au.'
  };

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
      if (!firstName.value.trim()) { showError(firstName, FORM_MSG.firstNameRequired); isValid = false; }
      else if (firstName.value.trim().length < 2) { showError(firstName, FORM_MSG.nameMin); isValid = false; }

      // Last Name
      var lastName = document.getElementById('lastName');
      if (!lastName.value.trim()) { showError(lastName, FORM_MSG.lastNameRequired); isValid = false; }
      else if (lastName.value.trim().length < 2) { showError(lastName, FORM_MSG.nameMin); isValid = false; }

      // Email
      var email = document.getElementById('email');
      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.value.trim()) { showError(email, FORM_MSG.emailRequired); isValid = false; }
      else if (!emailRegex.test(email.value.trim())) { showError(email, FORM_MSG.emailInvalid); isValid = false; }

      // Phone
      var phone = document.getElementById('phone');
      var phoneDigits = phone.value.replace(/\D/g, '');
      if (!phone.value.trim()) { showError(phone, FORM_MSG.phoneRequired); isValid = false; }
      else if (phoneDigits.length < 9) { showError(phone, FORM_MSG.phoneInvalid); isValid = false; }

      // Message
      var message = document.getElementById('message');
      if (!message.value.trim()) { showError(message, FORM_MSG.messageRequired); isValid = false; }
      else if (message.value.trim().length < 10) { showError(message, FORM_MSG.messageMin); isValid = false; }

      if (!isValid) {
        setFormStatus(statusBox, FORM_MSG.fixFields, 'error');
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
        setFormStatus(statusBox, FORM_MSG.notConfigured, 'error');
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = FORM_MSG.sendingBtn;
      }
      setFormStatus(statusBox, FORM_MSG.sendingStatus, 'info');

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
          setFormStatus(statusBox, FORM_MSG.success, 'success');
          if (submitBtn) {
            submitBtn.innerHTML = FORM_MSG.sentBtn;
            setTimeout(function () {
              submitBtn.disabled = false;
              submitBtn.innerHTML = originalText;
            }, 4000);
          }
        })
        .catch(function () {
          setFormStatus(statusBox, FORM_MSG.error, 'error');
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
