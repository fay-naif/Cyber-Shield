/**
 * Link checker UI — reads the input, runs LinkAnalyzer, checks the host
 * against the phishing database (ThreatFeed) and renders the result.
 */
window.LinkChecker = (function () {
  "use strict";
  const { $, escapeHtml } = window.Dom;

  const VIEW = {
    high: { cls: "danger", icon: "🚨", title: "خطر مرتفع", note: "الرابط يحتوي على مؤشرات احتيال محتملة:" },
    medium: { cls: "medium", icon: "⚠️", title: "متوسط الخطورة", note: "انتبه، الرابط فيه بعض المؤشرات المشبوهة:" },
    safe: { cls: "safe", icon: "✅", title: "الرابط آمن", note: "لم نجد مؤشرات احتيال واضحة في هذا الرابط." },
  };

  function renderWarning(box, title, text) {
    box.className = "checker__result checker__result--warning";
    box.innerHTML =
      '<p class="result__title"><span aria-hidden="true">⚠️</span> ' + title + "</p>" +
      "<p>" + text + "</p>";
    box.hidden = false;
  }

  function formatDate(iso) {
    try {
      return new Date(iso).toLocaleDateString("ar-SA-u-nu-latn", { year: "numeric", month: "long", day: "numeric" });
    } catch (err) {
      return "";
    }
  }

  function feedLine(feed) {
    if (!feed || !feed.available) {
      return '<p class="result__feed result__feed--off">قاعدة بيانات الاحتيال غير متاحة الآن، الفحص تم على شكل الرابط فقط.</p>';
    }
    const status = feed.listed
      ? "⛔ هذا النطاق مُبلَّغ عنه في قوائم الاحتيال العالمية"
      : "✓ غير موجود في قوائم الاحتيال المُبلَّغ عنها";
    return '<p class="result__feed' + (feed.listed ? " result__feed--hit" : "") + '">' + status +
      '<span class="result__feed-meta">قاعدة البيانات: ' + Number(feed.total).toLocaleString("en-US") +
      " نطاق احتيالي · آخر تحديث " + formatDate(feed.updatedAt) + "</span></p>";
  }

  /** A domain found in the phishing feeds is always high risk. */
  function applyFeed(result, feed) {
    if (!feed || !feed.listed) return result;
    return Object.assign({}, result, {
      score: Math.min(result.score, 5),
      level: "high",
      reasons: ["مُبلَّغ عنه كموقع احتيال"].concat(result.reasons),
    });
  }

  function renderResult(box, result, feed) {
    const view = VIEW[result.level];
    let details = "";

    if (result.keywords.length) {
      details = '<p class="result__signals">' + result.keywords.map(escapeHtml).join(" - ") + "</p>";
    } else if (result.reasons.length) {
      details = '<ul class="result__reasons">' +
        result.reasons.map((r) => "<li>" + escapeHtml(r) + "</li>").join("") + "</ul>";
    }

    box.className = "checker__result checker__result--" + view.cls;
    box.innerHTML =
      '<p class="result__title"><span aria-hidden="true">' + view.icon + "</span> " + view.title + "</p>" +
      '<p class="result__score">درجة الأمان: <strong>' + result.score + "%</strong></p>" +
      (result.level === "safe" && !details ? "<p>" + view.note + "</p>" : (details ? "<p>" + view.note + "</p>" + details : "")) +
      feedLine(feed);
    box.hidden = false;
  }

  function init() {
    const form = $("#checkerForm");
    const input = $("#urlInput");
    const box = $("#checkerResult");
    if (!form) return;

    // Warm up the database in the background so the first check is instant.
    if (window.ThreatFeed) window.ThreatFeed.loadManifest();

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const value = input.value.trim();

      if (!value) {
        renderWarning(box, "الرجاء إدخال رابط", "أدخل الرابط أولاً ثم اضغط فحص.");
        input.focus();
        return;
      }

      const result = window.LinkAnalyzer.analyze(value);
      if (!result.valid) {
        renderWarning(box, "رابط غير صالح", "تأكد من كتابة الرابط بشكل صحيح، مثال: https://example.com");
        return;
      }

      const button = form.querySelector("button[type=submit]");
      if (button) button.disabled = true;
      box.className = "checker__result checker__result--loading";
      box.innerHTML = '<p class="result__title">جارِ الفحص…</p>';
      box.hidden = false;

      const feed = window.ThreatFeed ? await window.ThreatFeed.lookup(result.host) : null;
      if (button) button.disabled = false;

      renderResult(box, applyFeed(result, feed), feed);
    });
  }

  return { init };
})();
