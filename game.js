"use strict";

const TILE = 16;
const VIEW_W = 320;
const VIEW_H = 192;

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const lightCanvas = document.createElement("canvas");
lightCanvas.width = VIEW_W;
lightCanvas.height = VIEW_H;
const lightCtx = lightCanvas.getContext("2d");

const $ = (id) => document.getElementById(id);
const frame = $("frame");
const tagEl = $("tag");
const floatsEl = $("floats");
const hudEl = $("hud");
const dialogueEl = $("dialogue");
const screenEl = $("screen");

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

const keys = new Set();
const hold = { up: false, down: false, left: false, right: false };
const input = { confirmEdge: false };

const state = {
  mode: "title",
  screen: "title",
  chapter: 0,
  time: 0,
  scale: 2,
  map: null,
  entities: [],
  player: null,
  cam: { x: 0, y: 0 },
  flags: {},
  faith: 100,
  held: "",
  objective: "",
  progress: "",
  journal: [],
  dialogue: { open: false, lines: [], index: 0, prog: 0, onDone: null },
  particles: [],
  floats: [],
  fade: 0,
  shake: 0,
  flash: 0,
  stormTimer: 5,
  hintUntil: 0,
  cleared: false,
  interludeStep: 0,
  gulls: [
    { x: 40, y: 18, s: 22 },
    { x: 180, y: 30, s: 28 },
    { x: 260, y: 14, s: 18 },
  ],
};

function hash(x, y) {
  let n = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

function dist(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

function tp(tx, ty) {
  return { x: tx * TILE + TILE / 2, y: ty * TILE + TILE / 2 };
}

function createMap(w, h, fill) {
  const rows = [];
  for (let y = 0; y < h; y++) rows.push(Array(w).fill(fill));
  const map = {
    w,
    h,
    rows,
    set(x, y, ch) {
      if (x >= 0 && y >= 0 && x < w && y < h) rows[y][x] = ch;
    },
    rect(x, y, rw, rh, ch) {
      for (let j = 0; j < rh; j++) for (let i = 0; i < rw; i++) this.set(x + i, y + j, ch);
    },
    frame(ch) {
      for (let x = 0; x < w; x++) {
        this.set(x, 0, ch);
        this.set(x, h - 1, ch);
      }
      for (let y = 0; y < h; y++) {
        this.set(0, y, ch);
        this.set(w - 1, y, ch);
      }
    },
  };
  return map;
}

function stroke(map, pts, ch, rad) {
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
    for (let s = 0; s <= steps; s++) {
      const x = Math.round(x0 + ((x1 - x0) * s) / steps);
      const y = Math.round(y0 + ((y1 - y0) * s) / steps);
      for (let dy = -rad; dy <= rad; dy++) {
        for (let dx = -rad; dx <= rad; dx++) {
          if (dx * dx + dy * dy <= rad * rad + 1) map.set(x + dx, y + dy, ch);
        }
      }
    }
  }
}

function scatter(map, ch, rate, allowed) {
  for (let y = 1; y < map.h - 1; y++) {
    for (let x = 1; x < map.w - 1; x++) {
      if (allowed(map.rows[y][x]) && hash(x, y) < rate) map.set(x, y, ch);
    }
  }
}

function look(opts) {
  return Object.assign(
    {
      robe: "#c4844a",
      robeS: "#a86a34",
      robeD: "#7a4c24",
      skin: "#f2c396",
      skinS: "#d79a68",
      hair: "#4a2c18",
      hairD: "#2a180e",
      beard: false,
      veil: null,
      halo: false,
      headband: null,
      sash: null,
      scale: 1,
      staff: false,
    },
    opts
  );
}

const LOOKS = {
  jesus: look({
    robe: "#f7f3ea",
    robeS: "#e4d9c6",
    robeD: "#b7aa96",
    sash: "#a33b34",
    hair: "#5a3820",
    hairD: "#3a2414",
    beard: true,
    halo: true,
    scale: 1.12,
  }),
  player: look({
    robe: "#3e6e92",
    robeS: "#315a78",
    robeD: "#234056",
    sash: "#e6d3a4",
    hair: "#3a2416",
  }),
  simon: look({ robe: "#b56a3c", robeS: "#8d4e2a", robeD: "#623418", headband: "#e6d3a4", beard: true }),
  andrew: look({ robe: "#7d8a45", robeS: "#5d6a32", robeD: "#3e4922", hair: "#3a2416" }),
  james: look({ robe: "#a85a48", robeS: "#864232", robeD: "#5c2c22", beard: true, hair: "#3a2414" }),
  john: look({ robe: "#4e8a78", robeS: "#3a6a5c", robeD: "#274840", hair: "#6b3e22" }),
  elder: look({
    robe: "#8d7b68",
    robeS: "#6e5e4e",
    robeD: "#4e4034",
    hair: "#d9d3c8",
    hairD: "#8a847a",
    beard: true,
    staff: true,
  }),
  woman: look({ robe: "#a85b62", robeS: "#864650", robeD: "#5c3038", veil: "#e7d3b0", hair: "#3a2416" }),
  youth: look({ robe: "#5d8a4a", robeS: "#456c38", robeD: "#2e4a26", hair: "#4a2c18" }),
  traveler: look({ robe: "#9a7044", robeS: "#7a5530", robeD: "#553c22", headband: "#d7c4a0" }),
  tax: look({ robe: "#6d5a78", robeS: "#524460", robeD: "#382e44", sash: "#e6d3a4" }),
  mary: look({ robe: "#3f5278", robeS: "#2e3d5c", robeD: "#1e283c", veil: "#f0e6d2", hair: "#3a2416" }),
  angel: look({
    robe: "#f7f4ee",
    robeS: "#e4ddd0",
    robeD: "#c9c0b0",
    hair: "#f0d78a",
    hairD: "#c4a85a",
    scale: 1.05,
  }),
  boy: look({ robe: "#6a8f4e", robeS: "#4f6e3a", robeD: "#354e28", hair: "#5a3418", scale: 0.82 }),
  farmer: look({ robe: "#b07a40", robeS: "#8c5e30", robeD: "#624220" }),
  mother: look({ robe: "#c47a55", robeS: "#a06040", robeD: "#704030", veil: "#f0e2c8" }),
  worker: look({ robe: "#6e7f88", robeS: "#526068", robeD: "#39444a" }),
  poor: look({ robe: "#8a7460", robeS: "#6c5848", robeD: "#4c3c30" }),
  sick: look({ robe: "#9a8b78", robeS: "#7a6c5c", robeD: "#564838", staff: true }),
};

function person(def) {
  const p = tp(def.tx, def.ty);
  const ent = Object.assign(
    {
      kind: "person",
      dir: "down",
      solid: false,
      talk: true,
      alpha: 1,
      moving: false,
    },
    def,
    p
  );
  ent.look = LOOKS[def.look] || LOOKS.traveler;
  return ent;
}

function prop(def) {
  const p = def.tx != null ? tp(def.tx, def.ty) : { x: def.x, y: def.y };
  return Object.assign({ solid: false, talk: false, alpha: 1 }, def, p);
}

/* ------------------------------ audio ------------------------------ */

const music = {
  ac: null,
  master: null,
  muted: false,
  mode: "peace",
  next: 0,
  step: 0,
  drone: null,
};

const MELODIES = {
  peace: [0, 2, 3, 2, 1, 0, 1, 2, 3, 4, 5, 4, 3, 2, 1, 0, 2, 3, 5, 4, 3, 1, 2, 0],
  dawn: [0, 2, 4, 5, 4, 2, 3, 1, 0, 2, 3, 5, 4, 2, 0],
  storm: [0, 1, 0, 3, -1, 0, 2, 1],
  end: [0, 2, 4, 3, 4, 5, 4, 2, 0, 2, 4, 5],
  solemn: [0, 2, 1, 0, -1, 0, 3, 2],
  hush: [],
};

const SCALES = {
  peace: [293.66, 349.23, 392, 440, 523.25, 587.33],
  dawn: [293.66, 329.63, 369.99, 440, 493.88, 587.33],
  storm: [174.61, 196, 233.08, 261.63, 293.66],
  end: [293.66, 369.99, 440, 523.25, 587.33, 739.99],
  solemn: [220, 261.63, 293.66, 349.23, 392],
  hush: [],
};

function ensureAudio() {
  if (music.ac) {
    if (music.ac.state === "suspended") music.ac.resume();
    return;
  }
  try {
    const ac = new AudioContext();
    const master = ac.createGain();
    master.gain.value = music.muted ? 0 : 0.16;
    master.connect(ac.destination);
    music.ac = ac;
    music.master = master;
    music.next = ac.currentTime + 0.05;
  } catch (err) {
    music.ac = null;
  }
}

function setMuted(muted) {
  music.muted = muted;
  if (music.master) music.master.gain.value = muted ? 0 : 0.16;
  $("btn-mute").textContent = muted ? "開聲" : "靜音";
  try {
    localStorage.setItem("follow-mute", muted ? "1" : "0");
  } catch (err) {
    /* ignore */
  }
}

function tone(freq, dur, type, gain, slide) {
  if (!music.ac || music.muted) return;
  const ac = music.ac;
  const t = ac.currentTime;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(1, slide), t + dur);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g);
  g.connect(music.master);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function noise(dur, gain, freq) {
  if (!music.ac || music.muted) return;
  const ac = music.ac;
  const len = Math.floor(ac.sampleRate * dur);
  const buffer = ac.createBuffer(1, len, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource();
  src.buffer = buffer;
  const filter = ac.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = freq || 900;
  const g = ac.createGain();
  g.gain.setValueAtTime(gain, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
  src.connect(filter);
  filter.connect(g);
  g.connect(music.master);
  src.start();
}

function chime() {
  [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tone(f, 0.22, "triangle", 0.045), i * 90));
}

function appearSound() {
  [392, 494, 587, 784].forEach((f, i) => setTimeout(() => tone(f, 0.45, "sine", 0.04), i * 140));
}

function setMusic(mode) {
  music.mode = mode;
  music.step = 0;
  if (!music.ac) return;
  if (music.drone) {
    try {
      music.drone.stop();
    } catch (err) {
      /* already stopped */
    }
    music.drone = null;
  }
  if (mode === "storm") {
    const o = music.ac.createOscillator();
    const g = music.ac.createGain();
    o.type = "sine";
    o.frequency.value = 98;
    g.gain.value = 0.03;
    o.connect(g);
    g.connect(music.master);
    o.start();
    music.drone = o;
  }
}

function tickMusic() {
  if (!music.ac || music.mode === "hush") return;
  const scale = SCALES[music.mode];
  const melody = MELODIES[music.mode];
  if (!scale || !melody || !melody.length) return;
  const tempo = music.mode === "storm" ? 0.34 : music.mode === "solemn" ? 0.72 : 0.5;
  const t = music.ac.currentTime;
  while (music.next < t + 0.12) {
    const degree = melody[music.step % melody.length];
    music.step++;
    if (degree >= 0) {
      const freq = scale[degree % scale.length] * (degree >= scale.length ? 2 : 1);
      const o = music.ac.createOscillator();
      const g = music.ac.createGain();
      o.type = music.mode === "storm" ? "triangle" : "sine";
      o.frequency.setValueAtTime(freq, music.next);
      const peak = music.mode === "storm" ? 0.03 : 0.045;
      g.gain.setValueAtTime(0.0001, music.next);
      g.gain.exponentialRampToValueAtTime(peak, music.next + 0.04);
      g.gain.exponentialRampToValueAtTime(0.0001, music.next + tempo * 0.92);
      o.connect(g);
      g.connect(music.master);
      o.start(music.next);
      o.stop(music.next + tempo);
    }
    music.next += tempo;
  }
}

/* ------------------------------ dialogue ------------------------------ */

function lineVerse(line) {
  if (!line) return "";
  return typeof line.verse === "string" ? line.verse : line.text;
}

function recordVerse(ref, text) {
  if (!ref || !text || state.journal.some((v) => v.ref === ref)) return;
  state.journal.push({ ref, text });
  const btn = $("btn-journal");
  btn.textContent = "經文 " + state.journal.length;
  btn.classList.remove("pulse");
  void btn.offsetWidth;
  btn.classList.add("pulse");
}

function say(lines, onDone) {
  state.dialogue.open = true;
  state.dialogue.lines = lines;
  state.dialogue.index = 0;
  state.dialogue.prog = 0;
  state.dialogue.onDone = onDone || null;
  state.hintUntil = 0;
  tone(620, 0.04, "square", 0.02);
}

function currentLine() {
  return state.dialogue.lines[state.dialogue.index] || null;
}

function advanceDialogue() {
  const d = state.dialogue;
  if (!d.open) return;
  const line = currentLine();
  if (!line) {
    d.open = false;
    return;
  }
  if (d.prog < line.text.length) {
    d.prog = line.text.length;
    return;
  }
  if (line.ref) recordVerse(line.ref, lineVerse(line));
  if (d.index < d.lines.length - 1) {
    d.index++;
    d.prog = 0;
    tone(520, 0.03, "square", 0.015);
    return;
  }
  d.open = false;
  const cb = d.onDone;
  d.onDone = null;
  if (cb) cb();
}

function updateDialogue(dt) {
  const d = state.dialogue;
  if (!d.open) return;
  const line = currentLine();
  if (!line) return;
  const speed = reduceMotion ? 400 : 18;
  d.prog += dt * speed;
  if (d.prog > line.text.length && line.ref) recordVerse(line.ref, lineVerse(line));
}

/* ------------------------------ particles / floats ------------------------------ */

function puff(x, y, color, n, speed) {
  if (reduceMotion) return;
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = (speed || 24) * (0.4 + Math.random());
    state.particles.push({
      x,
      y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s - 8,
      life: 0.5 + Math.random() * 0.5,
      age: 0,
      color,
      sz: 1 + ((Math.random() * 2) | 0),
    });
  }
}

