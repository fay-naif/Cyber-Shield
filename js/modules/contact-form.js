/**
 * Contact form validation. The site is static, so a valid message
 * shows a confirmation and clears the form.
 */
window.ContactForm = (function () {
  "use strict";
  const { $ } = window.Dom;

  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function init() {
    const form = $("#contactForm");
    if (!form) return;

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const fields = {
        name: $("#contactName"),
        email: $("#contactEmail"),
        message: $("#contactMessage"),
      };

      const errors = {
        name: !fields.name.value.trim(),
        email: !EMAIL_PATTERN.test(fields.email.value.trim()),
        message: fields.message.value.trim().length < 5,
      };

      Object.keys(fields).forEach((key) => fields[key].classList.toggle("is-invalid", errors[key]));

      if (errors.name || errors.email || errors.message) {
        const msg = errors.email && !errors.name ? "الرجاء إدخال بريد إلكتروني صحيح" : "الرجاء تعبئة جميع الحقول";
        window.Toast.show(msg, "error");
        return;
      }

      form.reset();
      window.Toast.show("تم إرسال رسالتك بنجاح، شكراً لتواصلك ✅");
    });
  }

  return { init };
})();
