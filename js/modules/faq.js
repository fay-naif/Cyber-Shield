/**
 * FAQ accordion — one answer open at a time.
 */
window.Faq = (function () {
  "use strict";
  const { $$ } = window.Dom;

  function setOpen(item, open) {
    const button = item.querySelector(".faq__question");
    const answer = item.querySelector(".faq__answer");
    item.classList.toggle("is-open", open);
    button.setAttribute("aria-expanded", String(open));
    answer.style.maxHeight = open ? answer.scrollHeight + "px" : "0px";
  }

  function init() {
    const items = $$(".faq__item");
    items.forEach((item) => {
      item.querySelector(".faq__question").addEventListener("click", () => {
        const willOpen = !item.classList.contains("is-open");
        items.forEach((other) => setOpen(other, false));
        if (willOpen) setOpen(item, true);
      });
    });
  }

  return { init };
})();
