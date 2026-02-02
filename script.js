const CONFIG = {
  partnerName: "Shao",
  partnerNickname: "Babushka",
  yourName: "Tyrone",
  momentPlaceA: "Village Local",
  momentPlaceB: "the beach",
  adoredDetail:
    "the way you yap about the smallest things, and how I could honestly listen to your voice forever",
  insideJoke: "Next time",
  finalQuestion: "Shao, will you be my Valentine?",
  finalSubtext:
    "A real question, wrapped in elegance, with just enough mischief to feel like us.",
  yesResponseTitle: "Okay, that’s my favourite answer. ♡",
  yesResponseText:
    "I’m going to make this Valentine’s feel like that night at Village Local and the beach, magic without trying, and soft in all the right places.",
  maybeResponse:
    "Take your time, Babushka, and if you postpone, I will accept it… but I will be judging you in silence. Next time.",
};

const STEPS = [
  {
    type: "choice",
    prompt:
      "Hello Babushka, and yes, I’m doing something a little extra, because you’re not a small feeling to me.",
    options: [
      { label: "Okay, I’m here.", next: 1 },
      { label: "Proceed, sir.", next: 1 },
    ],
  },
  {
    type: "choice",
    prompt:
      "You were interested first, and I fell in love first, and somehow that makes the timing feel perfect instead of messy.",
    options: [
      { label: "That’s cute.", next: 2 },
      { label: "Continue.", next: 2 },
      { label: "You’re brave for saying that.", next: 2 },
    ],
  },
  {
    type: "choice",
    prompt:
      "Do you remember our date at Village Local, and then the beach after, and how it felt like the world got quieter for us.",
    options: [
      { label: "I remember.", next: 3 },
      { label: "That was magical.", next: 3 },
      { label: "Okay, you’re making me smile.", next: 3 },
    ],
  },
  {
    type: "input",
    prompt:
      "Tell me one tiny thing you’ve been yapping about lately, because I genuinely love listening to you go through even the smallest things.",
    placeholder: "Type here…",
    button: "Let me hear it",
    next: 4,
  },
  {
    type: "poem",
    title: "A small poem, with a smile in it",
    lines: [
      "If I could bottle a moment,",
      "it would sound like your voice,",
      "moving through a story that doesn’t even matter,",
      "until you tell it.",
      "",
      "You turn small things into something worth noticing,",
      "like the world is a little more detailed",
      "when you’re in it.",
      "",
      "And I like you in a way that isn’t casual,",
      "in a way that keeps choosing you,",
      "even when I pretend I’m calm.",
      "",
      "So here is me, being elegant about it,",
      "and also slightly unserious,",
      "because you deserve both.",
    ],
    next: 5,
  },
  {
    type: "choice",
    prompt:
      "One more thing, and then I’ll ask, and I promise I won’t say it and then postpone it with “Next time”.",
    options: [
      { label: "Good.", next: 6 },
      { label: "Next time.", next: 6 },
    ],
  },
  {
    type: "final",
  },
];

let memory = { yapThing: "" };
let audioOn = false;
let audioCtx = null;
let nodes = null;

let eggUsed = false;

const elStage = document.getElementById("stage");
const elTitle = document.getElementById("title");
const elSubtitle = document.getElementById("subtitle");
const elToLine = document.getElementById("toLine");
const elProgressBar = document.getElementById("progressBar");
const elHearts = document.getElementById("hearts");

const elModal = document.getElementById("finalModal");
const elCloseModal = document.getElementById("closeModal");
const elYesBtn = document.getElementById("yesBtn");
const elMaybeBtn = document.getElementById("maybeBtn");
const elFinalTitle = document.getElementById("finalTitle");
const elFinalText = document.getElementById("finalText");

const elToast = document.getElementById("toast");
const elToggleAudio = document.getElementById("toggleAudio");

boot();

function boot() {
  const name = CONFIG.partnerName || "you";
  elToLine.innerHTML = `To <span class="accent">${escapeHtml(name)}</span>,`;
  elFinalTitle.textContent = CONFIG.finalQuestion;
  elFinalText.textContent = CONFIG.finalSubtext;

  renderStep(0);
  setProgress(0);

  elToggleAudio.addEventListener("click", toggleAmbience);
  elCloseModal.addEventListener("click", closeModal);
  elModal.addEventListener("click", (e) => {
    if (e.target === elModal) closeModal();
  });

  elYesBtn.addEventListener("click", onYes);
  elMaybeBtn.addEventListener("click", onMaybe);

  setInterval(() => {
    if (Math.random() < 0.55) spawnHeart();
  }, 520);
}

function renderStep(index) {
  const step = STEPS[index];

  elStage.innerHTML = "";
  setProgress(index / (STEPS.length - 1));

  if (step.type === "choice") renderChoice(step);
  if (step.type === "input") renderInput(step);
  if (step.type === "poem") renderPoem(step);
  if (step.type === "final") renderFinal();

  hydrateCopy(index);
  softPulse();
}

