(function () {
  var root = document.querySelector(".insights");
  if (!root) return;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var tabs = Array.prototype.slice.call(root.querySelectorAll("[role='tab']"));
  var panels = Array.prototype.slice.call(root.querySelectorAll("[role='tabpanel']"));

  function selectTab(id) {
    tabs.forEach(function (tab) {
      var on = tab.getAttribute("aria-controls") === id;
      tab.setAttribute("aria-selected", on ? "true" : "false");
      tab.tabIndex = on ? 0 : -1;
    });
    panels.forEach(function (panel) {
      var on = panel.id === id;
      panel.hidden = !on;
      if (!on) return;
      requestAnimationFrame(function () {
        panel.classList.add("is-in");
        panel.querySelectorAll(".count").forEach(runCount);
      });
    });
  }

  tabs.forEach(function (tab, index) {
    tab.addEventListener("click", function () {
      selectTab(tab.getAttribute("aria-controls"));
    });
    tab.addEventListener("keydown", function (event) {
      var next = index;
      if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
      else if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = tabs.length - 1;
      else return;
      event.preventDefault();
      tabs[next].focus();
      selectTab(tabs[next].getAttribute("aria-controls"));
    });
  });

  function format(value, decimals) {
    return value.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  function runCount(el) {
    if (el.dataset.done) return;
    el.dataset.done = "1";
    var target = Number(el.dataset.count);
    var decimals = Number(el.dataset.decimals || 0);
    var prefix = el.dataset.prefix || "";
    var suffix = el.dataset.suffix || "";
    if (reduced || !Number.isFinite(target)) return;
    var start = performance.now();
    var duration = 1100;
    function frame(now) {
      var t = Math.min(1, (now - start) / duration);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = prefix + format(target * eased, decimals) + suffix;
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function reveal(panel) {
    panel.classList.add("is-in");
    panel.querySelectorAll(".count").forEach(runCount);
  }

  if (!reduced) root.classList.add("will-animate");

  var seen = false;
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || seen) return;
        seen = true;
        var current = panels.filter(function (panel) { return !panel.hidden; })[0];
        if (current) reveal(current);
        observer.disconnect();
      });
    }, { threshold: 0.2 });
    observer.observe(root);
  } else {
    panels.forEach(reveal);
  }

  var gallery = root.querySelector(".gallery");
  root.querySelectorAll("[data-gallery]").forEach(function (button) {
    button.addEventListener("click", function () {
      if (!gallery) return;
      var dir = button.getAttribute("data-gallery") === "next" ? 1 : -1;
      gallery.scrollBy({
        left: dir * Math.max(220, gallery.clientWidth * 0.8),
        behavior: reduced ? "auto" : "smooth"
      });
    });
  });

  var lightbox = document.querySelector(".lightbox");
  if (!lightbox) return;
  var frame = lightbox.querySelector(".lb-frame");
  var scroll = lightbox.querySelector(".lb-scroll");
  var image = lightbox.querySelector("img");
  var highlight = lightbox.querySelector(".hl");
  var title = lightbox.querySelector("#lb-title");
  var lastFocus = null;

  function focusBox(el, full) {
    if (full) return null;
    if (!el.dataset.w) return null;
    return {
      x: Number(el.dataset.x || 0),
      y: Number(el.dataset.y || 0),
      w: Number(el.dataset.w || 1),
      h: Number(el.dataset.h || 1)
    };
  }

  function openShot(source, full) {
    var shot = source.getAttribute("data-shot");
    var figure = document.getElementById("proof-" + shot);
    if (!figure) return;
    var thumb = figure.querySelector("img");
    var box = focusBox(source, full);
    lastFocus = source;
    image.src = thumb.currentSrc || thumb.src;
    image.alt = thumb.alt;
    title.textContent = figure.querySelector("figcaption").textContent;
    var zoom = 1;
    if (box && box.w < 0.85) zoom = Math.min(1.75, Math.max(1.15, 0.62 / box.w));
    frame.style.width = (zoom * 100) + "%";
    if (!box) {
      highlight.hidden = true;
    } else {
      highlight.hidden = false;
      highlight.style.left = (box.x * 100) + "%";
      highlight.style.top = (box.y * 100) + "%";
      highlight.style.width = (box.w * 100) + "%";
      highlight.style.height = (box.h * 100) + "%";
    }
    lightbox.hidden = false;
    document.documentElement.classList.add("lb-open");
    lightbox.querySelector(".lb-close").focus();
    function center() {
      if (highlight.hidden) {
        scroll.scrollTop = 0;
        scroll.scrollLeft = 0;
        return;
      }
      var hl = highlight.getBoundingClientRect();
      var sc = scroll.getBoundingClientRect();
      scroll.scrollTop += hl.top - sc.top - (sc.height - hl.height) / 2;
      scroll.scrollLeft += hl.left - sc.left - (sc.width - hl.width) / 2;
    }
    if (image.complete) requestAnimationFrame(center);
    else image.addEventListener("load", function once() {
      image.removeEventListener("load", once);
      center();
    });
  }

  function closeShot() {
    lightbox.hidden = true;
    document.documentElement.classList.remove("lb-open");
    if (lastFocus) lastFocus.focus();
  }

  root.querySelectorAll(".proof").forEach(function (link) {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      openShot(link, false);
    });
  });
  root.querySelectorAll(".shot-open").forEach(function (button) {
    button.addEventListener("click", function () {
      openShot(button, true);
    });
  });
  lightbox.addEventListener("click", function (event) {
    if (event.target.closest("[data-close]") || event.target === lightbox) closeShot();
  });
  document.addEventListener("keydown", function (event) {
    if (lightbox.hidden) return;
    if (event.key === "Escape") closeShot();
  });
})();