function spawnFloat(x, y, text) {
  const el = document.createElement("div");
  el.className = "float";
  el.textContent = text;
  floatsEl.appendChild(el);
  state.floats.push({ el, x, y, life: 1.5, max: 1.5 });
}

function updateParticles(dt) {
  for (const p of state.particles) {
    p.age += dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 12 * dt;
  }
  state.particles = state.particles.filter((p) => p.age < p.life);
  for (const f of state.floats) f.life -= dt;
  state.floats = state.floats.filter((f) => {
    if (f.life <= 0) {
      f.el.remove();
      return false;
    }
    return true;
  });
}

/* ------------------------------ drawing ------------------------------ */

function px(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x | 0, y | 0, w, h);
}

function drawShadow(yOff) {
  ctx.fillStyle = "rgba(24,18,12,0.32)";
  px(-5, -2 + (yOff || 0), 10, 2, "rgba(24,18,12,0.32)");
  px(-3, 0 + (yOff || 0), 6, 1, "rgba(24,18,12,0.22)");
}

function drawPerson(e, time) {
  const L = e.look;
  const sc = L.scale || 1;
  const step = e.moving ? Math.floor(time * 8) % 2 : 0;
  const bob = e.moving ? step : Math.floor(time * 1.2) % 2 === 0 ? 0 : 0;
  ctx.save();
  ctx.globalAlpha = e.alpha == null ? 1 : e.alpha;
  ctx.translate(Math.round(e.x), Math.round(e.y + bob));
  ctx.scale((e.dir === "left" ? -1 : 1) * sc, sc);
  drawShadow(0);

  const leg = step ? 1 : 0;
  px(-4, -7, 3, 6, L.robeD);
  px(1, -7 + leg, 3, 6 - leg, L.robeD);
  px(-3, -6, 2, 4, L.robeS);
  px(2, -6 + leg, 2, 4, L.robeS);

  px(-6, -16, 12, 11, L.robeD);
  px(-5, -15, 10, 8, L.robe);
  px(-5, -12, 10, 3, L.robeS);
  if (L.sash) px(-5, -11, 10, 2, L.sash);
  if (e.dir === "up") {
    px(-6, -15, 2, 5, L.robeS);
    px(4, -15, 2, 5, L.robeS);
  } else if (e.dir === "left" || e.dir === "right") {
    px(3, -15, 3, 6, L.robeS);
  } else {
    px(-7, -14, 2, 4, L.robeS);
    px(5, -14, 2, 4, L.robeS);
  }

  const hy = -22;
  px(-4, hy, 8, 7, L.hairD);
  px(-3, hy + 1, 6, 5, L.skin);
  px(-4, hy - 1, 8, 3, L.hair);
  px(-5, hy + 1, 1, 4, L.hairD);
  px(4, hy + 1, 1, 4, L.hair);

  if (L.veil) {
    px(-5, hy - 2, 10, 4, L.veil);
    px(-6, hy + 2, 2, 7, L.veil);
    px(4, hy + 2, 2, 6, L.veil);
  }
  if (L.headband) px(-4, hy + 2, 8, 2, L.headband);

  if (e.dir === "up") {
    px(-3, hy + 1, 6, 5, L.hair);
  } else if (e.dir === "down") {
    px(-2, hy + 3, 1, 1, L.hairD);
    px(1, hy + 3, 1, 1, L.hairD);
    if (L.beard) {
      px(-3, hy + 5, 6, 2, L.hair);
      px(-2, hy + 7, 4, 1, L.hairD);
    }
  } else {
    px(1, hy + 3, 1, 1, L.hairD);
    if (L.beard) px(0, hy + 5, 3, 2, L.hair);
  }

  if (L.staff && e.dir !== "up") px(6, -20, 1, 18, "#6b4224");

  if (e.mark === "worry") {
    px(-2, hy - 6, 2, 2, "#9aa4b0");
    px(1, hy - 8, 2, 2, "#c5ced6");
    px(3, hy - 5, 1, 1, "#9aa4b0");
  } else if (e.mark === "hungry") {
    px(-3, hy - 6, 6, 2, "#6e5438");
    px(-2, hy - 7, 4, 1, "#c4a574");
  } else if (e.mark === "peace") {
    px(-1, hy - 6, 2, 2, "#f0c84b");
  }

  if (L.halo) {
    const pulse = 0.75 + 0.25 * Math.sin(time * 3);
    ctx.globalAlpha *= pulse;
    const hy2 = hy - 5;
    px(-3, hy2, 1, 1, "#f0c84b");
    px(-2, hy2 - 1, 4, 1, "#ffe7a0");
    px(2, hy2, 1, 1, "#f0c84b");
    px(-4, hy2 + 1, 1, 2, "#f0c84b");
    px(3, hy2 + 1, 1, 2, "#f0c84b");
    px(-2, hy2 + 3, 1, 1, "#f0c84b");
    px(1, hy2 + 3, 1, 1, "#ffe7a0");
  }

  ctx.restore();

  if (L.halo && (e.alpha == null || e.alpha > 0.4)) {
    const a = 0.18 + 0.08 * Math.sin(time * 2);
    for (let i = 0; i < 4; i++) {
      const ang = time * 0.9 + i * 1.6;
      const mx = Math.round(e.x + Math.cos(ang) * 12);
      const my = Math.round(e.y - 20 + Math.sin(ang * 1.4) * 6);
      px(mx, my, 1, 1, `rgba(255, 236, 190, ${a + 0.4})`);
    }
  }
}

function drawOlive(x, y, seed) {
  x = Math.round(x);
  y = Math.round(y);
  px(x - 2, y - 11, 4, 11, "#6b4426");
  px(x - 2, y - 11, 1, 11, "#4a2e18");
  const blobs = [
    [0, -18, 16, 10],
    [-7, -16, 10, 8],
    [7, -15, 10, 8],
    [0, -24, 10, 8],
  ];
  blobs.forEach(([ox, oy, w, h], i) => {
    const g = i % 2 ? "#6d8450" : "#54683c";
    px(x + ox - (w >> 1), y + oy, w, h, g);
    px(x + ox - (w >> 1) + 2, y + oy + 2, Math.max(2, w - 6), 3, "#8aa56a");
    px(x + ox - (w >> 1), y + oy + h - 3, w, 2, "#3c4e2c");
  });
  if (seed > 0.6) px(x + 4, y - 20, 2, 2, "#d0e09a");
}

function drawCypress(x, y) {
  x = Math.round(x);
  y = Math.round(y);
  px(x - 1, y - 8, 3, 8, "#5a3a22");
  const layers = [
    [10, 8],
    [8, 7],
    [6, 7],
    [4, 6],
    [2, 5],
  ];
  let top = -6;
  layers.forEach(([w, h], i) => {
    top -= h - 2;
    px(x - (w >> 1), y + top, w, h, i % 2 ? "#2a4634" : "#3e6248");
    px(x - (w >> 1) + 1, y + top + 1, Math.max(1, w - 4), 2, "#6a8a68");
  });
}

function drawHouse(e) {
  const x = Math.round(e.x);
  const y = Math.round(e.y);
  const left = x - 15;
  const top = y - 28;
  px(left - 1, top - 4, 32, 5, "#7a342c");
  px(left + 2, top - 6, 26, 3, "#8c4034");
  px(left, top, 30, 24, "#e6d5b4");
  px(left, top, 30, 3, "#cbb892");
  px(left, top, 2, 24, "#b7a07c");
  px(left + 28, top, 2, 24, "#b7a07c");
  px(x - 3, y - 12, 6, 12, "#6e4122");
  px(x - 1, y - 8, 2, 2, "#e6c56a");
  px(left + 5, top + 8, 6, 5, "#7eb4cc");
  px(left + 7, top + 8, 1, 5, "#2a2118");
  px(left + 20, top + 8, 5, 5, "#7eb4cc");
}

function drawWell(x, y) {
  x = Math.round(x);
  y = Math.round(y);
  px(x - 8, y - 10, 16, 10, "#8d8478");
  px(x - 6, y - 12, 12, 4, "#a79f92");
  px(x - 4, y - 8, 8, 5, "#1e3344");
  px(x - 7, y - 16, 2, 8, "#6b4224");
  px(x + 5, y - 16, 2, 8, "#6b4224");
  px(x - 7, y - 16, 14, 2, "#6b4224");
}

function drawNet(x, y, time) {
  x = Math.round(x);
  y = Math.round(y);
  const sway = Math.floor(time * 2) % 2;
  for (let j = 0; j < 5; j++) {
    for (let i = 0; i < 7; i++) {
      if ((i + j) % 2 === 0) px(x - 8 + i * 2 + sway, y - 6 + j * 2, 1, 1, "#e6d7b8");
    }
  }
}

function drawMast(x, y) {
  x = Math.round(x);
  y = Math.round(y);
  px(x, y - 20, 2, 20, "#6b4224");
  px(x + 2, y - 18, 7, 8, "#f3ecdf");
  px(x + 2, y - 18, 7, 1, "#d9cbb6");
}

function drawStone(x, y) {
  x = Math.round(x);
  y = Math.round(y - 6);
  for (let j = -7; j <= 7; j++) {
    for (let i = -7; i <= 7; i++) {
      const d = i * i + j * j;
      if (d <= 49 && d >= 30) px(x + i, y + j, 1, 1, "#8a8378");
      else if (d < 30) px(x + i, y + j, 1, 1, "#b7b1a6");
    }
  }
  px(x - 2, y, 4, 1, "#6e675e");
}

