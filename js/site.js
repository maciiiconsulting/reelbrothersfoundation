(function () {
  var C = window.RBF_CONFIG || {};

  // Mobile menu
  var btn = document.querySelector(".menu-btn"), list = document.getElementById("navlist");
  function closeMenu() { list.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); }
  if (btn && list) {
    btn.addEventListener("click", function () {
      var open = list.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    list.addEventListener("click", function (e) { if (e.target.closest("a")) closeMenu(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && list.classList.contains("open")) { closeMenu(); btn.focus(); }
    });
  }

  // "Reach out" style links preselect the contact topic, on this page or via ?topic= from another page
  var TOPICS = { grieving: "I am grieving", partner: "I want to partner", volunteer: "I want to volunteer", press: "Press", other: "Other" };
  var topic = document.getElementById("cf-topic");
  function setTopic(key) { if (topic && TOPICS[key]) topic.value = TOPICS[key]; }
  Array.prototype.forEach.call(document.querySelectorAll("[data-topic]"), function (a) {
    a.addEventListener("click", function () { setTopic(a.getAttribute("data-topic")); });
  });
  var fromUrl = new URLSearchParams(location.search).get("topic");
  if (fromUrl) setTopic(fromUrl);

  // Forms post to the endpoint in js/config.js: the RBF Google Apps Script (apps-script/contact-form.gs).
  // Sent as a plain form post so no preflight is needed, and the script answers with JSON.
  function ready(url) { return !!url && url.indexOf("REPLACE_ME") === -1; }
  function say(el, msg, kind) { el.textContent = msg; el.className = "form-status" + (kind ? " " + kind : ""); }
  function send(endpoint, body, retries) {
    var again = function () { return new Promise(function (r) { setTimeout(r, 1500); }).then(function () { return send(endpoint, body, retries - 1); }); };
    return fetch(endpoint, { method: "POST", body: body, headers: { Accept: "application/json" } })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) {
          var refused = !!(j && j.ok === false);
          var res = { ok: r.ok && !refused, refused: refused, j: j };
          return (!res.ok && !refused && retries > 0) ? again() : res;
        });
      }, function (err) { if (retries > 0) return again(); throw err; });
  }
  function wire(form, endpoint, kind) {
    if (!form) return;
    var status = form.querySelector(".form-status"), submit = form.querySelector("[type=submit]");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      if (!ready(endpoint)) { say(status, "This form is not connected yet. Please check back soon.", "warn"); return; }
      var data = new FormData(form);
      data.append("page", location.pathname);
      data.append("_subject", kind === "contact" ? "RBF website: " + (data.get("topic") || "Message") : "RBF website: newsletter sign up");
      submit.disabled = true;
      say(status, "Sending\u2026", "");
      // Google can take several seconds to wake the script, so reassure, and retry once if it stumbles.
      var slow = setTimeout(function () { say(status, "Still sending. This can take a few more seconds\u2026", ""); }, 5000);
      send(endpoint, new URLSearchParams(data), 1)
        .then(function (res) {
          if (res.ok) {
            form.reset();
            say(status, kind === "contact" ? "Thank you. Your message is on its way to us." : "You are signed up. Thank you.", "ok");
            if (window.gtag) window.gtag("event", "generate_lead", { form_name: kind });
          } else {
            var m = res.j && res.j.errors ? res.j.errors.map(function (x) { return x.message; }).join(" ") : "";
            say(status, m || "Something went wrong. Please try again.", "err");
          }
        })
        .catch(function () { say(status, "That did not go through. Please check your connection and try again.", "err"); })
        .then(function () { clearTimeout(slow); submit.disabled = false; });
    });
  }
  wire(document.getElementById("contact-form"), C.FORM_ENDPOINT, "contact");
  wire(document.getElementById("news-form"), C.NEWSLETTER_ENDPOINT || C.FORM_ENDPOINT, "newsletter");

  Array.prototype.forEach.call(document.querySelectorAll("[data-year]"), function (n) { n.textContent = new Date().getFullYear(); });
})();