function renderChoice(step) {
  const wrap = document.createElement("div");
  wrap.className = "step";

  const p = document.createElement("div");
  p.className = "prompt";
  p.textContent = step.prompt;

  const options = document.createElement("div");
  options.className = "options";

  step.options.forEach((opt) => {
    const btn = document.createElement("button");
    btn.className = "btn";
    btn.type = "button";
    btn.textContent = opt.label;

    btn.addEventListener("click", () => {
      clickSparkle();

      if (String(opt.label).toLowerCase().includes("next time")) {
        nextTimeEasterEgg();
      }

      renderStep(opt.next);
    });

    options.appendChild(btn);
  });

  wrap.appendChild(p);
  wrap.appendChild(options);
  elStage.appendChild(wrap);
}

function renderInput(step) {
  const wrap = document.createElement("div");
  wrap.className = "step";

  const p = document.createElement("div");
  p.className = "prompt";
  p.textContent = step.prompt;

  const row = document.createElement("div");
  row.className = "inputRow";

  const input = document.createElement("input");
  input.className = "input";
  input.type = "text";
  input.placeholder = step.placeholder || "";
  input.maxLength = 70;

  const btn = document.createElement("button");
  btn.className = "btn primary";
  btn.type = "button";
  btn.textContent = step.button || "Continue";

  btn.addEventListener("click", () => {
    const v = (input.value || "").trim();
    memory.yapThing = v;
    clickSparkle();
    if (v) toast(`Noted: “${v}”.`);
    renderStep(step.next);
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") btn.click();
  });

  row.appendChild(input);
  row.appendChild(btn);

  wrap.appendChild(p);
  wrap.appendChild(row);
  elStage.appendChild(wrap);

  setTimeout(() => input.focus(), 120);
}

function renderPoem(step) {
  const wrap = document.createElement("div");
  wrap.className = "step";

  const p = document.createElement("div");
  p.className = "prompt";
  p.textContent = step.title || "A note";

  const poem = document.createElement("div");
  poem.className = "poem";

  step.lines.forEach((line) => {
    const span = document.createElement("span");
    span.className = "line";
    span.textContent = line === "" ? " " : line;
    poem.appendChild(span);
  });

  if (memory.yapThing) {
    const extra = document.createElement("div");
    extra.className = "sig";
    extra.textContent = `Also, I’m still thinking about “${memory.yapThing}”.`;
    poem.appendChild(extra);
  }

  const sig = document.createElement("div");
  sig.className = "sig";
  sig.textContent = `— ${CONFIG.yourName}`;

  poem.appendChild(sig);

  const actions = document.createElement("div");
  actions.className = "options";

  const btn = document.createElement("button");
  btn.className = "btn primary";
  btn.type = "button";
  btn.textContent = "Keep going";
  btn.addEventListener("click", () => {
    clickSparkle();
    renderStep(step.next);
  });

  actions.appendChild(btn);

  wrap.appendChild(p);
  wrap.appendChild(poem);
  wrap.appendChild(actions);
  elStage.appendChild(wrap);
}

function renderFinal() {
  const wrap = document.createElement("div");
  wrap.className = "step";

  const p = document.createElement("div");
  p.className = "prompt";
  p.textContent =
    "Now I’m going to ask the question I meant to ask, and I’m not postponing it, not even for comedy.";

  const options = document.createElement("div");
  options.className = "options";

  const btn = document.createElement("button");
  btn.className = "btn primary";
  btn.type = "button";
  btn.textContent = "Open the question";
  btn.addEventListener("click", () => {
    clickSparkle();
    openModal();
  });

  const btn2 = document.createElement("button");
  btn2.className = "btn";
  btn2.type = "button";
  btn2.textContent = "Replay from the start";
  btn2.addEventListener("click", () => {
    clickSparkle();
    memory = { yapThing: "" };
    eggUsed = false;
    renderStep(0);
  });

  options.appendChild(btn);
  options.appendChild(btn2);

  wrap.appendChild(p);
  wrap.appendChild(options);
  elStage.appendChild(wrap);
}

function hydrateCopy(stepIndex) {
  const partner = CONFIG.partnerNickname || CONFIG.partnerName || "Shao";

  if (stepIndex <= 1) {
    elTitle.textContent = `Hi, ${partner}.`;
    elSubtitle.textContent =
      "I wanted this to feel elegant and playful, like a love note that learned how to code.";
    return;
  }

  if (stepIndex === 2) {
    elTitle.textContent = "That day felt like a soft miracle.";
    elSubtitle.textContent =
      "Village Local, then the beach, and the feeling that the world was quietly on our side.";
    return;
  }

  if (stepIndex === 3) {
    elTitle.textContent = "I’m obsessed with your voice.";
    elSubtitle.textContent = CONFIG.adoredDetail;
    return;
  }

  elTitle.textContent = "This is me being clear.";
  elSubtitle.textContent =
    "I want Valentine’s to be ours, even if we decide what we’re doing at the last minute, and even if we laugh the whole time.";
}