function drawLinen(x, y) {
  x = Math.round(x);
  y = Math.round(y);
  px(x - 7, y - 4, 14, 5, "#f7f3ea");
  px(x - 5, y - 6, 8, 3, "#e4ddd0");
  px(x - 6, y - 3, 10, 1, "#d5cec2");
  px(x + 2, y - 7, 4, 2, "#f7f3ea");
}

function drawTree(e) {
  if (e.variant === "cypress") drawCypress(e.x, e.y);
  else drawOlive(e.x, e.y, hash(e.tx || 0, e.ty || 0));
}

function drawTile(ch, x, y, time) {
  const px0 = x * TILE;
  const py0 = y * TILE;
  const h = hash(x, y);
  const wave = Math.floor(time * 2 + x * 0.4) % 2;

  if (ch === "." || ch === ",") {
    ctx.fillStyle = h > 0.55 ? "#74a24c" : "#87b25c";
    ctx.fillRect(px0, py0, 16, 16);
    ctx.fillStyle = "#5e8a3c";
    ctx.fillRect(px0 + 2, py0 + 4 + ((h * 5) | 0), 1, 2);
    ctx.fillRect(px0 + 9, py0 + 8, 1, 3);
    ctx.fillRect(px0 + 13, py0 + 3, 1, 2);
    if (h > 0.82) {
      ctx.fillStyle = "#9bc46a";
      ctx.fillRect(px0 + 6, py0 + 11, 2, 1);
    }
    if (ch === ",") {
      const colors = ["#f0d56a", "#e07a72", "#f4f0e4", "#d7e4a8"];
      ctx.fillStyle = colors[(h * 4) | 0];
      ctx.fillRect(px0 + 5, py0 + 6, 2, 2);
      ctx.fillStyle = "#3e6a32";
      ctx.fillRect(px0 + 6, py0 + 8, 1, 2);
    }
  } else if (ch === "p") {
    ctx.fillStyle = h > 0.5 ? "#c4a36e" : "#b89562";
    ctx.fillRect(px0, py0, 16, 16);
    ctx.fillStyle = "#a68455";
    ctx.fillRect(px0 + 2, py0 + 3, 2, 1);
    ctx.fillRect(px0 + 8, py0 + 10, 3, 1);
    ctx.fillStyle = "#d8c090";
    ctx.fillRect(px0 + 11, py0 + 5, 1, 1);
  } else if (ch === "m") {
    ctx.fillStyle = h > 0.5 ? "#8d9274" : "#7e8464";
    ctx.fillRect(px0, py0, 16, 16);
    ctx.fillStyle = "#6a7054";
    ctx.fillRect(px0 + 3, py0 + 4, 3, 2);
    ctx.fillRect(px0 + 10, py0 + 9, 2, 2);
  } else if (ch === "s") {
    ctx.fillStyle = h > 0.6 ? "#e6d2a2" : "#dcc496";
    ctx.fillRect(px0, py0, 16, 16);
    ctx.fillStyle = "rgba(180,140,80,0.35)";
    ctx.fillRect(px0 + ((h * 10) | 0), py0 + 6, 2, 1);
    const up = state.map.rows[y - 1] && state.map.rows[y - 1][x];
    if (up === "w" || up === "d") {
      ctx.fillStyle = "#cbb888";
      ctx.fillRect(px0, py0, 16, 4);
      ctx.fillStyle = wave ? "#f7fbfb" : "#d5ebe8";
      ctx.fillRect(px0 + 2, py0 + 1, 4, 1);
      ctx.fillRect(px0 + 9, py0 + 2, 5, 1);
    }
  } else if (ch === "d" || ch === "w" || ch === "n" || ch === "l") {
    const deep = ch === "d" || ch === "n";
    ctx.fillStyle = deep ? (wave ? "#164868" : "#1b5274") : wave ? "#2a7498" : "#3284ac";
    if (ch === "n") ctx.fillStyle = wave ? "#12344e" : "#173e5c";
    ctx.fillRect(px0, py0, 16, 16);
    ctx.fillStyle = deep ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.28)";
    if (ch === "n") ctx.fillStyle = "rgba(180,210,230,0.16)";
    ctx.fillRect(px0 + 2 + wave * 3, py0 + 5, 6, 1);
    ctx.fillRect(px0 + 8, py0 + 11 - wave, 5, 1);
    if (ch === "w") {
      ctx.fillStyle = "rgba(232, 214, 170, 0.18)";
      ctx.fillRect(px0, py0 + 12, 16, 4);
    }
    if (ch === "l") {
      const glow = 0.78 + 0.22 * Math.sin(time * 3 + x * 0.7 + y);
      ctx.fillStyle = `rgba(255, 168, 40, ${glow})`;
      ctx.fillRect(px0 + 1, py0 + 1, 14, 14);
      ctx.fillStyle = "rgba(255, 244, 210, 0.95)";
      ctx.fillRect(px0 + 3 + wave, py0 + 6, 4, 1);
      ctx.fillRect(px0 + 8, py0 + 10, 3, 1);
    }
  } else if (ch === "b" || ch === "=") {
    ctx.fillStyle = ch === "b" ? "#a56b38" : "#8d5a30";
    ctx.fillRect(px0, py0, 16, 16);
    ctx.fillStyle = "#c48a52";
    ctx.fillRect(px0, py0 + 3, 16, 1);
    ctx.fillRect(px0, py0 + 8, 16, 1);
    ctx.fillRect(px0, py0 + 13, 16, 1);
    ctx.fillStyle = "#6e4122";
    const row = state.map.rows[y];
    const left = row[x - 1];
    const right = row[x + 1];
    const up = state.map.rows[y - 1] && state.map.rows[y - 1][x];
    const down = state.map.rows[y + 1] && state.map.rows[y + 1][x];
    if (left !== "b" && left !== "=") ctx.fillRect(px0, py0, 2, 16);
    if (right !== "b" && right !== "=") ctx.fillRect(px0 + 14, py0, 2, 16);
    if (up !== "b" && up !== "=") ctx.fillRect(px0, py0, 16, 2);
    if (down !== "b" && down !== "=") ctx.fillRect(px0, py0 + 14, 16, 2);
  } else if (ch === "r" || ch === "T") {
    ctx.fillStyle = ch === "T" ? (h > 0.5 ? "#6a645c" : "#5c564e") : "#8e877c";
    ctx.fillRect(px0, py0, 16, 16);
    ctx.fillStyle = ch === "T" ? "#3e3a36" : "#6e675e";
    ctx.fillRect(px0 + 1, py0 + 2, 6, 5);
    ctx.fillRect(px0 + 8, py0 + 8, 6, 5);
    ctx.fillStyle = ch === "T" ? "#8a847c" : "#c2bbb0";
    ctx.fillRect(px0 + 2, py0 + 3, 2, 1);
  } else if (ch === "o") {
    ctx.fillStyle = "#141218";
    ctx.fillRect(px0, py0, 16, 16);
    ctx.fillStyle = "rgba(90,80,70,0.25)";
    ctx.fillRect(px0 + 2, py0 + 4, 3, 2);
    ctx.fillRect(px0 + 10, py0 + 9, 2, 2);
  } else if (ch === "#") {
    ctx.fillStyle = "#1c1612";
    ctx.fillRect(px0, py0, 16, 16);
    if (h > 0.7) {
      ctx.fillStyle = "#2a221c";
      ctx.fillRect(px0 + 4, py0 + 5, 3, 2);
    }
  }
}

function drawEntity(e, time) {
  if (e.alpha === 0) return;
  if (e.kind === "person") drawPerson(e, time);
  else if (e.kind === "tree") drawTree(e);
  else if (e.kind === "house") drawHouse(e);
  else if (e.kind === "well") drawWell(e.x, e.y);
  else if (e.kind === "net") drawNet(e.x, e.y, time);
  else if (e.kind === "mast") drawMast(e.x, e.y);
  else if (e.kind === "stone") drawStone(e.x, e.y);
  else if (e.kind === "linen") drawLinen(e.x, e.y);
}

function tileAt(x, y) {
  const tx = Math.floor(x / TILE);
  const ty = Math.floor(y / TILE);
  if (!state.map || ty < 0 || tx < 0 || ty >= state.map.h || tx >= state.map.w) return "#";
  return state.map.rows[ty][tx];
}

function isSolidChar(ch) {
  if (ch === "#" || ch === "r" || ch === "T") return true;
  const waterSolid = CHAPTERS[state.chapter].waterSolid !== false;
  if (waterSolid && (ch === "w" || ch === "d" || ch === "n")) return true;
  return false;
}

function blocked(x, y) {
  const r = 4;
  const pts = [
    [x - r, y - 2],
    [x + r, y - 2],
    [x - r, y + 3],
    [x + r, y + 3],
  ];
  for (const [px0, py0] of pts) if (isSolidChar(tileAt(px0, py0))) return true;
  for (const e of state.entities) {
    if (!e.solid) continue;
    if (e.box) {
      const l = e.x + e.box.x;
      const t = e.y + e.box.y;
      if (x > l - r && x < l + e.box.w + r && y > t - 2 && y < t + e.box.h + r) return true;
    } else if (e.radius) {
      const dx = x - e.x;
      const dy = y - e.y;
      const rr = e.radius + r;
      if (dx * dx + dy * dy < rr * rr) return true;
    }
  }
  return false;
}

function tryMove(dx, dy) {
  const p = state.player;
  if (!blocked(p.x + dx, p.y)) p.x += dx;
  if (!blocked(p.x, p.y + dy)) p.y += dy;
}

/* ------------------------------ chapters ------------------------------ */

const VERSES = {
  call: "來跟從我，我要叫你們得人如得魚一樣。",
  nets: "他們就立刻捨了網，跟從了他。",
  b3: "虛心的人有福了！因為天國是他們的。",
  b4: "哀慟的人有福了！因為他們必得安慰。",
  b5: "溫柔的人有福了！因為他們必承受地土。",
  b6: "飢渴慕義的人有福了！因為他們必得飽足。",
  b7: "憐恤人的人有福了！因為他們必蒙憐恤。",
  fearNot: "你們放心，是我，不要怕！",
  littleFaith: "你這小信的人哪，為甚麼疑惑呢？",
  windStill: "風就住了。",
  loaves: "有一個孩童，這裡有五個大麥餅、兩條魚。",
  bread: "我就是生命的糧。到我這裡來的，必定不餓；信我的，永遠不渴。",
  leftovers: "把剩下的零碎收拾起來，免得有糟蹋的。",
  baskets: "他們便將那五個大麥餅的零碎，收拾起來，裝滿了十二個籃子。",
  finished: "耶穌嘗了那醋，就說：「成了！」便低下頭，將靈魂交付神了。",
  risen: "不要害怕！我知道你們是尋找那釘十字架的耶穌。他不在這裡，照他所說的，已經復活了。你們來看安放主的地方。",
  maryLost: "他們把我主挪了去，我不知道放在哪裡。",
  maryName: "馬利亞。",
  peace: "願你們平安！父怎樣差遣了我，我也照樣差遣你們。",
  way: "我就是道路、真理、生命；若不藉著我，沒有人能到父那裡去。",
};

const INTERLUDE = [
  { text: "此後，他被交在人手裡。", ref: "" },
  { text: "他們把他帶到各各他。園子外的天亮了，又暗了。", ref: "" },
  { text: VERSES.finished, ref: "約翰福音 19:30", verse: true },
  { text: "第三日，天還黑的時候。", ref: "" },
];

