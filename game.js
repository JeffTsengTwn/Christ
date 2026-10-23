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
  child: look({
    robe: "#f7f3ea",
    robeS: "#e4d9c6",
    robeD: "#b7aa96",
    sash: "#a33b34",
    hair: "#5a3820",
    hairD: "#3a2414",
    beard: false,
    halo: true,
    scale: 0.82,
  }),
  baptist: look({
    robe: "#8a6840",
    robeS: "#6e5030",
    robeD: "#4e3820",
    hair: "#3a2414",
    hairD: "#24160c",
    beard: true,
    staff: true,
  }),
  tempter: look({
    robe: "#2a2428",
    robeS: "#1a1618",
    robeD: "#100e10",
    hair: "#1a1412",
    hairD: "#0c0a0a",
    beard: true,
    scale: 1.08,
  }),
  soldier: look({
    robe: "#6a3030",
    robeS: "#4e2222",
    robeD: "#321616",
    headband: "#c4a574",
    beard: true,
    hair: "#2a2118",
  }),
  pilate: look({
    robe: "#f4f0e8",
    robeS: "#d4cfc4",
    robeD: "#a8a298",
    sash: "#8c2f2f",
    hair: "#c8c2b4",
    hairD: "#8a8478",
    headband: "#e6d3a4",
  }),
  lazarus: look({
    robe: "#d7d0c4",
    robeS: "#b7b0a4",
    robeD: "#8a8478",
    hair: "#4a3828",
    hairD: "#2a2018",
    beard: true,
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
  mother: look({ robe: "#6d4a62", robeS: "#523648", robeD: "#3a2432", veil: "#f3e6c8", hair: "#3a2416" }),
  steward: look({ robe: "#8d3d4a", robeS: "#6e2e38", robeD: "#4a2028", sash: "#e6d3a4", beard: true, headband: "#f0e6d2" }),
  philip: look({ robe: "#3f7a6a", robeS: "#2f5c50", robeD: "#1e4038", hair: "#4a3018" }),
  bart: look({ robe: "#d7c4a4", robeS: "#b7a484", robeD: "#8c7a5c", beard: true, hair: "#6a5438" }),
  thomas: look({ robe: "#5c6a78", robeS: "#45525e", robeD: "#2e3842", hair: "#2a2118" }),
  james2: look({ robe: "#9a6438", robeS: "#784c2a", robeD: "#54341c", beard: true, hair: "#3a2414" }),
  thad: look({ robe: "#6a8f55", robeS: "#527044", robeD: "#385030", headband: "#e6d3a4" }),
  zealot: look({ robe: "#a34b3c", robeS: "#7c382c", robeD: "#54241c", headband: "#2a2118", beard: true }),
  judas: look({ robe: "#5c5348", robeS: "#453e36", robeD: "#2e2924", sash: "#c4a574", beard: true, hair: "#24180e" }),
};

function asRole(tx, ty, dir, role) {
  const roles = {
    jesus: { look: LOOKS.jesus, name: "耶穌" },
    child: { look: LOOKS.child, name: "少年耶穌" },
    joseph: { look: LOOKS.elder, name: "約瑟" },
    servant: { look: LOOKS.worker, name: "用人" },
    peter: { look: LOOKS.simon, name: "彼得" },
    john: { look: LOOKS.john, name: "約翰" },
    mary: { look: LOOKS.mary, name: "抹大拉的馬利亞" },
  };
  const r = roles[role] || roles.jesus;
  state.roleName = r.name;
  return Object.assign(tp(tx, ty), {
    dir: dir || "down",
    moving: false,
    look: r.look,
    name: r.name,
    role,
    wounds: false,
    crown: false,
    carry: false,
  });
}

function asJesus(tx, ty, dir, young) {
  return asRole(tx, ty, dir, young ? "child" : "jesus");
}

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
  if (e.crown) {
    px(-5, hy - 3, 10, 2, "#5a3a22");
    px(-4, hy - 4, 2, 1, "#8c2f2f");
    px(1, hy - 4, 2, 1, "#8c2f2f");
    px(-1, hy + 2, 1, 1, "#8c2f2f");
  }
  if (e.wounds) {
    px(-7, -13, 2, 2, "#7a2030");
    px(5, -12, 2, 2, "#7a2030");
    px(-1, -3, 2, 1, "#7a2030");
  }
  if (e.carry) {
    px(6, -26, 2, 24, "#6b4224");
    px(1, -18, 14, 2, "#5a3820");
  }

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
  } else if (ch === "f") {
    ctx.fillStyle = h > 0.55 ? "#cbb89a" : "#bba888";
    ctx.fillRect(px0, py0, 16, 16);
    ctx.fillStyle = "rgba(90,70,48,0.28)";
    ctx.fillRect(px0, py0, 16, 1);
    ctx.fillRect(px0, py0, 1, 16);
  } else if (ch === "#") {
    ctx.fillStyle = "#1c1612";
    ctx.fillRect(px0, py0, 16, 16);
    if (h > 0.7) {
      ctx.fillStyle = "#2a221c";
      ctx.fillRect(px0 + 4, py0 + 5, 3, 2);
    }
  }
}

function drawJar(e) {
  const x = Math.round(e.x);
  const y = Math.round(e.y);
  px(x - 6, y - 17, 12, 3, "#6a645c");
  px(x - 5, y - 15, 10, 13, "#9a9488");
  px(x - 4, y - 14, 2, 11, "#c2bbb0");
  const inner = e.wine ? "#7c2434" : e.water ? "#3d7ea0" : "#2a2622";
  px(x - 3, y - 16, 6, 4, inner);
  if (e.water || e.wine) px(x - 2, y - 17, 4, 2, e.wine ? "#c45060" : "#9ad4ea");
  px(x - 6, y - 4, 12, 3, "#5e584e");
}

function drawTable(e) {
  const x = Math.round(e.x);
  const y = Math.round(e.y);
  px(x - 56, y - 24, 112, 28, "#6e4122");
  px(x - 52, y - 22, 104, 22, "#a56b38");
  px(x - 52, y - 22, 104, 2, "#c48a52");
  px(x - 50, y + 2, 4, 6, "#5a381c");
  px(x + 46, y + 2, 4, 6, "#5a381c");
  if (state.flags.meal) {
    px(x - 10, y - 16, 10, 6, "#e6c56a");
    px(x - 8, y - 18, 6, 2, "#f4dd9a");
    px(x + 12, y - 18, 7, 8, "#7a2430");
    px(x + 13, y - 20, 5, 2, "#e6d3a4");
  }
}

function drawStall(e) {
  const x = Math.round(e.x);
  const y = Math.round(e.y);
  if (e.tipped) {
    px(x - 16, y - 4, 30, 5, "#6e4122");
    px(x - 6, y - 8, 4, 3, "#e6c56a");
    px(x + 4, y - 2, 3, 3, "#c0c4c8");
    return;
  }
  px(x - 14, y - 12, 28, 8, "#8a5a30");
  px(x - 12, y - 10, 24, 5, "#c48a52");
  px(x - 8, y - 9, 5, 3, "#e6c56a");
  px(x + 2, y - 10, 4, 4, "#d8dce0");
  px(x - 12, y - 4, 2, 6, "#5a381c");
  px(x + 10, y - 4, 2, 6, "#5a381c");
}

function drawDove(e, time) {
  const x = Math.round(e.x);
  const y = Math.round(e.y + Math.sin(time * 4) * 1);
  px(x - 3, y, 6, 2, "#f7f4ee");
  px(x - 6, y - 1, 3, 1, "#f7f4ee");
  px(x + 3, y - 1, 3, 1, "#f7f4ee");
  px(x - 1, y + 1, 2, 1, "#e6d3a4");
}

function drawLamp(x, y, time) {
  x = Math.round(x);
  y = Math.round(y);
  const flick = Math.floor(time * 7) % 2;
  px(x - 3, y - 6, 6, 5, "#c4a574");
  px(x - 2, y - 8, 4, 2, "#8d6a38");
  px(x - 1, y - 12 - flick, 2, 4, "#f0c14a");
  px(x, y - 14 - flick, 1, 2, "#fff4d2");
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
  else if (e.kind === "jar") drawJar(e);
  else if (e.kind === "table") drawTable(e);
  else if (e.kind === "lamp") drawLamp(e.x, e.y, time);
  else if (e.kind === "stall") drawStall(e);
  else if (e.kind === "dove") drawDove(e, time);
  else if (e.kind === "colt") drawColt(e);
}