function openModal() {
  document.body.classList.add("modal-open");
  elModal.dataset.open = "true";
  elModal.setAttribute("aria-hidden", "false");
  burstHearts(18);
}

function closeModal() {
  document.body.classList.remove("modal-open");
  elModal.dataset.open = "false";
  elModal.setAttribute("aria-hidden", "true");
}

function onYes() {
  elFinalTitle.textContent = CONFIG.yesResponseTitle;
  elFinalText.textContent = CONFIG.yesResponseText;

  elMaybeBtn.textContent = "Close";
  elMaybeBtn.onclick = () => closeModal();

  elYesBtn.onclick = () => {
    burstHearts(28);
    toast("I’m smiling so hard right now.");
  };

  burstHearts(28);
  toast("Yay. ♡");
}

function onMaybe() {
  toast(CONFIG.maybeResponse);
  burstHearts(10);
}

function nextTimeEasterEgg() {
  if (eggUsed) return;
  eggUsed = true;

  burstHearts(36);
  toast("Next time? Bold choice, Babushka.");

  const brandText = document.querySelector(".brand-text");
  const old = brandText ? brandText.textContent : "";

  if (brandText) {
    brandText.textContent = "Next time… is officially now ♡";
    window.setTimeout(() => {
      brandText.textContent = old;
    }, 2600);
  }
}

function setProgress(frac) {
  const pct = Math.max(0, Math.min(1, frac)) * 100;
  elProgressBar.style.width = `${pct}%`;
}

function toast(msg) {
  elToast.textContent = msg;
  elToast.dataset.open = "true";
  elToast.setAttribute("aria-hidden", "false");
  window.clearTimeout(toast._t);
  toast._t = window.setTimeout(() => {
    elToast.dataset.open = "false";
    elToast.setAttribute("aria-hidden", "true");
  }, 2600);
}

function softPulse() {
  const card = document.querySelector(".card");
  card.animate(
    [{ transform: "translateY(0px)" }, { transform: "translateY(-2px)" }, { transform: "translateY(0px)" }],
    { duration: 520, easing: "ease-out" }
  );
}

function clickSparkle() {
  if (Math.random() < 0.7) spawnHeart(true);
}

function spawnHeart(nearCenter = false) {
  const h = document.createElement("div");
  h.className = "heart";

  const left = nearCenter ? 40 + Math.random() * 20 : Math.random() * 100;
  const size = 8 + Math.random() * 14;
  const dur = 5 + Math.random() * 5;
  const delay = Math.random() * 0.2;

  h.style.left = `${left}vw`;
  h.style.bottom = `-20px`;
  h.style.width = `${size}px`;
  h.style.height = `${size}px`;
  h.style.animationDuration = `${dur}s`;
  h.style.animationDelay = `${delay}s`;
  h.style.opacity = `${0.35 + Math.random() * 0.45}`;

  elHearts.appendChild(h);

  window.setTimeout(() => {
    h.remove();
  }, (dur + delay) * 1000);
}

function burstHearts(n = 16) {
  for (let i = 0; i < n; i++) window.setTimeout(() => spawnHeart(true), i * 30);
}

function toggleAmbience() {
  audioOn = !audioOn;
  elToggleAudio.setAttribute("aria-pressed", audioOn ? "true" : "false");
  elToggleAudio.querySelector(".quiet-text").textContent = audioOn ? "Ambience on" : "Ambience";

  if (audioOn) startAmbience();
  else stopAmbience();
}

function startAmbience() {
  if (audioCtx) return;

  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return toast("Audio not supported here.");

  audioCtx = new Ctx();

  const master = audioCtx.createGain();
  master.gain.value = 0.07;
  master.connect(audioCtx.destination);

  const pad = audioCtx.createOscillator();
  const pad2 = audioCtx.createOscillator();
  const padGain = audioCtx.createGain();

  pad.type = "sine";
  pad2.type = "triangle";
  pad.frequency.value = 220;
  pad2.frequency.value = 277.18;

  padGain.gain.value = 0.6;

  const lfo = audioCtx.createOscillator();
  const lfoGain = audioCtx.createGain();
  lfo.type = "sine";
  lfo.frequency.value = 0.08;
  lfoGain.gain.value = 0.22;

  lfo.connect(lfoGain);
  lfoGain.connect(padGain.gain);

  pad.connect(padGain);
  pad2.connect(padGain);
  padGain.connect(master);

  pad.start();
  pad2.start();
  lfo.start();

  nodes = { master, pad, pad2, padGain, lfo };
  toast("Ambience on.");
}

function stopAmbience() {
  if (!audioCtx || !nodes) return;

  try {
    nodes.master.gain.setTargetAtTime(0.0001, audioCtx.currentTime, 0.08);
    window.setTimeout(() => {
      nodes.pad.stop();
      nodes.pad2.stop();
      nodes.lfo.stop();
      audioCtx.close();
      audioCtx = null;
      nodes = null;
    }, 220);
  } catch {
    audioCtx = null;
    nodes = null;
  }

  toast("Ambience off.");
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