function findEnt(id) {
  return state.entities.find((e) => e.id === id);
}

function jesus() {
  return findEnt("jesus");
}

function nearestTalkable() {
  let best = null;
  let bestD = 30;
  for (const e of state.entities) {
    if (!e.talk || e.alpha === 0 || !e.name) continue;
    const d = dist(state.player, e);
    if (d < bestD) {
      best = e;
      bestD = d;
    }
  }
  return best;
}

function completeChapter() {
  if (state.cleared) return;
  state.cleared = true;
  const ch = CHAPTERS[state.chapter];
  if (ch.after) ch.after();
  else openClear();
}

function snapCamera() {
  const maxX = Math.max(0, state.map.w * TILE - VIEW_W);
  const maxY = Math.max(0, state.map.h * TILE - VIEW_H);
  state.cam.x = clamp(state.player.x - VIEW_W / 2, 0, maxX);
  state.cam.y = clamp(state.player.y - VIEW_H / 2, 0, maxY);
}

function baseReset(musicMode) {
  state.flags = {};
  state.held = "";
  state.progress = "";
  state.cleared = false;
  state.faith = 100;
  state.dialogue.open = false;
  state.particles = [];
  state.floats.forEach((f) => f.el.remove());
  state.floats = [];
  state.flash = 0;
  state.shake = 0;
  setMusic(musicMode);
}

