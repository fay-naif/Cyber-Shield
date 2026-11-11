/**
 * Customer reviews: renders the default reviews plus any the visitor adds.
 * Added reviews are kept in localStorage so they survive a refresh.
 */
window.Reviews = (function () {
  "use strict";
  const { $, escapeHtml } = window.Dom;

  const STORAGE_KEY = "cyber-shield:reviews";
  const MAX_STARS = 5;

  const DEFAULT_REVIEWS = [
    { name: "أحمد محمد", text: "ساعدني الموقع أكتشف رابط احتيالي قبل ما أدخل بياناتي البنكية.", stars: 5 },
    { name: "سارة خالد", text: "التصميم جميل والتحليل واضح وسريع جداً.", stars: 5 },
    { name: "خالد فهد", text: "منصة ممتازة وتحتاج فقط مزيد من الخصائص.", stars: 4 },
  ];

  function stars(count) {
    return "★".repeat(count) + "☆".repeat(MAX_STARS - count);
  }

  function cardHtml(review) {
    return (
      '<article class="card review">' +
      '<div class="review__stars" aria-label="' + review.stars + ' من 5">' + stars(review.stars) + "</div>" +
      '<p class="review__text">' + escapeHtml(review.text) + "</p>" +
      '<p class="review__name">' + escapeHtml(review.name) + "</p>" +
      "</article>"
    );
  }

  function render(list) {
    const saved = window.Storage2.read(STORAGE_KEY, []);
    list.innerHTML = DEFAULT_REVIEWS.concat(saved).map(cardHtml).join("");
  }

  function init() {
    const list = $("#reviewsList");
    const form = $("#reviewForm");
    if (!list || !form) return;

    render(list);

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const nameInput = $("#reviewName");
      const textInput = $("#reviewText");
      const name = nameInput.value.trim();
      const text = textInput.value.trim();

      nameInput.classList.toggle("is-invalid", !name);
      textInput.classList.toggle("is-invalid", !text);
      if (!name || !text) {
        window.Toast.show("الرجاء كتابة الاسم والتقييم", "error");
        return;
      }

      const saved = window.Storage2.read(STORAGE_KEY, []);
      saved.push({ name, text, stars: MAX_STARS });
      window.Storage2.write(STORAGE_KEY, saved);

      render(list);
      form.reset();
      window.Toast.show("شكراً لك! تمت إضافة تقييمك");
      document.getElementById("reviews").scrollIntoView({ behavior: "smooth" });
    });
  }

  return { init };
})();
