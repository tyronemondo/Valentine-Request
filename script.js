(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var stage = document.getElementById("stage");
    var title = document.getElementById("title");
    var subtitle = document.getElementById("subtitle");
    var bar = document.getElementById("progressBar");
    var toastEl = document.getElementById("toast");
    var heartsEl = document.getElementById("hearts");
    var toLine = document.getElementById("toLine");
    var audioBtn = document.getElementById("toggleAudio");

    // If anything essential is missing, show a clear message instead of failing silently.
    if (!stage || !title || !subtitle || !bar || !toastEl || !heartsEl || !toLine || !audioBtn) {
      document.body.innerHTML = "<div style='padding:24px;font-family:system-ui;color:#fff;'>Something didn’t load. Make sure index.html, style.css, and script.js are in the repo root.</div>";
      return;
    }

    toLine.innerHTML = "To <span style='color: rgba(255,143,184,1); font-weight:700;'>Shao</span>,";

    var STEPS = [
      {
        title: "Hi there my Babushka.",
        subtitle: "I put together this little something with a (not so) surprise at the end. I hope you like it.",
        prompt: "Are you ready?",
        options: [
          { label: "Let's Do it!!", next: 1, sound: "ok", kind: "primary" },
          { label: "Next Time", toast: "KWANA!!", sound: "kwana" }
        ]
      },
      {
        title: "Question one.",
        subtitle: "Who said \"I love you\" first?",
        options: [
          { label: "Shao", toast: "Nope. Try again.", sound: "nope" },
          { label: "Ty", toast: "And after all this time I'm still falling harder and harder for you", next: 2, sound: "correct", kind: "primary" }
        ]
      },
      {
        title: "Question two.",
        subtitle: "Who is always right?",
        options: [
          { label: "Shao", toast: "Toruk Makto knows best.", next: 3, sound: "correct", kind: "primary" },
          { label: "Ty", disabled: true }
        ]
      },
      {
        title: "Question three.",
        subtitle: "What is a cute date you want to go on?",
        input: true
      },
      { final: true }
    ];

    var step = 0;
    var dateIdea = "";

    // Sound
    var audioCtx = null;
    var audioEnabled = false;

    audioBtn.addEventListener("click", function () {
      audioEnabled = true;
      playSfx("ok");
      var t = audioBtn.querySelector(".quiet-text");
      if (t) t.textContent = "Sound on";
    });

    // Hearts
    startHearts();

    // Render first screen
    render();

    function render() {
      stage.innerHTML = "";
      bar.style.width = Math.round((step / STEPS.length) * 100) + "%";

      var s = STEPS[step];
      title.textContent = s.title || "";
      subtitle.textContent = s.subtitle || "";

      if (s.prompt) stage.appendChild(block(s.prompt));

      if (s.options) {
        var o = document.createElement("div");
        o.className = "options";

        s.options.forEach(function (opt) {
          var b = makeBtn(opt.label || "", opt.kind);

          if (opt.disabled) {
            b.disabled = true;
          } else {
            b.addEventListener("click", function () {
              playSfx(opt.sound || "tap");
              if (opt.toast) toast(opt.toast);
              if (typeof opt.next === "number") {
                step = opt.next;
                render();
              }
            });
          }

          o.appendChild(b);
        });

        stage.appendChild(o);
      }

      if (s.input) {
        var i = document.createElement("input");
        i.className = "input";
        i.placeholder = "Type here…";
        i.maxLength = 90;

        var b2 = makeBtn("Lock it in", "primary");
        b2.addEventListener("click", function () {
          var v = (i.value || "").trim();
          if (!v) {
            playSfx("nope");
            toast("Tell me first.");
            return;
          }
          dateIdea = v;
          playSfx("correct");
          step = step + 1;
          render();
        });

        stage.appendChild(i);
        stage.appendChild(b2);

        setTimeout(function () { i.focus(); }, 120);
      }

      if (s.final) {
        stage.appendChild(block("Will you be my Valentine and go to " + dateIdea + " with me?"));

        var row = document.createElement("div");
        row.className = "options equal";

        var yes = makeBtn("Yes", "primary");
        yes.addEventListener("click", function () {
          playSfx("correct");
          celebrate();
        });

        var no = makeBtn("No");
        row.appendChild(yes);
        row.appendChild(no);
        stage.appendChild(row);

        setTimeout(function () {
          activateRunaway(no, row);
        }, 650);
      }
    }

    function celebrate() {
      stage.innerHTML =
        "<div class='poster'>" +
        "<div class='poster-title'>I love you the most my princess.</div>" +
        "<div class='poster-lines'>" +
        "<span class='poster-line'>Me <strong>vs</strong> You.</span>" +
        "<span class='poster-line'><strong>Feb 14th.</strong></span>" +
        "<span class='poster-line'>Going to <strong>" + escapeHtml(dateIdea) + "</strong>.</span>" +
        "</div>" +
        "<div class='poster-sub'>Screenshot this and send it to me.</div>" +
        "</div>";

      toast("Locked in. ♡");
      burstHearts(18);
    }

    // UI helpers
    function block(t) {
      var e = document.createElement("div");
      e.className = "step";
      e.textContent = t;
      return e;
    }

    function makeBtn(text, kind) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "btn" + (kind === "primary" ? " primary" : "");
      b.textContent = text;
      return b;
    }

    function toast(t) {
      toastEl.textContent = t;
      toastEl.dataset.open = "true";
      clearTimeout(toast._t);
      toast._t = setTimeout(function () {
        toastEl.dataset.open = "false";
      }, 2600);
    }

    // Runaway No button: replace it with an invisible placeholder, then move the real button into the stage.
    function activateRunaway(noBtn, row) {
      var stageBox = stage.getBoundingClientRect();
      var noBox = noBtn.getBoundingClientRect();

      var w = Math.ceil(noBox.width);
      var h = Math.ceil(noBox.height);

      var placeholder = makeBtn("No");
      placeholder.style.opacity = "0";
      placeholder.style.pointerEvents = "none";
      placeholder.style.width = w + "px";
      placeholder.style.height = h + "px";

      row.replaceChild(placeholder, noBtn);

      noBtn.classList.add("runaway");
      noBtn.style.width = w + "px";
      noBtn.style.height = h + "px";
      noBtn.style.left = (noBox.left - stageBox.left) + "px";
      noBtn.style.top = (noBox.top - stageBox.top) + "px";
      noBtn.style.transform = "translate(0px, 0px)";
      stage.appendChild(noBtn);

      var run = function () { runAway(noBtn); };

      noBtn.addEventListener("mouseenter", run);
      noBtn.addEventListener("focus", run);
      noBtn.addEventListener("touchstart", function (e) {
        e.preventDefault();
        run();
      }, { passive: false });

      setTimeout(function () { runAway(noBtn); }, 250);
    }

    function runAway(el) {
      var padding = 10;
      var bounds = stage.getBoundingClientRect();
      var b = el.getBoundingClientRect();

      var maxX = Math.max(padding, bounds.width - b.width - padding);
      var maxY = Math.max(padding, bounds.height - b.height - padding);

      var x = Math.floor(Math.random() * maxX);
      var y = Math.floor(Math.random() * maxY);

      el.style.transform = "translate(" + x + "px, " + y + "px)";
      playSfx("nope");
    }

    // Hearts
    function startHearts() {
      setInterval(function () {
        if (Math.random() < 0.75) spawnHeart(false);
      }, 520);
    }

    function spawnHeart(nearCenter) {
      var h = document.createElement("div");
      h.className = "heart";

      var left = nearCenter ? 40 + Math.random() * 20 : Math.random() * 100;
      var size = 8 + Math.random() * 14;
      var dur = 5 + Math.random() * 6;
      var delay = Math.random() * 0.2;

      h.style.left = left + "vw";
      h.style.bottom = "-20px";
      h.style.width = size + "px";
      h.style.height = size + "px";
      h.style.animationDuration = dur + "s";
      h.style.animationDelay = delay + "s";
      h.style.opacity = (0.25 + Math.random() * 0.55).toFixed(2);

      heartsEl.appendChild(h);

      setTimeout(function () {
        if (h && h.parentNode) h.parentNode.removeChild(h);
      }, (dur + delay) * 1000);
    }

    function burstHearts(n) {
      for (var i = 0; i < n; i++) {
        (function (k) {
          setTimeout(function () { spawnHeart(true); }, k * 35);
        })(i);
      }
    }

    // Sound
    function ensureAudio() {
      if (!audioEnabled) return null;
      if (audioCtx) return audioCtx;

      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;

      audioCtx = new Ctx();
      return audioCtx;
    }

    function playTone(freq, durationMs, type, gainVal) {
      var ctx = ensureAudio();
      if (!ctx) return;

      var o = ctx.createOscillator();
      var g = ctx.createGain();

      o.type = type || "sine";
      o.frequency.value = freq;

      var now = ctx.currentTime;
      var dur = Math.max(0.03, durationMs / 1000);

      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(gainVal || 0.08, now + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, now + dur);

      o.connect(g);
      g.connect(ctx.destination);

      o.start(now);
      o.stop(now + dur + 0.02);
    }

    function playSfx(kind) {
      if (!audioEnabled && kind !== "ok") return;

      if (kind === "correct") {
        playTone(523.25, 90, "sine", 0.09);
        setTimeout(function () { playTone(659.25, 110, "sine", 0.08); }, 90);
        setTimeout(function () { playTone(783.99, 140, "triangle", 0.07); }, 210);
        return;
      }

      if (kind === "nope") {
        playTone(220, 90, "square", 0.06);
        setTimeout(function () { playTone(196, 110, "square", 0.05); }, 85);
        return;
      }

      if (kind === "kwana") {
        playTone(330, 70, "triangle", 0.07);
        setTimeout(function () { playTone(262, 120, "triangle", 0.07); }, 80);
        return;
      }

      if (kind === "ok") {
        audioEnabled = true;
        playTone(440, 70, "sine", 0.05);
        return;
      }

      playTone(392, 45, "sine", 0.03);
    }

    // Safety
    function escapeHtml(str) {
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }
  });
})();