const CHAPTERS = [
  {
    title: "海邊的呼召",
    ref: "馬可福音 1:16–20",
    kicker: "第一章",
    intro:
      "加利利海邊，有人在補網。一位拉比沿岸走過，對他們說：來跟從我。你站在他們中間，像是也被這聲音叫住的人。走過去，回答他，再去請那四位漁夫。",
    closing: "他們就立刻捨了網，跟從了他。",
    closingRef: "馬可福音 1:18",
    music: "peace",
    build() {
      const m = createMap(34, 22, ".");
      m.rect(0, 1, 34, 3, "d");
      m.rect(0, 4, 34, 1, "w");
      m.rect(0, 5, 34, 4, "s");
      m.rect(4, 6, 7, 3, "b");
      m.rect(22, 6, 7, 3, "b");
      stroke(m, [
        [16, 20],
        [16, 9],
      ], "p", 0);
      stroke(m, [
        [17, 20],
        [17, 9],
      ], "p", 0);
      m.rect(8, 9, 18, 1, "p");
      scatter(m, ",", 0.14, (ch) => ch === ".");
      [[4, 16], [30, 14], [7, 12], [28, 18], [21, 15]].forEach(([x, y]) => m.set(x, y, "r"));
      m.frame("#");
      state.map = m;
      state.player = Object.assign(tp(16, 18), { dir: "up", moving: false, look: LOOKS.player });
      state.entities = [
        prop({ kind: "house", tx: 4, ty: 14, solid: true, box: { x: -14, y: -16, w: 28, h: 16 } }),
        prop({ kind: "house", tx: 29, ty: 16, solid: true, box: { x: -14, y: -16, w: 28, h: 16 } }),
        prop({ kind: "tree", tx: 8, ty: 13, solid: true, radius: 4 }),
        prop({ kind: "tree", tx: 24, ty: 13, solid: true, radius: 4 }),
        prop({ kind: "tree", tx: 6, ty: 18, solid: true, radius: 4 }),
        prop({ kind: "tree", tx: 27, ty: 19, solid: true, radius: 4 }),
        prop({ kind: "tree", tx: 12, ty: 20, solid: true, radius: 4 }),
        prop({ kind: "mast", tx: 6, ty: 6 }),
        prop({ kind: "mast", tx: 26, ty: 6 }),
        prop({ kind: "net", tx: 13, ty: 8 }),
        person({ id: "villager", name: "村人", tx: 11, ty: 15, look: "elder", dir: "right" }),
        person({ id: "simon", name: "西門", tx: 7, ty: 7, look: "simon", dir: "down", role: "fisher" }),
        person({ id: "andrew", name: "安得烈", tx: 13, ty: 8, look: "andrew", dir: "left", role: "fisher" }),
        person({ id: "james", name: "雅各", tx: 25, ty: 7, look: "james", dir: "down", role: "fisher" }),
        person({ id: "john", name: "約翰", tx: 20, ty: 8, look: "john", dir: "right", role: "fisher" }),
        person({ id: "jesus", name: "耶穌", tx: 16, ty: 7, look: "jesus", dir: "down" }),
      ];
      state.objective = "走到海邊，回應耶穌的呼召。";
      state.flags.called = {};
    },
    onEnter() {
      state.objective = "走到海邊，回應耶穌的呼召。";
      this.refresh();
    },
    refresh() {
      const n = Object.keys(state.flags.called).length;
      state.progress = state.flags.metJesus ? `漁夫 ${n}／4` : "";
    },
    goal() {
      if (!state.flags.metJesus) return jesus();
      const left = state.entities.find((e) => e.role === "fisher" && !state.flags.called[e.id]);
      if (left) return left;
      return jesus();
    },
    update(dt) {
      const slots = [
        [-14, 18],
        [14, 18],
        [-16, 30],
        [16, 30],
      ];
      let i = 0;
      const j = jesus();
      for (const e of state.entities) {
        if (!e.following || !j) continue;
        const slot = slots[i++] || slots[0];
        const tx = j.x + slot[0];
        const ty = j.y + slot[1];
        const dx = tx - e.x;
        const dy = ty - e.y;
        e.x += dx * Math.min(1, dt * 2.2);
        e.y += dy * Math.min(1, dt * 2.2);
        e.moving = Math.hypot(dx, dy) > 2;
        if (Math.abs(dx) > Math.abs(dy)) e.dir = dx > 0 ? "right" : "left";
        else if (Math.abs(dy) > 1) e.dir = dy > 0 ? "down" : "up";
      }
    },
    talk(e) {
      const flags = state.flags;
      if (e.id === "villager") {
        say([
          { name: "村人", text: "孩子，海邊有一位拉比。他說話不像文士，像是有權柄的人。" },
          { name: "村人", text: "網還在他們手裡。你若要找他，就沿著這條路往海走。" },
        ]);
        return;
      }
      if (e.id === "jesus") {
        const n = Object.keys(flags.called).length;
        if (!flags.metJesus) {
          say(
            [
              { name: "耶穌", text: "時候到了，神的國近了。" },
              { name: "耶穌", text: VERSES.call, ref: "馬可福音 1:17", verse: true },
              { name: "你", text: "主，我跟從你。" },
              { name: "耶穌", text: "你去，請岸邊的漁夫。我呼召他們，也呼召你。" },
            ],
            () => {
              flags.metJesus = true;
              state.objective = "請西門、安得烈、雅各、約翰來跟從。";
              this.refresh();
            }
          );
          return;
        }
        if (n < 4) {
          say([{ name: "耶穌", text: "人還沒有到齊。岸邊還有被呼召的人。" }]);
          return;
        }
        say(
          [
            { name: "耶穌", text: "你們來。從此，你們要與我同行。" },
            { name: "", text: VERSES.nets, ref: "馬可福音 1:18", verse: true },
          ],
          () => completeChapter()
        );
        return;
      }
      if (e.role === "fisher") {
        if (!flags.metJesus) {
          const lines = {
            simon: "整晚勞力，網裡卻不多。你找誰？海邊若有拉比，你先去聽他說話。",
            andrew: "我是安得烈。網破了，我正在補。你看起來在找人。",
            james: "船還要收拾。你若沒事，別擋著槳。",
            john: "海今天很亮。你在等人嗎？我也是。",
          };
          say([{ name: e.name, text: lines[e.id] }]);
          return;
        }
        if (flags.called[e.id]) {
          say([{ name: e.name, text: "我們在他身邊。網可以留在這裡。" }]);
          return;
        }
        const lines = {
          simon: [
            { name: "西門", text: "跟從他？我是西門。他看著我，好像早就認識我。" },
            { name: "你", text: "他說：來跟從我，我要叫你們得人如得魚一樣。" },
            { name: "西門", text: "那就把網放下。我來了。" },
          ],
          andrew: [
            { name: "安得烈", text: "我是安得烈，西門的兄弟。我們原是在等那將要來的。" },
            { name: "安得烈", text: "他若呼召，我就去。你告訴我兄弟，我也在路上。" },
          ],
          james: [
            { name: "雅各", text: "我和弟弟在父親的船上補網。" },
            { name: "雅各", text: "可是他呼召的時候，我不能把心留在網裡。父親若問，你說我們跟老師去了。" },
          ],
          john: [
            { name: "約翰", text: "我聽見了。他不是只要我們捕魚。" },
            { name: "約翰", text: "他要我們得人。我把雇工留在船上，我跟你們走。" },
          ],
        };
        say(lines[e.id], () => {
          flags.called[e.id] = true;
          e.following = true;
          e.dir = "up";
          puff(e.x, e.y - 10, "#f0c84b", 8, 20);
          this.refresh();
          const n = Object.keys(flags.called).length;
          if (n >= 4) state.objective = "回到耶穌那裡。他們都來了。";
        });
      }
    },
  },
  {
    title: "山上的話",
    ref: "馬太福音 5:1–7",
    kicker: "第二章",
    intro:
      "他上了山，開口教訓他們。山坡上坐著憂愁的人。先到他面前，把這些話接過來，再送到每一個人心裡。",
    closing: "話留在他們心裡，他們就不再坐在憂愁裡。",
    closingRef: "馬太福音 5:2",
    music: "peace",
    people: [
      {
        id: "tax",
        name: "稅吏",
        look: "tax",
        tx: 22,
        ty: 16,
        pain: "人都知道我的行業。我以為天國沒有我的份。",
        reply: "若天國是虛心之人的，那我也坐在這裡聽。",
        verse: VERSES.b3,
        ref: "馬太福音 5:3",
      },
      {
        id: "widow",
        name: "婦人",
        look: "woman",
        tx: 9,
        ty: 14,
        pain: "我失去了孩子。山風很大，心裡更空。",
        reply: "……若是他說的，我就在這裡等那安慰。",
        verse: VERSES.b4,
        ref: "馬太福音 5:4",
      },
      {
        id: "youth",
        name: "少年",
        look: "youth",
        tx: 11,
        ty: 10,
        pain: "人都說我軟弱，說我該更硬一點。",
        reply: "溫柔若也是一條路，那我不必裝成別人。",
        verse: VERSES.b5,
        ref: "馬太福音 5:5",
      },
      {
        id: "traveler",
        name: "旅人",
        look: "traveler",
        tx: 23,
        ty: 8,
        pain: "我渴想公義，像走路的人渴想水。到處都是彎曲的。",
        reply: "那我就坐下來，等他說的飽足。",
        verse: VERSES.b6,
        ref: "馬太福音 5:6",
      },
      {
        id: "elder",
        name: "老人",
        look: "elder",
        tx: 14,
        ty: 6,
        pain: "我病了很久，沒有人肯靠近我的鋪蓋。",
        reply: "憐恤若從他口裡出來，也該從我們手裡出去。",
        verse: VERSES.b7,
        ref: "馬太福音 5:7",
      },
    ],
    build() {
      const m = createMap(32, 24, "m");
      m.rect(3, 2, 26, 20, ".");
      stroke(
        m,
        [
          [16, 21],
          [16, 16],
          [10, 14],
          [10, 10],
          [18, 8],
          [16, 4],
        ],
        "p",
        1
      );
      scatter(m, ",", 0.1, (ch) => ch === ".");
      [[5, 8], [26, 6], [6, 18], [27, 16], [24, 12], [8, 6]].forEach(([x, y]) => m.set(x, y, "r"));
      m.frame("#");
      state.map = m;
      state.player = Object.assign(tp(16, 21), { dir: "up", moving: false, look: LOOKS.player });
      state.entities = [
        prop({ kind: "tree", tx: 6, ty: 11, solid: true, radius: 4 }),
        prop({ kind: "tree", tx: 26, ty: 10, solid: true, radius: 4 }),
        prop({ kind: "tree", tx: 8, ty: 17, solid: true, radius: 4 }),
        prop({ kind: "tree", tx: 25, ty: 18, solid: true, radius: 4 }),
        prop({ kind: "tree", tx: 20, ty: 5, solid: true, radius: 4 }),
        person({ id: "jesus", name: "耶穌", tx: 16, ty: 4, look: "jesus", dir: "down" }),
      ];
      this.people.forEach((p) => {
        state.entities.push(person({ id: p.id, name: p.name, tx: p.tx, ty: p.ty, look: p.look, mark: "worry", role: "crowd" }));
      });
      state.flags.comforted = {};
      state.objective = "上山，到耶穌面前。";
    },
    onEnter() {
      state.objective = "上山，到耶穌面前。";
    },
    refresh() {
      const n = Object.keys(state.flags.comforted).length;
      state.progress = state.flags.gotSermon ? `已安慰 ${n}／5` : "";
      state.held = state.flags.gotSermon && n < 5 ? "山上的話" : "";
    },
    goal() {
      const n = Object.keys(state.flags.comforted).length;
      if (!state.flags.gotSermon || n >= 5) return jesus();
      let best = null;
      let bestD = 1e9;
      for (const p of this.people) {
        if (state.flags.comforted[p.id]) continue;
        const e = findEnt(p.id);
        const d = dist(state.player, e);
        if (d < bestD) {
          best = e;
          bestD = d;
        }
      }
      return best;
    },
    update() {},
    talk(e) {
      const flags = state.flags;
      if (e.id === "jesus") {
        const n = Object.keys(flags.comforted).length;
        if (!flags.gotSermon) {
          say(
            [
              { name: "耶穌", text: "他看見這許多的人，就上了山。門徒到他跟前來。" },
              { name: "耶穌", text: "有人帶著憂愁坐在這山坡上。我把這些話託付給你。" },
              { name: "耶穌", text: "走到每一個人面前，把對他說的那句話送出去。" },
            ],
            () => {
              flags.gotSermon = true;
              state.objective = "把山上的話，說給五個憂愁的人聽。";
              this.refresh();
            }
          );
          return;
        }
        if (n < 5) {
          say([{ name: "耶穌", text: "還有人坐在憂愁裡。你手裡的話，還沒有送完。" }]);
          return;
        }
        say(
          [
            { name: "耶穌", text: "你們是世上的光。話留下，人就不必再走在暗中。" },
            { name: "耶穌", text: "去吧。山還在，可是他們的臉已經不一樣了。" },
          ],
          () => completeChapter()
        );
        return;
      }
      const info = this.people.find((p) => p.id === e.id);
      if (!info) return;
      if (flags.comforted[e.id]) {
        say([{ name: e.name, text: "我還坐在這裡，可是心裡安靜了。" }]);
        return;
      }
      if (!flags.gotSermon) {
        say([
          { name: e.name, text: info.pain },
          { name: e.name, text: "等那位拉比開口吧。你先上到他那裡。" },
        ]);
        return;
      }
      say(
        [
          { name: e.name, text: info.pain },
          { name: "你", text: info.verse, ref: info.ref, verse: true },
          { name: e.name, text: info.reply },
        ],
        () => {
          flags.comforted[e.id] = true;
          e.mark = "peace";
          puff(e.x, e.y - 16, "#f0c84b", 10, 18);
          tone(740, 0.12, "triangle", 0.04);
          this.refresh();
          const n = Object.keys(flags.comforted).length;
          state.objective = n >= 5 ? "回到耶穌那裡。" : "還有人在等一句話。";
        }
      );
    },
  },
  {
    title: "履海",
    ref: "馬太福音 14:22–33",
    kicker: "第三章",
    intro:
      "夜裡四更天，船在海中，因風不順，被浪搖撼。他在海面上走。從船上下來，踏著金光走向他。眼睛看著他，不要看風浪。信心若盡，他仍會拉住你。",
    closing: "他們上了船，風就住了。",
    closingRef: "馬太福音 14:32",
    music: "storm",
    waterSolid: false,
    night: true,
    build() {
      const m = createMap(40, 18, "n");
      stroke(
        m,
        [
          [11, 8],
          [18, 6],
          [24, 10],
          [34, 8],
        ],
        "l",
        1
      );
      m.rect(2, 7, 8, 3, "b");
      m.rect(3, 6, 6, 1, "b");
      m.rect(3, 10, 6, 1, "b");
      m.set(10, 8, "b");
      m.frame("#");
      state.map = m;
      state.player = Object.assign(tp(5, 8), { dir: "right", moving: false, look: LOOKS.player });
      state.entities = [
        prop({ kind: "mast", tx: 4, ty: 7 }),
        person({ id: "jesus", name: "耶穌", tx: 34, ty: 8, look: "jesus", dir: "left" }),
      ];
      state.faith = 100;
      state.flags.sinks = 0;
      state.objective = "踏著金光，走向海上的耶穌。面向他，風就減弱。";
    },
    onEnter() {
      say([
        { name: "耶穌", text: VERSES.fearNot, ref: "馬太福音 14:27", verse: true },
        { name: "耶穌", text: "從船上下來，走向我。金光所在的地方，海就托住你。" },
        { name: "耶穌", text: "你的眼睛要看我，不要看風浪。" },
      ]);
      state.objective = "踏著金光，走向海上的耶穌。面向他，風就減弱。";
    },
    goal() {
      return jesus();
    },
    facingHim() {
      const j = jesus();
      if (!j) return false;
      const a = axis();
      if (!a.x && !a.y) return false;
      return a.x * (j.x - state.player.x) + a.y * (j.y - state.player.y) > 0;
    },
    update(dt) {
      const flags = state.flags;
      if (flags.sinking || flags.reached || state.dialogue.open) return;
      const ch = tileAt(state.player.x, state.player.y);
      const onBoat = ch === "b" || ch === "=";
      const onLight = ch === "l";
      const j = jesus();
      if (onBoat || onLight) state.faith = Math.min(100, state.faith + dt * (onLight ? 34 : 46));
      else {
        const face = this.facingHim();
        state.faith -= dt * (face ? 7 : 18);
        const push = face ? 8 : 26;
        tryMove(0, push * dt);
      }
      if (state.faith <= 0) {
        state.faith = 0;
        flags.sinking = true;
        flags.sinks += 1;
        state.shake = 0.6;
        noise(0.25, 0.08, 600);
        tone(160, 0.2, "sine", 0.05, 50);
        const first = flags.sinks === 1;
        const lines = first
          ? [
              { name: "你", text: "主啊，救我！" },
              { name: "", text: "一隻手把你拉住了。" },
              { name: "耶穌", text: VERSES.littleFaith, ref: "馬太福音 14:31", verse: true },
              { name: "耶穌", text: "起來，再走。我在這裡。" },
            ]
          : [
              { name: "你", text: "主啊，救我！" },
              { name: "耶穌", text: "我在。看我，再走一次。" },
            ];
        say(lines, () => {
          const home = tp(5, 8);
          state.player.x = home.x;
          state.player.y = home.y;
          state.player.dir = "right";
          state.faith = 100;
          flags.sinking = false;
          snapCamera();
        });
        return;
      }
      if (j && dist(state.player, j) < 22) {
        flags.reached = true;
        state.faith = 100;
        puff(j.x, j.y, "#d6ecff", 16, 30);
        say(
          [
            { name: "耶穌", text: "上來吧。" },
            { name: "", text: "風就住了，海也平靜了。", ref: "馬太福音 14:32", verse: VERSES.windStill },
            { name: "耶穌", text: "你信，不是因為海平靜，是因為我在。" },
          ],
          () => completeChapter()
        );
      }
    },
    talk(e) {
      if (e.id === "jesus" && !state.flags.reached) {
        say([{ name: "耶穌", text: "再走幾步。我看得見你。" }]);
      }
    },
  },
  {
    title: "五餅二魚",
    ref: "約翰福音 6:1–13",
    kicker: "第四章",
    intro: "眾人餓了，地方又是野地。一個孩子願意交出五個大麥餅、兩條魚。先帶到主面前，再分給人。",
    closing: "他們都吃飽了。",
    closingRef: "約翰福音 6:12",
    music: "peace",
    crowd: [
      ["farmer", "農夫", 12, 9],
      ["woman", "婦人", 22, 9],
      ["elder", "老人", 10, 12],
      ["traveler", "旅人", 24, 12],
      ["youth", "少年", 14, 13],
      ["mother", "母親", 20, 14],
      ["worker", "工人", 13, 15],
      ["poor", "乞丐", 23, 11],
    ],
    build() {
      const m = createMap(34, 22, ".");
      scatter(m, ",", 0.16, (ch) => ch === ".");
      m.rect(14, 4, 6, 3, "p");
      stroke(m, [
        [17, 18],
        [17, 6],
      ], "p", 0);
      [[5, 6], [29, 8], [6, 16], [28, 17]].forEach(([x, y]) => m.set(x, y, "r"));
      m.frame("#");
      state.map = m;
      state.player = Object.assign(tp(17, 18), { dir: "up", moving: false, look: LOOKS.player });
      state.entities = [
        prop({ kind: "tree", tx: 4, ty: 8, solid: true, radius: 4 }),
        prop({ kind: "tree", tx: 29, ty: 6, solid: true, radius: 4 }),
        prop({ kind: "tree", tx: 5, ty: 17, solid: true, radius: 4 }),
        prop({ kind: "tree", tx: 28, ty: 15, solid: true, radius: 4 }),
        prop({ kind: "well", tx: 7, ty: 11, solid: true, radius: 8 }),
        person({ id: "boy", name: "孩子", tx: 20, ty: 16, look: "boy", dir: "left" }),
        person({ id: "jesus", name: "耶穌", tx: 17, ty: 5, look: "jesus", dir: "down" }),
      ];
      this.crowd.forEach(([lookId, name, tx, ty], i) => {
        state.entities.push(
          person({
            id: "hungry" + i,
            name,
            tx,
            ty,
            look: lookId,
            role: "hungry",
            mark: "hungry",
            fed: false,
          })
        );
      });
      state.flags.fed = 0;
      state.objective = "去找那個願意交出午餐的孩子。";
    },
    onEnter() {
      state.objective = "去找那個願意交出午餐的孩子。";
    },
    refresh() {
      if (state.flags.blessed) state.progress = `已領受 ${state.flags.fed}／8`;
      else state.progress = "";
    },
    goal() {
      if (!state.flags.hasBasket) return findEnt("boy");
      if (!state.flags.blessed) return jesus();
      if (state.flags.fed < 8) {
        let best = null;
        let bestD = 1e9;
        for (const e of state.entities) {
          if (e.role !== "hungry" || e.fed) continue;
          const d = dist(state.player, e);
          if (d < bestD) {
            best = e;
            bestD = d;
          }
        }
        return best;
      }
      return jesus();
    },
    update() {},
    talk(e) {
      const flags = state.flags;
      if (e.id === "boy") {
        if (!flags.hasBasket) {
          say(
            [
              { name: "孩子", text: "先生，我只有這些。這麼多人，算什麼呢？" },
              { name: "", text: VERSES.loaves, ref: "約翰福音 6:9", verse: true },
              { name: "你", text: "我們拿到主那裡去。" },
              { name: "孩子", text: "好。五個大麥餅、兩條魚，都在這籃子裡了。" },
            ],
            () => {
              flags.hasBasket = true;
              state.held = "五餅二魚";
              state.objective = "把籃子交在耶穌手裡。";
              puff(e.x, e.y - 8, "#e6c56a", 8, 16);
            }
          );
          return;
        }
        say([{ name: "孩子", text: flags.blessed ? "真的夠大家吃。我從沒看過這樣的事。" : "快點拿去吧，大家都望著他。" }]);
        return;
      }
      if (e.id === "jesus") {
        if (!flags.hasBasket) {
          say([
            { name: "耶穌", text: "你們給他們吃吧。" },
            { name: "耶穌", text: "這裡有多少餅，你們去看看。" },
          ]);
          return;
        }
        if (!flags.blessed) {
          say(
            [
              { name: "耶穌", text: "拿過來。" },
              { name: "", text: "耶穌拿起餅來，祝謝了，就分給那坐著的人。", ref: "約翰福音 6:11" },
              { name: "耶穌", text: VERSES.bread, ref: "約翰福音 6:35", verse: true },
            ],
            () => {
              flags.blessed = true;
              state.held = "生命的糧";
              state.objective = "把餅分給場上的八個人。";
              puff(e.x, e.y - 8, "#f0c84b", 22, 36);
              chime();
              this.refresh();
            }
          );
          return;
        }
        if (flags.fed < 8) {
          say([{ name: "耶穌", text: "你去分給他們。不要留下誰餓著。" }]);
          return;
        }
        say(
          [
            { name: "耶穌", text: VERSES.leftovers, ref: "約翰福音 6:12", verse: true },
            { name: "", text: VERSES.baskets, ref: "約翰福音 6:13" },
          ],
          () => completeChapter()
        );
        return;
      }
      if (e.role === "hungry") {
        if (!flags.blessed) {
          say([{ name: e.name, text: "肚子餓了。若有餅，請先帶到主面前。" }]);
          return;
        }
        if (e.fed) {
          spawnFloat(e.x, e.y - 24, "我飽了。");
          return;
        }
        e.fed = true;
        e.mark = null;
        flags.fed += 1;
        const thanks = ["謝謝你。", "我飽了。", "這餅是熱的。", "謝謝主。", "夠了，真的夠了。", "我不再餓了。", "請也給旁邊的人。", "願主記念你。"];
        spawnFloat(e.x, e.y - 24, thanks[flags.fed % thanks.length]);
        puff(e.x, e.y - 10, "#f2d48a", 6, 16);
        tone(640, 0.08, "triangle", 0.04);
        this.refresh();
        if (flags.fed >= 8) {
          state.objective = "眾人都吃飽了。回到耶穌那裡。";
          chime();
        }
      }
    },
  },
  {
    title: "清晨的園子",
    ref: "約翰福音 20:1–18",
    kicker: "第五章",
    intro: "七日的第一日，清早。墓前的石頭已經滾開。進去看，再回到園子裡。",
    closing: "",
    music: "dawn",
    after() {
      openEnding();
    },
    build() {
      const m = createMap(30, 20, ".");
      scatter(m, ",", 0.22, (ch) => ch === ".");
      stroke(m, [
        [15, 17],
        [15, 8],
      ], "p", 0);
      m.rect(10, 2, 10, 6, "T");
      m.rect(12, 3, 6, 4, "o");
      m.set(14, 7, "p");
      m.set(15, 7, "p");
      m.frame("#");
      state.map = m;
      state.player = Object.assign(tp(15, 17), { dir: "up", moving: false, look: LOOKS.player });
      state.entities = [
        prop({ kind: "tree", tx: 4, ty: 8, variant: "cypress", solid: true, radius: 3 }),
        prop({ kind: "tree", tx: 7, ty: 15, variant: "cypress", solid: true, radius: 3 }),
        prop({ kind: "tree", tx: 24, ty: 6, variant: "cypress", solid: true, radius: 3 }),
        prop({ kind: "tree", tx: 26, ty: 14, variant: "cypress", solid: true, radius: 3 }),
        prop({ kind: "tree", tx: 8, ty: 5, variant: "cypress", solid: true, radius: 3 }),
        prop({ kind: "stone", tx: 19, ty: 8 }),
        prop({ kind: "linen", id: "linen", tx: 14, ty: 4 }),
        person({ id: "mary", name: "抹大拉的馬利亞", tx: 15, ty: 13, look: "mary", dir: "up" }),
        person({ id: "angel", name: "天使", tx: 18, ty: 9, look: "angel", dir: "left" }),
        prop({ kind: "beacon", id: "out", tx: 15, ty: 10 }),
      ];
      state.flags.seenTomb = false;
      state.flags.appeared = false;
      state.flags.finalStarted = false;
      state.objective = "走向墓門。石頭已經滾開了。";
    },
    onEnter() {
      state.objective = "走向墓門。石頭已經滾開了。";
    },
    inTomb() {
      return tileAt(state.player.x, state.player.y) === "o";
    },
    goal() {
      if (!state.flags.seenTomb) return findEnt("linen");
      if (!state.flags.appeared) return findEnt("out");
      return jesus();
    },
    update(dt) {
      const flags = state.flags;
      const mary = findEnt("mary");
      if (mary && !flags.marySpoke && !flags.appeared && !state.dialogue.open && dist(state.player, mary) < 26) {
        flags.marySpoke = true;
        this.talk(mary);
      }
      if (!flags.seenTomb && this.inTomb() && !state.dialogue.open) {
        flags.seenTomb = true;
        const lines = [];
        if (!flags.angelSpoke) {
          flags.angelSpoke = true;
          lines.push(
            { name: "天使", text: "不要害怕！我知道你們是尋找那釘十字架的耶穌。", ref: "馬太福音 28:5-6", verse: VERSES.risen },
            { name: "天使", text: "他不在這裡，照他所說的，已經復活了。你們來看安放主的地方。" }
          );
        }
        lines.push({ name: "", text: "只有細麻布還在這裡。裡頭是空的。" });
        say(lines, () => {
          state.objective = "離開墳墓，回到園子裡。";
        });
      }
      if (flags.seenTomb && !flags.appeared && !this.inTomb() && !state.dialogue.open) {
        flags.appeared = true;
        flags.appearTimer = 1.05;
        const spot = tp(22, 12);
        state.entities.push(person({ id: "jesus", name: "耶穌", tx: 22, ty: 12, look: "jesus", dir: "left", alpha: 0 }));
        const j = jesus();
        j.x = spot.x;
        j.y = spot.y;
        state.flash = 0.85;
        puff(spot.x, spot.y - 12, "#fff4d0", 24, 28);
        appearSound();
        setMusic("end");
      }
      const j = jesus();
      if (j && flags.appeared && j.alpha < 1) j.alpha = Math.min(1, j.alpha + dt * 0.7);
      if (flags.appeared && !flags.finalStarted) {
        flags.appearTimer -= dt;
        if (flags.appearTimer <= 0) this.finale();
      }
    },
    finale() {
      if (state.flags.finalStarted) return;
      state.flags.finalStarted = true;
      const mary = findEnt("mary");
      if (mary) mary.dir = "right";
      say(
        [
          { name: "耶穌", text: VERSES.maryName, ref: "約翰福音 20:16" },
          { name: "抹大拉的馬利亞", text: "拉波尼！" },
          { name: "抹大拉的馬利亞", text: "我已經看見了主。" },
          { name: "耶穌", text: VERSES.peace, ref: "約翰福音 20:21", verse: true },
        ],
        () => completeChapter()
      );
    },
    talk(e) {
      const flags = state.flags;
      if (e.id === "mary") {
        if (flags.appeared) say([{ name: "抹大拉的馬利亞", text: "我已經看見了主。他活著。" }]);
        else
          say([
            { name: "抹大拉的馬利亞", text: VERSES.maryLost, ref: "約翰福音 20:13", verse: true },
            { name: "抹大拉的馬利亞", text: "天還黑的時候我就來了。石頭不在原處。" },
          ]);
        return;
      }
      if (e.id === "angel") {
        if (flags.angelSpoke) {
          say([{ name: "天使", text: "來看安放主的地方。他不在這裡。" }]);
          return;
        }
        flags.angelSpoke = true;
        say([
          { name: "天使", text: "不要害怕！我知道你們是尋找那釘十字架的耶穌。", ref: "馬太福音 28:5-6", verse: VERSES.risen },
          { name: "天使", text: "他不在這裡，照他所說的，已經復活了。你們來看安放主的地方。" },
        ]);
        return;
      }
      if (e.id === "linen") {
        if (!flags.seenTomb) return;
        say([{ name: "", text: "細麻布還在，人卻不在了。" }]);
        return;
      }
      if (e.id === "jesus") this.finale();
    },
  },
];

