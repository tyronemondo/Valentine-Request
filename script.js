const STEPS = [
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
const heartsEl = document.getElementById("hearts");
const toLine = document.getElementById("toLine");
const audioBtn = document.getElementById("toggleAudio");

toLine.innerHTML = `To <span style="color: rgba(255,143,184,1); font-weight:700;">Shao</span>,`;

let audioCtx = null;
let audioEnabled = false;

audioBtn.addEventListener("click", () => {
  audioEnabled = true;
  playSfx("ok");
  audioBtn.querySelector(".quiet-text").textContent = "Sound on";
});

startHearts();
render();

function render() {
  stage.innerHTML = "";
  bar.style.width = `${(step / STEPS.length) * 100}%`;

  const s = STEPS[step];
  title.textContent = s.title || "";
  subtitle.textContent = s.subtitle || "";

  if (s.prompt) stage.appendChild(block(s.prompt));

  if (s.options) {
    const o = document.createElement("div");
    o.className = "options";

    s.options.forEach(opt => {
      const b = makeBtn(opt.label || "", opt.kind);

      if (opt.disabled) {
        b.disabled = true;
        b.classList.add("disabled");
      } else {
        b.onclick = () => {
          playSfx(opt.sound || "tap");
          if (opt.toast) toast(opt.toast);
          if (opt.next !== undefined) {
            step = opt.next;
            render();
          }
        };
      }
      o.appendChild(b);
    });

    stage.appendChild(o);
  }

  if (s.input) {
    const i = document.createElement("input");
    i.className = "input";
    i.placeholder = "Type here…";
    i.maxLength = 90;

    const b = makeBtn("Lock it in", "primary");
    b.onclick = () => {
      const v = (i.value || "").trim();
      if (!v) {
        playSfx("nope");
        return toast("Tell me first.");
      }
      dateIdea = v;
      playSfx("correct");
      step++;
      render();
    };

    stage.append(i, b);
    setTimeout(() => i.focus(), 120);
  }

  if (s.final) {
    stage.appendChild(block(`Will you be my Valentine and go to ${dateIdea} with me?`));

    const row = document.createElement("div");
    row.className = "options equal";

    const yes = makeBtn("Yes", "primary");
    yes.onclick = () => {
      playSfx("correct");
      celebrate();
    };

    const no = makeBtn("No");
    row.appendChild(yes);
    row.appendChild(no);
    stage.appendChild(row);

    setTimeout(() => activateRunaway(no, row), 650);
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
  toast("Locked in. ♡");
  burstHearts(18);
}

/* UI helpers */
function block(t) {
  const e = document.createElement("div");
  e.className = "step";
  e.textContent = t;
  return e;
}

function makeBtn(text, kind) {
  const b = document.createElement("button");
  b.className = "btn" + (kind === "primary" ? " primary" : "");
  b.type = "button";
  b.textContent = text;
  return b;
}

function toast(t) {
  toastEl.textContent = t;
  toastEl.dataset.open = "true";
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toastEl.dataset.open = "false", 2600);
}

/* Runaway No button */
function activateRunaway(noBtn, row) {
  const w = Math.ceil(noBtn.getBoundingClientRect().width);
  const h = Math.ceil(noBtn.getBoundingClientRect().height);
  noBtn.style.width = w + "px";
  noBtn.style.height = h + "px";

  const stageBox = stage.getBoundingClientRect();
  const rowBox = row.getBoundingClientRect();
  const noBox = noBtn.getBoundingClientRect();

  const startX = (noBox.left - stageBox.left);
  const startY = (rowBox.top - stageBox.top);

  noBtn.classList.add("runaway");
  noBtn.style.left = startX + "px";
  noBtn.style.top = startY + "px";

  row.style.visibility = "hidden";

  const run = () => runAway(noBtn);

  noBtn.addEventListener("mouseenter", run);
  noBtn.addEventListener("focus", run);
  noBtn.addEventListener("touchstart", (e) => { e.preventDefault(); run(); }, { passive: false });

  setTimeout(() => runAway(noBtn), 250);
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
  playSfx("nope");
}

/* Cute background hearts */
function startHearts() {
  setInterval(() => {
    if (Math.random() < 0.75) spawnHeart(false);
  }, 520);
}

function spawnHeart(nearCenter) {
  if (!heartsEl) return;

  const h = document.createElement("div");
  h.className = "heart";

  const left = nearCenter ? 40 + Math.random() * 20 : Math.random() * 100;
  const size = 8 + Math.random() * 14;
  const dur = 5 + Math.random() * 6;
  const delay = Math.random() * 0.2;

  h.style.left = `${left}vw`;
  h.style.bottom = `-20px`;
  h.style.width = `${size}px`;
  h.style.height = `${size}px`;
  h.style.animationDuration = `${dur}s`;
  h.style.animationDelay = `${delay}s`;
  h.style.opacity = `${0.25 + Math.random() * 0.55}`;

  heartsEl.appendChild(h);

  setTimeout(() => h.remove(), (dur + delay) * 1000);
}

function burstHearts(n) {
  for (let i = 0; i < n; i++) setTimeout(() => spawnHeart(true), i * 35);
}

/* Sound effects */
function ensureAudio() {
  if (!audioEnabled) return null;
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
  if (!audioEnabled && kind !== "ok") return;

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
    audioEnabled = true;
    playTone(440, 70, "sine", 0.05);
    return;
  }

  playTone(392, 45, "sine", 0.03);
}

/* Safety */
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
