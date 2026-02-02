const STEPS = [
  {
    title: "Hi there my Babushka.",
    subtitle: "I put together this little something with a (not so) surprise at the end. I hope you like it.",
    prompt: "Are you ready?",
    options: [
      { label: "Let's Do it!!", next: 1, sound: "ok" },
      { label: "Next Time", toast: "KWANA!!", sound: "kwana" }
    ]
  },
  {
    title: "Question one.",
    subtitle: "Who said \"I love you\" first?",
    options: [
      { label: "Shao", toast: "Nope. Try again.", sound: "nope" },
      { label: "Ty", toast: "And after all this time I'm still falling harder and harder for you", next: 2, sound: "correct" }
    ]
  },
  {
    title: "Question two.",
    subtitle: "Who is always right?",
    options: [
      { label: "Shao", toast: "Toruk Makto knows best.", next: 3, sound: "correct" },
      { label: "Ty", transform: "Shao", toast: "Toruk Makto knows best.", next: 3, sound: "correct" }
    ]
  },
  {
    title: "Question three.",
    subtitle: "What is a cute date you want to go on?",
    input: true
  },
  {
    final: true
  }
];

let step = 0;
let dateIdea = "";

const stage = document.getElementById("stage");
const title = document.getElementById("title");
const subtitle = document.getElementById("subtitle");
const bar = document.getElementById("progressBar");
const toastEl = document.getElementById("toast");

let audioCtx = null;

render();

function render() {
  stage.innerHTML = "";
  bar.style.width = `${(step / STEPS.length) * 100}%`;

  const s = STEPS[step];
  title.textContent = s.title || "";
  subtitle.textContent = s.subtitle || "";

  if (s.prompt) stage.appendChild(p(s.prompt));

  if (s.options) {
    const o = document.createElement("div");
    o.className = "options";
    s.options.forEach(opt => {
      const b = btn(opt.label, "primary");
      b.onclick = () => {
        playSfx(opt.sound || "tap");

        if (opt.toast) toast(opt.toast);
        if (opt.transform) b.textContent = opt.transform;

        if (opt.next !== undefined) {
          step = opt.next;
          render();
        }
      };
      o.appendChild(b);
    });
    stage.appendChild(o);
  }

  if (s.input) {
    const i = document.createElement("input");
    i.placeholder = "Type here…";
    i.style.padding = "12px 12px";
    i.style.borderRadius = "14px";
    i.style.border = "1px solid rgba(255,255,255,.2)";
    i.style.background = "rgba(0,0,0,.18)";
    i.style.color = "rgba(246,242,255,.95)";
    i.style.outline = "none";

    const b = btn("Lock it in", "primary");
    b.onclick = () => {
      if (!i.value.trim()) {
        playSfx("nope");
        return toast("Tell me first.");
      }
      dateIdea = i.value.trim();
      playSfx("correct");
      step++;
      render();
    };

    stage.append(i, b);
    setTimeout(() => i.focus(), 120);
  }

  if (s.final) {
    stage.appendChild(p(`Will you be my Valentine and go to ${dateIdea} with me?`));

    const yes = btn("Yes", "primary");
    yes.onclick = () => {
      playSfx("correct");
      celebrate();
    };

    const no = btn("No", "runaway");
    no.classList.add("runaway");
    no.setAttribute("aria-label", "No (you cannot catch it)");
    placeRunawayButton(no);

    no.addEventListener("mouseenter", () => runAway(no));
    no.addEventListener("focus", () => runAway(no));
    no.addEventListener("touchstart", (e) => {
      e.preventDefault();
      runAway(no);
    }, { passive: false });

    stage.append(yes);
    stage.append(no);

    setTimeout(() => runAway(no), 400);
  }
}

function celebrate() {
  stage.innerHTML = `
    <div class="poster">
      <div class="poster-title">I love you the most my princess.</div>
      <div class="poster-lines">
        <span class="poster-line">Me <strong>vs</strong> You.</span>
        <span class="poster-line"><strong>Feb 14th.</strong></span>
        <span class="poster-line">Going to <strong>${escapeHtml(dateIdea)}</strong>.</span>
      </div>
      <div class="poster-sub">Screenshot this and send it to me.</div>
    </div>
  `;
}

function p(t) {
  const e = document.createElement("div");
  e.className = "step";
  e.textContent = t;
  return e;
}

function btn(t, kind) {
  const b = document.createElement("button");
  b.className = "btn" + (kind === "primary" ? " primary" : "");
  if (kind === "runaway") b.className = "btn runaway";
  b.textContent = t;
  return b;
}

function toast(t) {
  toastEl.textContent = t;
  toastEl.dataset.open = "true";
  setTimeout(() => toastEl.dataset.open = "false", 2500);
}

/* ==========
   No button runs away.
   ========== */
function placeRunawayButton(el) {
  el.style.left = "0px";
  el.style.top = "0px";
  el.dataset.x = "0";
  el.dataset.y = "0";
}

function runAway(el) {
  const padding = 10;
  const bounds = stage.getBoundingClientRect();
  const b = el.getBoundingClientRect();

  const maxX = Math.max(padding, bounds.width - b.width - padding);
  const maxY = Math.max(padding, bounds.height - b.height - padding);

  const x = Math.floor(Math.random() * maxX);
  const y = Math.floor(Math.random() * maxY);

  el.style.transform = `translate(${x}px, ${y}px)`;
  el.dataset.x = String(x);
  el.dataset.y = String(y);

  playSfx("nope");
}

/* ==========
   Sound effects.
   ========== */
function ensureAudio() {
  if (audioCtx) return audioCtx;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  audioCtx = new Ctx();
  return audioCtx;
}

function playTone(freq, durationMs, type, gainVal) {
  const ctx = ensureAudio();
  if (!ctx) return;

  const o = ctx.createOscillator();
  const g = ctx.createGain();

  o.type = type || "sine";
  o.frequency.value = freq;

  const now = ctx.currentTime;
  const dur = Math.max(0.03, durationMs / 1000);

  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(gainVal || 0.08, now + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, now + dur);

  o.connect(g);
  g.connect(ctx.destination);

  o.start(now);
  o.stop(now + dur + 0.02);
}

function playSfx(kind) {
  if (kind === "correct") {
    playTone(523.25, 90, "sine", 0.09);
    setTimeout(() => playTone(659.25, 110, "sine", 0.08), 90);
    setTimeout(() => playTone(783.99, 140, "triangle", 0.07), 210);
    return;
  }

  if (kind === "nope") {
    playTone(220, 90, "square", 0.06);
    setTimeout(() => playTone(196, 110, "square", 0.05), 85);
    return;
  }

  if (kind === "kwana") {
    playTone(330, 70, "triangle", 0.07);
    setTimeout(() => playTone(262, 120, "triangle", 0.07), 80);
    return;
  }

  if (kind === "ok") {
    playTone(440, 70, "sine", 0.05);
    return;
  }

  playTone(392, 45, "sine", 0.03);
}

/* ==========
   Safety: avoid injecting user text into HTML unsafely.
   ========== */
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