function loadChapter(index) {
  state.chapter = index;
  const ch = CHAPTERS[index];
  baseReset(ch.music || "peace");
  ch.build();
  snapCamera();
  state.objective = state.objective || "";
}

/* ------------------------------ simulation ------------------------------ */

function axis() {
  let x = 0;
  let y = 0;
  if (keys.has("arrowleft") || keys.has("a") || hold.left) x -= 1;
  if (keys.has("arrowright") || keys.has("d") || hold.right) x += 1;
  if (keys.has("arrowup") || keys.has("w") || hold.up) y -= 1;
  if (keys.has("arrowdown") || keys.has("s") || hold.down) y += 1;
  if (x && y) {
    x *= 0.707;
    y *= 0.707;
  }
  return { x, y };
}

function updatePlayer(dt) {
  const p = state.player;
  const a = axis();
  const speed = 78;
  p.moving = a.x !== 0 || a.y !== 0;
  if (p.moving) {
    if (Math.abs(a.x) > Math.abs(a.y)) p.dir = a.x > 0 ? "right" : "left";
    else p.dir = a.y > 0 ? "down" : "up";
    tryMove(a.x * speed * dt, a.y * speed * dt);
    if (state.chapter === 0 && tileAt(p.x, p.y) === "s" && Math.random() < 0.3) {
      state.particles.push({
        x: p.x,
        y: p.y,
        vx: 0,
        vy: -4,
        life: 0.3,
        age: 0,
        color: "rgba(230,210,160,0.8)",
        sz: 1,
      });
    }
  }
}

function updateCamera(dt) {
  const maxX = Math.max(0, state.map.w * TILE - VIEW_W);
  const maxY = Math.max(0, state.map.h * TILE - VIEW_H);
  let tx = clamp(state.player.x - VIEW_W / 2, 0, maxX);
  let ty = clamp(state.player.y - VIEW_H / 2, 0, maxY);
  if (state.mode === "title") {
    tx = clamp(tp(16, 7).x - VIEW_W / 2, 0, maxX);
    ty = 0;
  }
  const k = 1 - Math.pow(0.001, dt);
  state.cam.x += (tx - state.cam.x) * (state.mode === "title" ? 1 : k);
  state.cam.y += (ty - state.cam.y) * (state.mode === "title" ? 1 : k);
}

function updateStorm(dt) {
  if (state.mode !== "play" || state.chapter !== 2) return;
  state.stormTimer -= dt;
  if (state.stormTimer <= 0) {
    state.flash = 0.55;
    state.shake = reduceMotion ? 0 : 0.45;
    noise(0.35, 0.06, 400);
    state.stormTimer = 6 + Math.random() * 5;
  }
}

