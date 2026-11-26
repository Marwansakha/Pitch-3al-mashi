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
    var token = (el._token = (el._token || 0) + 1);
    var target = Number(el.dataset.count);
    var decimals = Number(el.dataset.decimals || 0);
    var prefix = el.dataset.prefix || "";
    var suffix = el.dataset.suffix || "";
    if (reduced || !Number.isFinite(target)) {
      if (el.dataset.text) el.textContent = el.dataset.text;
      return;
    }
    var start = performance.now();
    var duration = 1100;
    function frame(now) {
      if (el._token !== token) return;
      var t = Math.min(1, (now - start) / duration);
      var eased = 1 - Math.pow(1 - t, 3);
      if (t >= 1) {
        el.textContent = el.dataset.text || (prefix + format(target, decimals) + suffix);
        return;
      }
      el.textContent = prefix + format(target * eased, decimals) + suffix;
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function writeCount(el, raw) {
    var prefix = el.dataset.prefix || "";
    var suffix = el.dataset.suffix || "";
    var count = 0;
    var decimals = 0;
    var text = "";
    if (typeof raw === "string" && /^[+-]?[\d.]+[KMB%]$/i.test(raw.trim())) {
      var match = raw.trim().match(/^([+-]?)([\d.]+)([KMB%])$/i);
      var sign = prefix || match[1];
      decimals = match[2].indexOf(".") >= 0 ? 1 : 0;
      suffix = match[3] === "%" ? "%" : match[3].toUpperCase();
      count = Number(match[2]);
      var body = count.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
      text = sign + body + suffix;
      prefix = sign;
    } else if (suffix === "%" && typeof raw === "number") {
      count = Math.round(raw * 10) / 10;
      decimals = 1;
      text = prefix + count.toFixed(1) + "%";
    } else if (typeof raw === "number") {
      count = Math.abs(raw);
      decimals = 0;
      suffix = "";
      text = prefix + count.toLocaleString("en-US");
    } else {
      return;
    }
    el.dataset.count = String(count);
    el.dataset.decimals = String(decimals);
    if (prefix) el.dataset.prefix = prefix;
    if (suffix) el.dataset.suffix = suffix;
    else delete el.dataset.suffix;
    el.dataset.text = text;
    el.textContent = text;
    el._token = (el._token || 0) + 1;
  }

  function updateBars(group, parts) {
    if (!Array.isArray(parts)) return;
    var rows = root.querySelectorAll('[data-metric-group="' + group + '"]');
    if (!rows.length) return;
    var scale = rows[0].getAttribute("data-scale") || "percent";
    var max = 100;
    if (scale === "max") {
      max = 0;
      parts.forEach(function (part) { max = Math.max(max, Number(part.value) || 0); });
    }
    parts.forEach(function (part) {
      var row = null;
      rows.forEach(function (candidate) {
        if (candidate.getAttribute("data-metric-label") === part.label) row = candidate;
      });
      if (!row) return;
      var value = Number(part.value);
      var fill = row.querySelector(".bar-fill");
      if (fill && max) fill.style.setProperty("--w", ((value / max) * 100).toFixed(2) + "%");
      var label = row.querySelector(".bar-val");
      if (label && Number.isFinite(value)) label.textContent = value.toFixed(1) + "%";
    });
  }

  function hasMetric(metrics, key) {
    return Object.prototype.hasOwnProperty.call(metrics, key) && metrics[key] != null && metrics[key] !== "";
  }

  function ammanYMD(date) {
    var parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Amman",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(date);
    var pick = function (type) {
      return Number(parts.filter(function (part) { return part.type === type; })[0].value);
    };
    return { y: pick("year"), m: pick("month"), d: pick("day") };
  }

  function shiftDays(ymd, days) {
    var date = new Date(Date.UTC(ymd.y, ymd.m - 1, ymd.d));
    date.setUTCDate(date.getUTCDate() + days);
    return { y: date.getUTCFullYear(), m: date.getUTCMonth() + 1, d: date.getUTCDate() };
  }

  function formatYMD(ymd, withYear) {
    var options = { timeZone: "UTC", day: "numeric", month: "short" };
    if (withYear) options.year = "numeric";
    return new Intl.DateTimeFormat("en-GB", options).format(new Date(Date.UTC(ymd.y, ymd.m - 1, ymd.d)));
  }

  function pickInstant(payload, names) {
    var sources = [payload, payload.metrics || {}];
    for (var s = 0; s < sources.length; s++) {
      for (var i = 0; i < names.length; i++) {
        var value = sources[s] && sources[s][names[i]];
        if (!value) continue;
        var date = new Date(value);
        if (!Number.isNaN(date.getTime())) return date;
      }
    }
    return null;
  }

  function rangeText(payload) {
    var start = pickInstant(payload, ["windowStart", "since", "periodStart"]);
    var end = pickInstant(payload, ["windowEnd", "until", "periodEnd"]);
    var startYmd = start ? ammanYMD(start) : null;
    var endYmd = end ? ammanYMD(end) : null;
    if (!endYmd && payload.updatedAt) {
      var updated = new Date(payload.updatedAt);
      if (!Number.isNaN(updated.getTime())) {
        endYmd = ammanYMD(updated);
        startYmd = shiftDays(endYmd, -30);
      }
    }
    if (!startYmd || !endYmd) return "";
    var startLabel = formatYMD(startYmd, startYmd.y !== endYmd.y);
    return "last 30 days (" + startLabel + " – " + formatYMD(endYmd, true) + ")";
  }

  function hideMissing(metrics) {
    root.querySelectorAll("[data-live-key]").forEach(function (el) {
      var keys = el.getAttribute("data-live-key").split(/\s+/);
      var present = keys.every(function (key) { return hasMetric(metrics, key); });
      if (el.classList.contains("shot-backed")) {
        el.hidden = false;
        return;
      }
      el.hidden = !present;
    });
  }

  function applyLive(payload) {
    var metrics = payload && payload.metrics;
    if (!metrics || typeof metrics !== "object") return;
    hideMissing(metrics);
    var range = root.querySelector(".insights-title .range");
    var label = rangeText(payload);
    if (range && label) range.textContent = "· " + label;
    root.querySelectorAll("[data-metric]").forEach(function (el) {
      var key = el.dataset.metric;
      if (!hasMetric(metrics, key)) return;
      var box = el.closest("[data-live-key]");
      if (box && box.hidden) return;
      writeCount(el, metrics[key]);
    });
    ["gender", "age", "countries", "cities", "languages"].forEach(function (group) {
      updateBars(group, metrics[group]);
    });
    if (Array.isArray(metrics.gender)) {
      var men = metrics.gender.filter(function (part) { return part.label === "Men"; })[0];
      var arc = root.querySelector(".donut-arc");
      if (men && arc) arc.style.setProperty("--men", String(men.value));
    }
    var non = Number(metrics.nonFollowerViews);
    var fol = Number(metrics.followerViews);
    if (non > 0 && fol > 0) {
      var total = non + fol;
      var nonBar = root.querySelector(".split-non");
      var folBar = root.querySelector(".split-fol");
      if (nonBar) nonBar.style.setProperty("--w", ((non / total) * 100).toFixed(2) + "%");
      if (folBar) folBar.style.setProperty("--w", ((fol / total) * 100).toFixed(2) + "%");
    }
    var note = root.querySelector(".live-note");
    var stamp = ammanStamp(payload.updatedAt);
    if (note && stamp) {
      note.hidden = false;
      note.textContent = "Live numbers updated " + stamp + " (Amman time)";
    }
    root.querySelectorAll(".count").forEach(function (el) { delete el.dataset.done; });
    panels.forEach(function (panel) {
      if (panel.hidden) return;
      panel.querySelectorAll(".count").forEach(runCount);
    });
  }

  function ammanStamp(iso) {
    var date = new Date(iso);
    if (!iso || Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Amman",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    }).format(date);
  }

  fetch("/.netlify/functions/creator-metrics", { headers: { accept: "application/json" } })
    .then(function (response) {
      if (!response.ok) throw new Error("missing");
      return response.json();
    })
    .then(applyLive)
    .catch(function () {});

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
    var figure = document.getElementById("shot-" + shot);
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

  root.querySelectorAll(".see").forEach(function (link) {
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