function drawColt(e) {
  const x = Math.round(e.x);
  const y = Math.round(e.y);
  px(x - 8, y - 8, 14, 7, "#8a6844");
  px(x + 4, y - 12, 6, 6, "#a07850");
  px(x + 8, y - 14, 2, 3, "#6a5034");
  px(x - 6, y - 1, 2, 5, "#5a4030");
  px(x + 2, y - 1, 2, 5, "#5a4030");
  px(x - 8, y - 6, 3, 2, "#6a5034");
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
  noWine: "他們沒有酒了。",
  whatever: "他告訴你們甚麼，你們就做甚麼。",
  notYet: "婦人，我與你有甚麼相干？我的時候還沒有到。",
  fillJars: "把缸倒滿了水。",
  drawOut: "現在可以舀出來，送給管筵席的。",
  goodWine: "人都是先擺上好酒，等客喝夠了，才擺上次的，你倒把好酒留到如今！",
  firstSign: "這是耶穌所行的頭一件神蹟，是在加利利的迦拿行的，顯出他的榮耀來；他的門徒就信他了。",
  appoint: "他就設立十二個人，要他們常和自己同在，也要差他們去傳道。",
  peterName: "這十二個人有西門，耶穌又給他起名叫彼得。",
  followMe: "你跟從我來。",
  philipFound: "摩西在律法上所寫的和眾先知所記的那一位，我們遇見了，就是約瑟的兒子拿撒勒人耶穌。",
  wash: "我是你們的主，你們的夫子，尚且洗你們的腳，你們也當彼此洗腳。我給你們作了榜樣，叫你們照著我向你們所做的去做。",
  body: "你們拿著吃，這是我的身體。",
  cup: "你們都喝這個；因為這是我立約的血，為多人流出來，使罪得赦。",
  betray: "我實在告訴你們，你們中間有一個人要賣我了。",
  isItI: "主，是我嗎？",
  rabbi: "拉比，是我嗎？",
  night: "猶大受了那點餅，立刻就出去。那時候是夜間了。",
  newCmd: "我賜給你們一條新命令，乃是叫你們彼此相愛；我怎樣愛你們，你們也要怎樣相愛。",
  judasNamed: "還有賣耶穌的加略人猶大。",
  nameJesus: "你要給他起名叫耶穌，因他要將自己的百姓從罪惡裡救出來。",
  manger: "就生了頭胎的兒子，用布包起來，放在馬槽裡，因為客店裡沒有地方。",
  goodNews: "不要懼怕！我報給你們大喜的信息，是關乎萬民的。因今天在大衛的城裡，為你們生了救主，就是主基督。",
  gloria: "在至高之處榮耀歸與神！在地上平安歸與他所喜悅的人！",
  star: "那生下來作猶太人之王的在哪裡？我們在東方看見他的星，特來拜他。",
  gifts: "就俯伏拜那小孩子，揭開寶盒，拿黃金、乳香、沒藥為禮物獻給他。",
  egypt: "起來！帶著小孩子同他母親逃往埃及。",
  fathers: "為甚麼找我呢？豈不知我應當以我父的事為念嗎？",
  johnNeed: "我當受你的洗，你反倒上我這裡來嗎？",
  fulfill: "你暫且許我，因為我們理當這樣盡諸般的義。",
  beloved: "這是我的愛子，我所喜悅的。",
  stones: "你若是神的兒子，可以吩咐這些石頭變成食物。",
  notBread: "人活著，不是單靠食物，乃是靠神口裡所出的一切話。",
  jump: "你若是神的兒子，可以跳下去，因為經上記著說：主要為你吩咐他的使者用手托著你，免得你的腳碰在石頭上。",
  notTest: "不可試探主你的神。",
  worship: "你若俯伏拜我，我就把這一切都賜給你。",
  begone: "撒但，退去吧！因為經上記著說：當拜主你的神，單要事奉他。",
  spirit: "主的靈在我身上，因為他用膏膏我，叫我傳福音給貧窮的人；差遣我報告：被擄的得釋放，瞎眼的得看見，叫那受壓制的得自由。",
  today: "今天這經應驗在你們耳中了。",
  hometown: "我實在告訴你們，沒有先知在自己家鄉被人悅納的。",
  passed: "他卻從他們中間直行，過去了。",
  ifWilling: "主若肯，必能叫我潔淨了。",
  willing: "我肯，你潔淨了吧！",
  sins: "小子，你的罪赦了。",
  takeMat: "我吩咐你，起來！拿你的褥子回家去吧。",
  sonOfDavid: "大衛的子孫耶穌啊，可憐我吧！",
  see: "你要我為你做甚麼？",
  wantSee: "拉波尼，我要能看見。",
  yourFaith: "你的信救了你了。",
  perish: "夫子！我們喪命，你不顧嗎？",
  peaceSea: "住了吧！靜了吧！",
  whereFaith: "為甚麼膽怯？你們還沒有信心嗎？",
  whoThen: "這到底是誰，連風和海也聽從他了。",
  ifHere: "主啊，你若早在這裡，我兄弟必不死。",
  resurrection: "復活在我，生命也在我。信我的人雖然死了，也必復活。",
  wept: "耶穌哭了。",
  stench: "主啊，他現在必是臭了，因為他死了已經四天了。",
  comeOut: "拉撒路出來！",
  unbind: "解開，叫他走！",
  colt: "看哪，你的王來到你這裡，是溫柔的，又騎著驢，就是騎著驢駒子。",
  hosanna: "和散那歸於大衛的子孫！奉主名來的是應當稱頌的！至高之上和散那！",
  housePrayer: "經上記著說：我的殿必稱為禱告的殿，你們倒使它成為賊窩了。",
  thisCup: "我父啊，倘若可行，求你叫這杯離開我；然而，不要照我的意思，只要照你的意思。",
  watch: "怎麼樣？你們不能同我儆醒片時嗎？總要警醒禱告，免得入了迷惑。你們心靈固然願意，肉體卻軟弱了。",
  hail: "請拉比安。",
  iAm: "我就是。",
  sheath: "收刀入鞘吧！我父所給我的那杯，我豈可不喝呢？",
  letThem: "到了這個地步，由他們吧！",
  king: "你是猶太人的王嗎？",
  youSay: "你說的是。",
  noFault: "我查不出他有甚麼罪來。",
  behold: "你們看這個人！",
  innocent: "流這義人的血，罪不在我，你們承當吧。",
  thorns: "兵丁用荊棘編做冠冕，戴在他頭上，給他穿上紫袍。",
  women: "耶路撒冷的女子，不要為我哭，當為自己和自己的兒女哭。",
  forgive: "父啊！赦免他們；因為他們所作的，他們不曉得。",
  paradise: "我實在告訴你，今日你要同我在樂園裡了。",
  beholdSon: "母親，看，你的兒子！",
  beholdMother: "看，你的母親！",
  eli: "以利！以利！拉馬撒巴各大尼？",
  forsaken: "我的神！我的神！為甚麼離棄我？",
  thirst: "我渴了。",
  intoHands: "父啊！我將我的靈魂交在你手裡。",
  spear: "惟有一個兵拿槍扎他的肋旁，隨即有血和水流出來。",
  buried: "約瑟取了身體，用細麻布加上香料裹好，安放在自己的新墳墓裡。",
  whyWeep: "婦人，為甚麼哭？你找誰呢？",
  gardener: "先生，若是你把他移了去，請告訴我，你把他放在哪裡，我便去取他。",
  notYetUp: "不要摸我，因我還沒有升上去見我的父。你往我弟兄那裡去，告訴他們說，我要升上去見我的父，也是你們的父，見我的神，也是你們的神。",
  touch: "伸過你的指頭來，摸我的手；伸出你的手來，探入我的肋旁。不要疑惑，總要信！",
  myLord: "我的主！我的神！",
  commission: "天上地下所有的權柄都賜給我了。所以，你們要去，使萬民作我的門徒。",
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

function chapterKey() {
  const ch = CHAPTERS[state.chapter];
  return ch ? ch.key : "";
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
  state.pose = "";
  state.crossStep = 0;
  state.roleName = "";
  setMusic(musicMode);
}

const CHAPTERS = [
  {
    key: "shore",
    title: "海邊的呼召",
    ref: "馬可福音 1:16–20",
    kicker: "第一章",
    intro:
      "加利利的海邊，有人在補網。你沿著岸走過去。對他們說：來跟從我。網可以留在船上。",
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
      state.player = asJesus(16, 16, "up");
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
      ];
      state.objective = "沿著海邊走，呼召西門、安得烈、雅各、約翰。";
      state.flags.called = {};
    },
    onEnter() {
      state.objective = "沿著海邊走，呼召西門、安得烈、雅各、約翰。";
      this.refresh();
    },
    refresh() {
      const n = Object.keys(state.flags.called).length;
      state.progress = `漁夫 ${n}／4`;
    },
    goal() {
      return state.entities.find((e) => e.role === "fisher" && !state.flags.called[e.id]) || null;
    },
    update(dt) {
      const slots = [
        [-14, 18],
        [14, 18],
        [-16, 30],
        [16, 30],
      ];
      let i = 0;
      for (const e of state.entities) {
        if (!e.following) continue;
        const slot = slots[i++] || slots[0];
        const tx = state.player.x + slot[0];
        const ty = state.player.y + slot[1];
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
          { name: "村人", text: "拉比，海邊有人在補網。他們整晚勞力。" },
          { name: "村人", text: "你若呼召他們，他們聽得見。" },
        ]);
        return;
      }
      if (e.role !== "fisher") return;
      if (flags.called[e.id]) {
        say([{ name: e.name, text: "我們在你身邊。網可以留在這裡。" }]);
        return;
      }
      const lines = {
        simon: [
          { name: "西門", text: "夫子，整晚勞力，網裡卻不多。你找誰？" },
          { name: "耶穌", text: VERSES.call, ref: "馬可福音 1:17", verse: true },
          { name: "西門", text: "那就把網放下。我來了。" },
        ],
        andrew: [
          { name: "安得烈", text: "我是安得烈，西門的兄弟。我們原是在等那將要來的。" },
          { name: "耶穌", text: "來跟從我。你去告訴你的兄弟，也來。" },
          { name: "安得烈", text: "我來。網留在岸上。" },
        ],
        james: [
          { name: "雅各", text: "我和弟弟在父親的船上補網。" },
          { name: "耶穌", text: "來跟從我。父親和雇工可以留在船上。" },
          { name: "雅各", text: "我們跟你去。" },
        ],
        john: [
          { name: "約翰", text: "海今天很亮。你站在船邊，好像早就認識我們。" },
          { name: "耶穌", text: "我要叫你們得人如得魚一樣。把網留下。" },
          { name: "約翰", text: "我把雇工留在船上。我跟你走。" },
        ],
      };
      say(lines[e.id], () => {
        flags.called[e.id] = true;
        e.following = true;
        e.dir = "up";
        puff(e.x, e.y - 10, "#f0c84b", 8, 20);
        this.refresh();
        const n = Object.keys(flags.called).length;
        state.objective = n >= 4 ? "他們都來了。" : "還有漁夫在岸邊。";
        if (n >= 4) {
          say(
            [
              { name: "耶穌", text: "你們來。從此，你們要與我同行。" },
              { name: "", text: VERSES.nets, ref: "馬可福音 1:18", verse: true },
            ],
            () => completeChapter()
          );
        }
      });
    },
  },
  {
    key: "cana",
    title: "迦拿的婚宴",
    ref: "約翰福音 2:1–11",
    who: "用人",
    kicker: "第二章",
    intro:
      "加利利的迦拿有人擺設婚宴。酒用盡了。耶穌的母親對你們說：他告訴你們甚麼，你們就做甚麼。六口石缸還空著。",
    closing: "這是耶穌所行的頭一件神蹟。他的門徒就信他了。",
    closingRef: "約翰福音 2:11",
    music: "peace",
    build() {
      const m = createMap(34, 22, ".");
      m.rect(8, 7, 18, 4, "p");
      scatter(m, ",", 0.1, (ch) => ch === ".");
      [[4, 6], [30, 8], [5, 16], [31, 15]].forEach(([x, y]) => m.set(x, y, "r"));
      m.frame("#");
      state.map = m;
      state.player = asRole(12, 13, "up", "servant");
      state.entities = [
        prop({ kind: "house", tx: 8, ty: 6, solid: true, box: { x: -14, y: -16, w: 28, h: 16 } }),
        prop({ kind: "house", tx: 26, ty: 6, solid: true, box: { x: -14, y: -16, w: 28, h: 16 } }),
        prop({ kind: "tree", tx: 4, ty: 11, solid: true, radius: 4 }),
        prop({ kind: "tree", tx: 30, ty: 12, solid: true, radius: 4 }),
        prop({ kind: "well", id: "well", name: "井", tx: 6, ty: 14, solid: true, radius: 8 }),
        person({ id: "mother", name: "耶穌的母親", tx: 16, ty: 12, look: "mother", dir: "down" }),
        person({ id: "jesus", name: "耶穌", tx: 16, ty: 9, look: "jesus", dir: "down" }),
        person({ id: "steward", name: "管筵席的", tx: 28, ty: 12, look: "steward", dir: "left" }),
        person({ id: "guest", name: "客人", tx: 23, ty: 15, look: "traveler", dir: "up" }),
        person({ id: "john", name: "約翰", tx: 20, ty: 16, look: "john", dir: "left" }),
      ];
      [8, 11, 14, 17, 20, 23].forEach((tx, i) => {
        state.entities.push(prop({ kind: "jar", id: "jar" + i, name: "石缸", tx, ty: 8 }));
      });
      state.flags.filled = {};
      state.objective = "酒用盡了。去聽耶穌的母親。";
    },
    onEnter() {
      state.objective = "酒用盡了。去聽耶穌的母親。";
    },
    refresh() {
      const n = Object.keys(state.flags.filled).length;
      state.progress = state.flags.commandFill ? `石缸 ${n}／6` : "";
    },
    goal() {
      const flags = state.flags;
      if (!flags.heardMother) return findEnt("mother");
      if (!flags.drawn) return findEnt("jesus");
      return findEnt("steward");
    },
    update(dt) {
      const flags = state.flags;
      if (!flags.filling) return;
      flags.fillT = (flags.fillT || 0) + dt;
      const n = Math.min(6, Math.floor(flags.fillT / 0.4));
      for (let i = 0; i < n; i++) {
        const jar = findEnt("jar" + i);
        if (jar && !jar.water) {
          jar.water = true;
          flags.filled[jar.id] = true;
          puff(jar.x, jar.y - 10, "#7ec8e3", 6, 14);
        }
      }
      this.refresh();
      if (n >= 6 && !flags.fillDone) {
        flags.fillDone = true;
        flags.filling = false;
        state.objective = "缸已滿到缸口。再到耶穌面前。";
      }
    },
    talk(e) {
      const flags = state.flags;
      if (e.id === "guest") {
        say([{ name: "客人", text: flags.drawn ? "這酒比先前所擺的更好。" : "拉比，席還熱著。只是酒，已經沒有了。" }]);
        return;
      }
      if (e.id === "john") {
        say([{ name: "約翰", text: flags.drawn ? "我們看見了，就信他。" : "他的母親說酒沒有了。他若吩咐，我們就去做。" }]);
        return;
      }
      if (e.id === "mother") {
        if (!flags.heardMother) {
          say(
            [
              { name: "耶穌的母親", text: VERSES.noWine, ref: "約翰福音 2:3", verse: true },
              { name: "耶穌", text: VERSES.notYet, ref: "約翰福音 2:4", verse: true },
              { name: "耶穌的母親", text: VERSES.whatever, ref: "約翰福音 2:5", verse: true },
            ],
            () => {
              flags.heardMother = true;
              state.objective = "到耶穌面前。他吩咐你把缸倒滿。";
            }
          );
          return;
        }
        say([{ name: "耶穌的母親", text: "他告訴你們甚麼，你們就做甚麼。" }]);
        return;
      }
      if (e.id === "jesus") {
        if (!flags.heardMother) {
          say([{ name: "耶穌", text: "我母親在那邊。先去聽她。" }]);
          return;
        }
        if (!flags.commandFill) {
          say(
            [{ name: "耶穌", text: VERSES.fillJars, ref: "約翰福音 2:7", verse: true }, { name: "用人", text: "我們去打水，直到缸口。" }],
            () => {
              flags.commandFill = true;
              flags.filling = true;
              flags.fillT = 0;
              state.objective = "把六口石缸倒滿到缸口。";
              this.refresh();
            }
          );
          return;
        }
        if (!flags.fillDone) {
          say([{ name: "耶穌", text: "水還在倒。缸口就快滿了。" }]);
          return;
        }
        if (!flags.drawn) {
          say(
            [{ name: "耶穌", text: VERSES.drawOut, ref: "約翰福音 2:8", verse: true }, { name: "用人", text: "我舀出來，送去給管筵席的。" }],
            () => {
              flags.drawn = true;
              state.entities.forEach((jar) => {
                if (jar.kind === "jar") jar.wine = true;
              });
              chime();
              state.objective = "把舀出來的送去，讓管筵席的嘗。";
            }
          );
          return;
        }
        say([{ name: "耶穌", text: "已經送去了。他自己不知道這酒是哪裡來的。" }]);
        return;
      }
      if (e.id === "steward") {
        if (!flags.drawn) {
          say([{ name: "管筵席的", text: "酒在哪裡？客還沒有散，席上卻已經沒有了。" }]);
          return;
        }
        say(
          [
            { name: "管筵席的", text: VERSES.goodWine, ref: "約翰福音 2:10", verse: true },
            { name: "", text: VERSES.firstSign, ref: "約翰福音 2:11", verse: true },
          ],
          () => completeChapter()
        );
      }
    },
  },
  {
    key: "twelve",
    title: "十二門徒",
    ref: "馬可福音 3:13–19",
    kicker: "第三章",
    intro:
      "你上了山，隨自己的意思叫人來。十二個人要常和你同在，也要被差去傳道。一個一個走到他們面前，呼叫他們的名字。",
    closing: "他就設立十二個人，要他們常和自己同在。",
    closingRef: "馬可福音 3:14",
    music: "peace",
    people: [
      {
        id: "peter",
        name: "西門",
        look: "simon",
        tx: 8,
        ty: 8,
        lines: [
          { name: "西門", text: "海邊的網還記得我。你也走上這座山了。" },
          { name: "耶穌", text: "你是西門，我又給你起名叫彼得。", ref: "馬可福音 3:16", verse: VERSES.peterName },
        ],
        again: "彼得這個名字，我還在心裡稱它。",
      },
      {
        id: "james",
        name: "雅各",
        look: "james",
        tx: 12,
        ty: 7,
        lines: [
          { name: "雅各", text: "我是西庇太的兒子雅各。弟弟約翰就在旁邊。" },
          { name: "耶穌", text: "他又給這兩個人起名叫半尼其，就是雷子的意思。", ref: "馬可福音 3:17", verse: true },
        ],
        again: "雷子。可是今天山上沒有雷，只有他的聲音。",
      },
      {
        id: "john",
        name: "約翰",
        look: "john",
        tx: 16,
        ty: 7,
        lines: [
          { name: "約翰", text: "他叫我和哥哥留在他身邊。我想知道的，都在他身上。" },
          { name: "約翰", text: "名字可以是雷子。我更願意做常和他同在的人。" },
        ],
        again: "我們要常和他同在。這是他設立我們的緣故。",
      },
      {
        id: "andrew",
        name: "安得烈",
        look: "andrew",
        tx: 20,
        ty: 7,
        lines: [
          { name: "安得烈", text: "我兄弟在，我也在。他叫誰，誰就上來。" },
          { name: "安得烈", text: "十二個人。不多。可是夠把一句話帶到別處。" },
        ],
        again: "你都認得了嗎？還有人站在坡上。",
      },
      {
        id: "philip",
        name: "腓力",
        look: "philip",
        tx: 25,
        ty: 9,
        lines: [
          { name: "腓力", text: "他找到我，對我說：來跟從我吧。", ref: "約翰福音 1:43", verse: "來跟從我吧。" },
          { name: "腓力", text: VERSES.philipFound, ref: "約翰福音 1:45", verse: true },
        ],
        again: "主，你叫我來，我就在這山上。",
      },
      {
        id: "bart",
        name: "巴多羅買",
        look: "bart",
        tx: 8,
        ty: 12,
        lines: [
          { name: "巴多羅買", text: "我是巴多羅買。他叫我的時候，我沒有多問，就來了。" },
          { name: "巴多羅買", text: "律法上所寫的那一位，我要在他身邊一點一點認識。" },
        ],
        again: "我還坐在這裡。他沒有叫我下去。",
      },
      {
        id: "matthew",
        name: "馬太",
        look: "tax",
        tx: 12,
        ty: 13,
        lines: [
          { name: "馬太", text: "我坐在稅關上。人都認得那個位子。" },
          { name: "耶穌", text: VERSES.followMe, ref: "馬太福音 9:9", verse: true },
          { name: "馬太", text: "我就起來，跟從了他。稅關還在那裡，我不在了。" },
        ],
        again: "帳冊可以留在原處。我如今在這山上。",
      },
      {
        id: "thomas",
        name: "多馬",
        look: "thomas",
        tx: 17,
        ty: 13,
        lines: [
          { name: "多馬", text: "有些話，我要親眼看見，心才放下。" },
          { name: "多馬", text: "可是他叫我，我就走。看清楚，和跟從，可以是同一條路。" },
        ],
        again: "我在。你不必猜我信不信，我已經上來了。",
      },
      {
        id: "james2",
        name: "亞勒腓的雅各",
        look: "james2",
        tx: 22,
        ty: 12,
        lines: [
          { name: "雅各", text: "別把我和西庇太的兒子搞混。我是亞勒腓的兒子雅各。" },
          { name: "雅各", text: "名字相同的人，也可以被同一個主設立。" },
        ],
        again: "亞勒腓的兒子。你這樣叫我，我就知道你認得我。",
      },
      {
        id: "thad",
        name: "達太",
        look: "thad",
        tx: 26,
        ty: 13,
        lines: [
          { name: "達太", text: "有人叫我達太，也有人叫我雅各的兒子猶大。" },
          { name: "達太", text: "我不是加略人。你記住這張臉，後來就不會叫錯。" },
        ],
        again: "你若要找猶大，先問是哪一個。",
      },
      {
        id: "simonZ",
        name: "奮銳黨的西門",
        look: "zealot",
        tx: 10,
        ty: 17,
        lines: [
          { name: "奮銳黨的西門", text: "我曾為一個地上的國熱心，連刀都肯帶在身上。" },
          { name: "奮銳黨的西門", text: "他把我的熱心要了去。我把刀留下，跟他上山。" },
        ],
        again: "熱心還在。只是方向換了。",
      },
      {
        id: "judas",
        name: "加略人猶大",
        look: "judas",
        tx: 22,
        ty: 17,
        lines: [
          { name: "加略人猶大", text: "我是加略人猶大。你也叫了我，我就在這十二人裡。" },
          { name: "加略人猶大", text: "一夥人的錢囊，在我手裡。需要買甚麼，可以來找我。" },
        ],
        again: "我還在這山上。你沒有把我從十二人裡拿開。",
      },
    ],
    build() {
      const m = createMap(34, 24, "m");
      m.rect(3, 2, 28, 20, ".");
      stroke(m, [[16, 21], [16, 5]], "p", 1);
      scatter(m, ",", 0.08, (ch) => ch === ".");
      [[5, 6], [29, 6], [4, 15], [30, 18]].forEach(([x, y]) => m.set(x, y, "r"));
      m.frame("#");
      state.map = m;
      state.player = asJesus(16, 18, "up");
      state.entities = [
        prop({ kind: "tree", tx: 5, ty: 10, solid: true, radius: 4 }),
        prop({ kind: "tree", tx: 29, ty: 11, solid: true, radius: 4 }),
        prop({ kind: "tree", tx: 6, ty: 19, solid: true, radius: 4 }),
        prop({ kind: "tree", tx: 28, ty: 19, solid: true, radius: 4 }),
      ];
      this.people.forEach((p) => {
        state.entities.push(person({ id: p.id, name: p.name, tx: p.tx, ty: p.ty, look: p.look, role: "twelve" }));
      });
      state.flags.met = {};
      state.objective = "走到每一個人面前，設立這十二個人。";
    },
    onEnter() {
      say([
        { name: "", text: "耶穌上了山，隨自己的意思叫人來，他們便來到他那裡。" },
        { name: "耶穌", text: VERSES.appoint, ref: "馬可福音 3:14", verse: true },
      ]);
      state.objective = "走到每一個人面前，設立這十二個人。";
      this.refresh();
    },
    refresh() {
      const n = Object.keys(state.flags.met).length;
      state.progress = `已設立 ${n}／12`;
    },
    goal() {
      let best = null;
      let bestD = 1e9;
      for (const p of this.people) {
        if (state.flags.met[p.id]) continue;
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
      const info = this.people.find((p) => p.id === e.id);
      if (!info) return;
      if (flags.met[e.id]) {
        say([{ name: e.name, text: info.again }]);
        return;
      }
      say(info.lines, () => {
        flags.met[e.id] = true;
        puff(e.x, e.y - 14, "#f0c84b", 8, 16);
        tone(620, 0.08, "triangle", 0.035);
        this.refresh();
        const n = Object.keys(flags.met).length;
        state.objective = n >= 12 ? "十二個人都在你身邊了。" : "還有人站在這山上。";
        if (n >= 12) {
          say(
            [
              { name: "耶穌", text: "這就是你們。要常和我同在，也要被差出去。" },
              { name: "", text: VERSES.judasNamed, ref: "馬可福音 3:19", verse: true },
            ],
            () => completeChapter()
          );
        }
      });
    },
  },
  {
    key: "mount",
    title: "山上的話",
    ref: "馬太福音 5:1–7",
    kicker: "第四章",
    intro:
      "你上了山，開口教訓他們。山坡上坐著憂愁的人。走到每一個人面前，把那句話親自說給他聽。",
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
      state.player = asJesus(16, 18, "up");
      state.entities = [
        prop({ kind: "tree", tx: 6, ty: 11, solid: true, radius: 4 }),
        prop({ kind: "tree", tx: 26, ty: 10, solid: true, radius: 4 }),
        prop({ kind: "tree", tx: 8, ty: 17, solid: true, radius: 4 }),
        prop({ kind: "tree", tx: 25, ty: 18, solid: true, radius: 4 }),
        prop({ kind: "tree", tx: 20, ty: 5, solid: true, radius: 4 }),
      ];
      this.people.forEach((p) => {
        state.entities.push(person({ id: p.id, name: p.name, tx: p.tx, ty: p.ty, look: p.look, mark: "worry", role: "crowd" }));
      });
      state.flags.comforted = {};
      state.objective = "把山上的話，說給五個憂愁的人聽。";
    },
    onEnter() {
      say([
        { name: "", text: "耶穌看見這許多的人，就上了山。門徒到他跟前來，他就開口教訓他們。" },
      ]);
      state.objective = "把山上的話，說給五個憂愁的人聽。";
    },
    refresh() {
      const n = Object.keys(state.flags.comforted).length;
      state.progress = `已安慰 ${n}／5`;
    },
    goal() {
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
      const info = this.people.find((p) => p.id === e.id);
      if (!info) return;
      if (flags.comforted[e.id]) {
        say([{ name: e.name, text: "我還坐在這裡，可是心裡安靜了。" }]);
        return;
      }
      say(
        [
          { name: e.name, text: info.pain },
          { name: "耶穌", text: info.verse, ref: info.ref, verse: true },
          { name: e.name, text: info.reply },
        ],
        () => {
          flags.comforted[e.id] = true;
          e.mark = "peace";
          puff(e.x, e.y - 16, "#f0c84b", 10, 18);
          tone(740, 0.12, "triangle", 0.04);
          this.refresh();
          const n = Object.keys(flags.comforted).length;
          state.objective = n >= 5 ? "話已經留下。" : "還有人在等一句話。";
          if (n >= 5) {
            say(
              [
                { name: "耶穌", text: "你們是世上的光。話留下，人就不必再走在暗中。" },
                { name: "耶穌", text: "去吧。山還在，可是他們的臉已經不一樣了。" },
              ],
              () => completeChapter()
            );
          }
        }
      );
    },
  },
  {
    key: "sea",
    title: "履海",
    ref: "馬太福音 14:22–33",
    who: "彼得",
    kicker: "第五章",
    intro:
      "夜裡四更天，你在船上。因風不順，船被浪搖撼。他從海面上走來。你求他叫你從水面上走到他那裡。眼睛看著他，踏著金光。",
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
      state.player = asRole(5, 8, "right", "peter");
      state.entities = [
        prop({ kind: "mast", tx: 4, ty: 7 }),
        person({ id: "jesus", name: "耶穌", tx: 34, ty: 8, look: "jesus", dir: "left" }),
        person({ id: "john", name: "約翰", tx: 5, ty: 7, look: "john", dir: "right", mark: "worry" }),
        person({ id: "andrew", name: "安得烈", tx: 7, ty: 9, look: "andrew", dir: "right", mark: "worry" }),
      ];
      state.faith = 100;
      state.objective = "他在海上。先聽他說話。";
    },
    onEnter() {
      state.objective = "他在海上。先聽他說話。";
      say(
        [
          { name: "門徒", text: "是個鬼怪！" },
          { name: "耶穌", text: VERSES.fearNot, ref: "馬太福音 14:27", verse: true },
          { name: "彼得", text: "主，如果是你，請叫我從水面上走到你那裡去。" },
          { name: "耶穌", text: "你來吧。" },
        ],
        () => {
          state.flags.called = true;
          state.faith = 100;
          state.objective = "踏著金光走到他那裡。下了光，風會把你推開。";
        }
      );
    },
    goal() {
      return jesus();
    },
    facingHim() {
      const j = jesus();
      if (!j) return false;
      const dx = j.x - state.player.x;
      const dy = j.y - state.player.y;
      const dir = state.player.dir;
      if (dir === "right") return dx > 8 && Math.abs(dy) < Math.abs(dx) + 24;
      if (dir === "left") return dx < -8 && Math.abs(dy) < Math.abs(dx) + 24;
      if (dir === "up") return dy < -8 && Math.abs(dx) < Math.abs(dy) + 24;
      return dy > 8 && Math.abs(dx) < Math.abs(dy) + 24;
    },
    update(dt) {
      const flags = state.flags;
      if (flags.sinking || flags.reached || state.dialogue.open || !flags.called) return;
      const j = jesus();
      const ch = tileAt(state.player.x, state.player.y);
      const onBoat = ch === "b";
      const onLight = ch === "l";
      if (onBoat || onLight) state.faith = Math.min(100, state.faith + dt * (onLight ? 34 : 46));
      else {
        const face = this.facingHim();
        state.faith -= dt * (face ? 7 : 18);
        tryMove(0, (face ? 8 : 26) * dt);
      }
      if (j && dist(state.player, j) < 22) {
        flags.reached = true;
        flags.calm = true;
        state.faith = 100;
        puff(state.player.x, state.player.y, "#d6ecff", 12, 20);
        say(
          [
            { name: "耶穌", text: "上來。" },
            { name: "", text: "他們上了船，風就住了。", ref: "馬太福音 14:32", verse: VERSES.windStill },
            { name: "門徒", text: "你真是神的兒子了。" },
          ],
          () => completeChapter()
        );
        return;
      }
      if (state.faith <= 0) {
        flags.sinking = true;
        state.faith = 0;
        say(
          [
            { name: "彼得", text: "主啊，救我！" },
            { name: "", text: "耶穌趕緊伸手拉住他。" },
            { name: "耶穌", text: VERSES.littleFaith, ref: "馬太福音 14:31", verse: true },
          ],
          () => {
            const boat = tp(5, 8);
            state.player.x = boat.x;
            state.player.y = boat.y;
            state.player.dir = "right";
            state.faith = 100;
            flags.sinking = false;
            state.objective = "再踏著金光走到他那裡。眼睛看著他。";
          }
        );
      }
    },
    talk(e) {
      const flags = state.flags;
      if (e.id === "jesus") {
        say([{ name: "耶穌", text: flags.called ? "再走幾步。我在這裡。" : "你來吧。" }]);
        return;
      }
      say([{ name: e.name, text: flags.calm ? "你真是神的兒子了。" : "海上有人走過來。我們都怕。" }]);
    },
  },
  {
    key: "field",
    title: "五餅二魚",
    ref: "約翰福音 6:1–13",
    who: "約翰",
    kicker: "第六章",
    intro: "眾人餓了，地方又是野地。耶穌對你們說：你們給他們吃吧。一個孩子有五個大麥餅、兩條魚。你把餅拿到他那裡，他祝謝了，你再分給坐著的人。",
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
      state.player = asRole(17, 11, "up", "john");
      state.entities = [
        prop({ kind: "tree", tx: 4, ty: 8, solid: true, radius: 4 }),
        prop({ kind: "tree", tx: 29, ty: 6, solid: true, radius: 4 }),
        prop({ kind: "tree", tx: 5, ty: 17, solid: true, radius: 4 }),
        prop({ kind: "tree", tx: 28, ty: 15, solid: true, radius: 4 }),
        prop({ kind: "well", tx: 7, ty: 11, solid: true, radius: 8 }),
        person({ id: "jesus", name: "耶穌", tx: 17, ty: 5, look: "jesus", dir: "down" }),
        person({ id: "philip", name: "腓力", tx: 14, ty: 10, look: "philip", dir: "down" }),
        person({ id: "boy", name: "孩子", tx: 20, ty: 16, look: "boy", dir: "left" }),
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
      const flags = state.flags;
      if (!flags.hasBasket) return findEnt("boy");
      if (!flags.blessed) return jesus();
      if (flags.fed < 8) {
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
      if (e.id === "philip") {
        say([
          { name: "耶穌", text: "你們給他們吃吧。" },
          { name: "腓力", text: "就是二十兩銀子的餅，叫他們各人吃一點也是不夠的。", ref: "約翰福音 6:7" },
        ]);
        return;
      }
      if (e.id === "jesus") {
        if (!flags.hasBasket) {
          say([{ name: "耶穌", text: "你們給他們吃吧。先去找那個孩子。" }]);
          return;
        }
        if (!flags.blessed) {
          say(
            [
              { name: "耶穌", text: "拿過來。" },
              { name: "", text: "耶穌拿起餅來，祝謝了，就分給那坐著的人。", ref: "約翰福音 6:11", verse: true },
              { name: "耶穌", text: VERSES.bread, ref: "約翰福音 6:35", verse: true },
            ],
            () => {
              flags.blessed = true;
              state.held = "生命的糧";
              state.objective = "他把餅交給你。分給場上的八個人。";
              puff(e.x, e.y - 8, "#f0c84b", 22, 36);
              chime();
              this.refresh();
            }
          );
          return;
        }
        if (flags.fed < 8) {
          say([{ name: "耶穌", text: "先分給坐著的人。" }]);
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
      if (e.id === "boy") {
        if (!flags.hasBasket) {
          say(
            [
              { name: "孩子", text: "先生，我只有這些。這麼多人，算什麼呢？" },
              { name: "", text: VERSES.loaves, ref: "約翰福音 6:9", verse: true },
              { name: "孩子", text: "你拿去給他吧。" },
            ],
            () => {
              flags.hasBasket = true;
              state.held = "五餅二魚";
              state.objective = "把餅拿到耶穌那裡。";
            }
          );
          return;
        }
        say([{ name: "孩子", text: flags.blessed ? "真的夠大家吃。我從沒看過這樣的事。" : "先拿去給他。" }]);
        return;
      }
      if (e.role === "hungry") {
        if (!flags.blessed) {
          say([{ name: e.name, text: "我們餓了。這地方是野地。" }]);
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
          state.objective = "眾人都吃飽了。回到耶穌那裡，把剩下的收拾起來。";
          chime();
        }
      }
    },
  },
  {
    key: "supper",
    title: "最後的晚餐",
    ref: "約翰福音 13；馬太福音 26:20–29",
    kicker: "第七章",
    intro:
      "逾越節的晚上，樓房已經預備好。你起來洗他們的腳，又把餅和杯遞給他們。這一夜的話很重。",
    closing: "他們唱了詩，就出來，往橄欖山去。",
    closingRef: "馬太福音 26:30",
    music: "solemn",
    light: "room",
    people: [
      { id: "peter", name: "彼得", look: "simon", tx: 9, ty: 8, before: "主啊，你洗我的腳嗎？", after: "主，是我嗎？" },
      { id: "james", name: "雅各", look: "james", tx: 9, ty: 10, before: "席已經擺上了。他還沒有坐下。", after: "主，是我嗎？" },
      { id: "andrew", name: "安得烈", look: "andrew", tx: 9, ty: 12, before: "我們都在這樓裡。一個也不少。", after: "主，是我嗎？" },
      { id: "john", name: "約翰", look: "john", tx: 21, ty: 8, before: "我靠近他。這一夜，他的話特別輕，也特別重。", after: "主，是誰？" },
      { id: "philip", name: "腓力", look: "philip", tx: 21, ty: 10, before: "餅在桌上。杯也在。他還沒有擘開。", after: "主，是我嗎？" },
      { id: "bart", name: "巴多羅買", look: "bart", tx: 21, ty: 12, before: "逾越節的羊羔已經預備好了。", after: "主，是我嗎？" },
      { id: "matthew", name: "馬太", look: "tax", tx: 12, ty: 7, before: "我曾算過很多人的帳。今夜他算的是另一件事。", after: "主，是我嗎？" },
      { id: "thomas", name: "多馬", look: "thomas", tx: 18, ty: 7, before: "我看著他的手。他還沒有把餅遞出來。", after: "主，是我嗎？" },
      { id: "james2", name: "亞勒腓的雅各", look: "james2", tx: 12, ty: 13, before: "亞勒腓的兒子也在這席上。", after: "主，是我嗎？" },
      { id: "thad", name: "達太", look: "thad", tx: 15, ty: 13, before: "我不是加略人。我就坐在這裡。", after: "主，是我嗎？" },
      { id: "simonZ", name: "奮銳黨的西門", look: "zealot", tx: 18, ty: 13, before: "刀留在門外了。今夜只剩下席。", after: "主，是我嗎？" },
    ],
    build() {
      const m = createMap(30, 18, "f");
      m.frame("#");
      m.rect(1, 1, 28, 2, "#");
      state.map = m;
      state.player = asJesus(15, 6, "down");
      state.entities = [
        prop({ kind: "table", tx: 15, ty: 10, solid: true, box: { x: -54, y: -30, w: 108, h: 22 } }),
        prop({ kind: "lamp", tx: 10, ty: 9 }),
        prop({ kind: "lamp", tx: 20, ty: 9 }),
        person({ id: "judas", name: "加略人猶大", tx: 24, ty: 14, look: "judas", dir: "left" }),
      ];
      this.people.forEach((p) => {
        state.entities.push(person({ id: p.id, name: p.name, tx: p.tx, ty: p.ty, look: p.look, role: "seat" }));
      });
      state.objective = "先到彼得面前。你要起來洗他的腳。";
    },
    onEnter() {
      say([
        { name: "", text: "到了晚上，耶穌和十二個門徒坐席。" },
        { name: "耶穌", text: "我很願意在受害以先和你們吃這逾越節的筵席。", ref: "路加福音 22:15", verse: true },
      ]);
      state.objective = "先到彼得面前。你要起來洗他的腳。";
    },
    goal() {
      const flags = state.flags;
      if (!flags.washed) return findEnt("peter");
      if (!flags.judasGone && flags.leaving) return findEnt("judas");
      return findEnt("john");
    },
    update(dt) {
      const judas = findEnt("judas");
      if (!judas || !state.flags.leaving || state.flags.judasGone) return;
      const door = tp(15, 16);
      const dx = door.x - judas.x;
      const dy = door.y - judas.y;
      if (Math.hypot(dx, dy) > 6) {
        judas.x += dx * Math.min(1, dt * 1.6);
        judas.y += dy * Math.min(1, dt * 1.6);
        judas.moving = true;
        judas.dir = "down";
      } else {
        judas.moving = false;
        judas.alpha = Math.max(0, judas.alpha - dt * 0.7);
        if (judas.alpha <= 0) {
          judas.talk = false;
          state.flags.judasGone = true;
          state.objective = "他出去了。到約翰面前，把那條新命令留下。";
        }
      }
    },
    talk(e) {
      const flags = state.flags;
      if (e.id === "judas") {
        if (flags.leaving) {
          say([{ name: "加略人猶大", text: VERSES.rabbi, ref: "馬太福音 26:25" }]);
          return;
        }
        say([
          { name: "加略人猶大", text: "錢囊在我這裡。席若還長，需要的我去辦。" },
          { name: "加略人猶大", text: "他也給我留了位子。" },
        ]);
        return;
      }
      if (e.role === "seat") {
        const info = this.people.find((p) => p.id === e.id);
        if (!info) return;
        if (e.id === "peter" && !flags.washed) {
          this.wash();
          return;
        }
        if (e.id === "john" && flags.washed) {
          this.atTable();
          return;
        }
        if (!flags.betrayal) say([{ name: e.name, text: info.before }]);
        else say([{ name: e.name, text: info.after, ref: e.id === "john" ? "" : "馬太福音 26:22", verse: e.id === "john" ? undefined : VERSES.isItI }]);
        return;
      }
    },
    wash() {
      const flags = state.flags;
      if (!flags.washed) {
        say(
          [
            { name: "", text: "你離席站起來，把水倒在盆裡，就洗門徒的腳。" },
            { name: "彼得", text: "主啊，你洗我的腳嗎？" },
            { name: "彼得", text: "你永不可洗我的腳！" },
            { name: "耶穌", text: "我若不洗你，你就與我無分了。", ref: "約翰福音 13:8" },
            { name: "彼得", text: "主啊，不但我的腳，連手和頭也要洗。" },
            { name: "耶穌", text: VERSES.wash, ref: "約翰福音 13:14-15", verse: true },
          ],
          () => {
            flags.washed = true;
            puff(findEnt("peter").x, findEnt("peter").y, "#9ad4ea", 10, 14);
            state.objective = "到約翰面前。把餅和杯拿起來。";
          }
        );
      }
    },
    atTable() {
      const flags = state.flags;
      if (!flags.meal) {
        say(
          [
            { name: "耶穌", text: VERSES.body, ref: "馬太福音 26:26", verse: true },
            { name: "耶穌", text: VERSES.cup, ref: "馬太福音 26:27-28", verse: true },
            { name: "", text: "餅遞到他們手裡。杯也遞過去。席上的人都領受了。" },
          ],
          () => {
            flags.meal = true;
            puff(tp(15, 10).x, tp(15, 10).y - 10, "#f0c84b", 14, 18);
            chime();
            state.objective = "還有話要說。再對約翰說。";
          }
        );
        return;
      }
      if (!flags.betrayal) {
        say(
          [
            { name: "耶穌", text: VERSES.betray, ref: "馬太福音 26:21", verse: true },
            { name: "", text: "他們就甚憂愁，一個一個地問他說：「主，是我嗎？」", ref: "馬太福音 26:22" },
            { name: "加略人猶大", text: VERSES.rabbi, ref: "馬太福音 26:25" },
            { name: "", text: VERSES.night, ref: "約翰福音 13:30", verse: true },
          ],
          () => {
            flags.betrayal = true;
            flags.leaving = true;
            state.objective = "他起來，往夜裡走了。";
          }
        );
        return;
      }
      if (!flags.judasGone) {
        say([{ name: "耶穌", text: "讓他去。已經是夜間了。" }]);
        return;
      }
      say(
        [
          { name: "耶穌", text: VERSES.newCmd, ref: "約翰福音 13:34", verse: true },
          { name: "耶穌", text: "你們若有彼此相愛的心，眾人因此就認出你們是我的門徒了。", ref: "約翰福音 13:35", verse: true },
          { name: "", text: "他們唱了詩，就出來，往橄欖山去。", ref: "馬太福音 26:30" },
        ],
        () => completeChapter()
      );
    },
  },
  {
    key: "garden",
    title: "清晨的園子",
    ref: "約翰福音 20",
    who: "抹大拉的馬利亞",
    kicker: "第八章",
    intro: "七日的第一日，天還黑的時候。你來到墳墓那裡。進去看。園子裡會遇見他，只是你還不認得。然後，多馬要親眼看見。",
    closing: "我的主，我的神。",
    closingRef: "約翰福音 20:28",
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
      state.player = asRole(15, 16, "up", "mary");
      state.entities = [
        prop({ kind: "tree", tx: 4, ty: 8, variant: "cypress", solid: true, radius: 3 }),
        prop({ kind: "tree", tx: 7, ty: 15, variant: "cypress", solid: true, radius: 3 }),
        prop({ kind: "tree", tx: 24, ty: 6, variant: "cypress", solid: true, radius: 3 }),
        prop({ kind: "tree", tx: 26, ty: 14, variant: "cypress", solid: true, radius: 3 }),
        prop({ kind: "tree", tx: 8, ty: 5, variant: "cypress", solid: true, radius: 3 }),
        prop({ kind: "linen", id: "linen", name: "細麻布", tx: 13, ty: 4, talk: true }),
        prop({ kind: "beacon", id: "out", tx: 15, ty: 12 }),
        person({ id: "jesus", name: "耶穌", tx: 22, ty: 12, look: "jesus", dir: "left", alpha: 0, talk: false, wounds: true }),
        person({ id: "thomas", name: "多馬", tx: 24, ty: 16, look: "thomas", dir: "left" }),
      ];
      state.objective = "天還黑。進墳墓看看。";
    },
    onEnter() {
      state.objective = "天還黑。進墳墓看看。";
    },
    goal() {
      const flags = state.flags;
      if (!flags.seenTomb) return findEnt("linen");
      if (!flags.appeared) return findEnt("out");
      if (!flags.named) return jesus();
      return findEnt("thomas");
    },
    update(dt) {
      const flags = state.flags;
      const j = jesus();
      const inTomb = tileAt(state.player.x, state.player.y) === "o";
      if (flags.seenTomb && !inTomb && j && !flags.appeared && !state.dialogue.open) {
        flags.appeared = true;
        j.talk = true;
        j.alpha = 0;
        state.flash = 0.6;
        appearSound();
        state.objective = "園子裡有人。你還不認得他。";
      }
      if (j && flags.appeared && j.alpha < 1) j.alpha = Math.min(1, j.alpha + dt * 0.8);
    },
    talk(e) {
      const flags = state.flags;
      if (e.id === "linen") {
        say([{ name: "", text: "細麻布還在，人卻不在了。" }], () => {
          flags.seenTomb = true;
          state.objective = "離開墳墓，回到園子裡。";
        });
        return;
      }
      if (e.id === "jesus") {
        if (!flags.appeared) return;
        if (flags.named) {
          say([{ name: "抹大拉的馬利亞", text: "拉波尼！我已經看見了主。" }]);
          return;
        }
        say(
          [
            { name: "耶穌", text: VERSES.whyWeep, ref: "約翰福音 20:15", verse: true },
            { name: "抹大拉的馬利亞", text: VERSES.gardener, ref: "約翰福音 20:15" },
            { name: "耶穌", text: VERSES.maryName, ref: "約翰福音 20:16" },
            { name: "抹大拉的馬利亞", text: "拉波尼！" },
            { name: "耶穌", text: VERSES.notYetUp, ref: "約翰福音 20:17", verse: true },
          ],
          () => {
            flags.named = true;
            e.dir = "right";
            puff(state.player.x, state.player.y - 14, "#fff4d0", 12, 18);
            state.objective = "到多馬那裡去。他要親眼看見。";
          }
        );
        return;
      }
      if (e.id === "thomas") {
        if (!flags.named) {
          say([{ name: "多馬", text: "我非看見他手上的釘痕，總不信。" }]);
          return;
        }
        say(
          [
            { name: "耶穌", text: VERSES.peace, ref: "約翰福音 20:21", verse: true },
            { name: "耶穌", text: VERSES.touch, ref: "約翰福音 20:27", verse: true },
            { name: "多馬", text: VERSES.myLord, ref: "約翰福音 20:28", verse: true },
            { name: "耶穌", text: VERSES.commission, ref: "馬太福音 28:18-19", verse: true },
          ],
          () => completeChapter()
        );
      }
    },
  },
];

const MORE = [
  {
    key: "bethlehem",
    title: "伯利恆",
    ref: "路加福音 2；馬太福音 1–2",
    who: "約瑟",
    intro: "客店沒有地方。孩子生在馬槽裡，你守在旁邊。牧羊人從野地趕來，博士跟著星來。然後，天使在夢中告訴你，要帶孩子和他母親往埃及去。",
    closing: "約瑟就起來，夜間帶著小孩子和他母親往埃及去。",
    closingRef: "馬太福音 2:14",
    music: "dawn",
    night: true,
    build() {
      const m = createMap(32, 20, ".");
      m.rect(11, 6, 8, 5, "p");
      scatter(m, ",", 0.08, (ch) => ch === ".");
      m.frame("#");
      state.map = m;
      state.player = asRole(17, 10, "up", "joseph");
      state.entities = [
        person({ id: "child", name: "孩子", tx: 15, ty: 8, look: "child", dir: "down" }),
        person({ id: "mary", name: "馬利亞", tx: 13, ty: 7, look: "mother", dir: "right" }),
        person({ id: "shepherd", name: "牧羊人", tx: 8, ty: 15, look: "traveler", dir: "up" }),
        person({ id: "magi", name: "博士", tx: 24, ty: 15, look: "steward", dir: "up" }),
      ];
      state.objective = "先到馬利亞面前。";
    },
    onEnter() {
      state.objective = "先到馬利亞面前。";
    },
    goal() {
      const f = state.flags;
      if (!f.mary) return findEnt("mary");
      if (!f.shepherds) return findEnt("shepherd");
      if (!f.magi) return findEnt("magi");
      return findEnt("mary");
    },
    update() {},
    talk(e) {
      const f = state.flags;
      if (e.id === "child") {
        say([{ name: "", text: "孩子在馬槽裡。馬利亞守著他。" }]);
        return;
      }
      if (e.id === "mary") {
        if (!f.mary) {
          say(
            [
              { name: "", text: VERSES.manger, ref: "路加福音 2:7", verse: true },
              { name: "馬利亞", text: VERSES.nameJesus, ref: "馬太福音 1:21", verse: true },
            ],
            () => {
              f.mary = true;
              state.objective = "牧羊人來了。去迎接他們。";
            }
          );
          return;
        }
        if (!f.magi) {
          say([{ name: "馬利亞", text: "先去迎接來找孩子的人。" }]);
          return;
        }
        say(
          [
            { name: "", text: "天使在夢中對你說：" },
            { name: "", text: VERSES.egypt, ref: "馬太福音 2:13", verse: true },
          ],
          () => completeChapter()
        );
        return;
      }
      if (e.id === "shepherd") {
        if (!f.mary) {
          say([{ name: "牧羊人", text: "我們找那生在馬槽裡的孩子。" }]);
          return;
        }
        say(
          [
            { name: "牧羊人", text: VERSES.goodNews, ref: "路加福音 2:10-11", verse: true },
            { name: "牧羊人", text: VERSES.gloria, ref: "路加福音 2:14", verse: true },
          ],
          () => {
            f.shepherds = true;
            state.objective = "東方的博士跟著星來了。";
          }
        );
        return;
      }
      if (e.id === "magi") {
        if (!f.shepherds) {
          say([{ name: "博士", text: "星還在前頭。我們要進屋子去。" }]);
          return;
        }
        say(
          [
            { name: "博士", text: VERSES.star, ref: "馬太福音 2:2", verse: true },
            { name: "", text: VERSES.gifts, ref: "馬太福音 2:11", verse: true },
          ],
          () => {
            f.magi = true;
            puff(e.x, e.y - 12, "#f0c84b", 10, 16);
            state.objective = "回到馬利亞身邊。該起身了。";
          }
        );
        return;
      }
    },
  },
  {
    key: "temple",
    title: "聖殿",
    ref: "路加福音 2:41–52",
    who: "少年耶穌",
    intro: "你十二歲，跟父母上耶路撒冷守節。他們回去了，你仍在殿裡，坐在教師中間。他們找了你三天。",
    closing: "豈不知我應當以我父的事為念嗎？",
    closingRef: "路加福音 2:49",
    music: "peace",
    build() {
      const m = createMap(28, 18, "f");
      m.frame("#");
      m.rect(1, 1, 26, 2, "#");
      state.map = m;
      state.player = asJesus(14, 8, "down", true);
      state.entities = [
        person({ id: "teacher", name: "教師", tx: 10, ty: 7, look: "elder", dir: "right" }),
        person({ id: "scribe", name: "文士", tx: 18, ty: 7, look: "tax", dir: "left" }),
        person({ id: "mary", name: "馬利亞", tx: 12, ty: 14, look: "mother", dir: "up" }),
        person({ id: "joseph", name: "約瑟", tx: 16, ty: 14, look: "elder", dir: "up" }),
      ];
      state.objective = "坐在教師中間，聽，也問。";
    },
    onEnter() {
      state.objective = "坐在教師中間，聽，也問。";
    },
    goal() {
      if (!state.flags.heard) return findEnt("teacher");
      return findEnt("mary");
    },
    update() {},
    talk(e) {
      const f = state.flags;
      if (e.id === "teacher" || e.id === "scribe") {
        say(
          [
            { name: e.name, text: "這孩子的應對，我們沒有聽過。" },
            { name: "耶穌", text: "我在我父的殿裡。你們所問的，經上已經寫了。" },
          ],
          () => {
            f.heard = true;
            state.objective = "馬利亞和約瑟找了你三天。去見他們。";
          }
        );
        return;
      }
      if (e.id === "mary" || e.id === "joseph") {
        if (!f.heard) {
          say([{ name: "馬利亞", text: "我兒，我們找你找得好苦。你先聽完教師的話。" }]);
          return;
        }
        say(
          [
            { name: "馬利亞", text: "我兒！為甚麼向我們這樣行呢？看哪，你父親和我傷心來找你！" },
            { name: "耶穌", text: VERSES.fathers, ref: "路加福音 2:49", verse: true },
            { name: "", text: "他父母不明白他所說的話。他就同他們下去，回到拿撒勒。" },
          ],
          () => completeChapter()
        );
      }
    },
  },
  {
    key: "baptism",
    title: "約旦河",
    ref: "馬太福音 3:13–17",
    intro: "約翰在約旦河施洗。你從加利利來到他那裡。走進水中。天要開，聖靈要降下，有聲音從天上來。",
    closing: "這是我的愛子，我所喜悅的。",
    closingRef: "馬太福音 3:17",
    music: "dawn",
    waterSolid: false,
    build() {
      const m = createMap(30, 18, ".");
      m.rect(0, 6, 30, 6, "w");
      m.rect(0, 5, 30, 1, "s");
      m.rect(0, 12, 30, 1, "s");
      m.frame("#");
      state.map = m;
      state.player = asJesus(15, 15, "up");
      state.entities = [person({ id: "john", name: "施洗約翰", tx: 15, ty: 8, look: "baptist", dir: "down" })];
      state.objective = "走到約旦河裡，到約翰面前。";
    },
    onEnter() {
      state.objective = "走到約旦河裡，到約翰面前。";
    },
    goal() {
      return findEnt("john");
    },
    inWater() {
      const ch = tileAt(state.player.x, state.player.y);
      return ch === "w" || ch === "d" || ch === "n";
    },
    update(dt) {
      const dove = findEnt("dove");
      if (dove) dove.y -= dt * 18;
    },
    talk(e) {
      if (e.id !== "john") return;
      if (!this.inWater()) {
        say([
          { name: "施洗約翰", text: "看哪，神的羔羊，除去世人罪孽的。" },
          { name: "施洗約翰", text: "你若要受洗，就走到河裡來。" },
        ]);
        return;
      }
      if (state.flags.done) return;
      say(
        [
          { name: "施洗約翰", text: VERSES.johnNeed, ref: "馬太福音 3:14", verse: true },
          { name: "耶穌", text: VERSES.fulfill, ref: "馬太福音 3:15", verse: true },
          { name: "", text: "耶穌受了洗，隨即從水裡上來。天忽然為他開了，他就看見神的靈彷彿鴿子降下，落在他身上。" },
          { name: "", text: VERSES.beloved, ref: "馬太福音 3:17", verse: true },
        ],
        () => {
          state.flags.done = true;
          state.flash = 0.9;
          state.entities.push(prop({ kind: "dove", id: "dove", tx: 15, ty: 6 }));
          chime();
          completeChapter();
        }
      );
    },
  },
  {
    key: "wild",
    title: "曠野",
    ref: "馬太福音 4:1–11",
    intro: "聖靈引你到曠野，受魔鬼的試探。你禁食四十晝夜。他要你把石頭變餅，從殿頂上跳下去，又把萬國指給你看。你用經上的話回答。",
    closing: "於是，魔鬼離了耶穌，有天使來伺候他。",
    closingRef: "馬太福音 4:11",
    music: "solemn",
    spots: [
      [8, 14],
      [24, 8],
      [16, 4],
    ],
    build() {
      const m = createMap(32, 20, "m");
      m.rect(4, 3, 24, 14, ".");
      [[6, 12], [10, 8], [22, 6], [18, 14], [26, 12]].forEach(([x, y]) => m.set(x, y, "r"));
      m.frame("#");
      state.map = m;
      state.player = asJesus(8, 17, "up");
      state.entities = [
        person({ id: "tempter", name: "試探者", tx: 8, ty: 14, look: "tempter", dir: "down" }),
        person({ id: "angel", name: "天使", tx: 16, ty: 8, look: "angel", dir: "down", alpha: 0, talk: false }),
      ];
      state.flags.step = 0;
      state.objective = "走到石頭那裡。他在等你。";
    },
    onEnter() {
      state.objective = "走到石頭那裡。他在等你。";
    },
    goal() {
      if (state.flags.step >= 3) return findEnt("angel");
      return findEnt("tempter");
    },
    update() {},
    talk(e) {
      const f = state.flags;
      if (e.id === "angel") {
        if (f.step < 3) return;
        say([{ name: "天使", text: "魔鬼離了你。我們來伺候。" }], () => completeChapter());
        return;
      }
      if (e.id !== "tempter") return;
      const rounds = [
        [
          { name: "試探者", text: VERSES.stones, ref: "馬太福音 4:3", verse: true },
          { name: "耶穌", text: VERSES.notBread, ref: "馬太福音 4:4", verse: true },
        ],
        [
          { name: "試探者", text: VERSES.jump, ref: "馬太福音 4:6", verse: true },
          { name: "耶穌", text: VERSES.notTest, ref: "馬太福音 4:7", verse: true },
        ],
        [
          { name: "試探者", text: VERSES.worship, ref: "馬太福音 4:9", verse: true },
          { name: "耶穌", text: VERSES.begone, ref: "馬太福音 4:10", verse: true },
        ],
      ];
      if (f.step >= 3) {
        say([{ name: "試探者", text: "……" }]);
        return;
      }
      say(rounds[f.step], () => {
        f.step += 1;
        if (f.step < 3) {
          const spot = this.spots[f.step];
          const p = tp(spot[0], spot[1]);
          e.x = p.x;
          e.y = p.y;
          state.objective = f.step === 1 ? "他帶你上了殿頂。" : "他又帶你上了一座最高的山。";
        } else {
          e.alpha = 0;
          e.talk = false;
          const angel = findEnt("angel");
          angel.alpha = 1;
          angel.talk = true;
          state.objective = "他走了。天使來了。";
          puff(e.x, e.y, "#1a1618", 8, 12);
        }
      });
    },
  },
  {
    key: "nazareth",
    title: "拿撒勒",
    ref: "路加福音 4:16–30",
    intro: "你在拿撒勒的會堂站起來，宣讀以賽亞書。今天這經應驗在他們耳中。他們卻惱怒，拉你到山崖，要把你推下去。你從他們中間直行過去。",
    closing: "他卻從他們中間直行，過去了。",
    closingRef: "路加福音 4:30",
    music: "peace",
    build() {
      const m = createMap(34, 18, ".");
      m.rect(2, 4, 14, 10, "f");
      m.rect(2, 4, 14, 1, "#");
      stroke(m, [[16, 9], [30, 9]], "p", 0);
      m.set(28, 6, "r");
      m.set(30, 12, "r");
      m.frame("#");
      state.map = m;
      state.player = asJesus(8, 9, "right");
      state.entities = [
        person({ id: "elder", name: "管會堂的", tx: 6, ty: 7, look: "elder", dir: "down" }),
        person({ id: "man", name: "會眾", tx: 22, ty: 9, look: "worker", dir: "left" }),
        person({ id: "woman", name: "婦人", tx: 24, ty: 11, look: "woman", dir: "left" }),
        prop({ kind: "beacon", id: "out", tx: 31, ty: 9 }),
      ];
      state.objective = "在會堂裡展開書卷。";
    },
    onEnter() {
      state.objective = "在會堂裡展開書卷。";
    },
    goal() {
      if (!state.flags.read) return findEnt("elder");
      if (!state.flags.angry) return findEnt("man");
      return findEnt("out");
    },
    update() {
      const out = findEnt("out");
      if (!state.flags.angry || state.flags.left || state.dialogue.open) return;
      if (out && dist(state.player, out) < 22) {
        state.flags.left = true;
        say([{ name: "", text: VERSES.passed, ref: "路加福音 4:30", verse: true }], () => completeChapter());
      }
    },
    talk(e) {
      const f = state.flags;
      if (e.id === "elder") {
        say(
          [
            { name: "", text: "有人把先知以賽亞的書交給他。他展開，找到一處，就念。" },
            { name: "耶穌", text: VERSES.spirit, ref: "路加福音 4:18", verse: true },
            { name: "耶穌", text: VERSES.today, ref: "路加福音 4:21", verse: true },
          ],
          () => {
            f.read = true;
            state.objective = "走到會眾面前。";
          }
        );
        return;
      }
      if (e.id === "man" || e.id === "woman") {
        if (!f.read) {
          say([{ name: e.name, text: "會堂裡還安靜。等他念完那卷書。" }]);
          return;
        }
        say(
          [
            { name: "會眾", text: "這不是約瑟的兒子嗎？" },
            { name: "耶穌", text: VERSES.hometown, ref: "路加福音 4:24", verse: true },
            { name: "會眾", text: "把他拉到山崖上，推下去！" },
          ],
          () => {
            f.angry = true;
            state.objective = "從他們中間直行，走到路的那一頭。";
          }
        );
      }
    },
  },
  {
    key: "heal",
    title: "伸手",
    ref: "馬太福音 8；馬可福音 2；馬可福音 10",
    intro: "長大痲瘋的求你潔淨他。癱子從房頂被縋下來。瞎子在路旁喊大衛的子孫。你伸手，也開口。",
    closing: "你的信救了你了。",
    closingRef: "馬可福音 10:52",
    music: "peace",
    build() {
      const m = createMap(34, 18, ".");
      m.rect(4, 6, 8, 5, "f");
      stroke(m, [[6, 15], [28, 15]], "p", 0);
      m.frame("#");
      state.map = m;
      state.player = asJesus(8, 15, "right");
      state.entities = [
        person({ id: "leper", name: "長大痲瘋的", tx: 14, ty: 12, look: "sick", dir: "left", mark: "worry" }),
        person({ id: "para", name: "癱子", tx: 8, ty: 8, look: "poor", dir: "down", mark: "hungry" }),
        person({ id: "friend", name: "朋友", tx: 6, ty: 7, look: "youth", dir: "right" }),
        person({ id: "blind", name: "瞎子", tx: 26, ty: 15, look: "elder", dir: "left", mark: "worry" }),
      ];
      state.flags.healed = {};
      state.objective = "三個人在等你的手。";
    },
    onEnter() {
      state.objective = "三個人在等你的手。";
    },
    refresh() {
      state.progress = `已醫治 ${Object.keys(state.flags.healed).length}／3`;
    },
    goal() {
      const ids = ["leper", "para", "blind"];
      let best = null;
      let bestD = 1e9;
      for (const id of ids) {
        if (state.flags.healed[id]) continue;
        const e = findEnt(id);
        const d = dist(state.player, e);
        if (d < bestD) {
          best = e;
          bestD = d;
        }
      }
      return best;
    },
    update() {},
    done(id, ent) {
      state.flags.healed[id] = true;
      ent.mark = "peace";
      puff(ent.x, ent.y - 14, "#f0c84b", 12, 18);
      chime();
      this.refresh();
      if (Object.keys(state.flags.healed).length >= 3) completeChapter();
      else state.objective = "還有人在等。";
    },
    talk(e) {
      const f = state.flags;
      if (e.id === "friend") {
        say([{ name: "朋友", text: "人太多，我們拆了屋頂，把他連褥子縋下來。" }]);
        return;
      }
      if (e.id === "leper") {
        if (f.healed.leper) {
          say([{ name: e.name, text: "我潔淨了。我要去給祭司察看。" }]);
          return;
        }
        say(
          [
            { name: "長大痲瘋的", text: VERSES.ifWilling, ref: "馬太福音 8:2", verse: true },
            { name: "耶穌", text: VERSES.willing, ref: "馬太福音 8:3", verse: true },
          ],
          () => {
            e.look = LOOKS.traveler;
            this.done("leper", e);
          }
        );
        return;
      }
      if (e.id === "para") {
        if (f.healed.para) {
          say([{ name: e.name, text: "褥子在我肩上。我回家去了。" }]);
          return;
        }
        say(
          [
            { name: "耶穌", text: VERSES.sins, ref: "馬可福音 2:5", verse: true },
            { name: "耶穌", text: VERSES.takeMat, ref: "馬可福音 2:11", verse: true },
          ],
          () => {
            e.look = LOOKS.youth;
            this.done("para", e);
          }
        );
        return;
      }
      if (e.id === "blind") {
        if (f.healed.blind) {
          say([{ name: e.name, text: "我看見了。我在路上跟隨你。" }]);
          return;
        }
        say(
          [
            { name: "瞎子", text: VERSES.sonOfDavid, ref: "馬可福音 10:47", verse: true },
            { name: "耶穌", text: VERSES.see, ref: "馬可福音 10:51", verse: true },
            { name: "瞎子", text: VERSES.wantSee, ref: "馬可福音 10:51" },
            { name: "耶穌", text: VERSES.yourFaith, ref: "馬可福音 10:52", verse: true },
          ],
          () => {
            e.mark = "peace";
            this.done("blind", e);
          }
        );
      }
    },
  },
  {
    key: "storm",
    title: "平靜風浪",
    ref: "馬可福音 4:35–41",
    who: "彼得",
    intro: "晚上，船在海中。耶穌在船尾睡覺。忽然起了暴風，船要滿了水。你把他叫醒。他起來，斥責風，向海說：住了吧！靜了吧！",
    closing: "風就止住，大大地平靜了。",
    closingRef: "馬可福音 4:39",
    music: "storm",
    night: true,
    waterSolid: true,
    build() {
      const m = createMap(28, 16, "n");
      m.rect(8, 6, 12, 5, "b");
      m.rect(9, 5, 10, 1, "b");
      m.rect(9, 11, 10, 1, "b");
      m.frame("#");
      state.map = m;
      state.player = asRole(10, 8, "right", "peter");
      state.entities = [
        person({ id: "jesus", name: "耶穌", tx: 13, ty: 8, look: "jesus", dir: "left" }),
        person({ id: "john", name: "約翰", tx: 15, ty: 7, look: "john", dir: "left", mark: "worry" }),
        prop({ kind: "mast", id: "wind", name: "風浪", tx: 18, ty: 8, talk: true }),
      ];
      state.objective = "到船尾叫醒他。";
    },
    onEnter() {
      state.objective = "到船尾叫醒他。";
    },
    goal() {
      if (!state.flags.woke) return jesus();
      return findEnt("wind");
    },
    update() {},
    talk(e) {
      if (e.id === "jesus") {
        if (!state.flags.woke) {
          say(
            [
              { name: "彼得", text: VERSES.perish, ref: "馬可福音 4:38", verse: true },
              { name: "耶穌", text: "我在這裡。" },
            ],
            () => {
              state.flags.woke = true;
              e.dir = "right";
              state.objective = "走到船頭。他要斥責風和海。";
            }
          );
          return;
        }
        say([{ name: "耶穌", text: state.flags.calm ? "連風和海也聽從我。" : "到船頭去。" }]);
        return;
      }
      if (e.id === "john") {
        say([{ name: "約翰", text: state.flags.calm ? "連風和海也聽從他。" : "船要滿了水。先叫醒他。" }]);
        return;
      }
      if (e.id === "wind" && !state.flags.woke) {
        say([{ name: "", text: "風還在灌進來。先叫醒船尾的人。" }]);
        return;
      }
      if (e.id === "wind" && !state.flags.calm) {
        say(
          [
            { name: "耶穌", text: VERSES.peaceSea, ref: "馬可福音 4:39", verse: true },
            { name: "", text: "風就止住，大大地平靜了。" },
            { name: "耶穌", text: VERSES.whereFaith, ref: "馬可福音 4:40", verse: true },
            { name: "門徒", text: VERSES.whoThen, ref: "馬可福音 4:41", verse: true },
          ],
          () => {
            state.flags.calm = true;
            state.shake = 0;
            chime();
            completeChapter();
          }
        );
      }
    },
  },
  {
    key: "lazarus",
    title: "拉撒路",
    ref: "約翰福音 11:1–44",
    intro: "拉撒路死了四天。馬大在村口迎接你。馬利亞俯伏在你腳前哭。你也哭了。到墳墓前，叫人把石頭挪開，然後大聲呼叫他的名字。",
    closing: "那死人就出來了，手腳裹著布。",
    closingRef: "約翰福音 11:44",
    music: "solemn",
    build() {
      const m = createMap(32, 20, ".");
      m.rect(12, 2, 8, 5, "T");
      m.rect(14, 3, 4, 3, "o");
      m.set(15, 6, "p");
      m.set(16, 6, "p");
      stroke(m, [[16, 17], [16, 8]], "p", 0);
      m.frame("#");
      state.map = m;
      state.player = asJesus(16, 16, "up");
      state.entities = [
        person({ id: "martha", name: "馬大", tx: 16, ty: 13, look: "woman", dir: "down" }),
        person({ id: "maryb", name: "馬利亞", tx: 18, ty: 10, look: "mary", dir: "down" }),
        prop({ kind: "stone", id: "stone", name: "石頭", tx: 16, ty: 7, talk: true }),
        person({ id: "lazarus", name: "拉撒路", tx: 15, ty: 4, look: "lazarus", dir: "down", alpha: 0, talk: false }),
      ];
      state.objective = "馬大在村口。先去見她。";
    },
    onEnter() {
      state.objective = "馬大在村口。先去見她。";
    },
    goal() {
      const f = state.flags;
      if (!f.martha) return findEnt("martha");
      if (!f.mary) return findEnt("maryb");
      if (!f.called) return findEnt("stone");
      return findEnt("lazarus");
    },
    update(dt) {
      const man = findEnt("lazarus");
      if (!man || !state.flags.called || state.flags.out) return;
      const door = tp(16, 9);
      const dx = door.x - man.x;
      const dy = door.y - man.y;
      if (Math.hypot(dx, dy) > 4) {
        man.x += dx * Math.min(1, dt * 1.2);
        man.y += dy * Math.min(1, dt * 1.2);
        man.moving = true;
      } else if (!state.dialogue.open) {
        state.flags.out = true;
        man.moving = false;
        man.talk = true;
        say(
          [
            { name: "", text: "那死人就出來了，手腳裹著布，臉上包著手巾。" },
            { name: "耶穌", text: VERSES.unbind, ref: "約翰福音 11:44", verse: true },
          ],
          () => completeChapter()
        );
      }
    },
    talk(e) {
      const f = state.flags;
      if (e.id === "martha") {
        say(
          [
            { name: "馬大", text: VERSES.ifHere, ref: "約翰福音 11:21", verse: true },
            { name: "耶穌", text: VERSES.resurrection, ref: "約翰福音 11:25", verse: true },
            { name: "馬大", text: "主啊，是的，我信你是基督，是神的兒子。" },
          ],
          () => {
            f.martha = true;
            state.objective = "馬利亞在墳前哭。去見她。";
          }
        );
        return;
      }
      if (e.id === "maryb") {
        if (!f.martha) {
          say([{ name: "馬利亞", text: "主啊，你若早在這裡……" }]);
          return;
        }
        say(
          [
            { name: "馬利亞", text: "主啊，你若早在這裡，我兄弟必不死。" },
            { name: "", text: VERSES.wept, ref: "約翰福音 11:35", verse: true },
          ],
          () => {
            f.mary = true;
            state.objective = "到石頭那裡，叫他們挪開。";
          }
        );
        return;
      }
      if (e.id === "stone") {
        if (!f.mary) {
          say([{ name: "", text: "石頭還擋著洞口。馬利亞在哭。" }]);
          return;
        }
        if (f.called) return;
        say(
          [
            { name: "耶穌", text: "你們把石頭挪開。" },
            { name: "馬大", text: VERSES.stench, ref: "約翰福音 11:39", verse: true },
            { name: "耶穌", text: "我不是對你說過，你若信，就必看見神的榮耀嗎？" },
            { name: "耶穌", text: VERSES.comeOut, ref: "約翰福音 11:43", verse: true },
          ],
          () => {
            f.called = true;
            const man = findEnt("lazarus");
            man.alpha = 1;
            state.flash = 0.4;
            state.objective = "看他出來。";
          }
        );
      }
    },
  },
  {
    key: "city",
    title: "聖城",
    ref: "馬太福音 21:1–13",
    intro: "你騎著驢駒進耶路撒冷。眾人鋪衣服，喊和散那。然後你進入聖殿，推倒兌換銀錢之人的桌子。",
    closing: "我的殿必稱為禱告的殿。",
    closingRef: "馬太福音 21:13",
    music: "peace",
    build() {
      const m = createMap(34, 22, ".");
      stroke(m, [[6, 16], [28, 8]], "p", 1);
      m.rect(18, 3, 12, 8, "f");
      m.rect(18, 3, 12, 1, "#");
      m.frame("#");
      state.map = m;
      state.player = asJesus(8, 16, "right");
      state.entities = [
        person({ id: "crowd", name: "眾人", tx: 16, ty: 12, look: "youth", dir: "left" }),
        prop({ kind: "colt", id: "colt", name: "驢駒", tx: 12, ty: 16, talk: true }),
        prop({ kind: "stall", id: "stall0", name: "銀錢桌", tx: 22, ty: 6, talk: true }),
        prop({ kind: "stall", id: "stall1", name: "銀錢桌", tx: 26, ty: 6, talk: true }),
        prop({ kind: "stall", id: "stall2", name: "賣鴿子的", tx: 24, ty: 8, talk: true }),
      ];
      state.flags.tipped = {};
      state.objective = "進聖城。先聽路上的人。";
    },
    onEnter() {
      state.objective = "進聖城。先聽路上的人。";
    },
    refresh() {
      if (state.flags.entered) state.progress = `桌子 ${Object.keys(state.flags.tipped).length}／3`;
    },
    goal() {
      if (!state.flags.entered) return findEnt("crowd");
      return state.entities.find((e) => e.kind === "stall" && !state.flags.tipped[e.id]) || null;
    },
    update(dt) {
      const colt = findEnt("colt");
      if (!colt || !colt.following) return;
      const dx = state.player.x - 18 - colt.x;
      const dy = state.player.y + 14 - colt.y;
      colt.x += dx * Math.min(1, dt * 2);
      colt.y += dy * Math.min(1, dt * 2);
      colt.moving = Math.hypot(dx, dy) > 2;
    },
    talk(e) {
      const f = state.flags;
      if (e.id === "crowd" || e.id === "colt") {
        say(
          [
            { name: "", text: VERSES.colt, ref: "馬太福音 21:5", verse: true },
            { name: "眾人", text: VERSES.hosanna, ref: "馬太福音 21:9", verse: true },
          ],
          () => {
            f.entered = true;
            const colt = findEnt("colt");
            colt.following = true;
            state.objective = "進入聖殿，推倒那些桌子。";
            this.refresh();
          }
        );
        return;
      }
      if (e.kind === "stall") {
        if (!f.entered) {
          say([{ name: "", text: "殿裡滿了兌換銀錢的人。你還沒有進門。" }]);
          return;
        }
        if (f.tipped[e.id]) return;
        e.tipped = true;
        f.tipped[e.id] = true;
        state.shake = 0.25;
        tone(180, 0.08, "square", 0.04);
        this.refresh();
        const n = Object.keys(f.tipped).length;
        if (n >= 3) {
          say(
            [{ name: "耶穌", text: VERSES.housePrayer, ref: "馬太福音 21:13", verse: true }],
            () => completeChapter()
          );
        } else spawnFloat(e.x, e.y - 16, "推倒了");
      }
    },
  },
  {
    key: "gethsemane",
    title: "客西馬尼",
    ref: "馬太福音 26:36–56；約翰福音 18",
    intro: "你們唱了詩，往橄欖山去。你把彼得、雅各、約翰留下，自己走到前頭禱告。三次。然後火把來了。猶大與你親嘴。你說：我就是。",
    closing: "你們拿我如同拿強盜。",
    closingRef: "馬太福音 26:55",
    music: "solemn",
    night: true,
    build() {
      const m = createMap(30, 20, ".");
      scatter(m, ",", 0.15, (ch) => ch === ".");
      m.frame("#");
      state.map = m;
      state.player = asJesus(15, 12, "up");
      state.entities = [
        prop({ kind: "tree", tx: 6, ty: 6, variant: "cypress", solid: true, radius: 3 }),
        prop({ kind: "tree", tx: 24, ty: 5, variant: "cypress", solid: true, radius: 3 }),
        prop({ kind: "tree", tx: 8, ty: 15, variant: "cypress", solid: true, radius: 3 }),
        prop({ kind: "stone", id: "rock", name: "磐石", tx: 15, ty: 6, talk: true }),
        person({ id: "peter", name: "彼得", tx: 13, ty: 14, look: "simon", dir: "up" }),
        person({ id: "james", name: "雅各", tx: 16, ty: 15, look: "james", dir: "up" }),
        person({ id: "john", name: "約翰", tx: 18, ty: 14, look: "john", dir: "up" }),
        person({ id: "judas", name: "加略人猶大", tx: 8, ty: 17, look: "judas", dir: "right", alpha: 0, talk: false }),
        person({ id: "malchus", name: "馬勒古", tx: 22, ty: 17, look: "soldier", dir: "left", alpha: 0, talk: false }),
      ];
      state.flags.prayed = 0;
      state.objective = "走到前頭的磐石那裡禱告。";
    },
    onEnter() {
      state.objective = "走到前頭的磐石那裡禱告。他們會睡著。";
    },
    goal() {
      const f = state.flags;
      if (f.prayed < 3) return findEnt("rock");
      if (!f.kiss) return findEnt("judas");
      if (!f.healed) return findEnt("malchus");
      return null;
    },
    update() {},
    wake() {
      state.flags.prayed += 1;
      ["peter", "james", "john"].forEach((id) => {
        const p = findEnt(id);
        if (p) p.mark = "worry";
      });
      if (state.flags.prayed >= 3) {
        ["judas", "malchus"].forEach((id) => {
          const p = findEnt(id);
          p.alpha = 1;
          p.talk = true;
        });
        state.objective = "火把來了。走到他們面前。";
      } else state.objective = "他們睡著了。再去禱告。";
    },
    talk(e) {
      const f = state.flags;
      if (e.id === "rock") {
        if (f.prayed >= 3) {
          say([{ name: "", text: "禱告已經三次。時候到了。" }]);
          return;
        }
        const lines = [
          { name: "耶穌", text: VERSES.thisCup, ref: "馬太福音 26:39", verse: true },
        ];
        if (f.prayed > 0) lines.push({ name: "耶穌", text: VERSES.watch, ref: "馬太福音 26:40-41", verse: true });
        say(lines, () => this.wake());
        return;
      }
      if (e.id === "peter" || e.id === "james" || e.id === "john") {
        say([{ name: e.name, text: f.prayed ? "……我們的眼睛困倦。" : "主，我們在這裡坐著。" }]);
        return;
      }
      if (e.id === "judas") {
        if (f.prayed < 3) return;
        say(
          [
            { name: "加略人猶大", text: VERSES.hail, ref: "馬太福音 26:49", verse: true },
            { name: "", text: "就與他親嘴。" },
            { name: "耶穌", text: VERSES.iAm, ref: "約翰福音 18:5", verse: true },
            { name: "耶穌", text: "朋友，你來要做的事，就做吧。" },
          ],
          () => {
            f.kiss = true;
            state.objective = "彼得動了刀。去治好那隻耳朵。";
          }
        );
        return;
      }
      if (e.id === "malchus") {
        if (!f.kiss) {
          say([{ name: "馬勒古", text: "火把還沒有靠近。" }]);
          return;
        }
        say(
          [
            { name: "彼得", text: "他砍了大祭司僕人的右耳。" },
            { name: "耶穌", text: VERSES.sheath, ref: "約翰福音 18:11", verse: true },
            { name: "耶穌", text: VERSES.letThem, ref: "路加福音 22:51", verse: true },
            { name: "", text: "耶穌就摸那人的耳朵，把他治好了。" },
            { name: "耶穌", text: "你們帶著刀棒出來拿我，如同拿強盜嗎？但這是你們的時候，黑暗掌權了。" },
          ],
          () => {
            f.healed = true;
            puff(e.x, e.y - 10, "#f2c396", 8, 14);
            completeChapter();
          }
        );
      }
    },
  },
  {
    key: "pilate",
    title: "彼拉多",
    ref: "馬太福音 27；約翰福音 18–19",
    intro: "他們把你帶到總督府。彼拉多問：你是猶太人的王嗎？他查不出罪。眾人卻喊著要釘十字架。兵丁用荊棘編冠冕，戴在你頭上，又鞭打你。",
    closing: "於是彼拉多將耶穌鞭打了，交給人釘十字架。",
    closingRef: "馬太福音 27:26",
    music: "solemn",
    build() {
      const m = createMap(28, 16, "f");
      m.frame("#");
      m.rect(1, 1, 26, 2, "#");
      state.map = m;
      state.player = asJesus(14, 10, "up");
      state.entities = [
        person({ id: "pilate", name: "彼拉多", tx: 14, ty: 5, look: "pilate", dir: "down" }),
        person({ id: "priest", name: "祭司長", tx: 8, ty: 8, look: "elder", dir: "right" }),
        person({ id: "crowd", name: "眾人", tx: 20, ty: 11, look: "worker", dir: "left" }),
        person({ id: "soldier", name: "兵丁", tx: 18, ty: 7, look: "soldier", dir: "left" }),
      ];
      state.objective = "站到彼拉多面前。";
    },
    onEnter() {
      state.objective = "站到彼拉多面前。";
    },
    goal() {
      const f = state.flags;
      if (!f.asked) return findEnt("pilate");
      if (!f.shouted) return findEnt("crowd");
      if (!f.scourged) return findEnt("soldier");
      return findEnt("pilate");
    },
    update() {},
    talk(e) {
      const f = state.flags;
      if (e.id === "pilate") {
        if (!f.asked) {
          say(
            [
              { name: "彼拉多", text: VERSES.king, ref: "馬太福音 27:11", verse: true },
              { name: "耶穌", text: VERSES.youSay, ref: "馬太福音 27:11" },
              { name: "彼拉多", text: VERSES.noFault, ref: "約翰福音 18:38", verse: true },
            ],
            () => {
              f.asked = true;
              state.objective = "聽眾人怎麼喊。";
            }
          );
          return;
        }
        if (!f.scourged) {
          say([{ name: "彼拉多", text: "我仍然查不出他有甚麼罪。你們要我怎麼辦？" }]);
          return;
        }
        say(
          [
            { name: "彼拉多", text: VERSES.behold, ref: "約翰福音 19:5", verse: true },
            { name: "彼拉多", text: VERSES.innocent, ref: "馬太福音 27:24", verse: true },
            { name: "", text: "於是彼拉多將耶穌鞭打了，交給人釘十字架。", ref: "馬太福音 27:26" },
          ],
          () => completeChapter()
        );
        return;
      }
      if (e.id === "priest" || e.id === "crowd") {
        if (!f.asked) {
          say([{ name: e.name, text: "把他釘十字架！總督還沒有問完。" }]);
          return;
        }
        say(
          [{ name: "眾人", text: "把他釘十字架！把他釘十字架！" }],
          () => {
            f.shouted = true;
            state.objective = "兵丁要上來。";
          }
        );
        return;
      }
      if (e.id === "soldier") {
        if (!f.shouted) {
          say([{ name: "兵丁", text: "總督還沒有把你交出來。" }]);
          return;
        }
        say(
          [
            { name: "", text: VERSES.thorns, ref: "約翰福音 19:2", verse: true },
            { name: "兵丁", text: "恭喜，猶太人的王啊！" },
            { name: "", text: "他們用鞭子打他的背。" },
          ],
          () => {
            f.scourged = true;
            state.player.wounds = true;
            state.player.crown = true;
            state.shake = 0.7;
            state.flash = 0.35;
            puff(state.player.x, state.player.y - 8, "#7a2030", 14, 20);
            noise(0.4, 0.12, 180);
            state.objective = "回到彼拉多面前。他要把你交出去。";
          }
        );
      }
    },
  },
  {
    key: "cross",
    title: "各各他",
    ref: "路加福音 23；約翰福音 19；馬太福音 27",
    intro: "他們把十字架放在你肩上。你走向城外的各各他。有一次你跌倒，古利奈人西門把十字架接過去。到了那裡，他們釘你。天暗了。你把話說完。",
    closing: "父啊，我將我的靈魂交在你手裡。",
    closingRef: "路加福音 23:46",
    music: "solemn",
    words: [
      { lines: [{ name: "耶穌", text: VERSES.forgive, ref: "路加福音 23:34", verse: true }] },
      {
        lines: [
          { name: "強盜", text: "你不懼怕神嗎？我們是應該的。這個人沒有做過一件不好的事。" },
          { name: "耶穌", text: VERSES.paradise, ref: "路加福音 23:43", verse: true },
        ],
      },
      {
        lines: [
          { name: "耶穌", text: VERSES.beholdSon, ref: "約翰福音 19:26", verse: true },
          { name: "耶穌", text: VERSES.beholdMother, ref: "約翰福音 19:27", verse: true },
        ],
      },
      {
        dark: true,
        lines: [
          { name: "", text: "從午正到申初，遍地都黑暗了。" },
          { name: "耶穌", text: VERSES.eli, ref: "馬太福音 27:46", verse: true },
          { name: "耶穌", text: VERSES.forsaken, ref: "馬太福音 27:46" },
        ],
      },
      { lines: [{ name: "耶穌", text: VERSES.thirst, ref: "約翰福音 19:28", verse: true }] },
      {
        bow: true,
        lines: [
          { name: "耶穌", text: "成了！", ref: "約翰福音 19:30", verse: VERSES.finished },
          { name: "", text: "耶穌嘗了那醋，就低下頭，將靈魂交付神了。" },
          { name: "耶穌", text: VERSES.intoHands, ref: "路加福音 23:46", verse: true },
        ],
      },
      {
        spear: true,
        lines: [
          { name: "", text: VERSES.spear, ref: "約翰福音 19:34", verse: true },
          { name: "", text: VERSES.buried, ref: "馬太福音 27:59-60", verse: true },
        ],
        done: true,
      },
    ],
    build() {
      const m = createMap(22, 28, ".");
      stroke(m, [[11, 25], [11, 4]], "p", 1);
      m.rect(6, 2, 10, 4, "m");
      m.frame("#");
      state.map = m;
      state.player = asJesus(11, 24, "up");
      state.player.wounds = true;
      state.player.crown = true;
      state.player.carry = true;
      state.entities = [
        person({ id: "women", name: "耶路撒冷的女子", tx: 8, ty: 20, look: "woman", dir: "right" }),
        person({ id: "simon", name: "古利奈人西門", tx: 14, ty: 12, look: "traveler", dir: "left" }),
        person({ id: "soldier", name: "兵丁", tx: 11, ty: 5, look: "soldier", dir: "down" }),
        person({ id: "mary", name: "耶穌的母親", tx: 8, ty: 6, look: "mother", dir: "right" }),
        person({ id: "john", name: "約翰", tx: 14, ty: 6, look: "john", dir: "left" }),
      ];
      state.objective = "背著十字架，往各各他走。";
    },
    onEnter() {
      state.objective = "背著十字架，往各各他走。";
    },
    goal() {
      const f = state.flags;
      if (state.pose === "cross") return null;
      if (!f.wept) return findEnt("women");
      if (!f.simon) return findEnt("simon");
      return findEnt("soldier");
    },
    update() {
      const f = state.flags;
      if (state.pose === "cross" || f.fell || state.dialogue.open) return;
      if (state.player.y < tp(0, 15).y) {
        f.fell = true;
        state.shake = 0.45;
        state.player.carry = true;
        say(
          [
            { name: "", text: "十字架壓下來。你倒在路上。" },
            { name: "", text: "他們就抓住那從鄉下來的西門，把十字架擱在他身上，叫他背著跟隨耶穌。" },
          ],
          () => {
            state.objective = "讓古利奈人西門接過十字架。";
          }
        );
      }
    },
    onCross() {
      if (state.dialogue.open) return;
      const step = this.words[state.crossStep];
      if (!step) return;
      state.crossStep += 1;
      if (step.dark) state.flags.dark = true;
      if (step.bow) state.flags.bow = true;
      if (step.spear) state.flags.spear = true;
      say(step.lines, () => {
        if (step.done) completeChapter();
      });
    },
    talk(e) {
      const f = state.flags;
      if (state.pose === "cross") return;
      if (e.id === "women") {
        say(
          [
            { name: "耶路撒冷的女子", text: "她們為他號咷痛哭。" },
            { name: "耶穌", text: VERSES.women, ref: "路加福音 23:28", verse: true },
          ],
          () => {
            f.wept = true;
            state.objective = "繼續往前。西門在路上。";
          }
        );
        return;
      }
      if (e.id === "simon") {
        if (!f.fell) {
          say([{ name: "古利奈人西門", text: "我從鄉下來，正經過這裡。" }]);
          return;
        }
        say(
          [{ name: "古利奈人西門", text: "把十字架給我。你走在前頭。" }],
          () => {
            f.simon = true;
            state.player.carry = false;
            e.carry = true;
            state.objective = "走到山頂。兵丁在那裡。";
          }
        );
        return;
      }
      if (e.id === "soldier") {
        if (!f.simon) {
          say([{ name: "兵丁", text: "十字架還沒有到。走過來。" }]);
          return;
        }
        say(
          [
            { name: "", text: "他們到了一個地方，名叫各各他，意思就是髑髏地。" },
            { name: "", text: "於是將他釘在十字架上，又拿苦膽調和的酒給他喝。他嘗了，就不肯喝。" },
            { name: "", text: "在他頭以上安一個牌子，寫著：這是猶太人的王耶穌。" },
          ],
          () => {
            state.pose = "cross";
            state.objective = "把話說完。";
            this.onCross();
          }
        );
        return;
      }
      if (e.id === "mary" || e.id === "john") {
        say([{ name: e.name, text: "我們站在十字架旁邊。" }]);
      }
    },
  },
];

MORE.forEach((ch) => CHAPTERS.push(ch));

const LIFE_ORDER = [
  "bethlehem",
  "temple",
  "baptism",
  "wild",
  "nazareth",
  "shore",
  "cana",
  "twelve",
  "heal",
  "mount",
  "storm",
  "sea",
  "field",
  "lazarus",
  "city",
  "supper",
  "gethsemane",
  "pilate",
  "cross",
  "garden",
];

function kickerOf(i) {
  const n = i + 1;
  const d = "一二三四五六七八九";
  if (n === 10) return "第十章";
  if (n < 10) return "第" + d[n - 1] + "章";
  if (n === 20) return "第二十章";
  return "第十" + d[n - 11] + "章";
}

{
  const by = {};
  CHAPTERS.forEach((ch) => {
    by[ch.key] = ch;
  });
  const ordered = LIFE_ORDER.map((k) => by[k]);
  if (ordered.some((ch) => !ch) || ordered.length !== CHAPTERS.length) {
    throw new Error("篇章沒有對上");
  }
  CHAPTERS.splice(0, CHAPTERS.length, ...ordered);
  CHAPTERS.forEach((ch, i) => {
    ch.kicker = kickerOf(i);
  });
}

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
  if (state.pose === "cross") {
    p.moving = false;
    return;
  }
  const a = axis();
  const speed = p.carry ? 48 : 78;
  p.moving = a.x !== 0 || a.y !== 0;
  if (p.moving) {
    if (Math.abs(a.x) > Math.abs(a.y)) p.dir = a.x > 0 ? "right" : "left";
    else p.dir = a.y > 0 ? "down" : "up";
    tryMove(a.x * speed * dt, a.y * speed * dt);
    if (chapterKey() === "shore" && tileAt(p.x, p.y) === "s" && Math.random() < 0.3) {
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
  const key = chapterKey();
  if (state.mode !== "play" || (key !== "sea" && key !== "storm") || state.flags.calm) return;
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

  if (chapterKey() === "shore" || state.mode === "title") {
    for (let i = 0; i < 5; i++) {
      const fx = 40 + i * 70 + Math.sin(state.time * 1.4 + i) * 16;
      const fy = 36 + (i % 2) * 18 + Math.cos(state.time * 1.1 + i) * 6;
      px(fx, fy, 3, 1, "rgba(232,244,248,0.85)");
      px(fx + 1, fy - 1, 1, 1, "rgba(232,244,248,0.85)");
    }
  }

  const drawables = state.entities.filter((e) => e.kind !== "beacon");
  if (state.pose !== "cross") {
    drawables.push({
      kind: "person",
      x: state.player.x,
      y: state.player.y,
      dir: state.player.dir,
      look: state.player.look,
      moving: state.player.moving,
      alpha: 1,
      mark: null,
      wounds: state.player.wounds,
      crown: state.player.crown,
      carry: state.player.carry,
    });
  }
  drawables.sort((a, b) => a.y - b.y);
  for (const e of drawables) drawEntity(e, state.time);

  const j = state.mode === "interlude" ? null : jesus();
  const glow = state.player.look && state.player.look.halo && state.pose !== "cross" ? state.player : j;
  if (glow && glow.alpha !== 0) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const g = ctx.createRadialGradient(glow.x, glow.y - 16, 2, glow.x, glow.y - 16, 34);
    g.addColorStop(0, "rgba(255, 220, 150, 0.45)");
    g.addColorStop(1, "rgba(255, 220, 150, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(glow.x - 36, glow.y - 52, 72, 72);
    ctx.restore();
  }
  ctx.restore();

  const ch = CHAPTERS[state.chapter];
  const room = ch && ch.light === "room";
  if (ch && (ch.night || room) && state.mode !== "title") {
    const sx = state.player.x - camX;
    const sy = state.player.y - camY - 10;
    const px0 = state.player.x - camX;
    const py0 = state.player.y - camY;
    lightCtx.clearRect(0, 0, VIEW_W, VIEW_H);
    const stormNight = chapterKey() === "sea" || chapterKey() === "storm";
    lightCtx.fillStyle = room ? "rgba(42, 22, 12, 0.84)" : stormNight ? "rgba(5, 8, 18, 0.78)" : "rgba(10, 14, 24, 0.5)";
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
    if (room) {
      for (const lamp of state.entities) {
        if (lamp.kind !== "lamp") continue;
        const lx = lamp.x - camX;
        const ly = lamp.y - camY - 10;
        const lg = lightCtx.createRadialGradient(lx, ly, 3, lx, ly, 52);
        lg.addColorStop(0, "rgba(0,0,0,0.92)");
        lg.addColorStop(0.6, "rgba(0,0,0,0.4)");
        lg.addColorStop(1, "rgba(0,0,0,0)");
        lightCtx.fillStyle = lg;
        lightCtx.fillRect(lx - 56, ly - 56, 112, 112);
      }
    }
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

    if (!room && stormNight && !state.flags.calm) {
    ctx.strokeStyle = "rgba(210,225,235,0.35)";
    for (let i = 0; i < 36; i++) {
      const rx = ((i * 97 + state.time * 140) % (VIEW_W + 20)) - 10;
      const ry = (i * 53) % VIEW_H;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 3, ry + 7);
      ctx.stroke();
    }
    }
  } else if (chapterKey() === "garden" && state.mode !== "title") {
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

  if (chapterKey() === "shore" || state.mode === "title") {
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
  if (state.pose === "cross") drawCrucifixion(state.time);
  ctx.restore();
}

function drawCrucifixion(time) {
  const dark = state.flags.dark ? 1 : 0;
  ctx.fillStyle = dark ? "#100e14" : "#6a5348";
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  if (!dark) {
    const sky = ctx.createLinearGradient(0, 0, 0, 90);
    sky.addColorStop(0, "#8a6a62");
    sky.addColorStop(1, "#c4a090");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, VIEW_W, 78);
  } else {
    ctx.fillStyle = "#1a1420";
    ctx.fillRect(0, 0, VIEW_W, 78);
  }
  ctx.fillStyle = dark ? "#1c1614" : "#5a4638";
  ctx.beginPath();
  ctx.moveTo(0, 150);
  ctx.lineTo(70, 118);
  ctx.lineTo(160, 132);
  ctx.lineTo(250, 110);
  ctx.lineTo(320, 128);
  ctx.lineTo(320, 192);
  ctx.lineTo(0, 192);
  ctx.fill();

  function crossAt(x, y, h, him) {
    ctx.fillStyle = "#4a3424";
    ctx.fillRect(x, y - h, 4, h + 18);
    ctx.fillRect(x - 16, y - h + 18, 36, 4);
    if (!him) {
      ctx.fillStyle = "#6a5344";
      ctx.fillRect(x - 3, y - h + 22, 10, 16);
      ctx.fillRect(x - 8, y - h + 26, 5, 3);
      ctx.fillRect(x + 7, y - h + 26, 5, 3);
      return;
    }
    const bow = state.flags.bow ? 6 : 0;
    ctx.fillStyle = "#f2c396";
    ctx.fillRect(x - 3, y - h + 20 + bow, 10, 8);
    ctx.fillStyle = "#5a3820";
    ctx.fillRect(x - 4, y - h + 18 + bow, 12, 4);
    ctx.fillStyle = "#5a3a22";
    ctx.fillRect(x - 5, y - h + 17 + bow, 14, 2);
    ctx.fillStyle = "#8c2f2f";
    ctx.fillRect(x - 3, y - h + 18 + bow, 2, 2);
    ctx.fillRect(x + 4, y - h + 19 + bow, 2, 2);
    ctx.fillStyle = "#f7f3ea";
    ctx.fillRect(x - 4, y - h + 36, 12, 10);
    ctx.fillStyle = "#e4d9c6";
    ctx.fillRect(x - 3, y - h + 44, 10, 18);
    ctx.fillStyle = "#c4a574";
    ctx.fillRect(x - 4, y - h + 58, 12, 6);
    ctx.fillStyle = "#f2c396";
    ctx.fillRect(x - 18, y - h + 20, 14, 3);
    ctx.fillRect(x + 8, y - h + 20, 14, 3);
    ctx.fillRect(x - 2, y - h + 62, 3, 12);
    ctx.fillRect(x + 3, y - h + 62, 3, 12);
    ctx.fillStyle = "#6a1824";
    ctx.fillRect(x - 17, y - h + 19, 3, 3);
    ctx.fillRect(x + 18, y - h + 19, 3, 3);
    ctx.fillRect(x, y - h + 72, 4, 3);
    if (state.flags.spear) {
      ctx.fillStyle = "#6a1824";
      ctx.fillRect(x + 6, y - h + 40, 4, 3);
      ctx.fillRect(x + 8, y - h + 43, 2, 8);
      ctx.fillStyle = "#d8e4ea";
      ctx.fillRect(x + 10, y - h + 44, 2, 6);
      ctx.fillStyle = "#c0c6cc";
      ctx.fillRect(x + 28, y - h + 8, 2, 70);
      ctx.fillRect(x + 24, y - h + 8, 8, 3);
    }
  }

  crossAt(78, 128, 78, false);
  crossAt(228, 124, 74, false);
  crossAt(152, 136, 96, true);

  ctx.fillStyle = "#e6d3a4";
  ctx.fillRect(138, 28, 32, 12);
  ctx.fillStyle = "#241910";
  ctx.fillRect(141, 31, 26, 2);
  ctx.fillRect(141, 35, 20, 2);

  ctx.fillStyle = "#3f5278";
  ctx.fillRect(96, 142, 8, 14);
  ctx.fillStyle = "#4e8a78";
  ctx.fillRect(108, 144, 8, 14);
  ctx.fillStyle = "#6a3030";
  ctx.fillRect(214, 146, 8, 14);
  ctx.fillStyle = "#4e2222";
  ctx.fillRect(226, 148, 8, 12);

  if (dark) {
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  }
  void time;
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
    $("role").textContent = state.roleName ? "你是" + state.roleName : "";
    $("role").classList.toggle("hidden", !state.roleName);
    $("objective").textContent = state.dialogue.open ? "" : state.objective;
    $("progress").textContent = state.progress;
    $("progress").classList.toggle("hidden", !state.progress);
    $("held").textContent = state.held;
    $("held").classList.toggle("hidden", !state.held);
    const sea = chapterKey() === "sea";
    $("faith").classList.toggle("hidden", !sea);
    $("wind").classList.toggle("hidden", !sea);
    if (sea) {
      $("faith-fill").style.width = clamp(state.faith, 0, 100) + "%";
      const label = $("faith").querySelector("span");
      if (label) label.textContent = "信心";
    }
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
    const who =
      line && line.name === "耶穌"
        ? "jesus"
        : line && (line.name === "你" || line.name === state.roleName)
          ? "you"
          : line && line.name
            ? "npc"
            : "narr";
    $("d-name").className = "who-" + who;
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
    <div class="sub">四福音書裡的一生</div>
    <h1>跟隨</h1>
    <p class="verse" style="text-align:center">耶穌說：「${VERSES.way}」</p>
    <p class="ref">約翰福音 14:6</p>
    <div class="rule"></div>
    <p style="text-align:center">每一章，你扮演這段記載裡該走的那個人。<br/>方向鍵或 WASD 移動。空白鍵、E 或 Enter 說話。</p>
    <div class="row">
      <button class="btn primary" data-act="start" data-primary>開始行走</button>
      <button class="btn" data-act="select">選擇篇章</button>
    </div>
    <p class="note">本遊戲依據四福音書的記載而作，經文引自和合本。<br/>從伯利恆到各各他，再到清晨。它並不取代聖經本身。</p>
  `);
}

function renderSelect() {
  state.screen = "select";
  const buttons = CHAPTERS.map(
    (ch, i) => `<button class="btn" data-act="chapter" data-arg="${i}">${ch.kicker}　${ch.title}<br/><span class="ref">${ch.ref}　·　你是${ch.who || "耶穌"}</span></button>`
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
    <h2>我就是</h2>
    <p class="verse" style="text-align:center">「${VERSES.commission}」</p>
    <p class="ref">馬太福音 28:18–19</p>
    <div class="rule"></div>
    <p>從馬槽到聖殿，從約旦河到曠野，從海上到席間，再到各各他與清晨的園子。每一章，你走進這段記載裡該在場的那個人。</p>
    <p class="verse" style="text-align:center">「${VERSES.way}」</p>
    <p class="ref">約翰福音 14:6</p>
    <div class="rule"></div>
    <p class="ref" style="text-align:left">這一程收下的話</p>
    ${items || "<p>這一程的話，還在風裡。</p>"}
    <div class="row">
      <button class="btn primary" data-act="title" data-primary>從伯利恆再走一次</button>
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
    ${items || "<p>這一程還沒有收下經文。話會留在你開口的地方。</p>"}
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
  const shore = CHAPTERS.findIndex((c) => c.key === "shore");
  loadChapter(shore < 0 ? 0 : shore);
  state.mode = "title";
  state.screen = "title";
  setMusic("peace");
  renderTitle();
}

function openChapter(index) {
  loadChapter(index);
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
    if (CHAPTERS[state.chapter].toInterlude) {
      state.interludeStep = 0;
      setMusic("solemn");
      renderInterlude();
    } else openChapter(state.chapter + 1);
  } else if (act === "interlude-next") {
    state.interludeStep = Math.min(INTERLUDE.length - 1, state.interludeStep + 1);
    renderInterlude();
  } else if (act === "garden") openChapter(CHAPTERS.findIndex((c) => c.key === "garden"));
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
      else if (state.mode === "play" && state.pose === "cross") {
        const ch = CHAPTERS[state.chapter];
        if (ch.onCross) ch.onCross();
      } else if (state.mode === "play") {
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