function updateTitle(dt) {
  const home = tp(16, 10);
  state.player.x = home.x + Math.sin(state.time * 0.45) * 26;
  state.player.y = home.y;
  state.player.moving = true;
  state.player.dir = Math.cos(state.time * 0.45) > 0 ? "right" : "left";
  const j = jesus();
  if (j) j.dir = "down";
}

function update(dt) {
  state.time += dt;
  if (state.shake > 0) state.shake = Math.max(0, state.shake - dt);
  if (state.flash > 0) state.flash = Math.max(0, state.flash - dt * 0.8);
  updateParticles(dt);
  tickMusic();
  if (!state.map) return;
  const playing = state.mode === "play" && !state.screen && !state.dialogue.open;
  if (state.mode === "title") updateTitle(dt);
  else if (playing) {
    updatePlayer(dt);
    CHAPTERS[state.chapter].update(dt);
    updateStorm(dt);
  }
  updateDialogue(dt);
  updateCamera(dt);
  for (const g of state.gulls) {
    g.x += g.s * dt;
    if (g.x > VIEW_W + 20) g.x = -20;
  }
}

function render() {
  const camX = Math.round(state.cam.x);
  const camY = Math.round(state.cam.y);
  ctx.save();
  if (state.shake > 0) {
    ctx.translate((Math.random() - 0.5) * state.shake * 6, (Math.random() - 0.5) * state.shake * 6);
  }
  ctx.fillStyle = "#120e0c";
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  if (state.mode === "interlude") {
    renderInterludeWorld();
    ctx.restore();
    return;
  }
  if (!state.map) {
    ctx.restore();
    return;
  }

  ctx.save();
  ctx.translate(-camX, -camY);
  const x0 = Math.max(0, Math.floor(camX / TILE) - 1);
  const y0 = Math.max(0, Math.floor(camY / TILE) - 1);
  const x1 = Math.min(state.map.w - 1, Math.floor((camX + VIEW_W) / TILE) + 1);
  const y1 = Math.min(state.map.h - 1, Math.floor((camY + VIEW_H) / TILE) + 1);
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) drawTile(state.map.rows[y][x], x, y, state.time);
  }

  if (state.chapter === 0 || state.mode === "title") {
    for (let i = 0; i < 5; i++) {
      const fx = 40 + i * 70 + Math.sin(state.time * 1.4 + i) * 16;
      const fy = 36 + (i % 2) * 18 + Math.cos(state.time * 1.1 + i) * 6;
      px(fx, fy, 3, 1, "rgba(232,244,248,0.85)");
      px(fx + 1, fy - 1, 1, 1, "rgba(232,244,248,0.85)");
    }
  }

  const drawables = state.entities.filter((e) => e.kind !== "beacon");
  drawables.push({
    kind: "person",
    x: state.player.x,
    y: state.player.y,
    dir: state.player.dir,
    look: state.player.look,
    moving: state.player.moving,
    alpha: 1,
    mark: null,
  });
  drawables.sort((a, b) => a.y - b.y);
  for (const e of drawables) drawEntity(e, state.time);

  const j = state.mode === "interlude" ? null : jesus();
  if (j && j.alpha !== 0) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const g = ctx.createRadialGradient(j.x, j.y - 16, 2, j.x, j.y - 16, 34);
    g.addColorStop(0, "rgba(255, 220, 150, 0.45)");
    g.addColorStop(1, "rgba(255, 220, 150, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(j.x - 36, j.y - 52, 72, 72);
    ctx.restore();
  }
  ctx.restore();

  const ch = CHAPTERS[state.chapter];
  if (ch && ch.night && state.mode !== "title") {
    const sx = j ? j.x - camX : state.player.x - camX;
    const sy = j ? j.y - camY - 10 : state.player.y - camY;
    const px0 = state.player.x - camX;
    const py0 = state.player.y - camY;
    lightCtx.clearRect(0, 0, VIEW_W, VIEW_H);
    lightCtx.fillStyle = "rgba(5, 8, 18, 0.78)";
    lightCtx.fillRect(0, 0, VIEW_W, VIEW_H);
    lightCtx.globalCompositeOperation = "destination-out";
    const grad = lightCtx.createRadialGradient(sx, sy, 8, sx, sy, 86);
    grad.addColorStop(0, "rgba(0,0,0,1)");
    grad.addColorStop(0.55, "rgba(0,0,0,0.45)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    lightCtx.fillStyle = grad;
    lightCtx.fillRect(sx - 100, sy - 100, 200, 200);
    const g2 = lightCtx.createRadialGradient(px0, py0, 2, px0, py0, 26);
    g2.addColorStop(0, "rgba(0,0,0,0.85)");
    g2.addColorStop(1, "rgba(0,0,0,0)");
    lightCtx.fillStyle = g2;
    lightCtx.fillRect(px0 - 30, py0 - 30, 60, 60);
    const lx0 = Math.max(0, Math.floor(camX / TILE) - 1);
    const ly0 = Math.max(0, Math.floor(camY / TILE) - 1);
    const lx1 = Math.min(state.map.w - 1, Math.floor((camX + VIEW_W) / TILE) + 1);
    const ly1 = Math.min(state.map.h - 1, Math.floor((camY + VIEW_H) / TILE) + 1);
    lightCtx.fillStyle = "rgba(0,0,0,0.95)";
    for (let y = ly0; y <= ly1; y++) {
      for (let x = lx0; x <= lx1; x++) {
        if (state.map.rows[y][x] !== "l") continue;
        lightCtx.fillRect(x * TILE - camX, y * TILE - camY, TILE, TILE);
      }
    }
    lightCtx.globalCompositeOperation = "source-over";
    ctx.drawImage(lightCanvas, 0, 0);

    ctx.strokeStyle = "rgba(210,225,235,0.35)";
    for (let i = 0; i < 36; i++) {
      const rx = ((i * 97 + state.time * 140) % (VIEW_W + 20)) - 10;
      const ry = (i * 53) % VIEW_H;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 3, ry + 7);
      ctx.stroke();
    }
  } else if (state.chapter === 4 && state.mode !== "title") {
    ctx.fillStyle = "rgba(255, 228, 200, 0.08)";
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    if (!reduceMotion) {
      for (let i = 0; i < 18; i++) {
        const mx = (i * 47 + state.time * 8) % VIEW_W;
        const my = (i * 29 + Math.sin(state.time + i) * 6) % VIEW_H;
        ctx.fillStyle = "rgba(255,255,255,0.18)";
        ctx.fillRect(mx, my, 2, 1);
      }
    }
  }

  if (state.chapter === 0 || state.mode === "title") {
    for (const g of state.gulls) {
      const wing = Math.sin(state.time * 8 + g.y) * 2;
      px(g.x, g.y, 2, 1, "#f7f4ee");
      px(g.x - 3, g.y - wing, 3, 1, "#f7f4ee");
      px(g.x + 2, g.y - wing, 3, 1, "#f7f4ee");
    }
  }

  if (state.mode === "play" && !state.screen && !state.dialogue.open) drawGoal();

  for (const p of state.particles) {
    const a = 1 - p.age / p.life;
    ctx.globalAlpha = Math.max(0, a);
    ctx.fillStyle = p.color;
    ctx.fillRect(Math.round(p.x - camX), Math.round(p.y - camY), p.sz, p.sz);
    ctx.globalAlpha = 1;
  }

  if (state.flash > 0) {
    ctx.fillStyle = `rgba(255,255,255,${state.flash})`;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  }
  ctx.restore();
}

function renderInterludeWorld() {
  const t = state.time;
  const sky = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  sky.addColorStop(0, "#141822");
  sky.addColorStop(0.55, "#3a2a38");
  sky.addColorStop(1, "#c47a55");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  for (let i = 0; i < 28; i++) {
    const alpha = 0.3 + (i % 5) * 0.1;
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fillRect((i * 53) % VIEW_W, (i * 37) % 90, 1, 1);
  }
  ctx.fillStyle = "#1a1418";
  ctx.beginPath();
  ctx.moveTo(0, 150);
  ctx.lineTo(70, 120);
  ctx.lineTo(130, 146);
  ctx.lineTo(190, 100);
  ctx.lineTo(250, 140);
  ctx.lineTo(320, 118);
  ctx.lineTo(320, 192);
  ctx.lineTo(0, 192);
  ctx.fill();
  ctx.fillStyle = "#120e12";
  const cx = 190;
  const cy = 100;
  ctx.fillRect(cx, cy - 28, 3, 28);
  ctx.fillRect(cx - 8, cy - 20, 19, 3);
  void t;
}

function currentGoal() {
  if (state.mode !== "play") return null;
  const ch = CHAPTERS[state.chapter];
  if (!ch.goal) return null;
  return ch.goal();
}

function drawGoal() {
  const g = currentGoal();
  if (!g) return;
  const camX = Math.round(state.cam.x);
  const camY = Math.round(state.cam.y);
  let sx = g.x - camX;
  let sy = g.y - camY - 34;
  const margin = 10;
  const on = sx > margin && sy > margin && sx < VIEW_W - margin && sy < VIEW_H - margin;
  if (on && dist(state.player, g) < 32) return;
  const bob = Math.sin(state.time * 4) * 2;
  ctx.fillStyle = "#f0c84b";
  if (on) {
    const x = Math.round(sx);
    const y = Math.round(sy + bob);
    ctx.fillRect(x - 1, y, 3, 2);
    ctx.fillRect(x - 3, y + 2, 2, 2);
    ctx.fillRect(x + 2, y + 2, 2, 2);
    return;
  }
  sx = clamp(sx, margin, VIEW_W - margin);
  sy = clamp(sy, margin, VIEW_H - margin);
  ctx.fillRect(sx - 2, sy - 2, 4, 4);
}

/* ------------------------------ UI ------------------------------ */

function resize() {
  const margin = 28;
  const scale = Math.max(1, Math.floor(Math.min((window.innerWidth - margin) / VIEW_W, (window.innerHeight - margin) / VIEW_H)));
  state.scale = scale;
  canvas.style.width = VIEW_W * scale + "px";
  canvas.style.height = VIEW_H * scale + "px";
  frame.style.width = VIEW_W * scale + "px";
  frame.style.height = VIEW_H * scale + "px";
  frame.style.fontSize = Math.max(13, Math.round(scale * 4.6)) + "px";
}

function syncUI() {
  const showHud = state.mode === "play";
  hudEl.classList.toggle("hidden", !showHud);
  if (showHud) {
    const ch = CHAPTERS[state.chapter];
    $("ch-name").textContent = `${ch.kicker}　${ch.title}`;
    $("objective").textContent = state.dialogue.open ? "" : state.objective;
    $("progress").textContent = state.progress;
    $("progress").classList.toggle("hidden", !state.progress);
    $("held").textContent = state.held;
    $("held").classList.toggle("hidden", !state.held);
    const sea = state.chapter === 2;
    $("faith").classList.toggle("hidden", !sea);
    $("wind").classList.toggle("hidden", !sea);
    if (sea) $("faith-fill").style.width = clamp(state.faith, 0, 100) + "%";
    const showHint = state.time < state.hintUntil && !state.dialogue.open && !state.screen;
    $("hint").classList.toggle("hidden", !showHint);
  }

  const d = state.dialogue;
  const showD = d.open && state.mode === "play" && state.screen !== "journal" && state.screen !== "pause";
  dialogueEl.classList.toggle("hidden", !showD);
  if (showD) {
    const line = currentLine();
    const shown = line ? line.text.slice(0, Math.floor(d.prog)) : "";
    const done = line && d.prog >= line.text.length;
    $("d-name").textContent = line && line.name ? line.name : "";
    $("d-name").className =
      "who-" + (line && line.name === "你" ? "you" : line && line.name === "耶穌" ? "jesus" : line && line.name ? "npc" : "narr");
    $("d-text").textContent = shown;
    $("d-text").classList.toggle("verse", !!(line && (line.verse || line.ref)));
    $("d-ref").textContent = done && line && line.ref ? line.ref : "";
    $("d-next").textContent = done ? "空白鍵繼續" : "";
  }

  const near = showHud && !state.screen && !d.open ? nearestTalkable() : null;
  if (near) {
    tagEl.classList.remove("hidden");
    tagEl.textContent = near.name + " · 交談";
    const x = (near.x - state.cam.x) * state.scale;
    const y = (near.y - 36 - state.cam.y) * state.scale;
    tagEl.style.transform = `translate(${x}px, ${y}px) translate(-50%, -100%)`;
  } else tagEl.classList.add("hidden");

  for (const f of state.floats) {
    const x = (f.x - state.cam.x) * state.scale;
    const y = (f.y - (1 - f.life / f.max) * 14 - state.cam.y) * state.scale;
    f.el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -100%)`;
    f.el.style.opacity = String(clamp(f.life, 0, 1));
  }

  screenEl.classList.toggle("hidden", !state.screen);
}

function setScreen(html) {
  state.screen = html ? state.screen : null;
  screenEl.innerHTML = html || "";
  screenEl.classList.toggle("hidden", !html);
}

function card(html) {
  screenEl.innerHTML = `<div class="card">${html}</div>`;
  screenEl.classList.remove("hidden");
}

function renderTitle() {
  state.screen = "title";
  card(`
    <div class="sub">福音書裡的一段路</div>
    <h1>跟隨</h1>
    <p class="verse" style="text-align:center">耶穌說：「${VERSES.way}」</p>
    <p class="ref">約翰福音 14:6</p>
    <div class="rule"></div>
    <p style="text-align:center">方向鍵或 WASD 移動。空白鍵、E 或 Enter 交談。<br/>這是一段可行走的默想。</p>
    <div class="row">
      <button class="btn primary" data-act="start" data-primary>開始行走</button>
      <button class="btn" data-act="select">選擇篇章</button>
    </div>
    <p class="note">本遊戲依據福音書的記載而作，經文引自和合本。<br/>它邀請人跟著走一段路，並不取代聖經本身。</p>
  `);
}

function renderSelect() {
  state.screen = "select";
  const buttons = CHAPTERS.map(
    (ch, i) => `<button class="btn" data-act="chapter" data-arg="${i}">${ch.kicker}　${ch.title}<br/><span class="ref">${ch.ref}</span></button>`
  ).join("");
  card(`<h2>選擇篇章</h2><div class="chapters">${buttons}</div><div class="row"><button class="btn ghost" data-act="title">回標題</button></div>`);
}

function renderCard() {
  const ch = CHAPTERS[state.chapter];
  state.screen = "card";
  card(`
    <div class="sub">${ch.kicker}</div>
    <h2>${ch.title}</h2>
    <p class="ref">${ch.ref}</p>
    <div class="rule"></div>
    <p>${ch.intro}</p>
    <div class="row">
      <button class="btn primary" data-act="begin" data-primary>進入這一程</button>
      <button class="btn ghost" data-act="title">回標題</button>
    </div>
  `);
}

function openClear() {
  const ch = CHAPTERS[state.chapter];
  state.mode = "clear";
  state.screen = "clear";
  const last = state.chapter >= CHAPTERS.length - 1;
  card(`
    <div class="sub">${ch.kicker}</div>
    <h2>${ch.title}</h2>
    <div class="rule"></div>
    <p class="verse" style="text-align:center">${ch.closing}</p>
    <p class="ref">${ch.closingRef || ""}</p>
    <div class="row">
      ${last ? "" : '<button class="btn primary" data-act="next" data-primary>下一程</button>'}
      <button class="btn ${last ? "primary" : ""}" data-act="title" ${last ? "data-primary" : ""}>回標題</button>
    </div>
  `);
}

function renderInterlude() {
  state.screen = "interlude";
  state.mode = "interlude";
  const lines = INTERLUDE.slice(0, state.interludeStep + 1)
    .map((line) => `<p class="${line.verse ? "verse" : ""}">${line.text}</p>${line.ref ? `<p class="ref">${line.ref}</p>` : ""}`)
    .join("");
  const done = state.interludeStep >= INTERLUDE.length - 1;
  card(`
    <div class="sub">各各他之後</div>
    <h2>第三日</h2>
    <div class="rule"></div>
    ${lines}
    <div class="row">
      ${
        done
          ? '<button class="btn primary" data-act="garden" data-primary>前往園子</button>'
          : '<button class="btn primary" data-act="interlude-next" data-primary>繼續</button>'
      }
    </div>
  `);
  if (done) {
    INTERLUDE.forEach((line) => {
      if (line.ref) recordVerse(line.ref, line.text);
    });
  }
}

function openEnding() {
  state.mode = "ending";
  state.screen = "ending";
  setMusic("end");
  recordVerse("約翰福音 14:6", VERSES.way);
  const items = state.journal
    .map((v) => `<div class="journal-item"><div class="ref">${v.ref}</div><div class="verse">${v.text}</div></div>`)
    .join("");
  card(`
    <div class="sub">七日的第一日</div>
    <h2>他不在這裡</h2>
    <p class="verse" style="text-align:center">已經復活了。</p>
    <div class="rule"></div>
    <p>你跟著他，走過海邊、山上、風浪與飢餓的人群，直到園子裡的清晨。</p>
    <p>網可以放下，餅可以遞出，海也可以走上去。因為道路本身，就是他。</p>
    <p class="verse" style="text-align:center">「${VERSES.way}」</p>
    <p class="ref">約翰福音 14:6</p>
    <div class="rule"></div>
    <p class="ref" style="text-align:left">這一程收下的話</p>
    ${items || "<p>這一程的話，還在風裡。</p>"}
    <div class="row">
      <button class="btn primary" data-act="title" data-primary>從海邊再走一次</button>
    </div>
  `);
}

function openJournal() {
  if (state.mode !== "play") return;
  state.screen = "journal";
  const items = state.journal
    .map((v) => `<div class="journal-item"><div class="ref">${v.ref}</div><div class="verse">${v.text}</div></div>`)
    .join("");
  card(`
    <h2>收下的經文</h2>
    <div class="rule"></div>
    ${items || "<p>這一程還沒有收下經文。走到他面前，話會留下來。</p>"}
    <div class="row"><button class="btn primary" data-act="close-screen" data-primary>關閉</button></div>
  `);
}

function openPause() {
  state.screen = "pause";
  card(`
    <h2>暫停</h2>
    <p style="text-align:center">路還在。你可以留在這裡。</p>
    <div class="row">
      <button class="btn primary" data-act="close-screen" data-primary>繼續行走</button>
      <button class="btn" data-act="journal">經文</button>
      <button class="btn ghost" data-act="title">回標題</button>
    </div>
  `);
}

function showTitle() {
  loadChapter(0);
  state.mode = "title";
  state.screen = "title";
  setMusic("peace");
  renderTitle();
}

function openChapter(index) {
  loadChapter(index);
  if (index === 4) setMusic("dawn");
  state.mode = "card";
  renderCard();
}

function beginPlay() {
  state.screen = null;
  screenEl.classList.add("hidden");
  state.mode = "play";
  state.hintUntil = state.time + 10;
  CHAPTERS[state.chapter].onEnter();
}

screenEl.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-act]");
  if (!btn) return;
  ensureAudio();
  const act = btn.dataset.act;
  const arg = btn.dataset.arg;
  if (act === "start") openChapter(0);
  else if (act === "select") renderSelect();
  else if (act === "title") showTitle();
  else if (act === "chapter") openChapter(Number(arg));
  else if (act === "begin") beginPlay();
  else if (act === "next") {
    if (state.chapter === 3) {
      state.interludeStep = 0;
      setMusic("solemn");
      renderInterlude();
    } else openChapter(state.chapter + 1);
  } else if (act === "interlude-next") {
    state.interludeStep = Math.min(INTERLUDE.length - 1, state.interludeStep + 1);
    renderInterlude();
  } else if (act === "garden") openChapter(4);
  else if (act === "journal") openJournal();
  else if (act === "close-screen") {
    state.screen = null;
    screenEl.classList.add("hidden");
  }
});

dialogueEl.addEventListener("click", () => {
  if (state.dialogue.open) advanceDialogue();
});

$("btn-journal").addEventListener("click", () => {
  ensureAudio();
  if (state.screen === "journal") {
    state.screen = null;
    screenEl.classList.add("hidden");
  } else openJournal();
});

$("btn-mute").addEventListener("click", () => {
  ensureAudio();
  setMuted(!music.muted);
});

window.addEventListener("keydown", (e) => {
  if (e.repeat) return;
  const k = e.key;
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " ", "Enter"].includes(k)) e.preventDefault();
  keys.add(k.toLowerCase());
  ensureAudio();
  if (k === "Escape") {
    if (state.screen === "journal" || state.screen === "pause") {
      state.screen = null;
      screenEl.classList.add("hidden");
    } else if (state.mode === "play" && !state.screen) openPause();
    return;
  }
  if (k === "j" || k === "J") {
    if (state.mode === "play") {
      if (state.screen === "journal") {
        state.screen = null;
        screenEl.classList.add("hidden");
      } else if (!state.screen) openJournal();
    }
    return;
  }
  if (k === "m" || k === "M") {
    setMuted(!music.muted);
    return;
  }
  if (k === " " || k === "Enter" || k === "e" || k === "E") {
    if (state.screen) {
      document.querySelector("#screen [data-primary]")?.click();
      return;
    }
    input.confirmEdge = true;
  }
});

window.addEventListener("keyup", (e) => keys.delete(e.key.toLowerCase()));

function bindHold(el, onDown, onUp) {
  const down = (ev) => {
    ev.preventDefault();
    onDown();
  };
  const up = (ev) => {
    ev.preventDefault();
    onUp();
  };
  el.addEventListener("pointerdown", down);
  el.addEventListener("pointerup", up);
  el.addEventListener("pointerleave", up);
  el.addEventListener("pointercancel", up);
}

document.querySelectorAll(".pad button").forEach((btn) => {
  const dir = btn.dataset.dir;
  bindHold(
    btn,
    () => {
      hold[dir] = true;
      ensureAudio();
    },
    () => {
      hold[dir] = false;
    }
  );
});

bindHold(
  $("btn-talk"),
  () => {
    ensureAudio();
    if (state.screen) document.querySelector("#screen [data-primary]")?.click();
    else input.confirmEdge = true;
  },
  () => {}
);

window.addEventListener("pointerdown", () => ensureAudio());
window.addEventListener("resize", resize);

function loop(now) {
  if (!loop.last) loop.last = now;
  let dt = (now - loop.last) / 1000;
  loop.last = now;
  if (dt > 0.05) dt = 0.05;

  if (input.confirmEdge) {
    input.confirmEdge = false;
    if (!state.screen) {
      if (state.dialogue.open) advanceDialogue();
      else if (state.mode === "play") {
        const near = nearestTalkable();
        if (near) CHAPTERS[state.chapter].talk(near);
      }
    }
  }

  update(dt);
  render();
  syncUI();
  requestAnimationFrame(loop);
}

try {
  if (localStorage.getItem("follow-mute") === "1") setMuted(true);
} catch (err) {
  /* ignore */
}

resize();
showTitle();
requestAnimationFrame(loop);
