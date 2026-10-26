import { mountGame, pen, resizeView, startLoop } from "./render/pixi.js";
import { getLanguage, onLanguageChange, text, toggleLanguage } from "./lang.js";
import splashUrl from "../assets/hagia-sophia-christ.jpg";

const TILE = 16;
const DESIGN_W = 320;
const DESIGN_H = 192;
let viewW = DESIGN_W;
let viewH = DESIGN_H;

let canvas = null;

const lightCanvas = document.createElement("canvas");
lightCanvas.width = viewW;
lightCanvas.height = viewH;
const lightCtx = lightCanvas.getContext("2d");

let CHAPTERS = [];
let VERSES = {};
let INTERLUDE = [];

export function bindContent(content) {
  CHAPTERS = content.CHAPTERS;
  VERSES = content.VERSES;
  INTERLUDE = content.INTERLUDE;
}

export async function initRenderer() {
  canvas = await mountGame(document.getElementById("game"));
  pen.attachLight(lightCanvas);
}

const $ = (id) => document.getElementById(id);
const frame = $("frame");
const tagEl = $("tag");
const floatsEl = $("floats");
const hudEl = $("hud");
const dialogueEl = $("dialogue");
const screenEl = $("screen");
const splashArt = $("splash-art");
const splashCtx = splashArt.getContext("2d");
const splashImage = new Image();
splashImage.onload = () => {
  if (state.mode === "splash") drawSplash();
};

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

const keys = new Set();
const hold = { up: false, down: false, left: false, right: false };
const input = { confirmEdge: false };

export const state = {
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

export function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

export function dist(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

export function tp(tx, ty) {
  return { x: tx * TILE + TILE / 2, y: ty * TILE + TILE / 2 };
}

export function createMap(w, h, fill) {
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

export function stroke(map, pts, ch, rad) {
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

export function scatter(map, ch, rate, allowed) {
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

export const LOOKS = {
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
    robe: "#d7e2bc",
    robeS: "#b7c896",
    robeD: "#8aaa78",
    skin: "#e8b88a",
    skinS: "#d79a68",
    hair: "#3a2414",
    hairD: "#24160c",
    beard: true,
    armor: true,
    helmet: true,
  }),
  roman: look({
    robe: "#a67c52",
    robeS: "#8a6844",
    robeD: "#6b4224",
    skin: "#e8b88a",
    skinS: "#d79a68",
    hair: "#3a2414",
    hairD: "#24160c",
    beard: true,
    armor: true,
    helmet: true,
    crest: true,
    cloak: "#a33b34",
  }),
  priest: look({
    robe: "#c5ced8",
    robeS: "#a8b4c2",
    robeD: "#6e7c8c",
    veil: "#f7f4ee",
    hair: "#d9d3c8",
    hairD: "#8a847a",
    beard: true,
    stripes: "#243044",
  }),
  pilate: look({
    robe: "#f7f4ee",
    robeS: "#e7e0d4",
    robeD: "#cfc6b8",
    skin: "#e8c4a0",
    skinS: "#d7a878",
    hair: "#6a5038",
    hairD: "#3a2818",
    laurel: true,
    scale: 1.12,
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
    wings: true,
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

export function asRole(tx, ty, dir, role) {
  const roles = {
    jesus: { look: LOOKS.jesus, name: "jesus" },
    child: { look: LOOKS.child, name: "the_boy_jesus" },
    joseph: { look: LOOKS.elder, name: "joseph" },
    servant: { look: LOOKS.worker, name: "servant" },
    peter: { look: LOOKS.simon, name: "peter" },
    simon: { look: LOOKS.simon, name: "simon" },
    john: { look: LOOKS.john, name: "john" },
    mary: { look: LOOKS.mary, name: "mary_magdalene" },
    mother: { look: LOOKS.mother, name: "mary" },
    angel: { look: LOOKS.angel, name: "angel" },
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

export function asJesus(tx, ty, dir, young) {
  return asRole(tx, ty, dir, young ? "child" : "jesus");
}

export function person(def) {
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

export function prop(def) {
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
  $("btn-mute").textContent = muted ? text("unmute") : text("mute");
  try {
    localStorage.setItem("follow-mute", muted ? "1" : "0");
  } catch (err) {
    /* ignore */
  }
}

export function tone(freq, dur, type, gain, slide) {
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

export function noise(dur, gain, freq) {
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

export function chime() {
  [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tone(f, 0.22, "triangle", 0.045), i * 90));
}

export function appearSound() {
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

function lineBody(line) {
  return line ? text(line.text) : "";
}

function recordVerse(ref, line) {
  if (!ref || !line || state.journal.some((v) => v.ref === ref)) return;
  state.journal.push({ ref, text: line });
  const btn = $("btn-journal");
  btn.textContent = text("journal") + " " + state.journal.length;
  btn.classList.remove("pulse");
  void btn.offsetWidth;
  btn.classList.add("pulse");
}

export function say(lines, onDone) {
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
  if (d.prog < lineBody(line).length) {
    d.prog = lineBody(line).length;
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
  const speed = reduceMotion ? 400 : getLanguage() === "en" ? 36 : 18;
  d.prog += dt * speed;
  if (d.prog > lineBody(line).length && line.ref) recordVerse(line.ref, lineVerse(line));
}

/* ------------------------------ particles / floats ------------------------------ */

export function puff(x, y, color, n, speed) {
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

export function spawnFloat(x, y, raw) {
  const el = document.createElement("div");
  el.className = "float";
  el.textContent = text(raw);
  floatsEl.appendChild(el);
  state.floats.push({ el, x, y, life: 1.5, max: 1.5, raw });
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
  pen.fillStyle = color;
  pen.fillRect(x | 0, y | 0, w, h);
}

function drawShadow(yOff) {
  pen.fillStyle = "rgba(24,18,12,0.32)";
  px(-5, -2 + (yOff || 0), 10, 2, "rgba(24,18,12,0.32)");
  px(-3, 0 + (yOff || 0), 6, 1, "rgba(24,18,12,0.22)");
}

function drawFallen(e) {
  const L = e.look;
  pen.save();
  pen.globalAlpha = e.alpha == null ? 1 : e.alpha;
  pen.translate(Math.round(e.x), Math.round(e.y));
  px(-10, -1, 14, 5, L.robeD);
  px(-9, 0, 11, 3, L.robe);
  if (L.cloak) px(-10, -2, 6, 3, L.cloak);
  if (L.armor) px(-6, 0, 6, 3, "#c4844a");
  px(4, -3, 6, 5, L.skin);
  px(4, -4, 6, 2, L.hair);
  px(-3, 3, 3, 2, L.robeD);
  px(1, 3, 3, 2, L.skinS || L.skin);
  if (L.helmet) {
    px(3, -5, 7, 3, "#c4a574");
    px(5, -8, 2, 3, L.crest ? "#c43232" : "#8c2f2f");
  }
  pen.restore();
}

function drawPerson(e, time) {
  if (e.fallen) {
    drawFallen(e);
    return;
  }
  const L = e.look;
  const sc = L.scale || 1;
  const step = e.moving ? Math.floor(time * 8) % 2 : 0;
  const bob = e.moving ? step : Math.floor(time * 1.2) % 2 === 0 ? 0 : 0;
  pen.save();
  pen.globalAlpha = e.alpha == null ? 1 : e.alpha;
  pen.translate(Math.round(e.x), Math.round(e.y + bob));
  pen.scale((e.dir === "left" ? -1 : 1) * sc, sc);
  if (e.throne) drawThrone();
  else if (e.chair) drawChair(e.dir === "left" ? "right" : e.dir);
  if (!e.noShadow) drawShadow(0);
  if (L.wings) {
    px(-14, -18, 7, 10, "#f7f4ee");
    px(-16, -15, 4, 6, "#e4ddd0");
    px(-12, -22, 5, 4, "#fffdf8");
    px(7, -18, 7, 10, "#f7f4ee");
    px(12, -15, 4, 6, "#e4ddd0");
    px(7, -22, 5, 4, "#fffdf8");
  }

  if (e.seated) {
    px(-6, -8, 12, 5, L.robeD);
    px(-5, -7, 10, 3, L.robe);
  } else {
    const leg = step ? 1 : 0;
    px(-4, -7, 3, 6, L.robeD);
    px(1, -7 + leg, 3, 6 - leg, L.robeD);
    px(-3, -6, 2, 4, L.robeS);
    px(2, -6 + leg, 2, 4, L.robeS);
  }

  px(-6, -16, 12, 11, L.robeD);
  px(-5, -15, 10, 8, L.robe);
  px(-5, -12, 10, 3, L.robeS);
  if (L.sash) px(-5, -11, 10, 2, L.sash);
  if (e.throne) {
    px(-7, -16, 14, 10, "#a33b34");
    px(-5, -15, 6, 6, "#f7f4ee");
    px(-4, -14, 4, 4, "#fffdf8");
    px(-1, -15, 2, 2, "#e6c86a");
    px(-8, -8, 16, 5, "#8c2f2f");
    px(-6, -7, 12, 2, "#c45050");
    px(-11, -13, 3, 7, "#5a3820");
    px(8, -13, 3, 7, "#5a3820");
    px(-11, -14, 3, 2, "#e6c86a");
    px(8, -14, 3, 2, "#e6c86a");
  }
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
  if (L.laurel) {
    px(-5, hy - 2, 10, 2, "#c4a84a");
    px(-5, hy - 1, 2, 3, "#e6c86a");
    px(3, hy - 1, 2, 3, "#e6c86a");
    px(-3, hy - 3, 2, 2, "#d4b85a");
    px(1, hy - 3, 2, 2, "#e6c86a");
  }

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
  if (e.holdInfant) {
    px(1, -9, 8, 2, L.robeS);
    px(2, -16, 11, 8, "#f7f4ee");
    px(3, -15, 9, 5, "#e4ddd0");
    px(4, -20, 7, 5, "#f2c396");
    px(3, -21, 8, 2, "#f7f4ee");
    px(6, -18, 1, 1, "#3a2416");
    px(8, -18, 1, 1, "#3a2416");
    px(5, -23, 6, 1, "#ffe7a0");
    px(4, -22, 1, 2, "#f0c84b");
    px(10, -22, 1, 2, "#f0c84b");
  }

  if (e.mark === "worry") {
    px(-2, hy - 6, 2, 2, "#9aa4b0");
    px(1, hy - 8, 2, 2, "#c5ced6");
    px(3, hy - 5, 1, 1, "#9aa4b0");
  } else if (e.mark === "anger") {
    px(-3, hy - 7, 2, 2, "#a33b34");
    px(1, hy - 8, 2, 2, "#8c2f2f");
    px(3, hy - 5, 1, 1, "#a33b34");
  } else if (e.mark === "hungry") {
    px(-3, hy - 6, 6, 2, "#6e5438");
    px(-2, hy - 7, 4, 1, "#c4a574");
  } else if (e.mark === "peace") {
    px(-1, hy - 6, 2, 2, "#f0c84b");
  }

  if (L.halo) {
    const pulse = 0.75 + 0.25 * Math.sin(time * 3);
    pen.globalAlpha *= pulse;
    const hy2 = hy - 5;
    px(-3, hy2, 1, 1, "#f0c84b");
    px(-2, hy2 - 1, 4, 1, "#ffe7a0");
    px(2, hy2, 1, 1, "#f0c84b");
    px(-4, hy2 + 1, 1, 2, "#f0c84b");
    px(3, hy2 + 1, 1, 2, "#f0c84b");
    px(-2, hy2 + 3, 1, 1, "#f0c84b");
    px(1, hy2 + 3, 1, 1, "#ffe7a0");
  }

  if (L.cloak) {
    px(-8, -17, 3, 16, L.cloak);
    px(-7, -6, 2, 7, "#7a2428");
    px(-6, -17, 4, 3, L.cloak);
    px(3, -17, 4, 3, "#8c2f2f");
  }
  if (L.armor) {
    px(-5, -16, 10, 6, "#7a4e2c");
    px(-4, -15, 8, 4, "#c4844a");
    px(-2, -14, 4, 2, L.cloak ? "#e6c2a0" : "#e6d3a4");
    px(-6, -16, 2, 3, "#5a3820");
    px(4, -16, 2, 3, "#5a3820");
    px(-5, -11, 10, 4, "#6b4224");
    px(-5, -11, 1, 4, "#c4a574");
    px(-2, -11, 1, 4, "#e6d3a4");
    px(1, -11, 1, 4, "#c4a574");
    px(4, -11, 1, 4, "#e6d3a4");
    if (L.cloak) {
      px(-5, -8, 2, 2, "#a33b34");
      px(-1, -8, 2, 2, "#a33b34");
      px(3, -8, 2, 2, "#a33b34");
    }
    px(-4, -7, 3, 5, L.skin);
    px(1, -7, 3, 5, L.skinS);
    px(-4, -2, 3, 2, "#5a4030");
    px(1, -2, 3, 2, "#3a2818");
  }
  if (L.helmet) {
    px(-5, hy - 3, 10, 5, "#c4a574");
    px(-4, hy - 4, 8, 2, "#e6d3a4");
    px(-5, hy + 1, 10, 2, "#8a6840");
    if (L.crest) {
      px(-1, hy - 9, 2, 6, "#c43232");
      px(-2, hy - 8, 4, 3, "#8c2f2f");
    } else px(-1, hy - 5, 2, 2, "#8c2f2f");
    if (e.dir !== "up") {
      px(-5, hy + 3, 2, 2, "#a67c52");
      px(3, hy + 3, 2, 2, "#a67c52");
    }
  }
  if (L.stripes) {
    px(-6, -16, 12, 9, "#f7f4ee");
    px(-7, -15, 2, 8, "#f3efe6");
    px(5, -15, 2, 8, "#e4ddd0");
    px(-6, -15, 12, 1, L.stripes);
    px(-6, -13, 12, 1, L.stripes);
    px(-6, -11, 12, 1, L.stripes);
    px(-6, -9, 12, 1, "#6a7c92");
  }
  if (e.torch) {
    const flick = Math.floor(time * 7) % 2;
    px(5, -20, 1, 14, "#5a3820");
    px(4, -21, 1, 3, "#6b4224");
    px(3, -28 - flick, 5, 4, "#e07020");
    px(4, -30 - flick, 3, 3, "#f0c14a");
    px(5, -31 - flick, 1, 2, "#fff4d2");
  }
  if (e.spear && e.dir === "up") {
    px(-1, -36, 2, 20, "#d5dde2");
    px(-3, -38, 6, 2, "#f4f7f8");
  }
  if (e.sword && e.dir !== "up") {
    px(3, -14, 5, 1, "#2a2118");
    px(4, -13, 2, 2, "#5a4030");
    px(5, -25, 2, 12, "#f4f1ea");
    px(5, -26, 2, 2, "#fffdf8");
    px(4, -16, 1, 3, "#c4c8cc");
  }
  if (e.chain && e.dir !== "up") {
    px(3, -12, 2, 1, "#d7dbe0");
    px(5, -11, 2, 1, "#8a9098");
    px(6, -10, 2, 1, "#d7dbe0");
    px(7, -9, 2, 1, "#5c646c");
  }

  pen.restore();

  if (e.spear && e.dir === "left") {
    const x = Math.round(e.x);
    const y = Math.round(e.y);
    const shaft = [
      [0, -12],
      [-2, -16],
      [-4, -20],
      [-6, -24],
      [-8, -28],
      [-10, -32],
      [-12, -36],
      [-14, -40],
    ];
    for (const [ox, oy] of shaft) px(x + ox, y + oy, 3, 3, "#e7eef2");
    px(x - 16, y - 42, 5, 3, "#f7fbfc");
    px(x - 2, y - 14, 3, 3, "#c4a574");
  }

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

function drawStone(x, y, big) {
  x = Math.round(x);
  y = Math.round(y - (big ? 10 : 6));
  const r = big ? 11 : 7;
  const rim = big ? 78 : 30;
  for (let j = -r; j <= r; j++) {
    for (let i = -r; i <= r; i++) {
      const d = i * i + j * j;
      if (d <= r * r && d >= rim) px(x + i, y + j, 1, 1, big ? "#6e675e" : "#8a8378");
      else if (d < rim) px(x + i, y + j, 1, 1, big ? "#a39e94" : "#b7b1a6");
    }
  }
  px(x - 3, y - 1, 6, 2, "#6e675e");
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
    pen.fillStyle = h > 0.55 ? "#74a24c" : "#87b25c";
    pen.fillRect(px0, py0, 16, 16);
    pen.fillStyle = "#5e8a3c";
    pen.fillRect(px0 + 2, py0 + 4 + ((h * 5) | 0), 1, 2);
    pen.fillRect(px0 + 9, py0 + 8, 1, 3);
    pen.fillRect(px0 + 13, py0 + 3, 1, 2);
    if (h > 0.82) {
      pen.fillStyle = "#9bc46a";
      pen.fillRect(px0 + 6, py0 + 11, 2, 1);
    }
    if (ch === ",") {
      const colors = ["#f0d56a", "#e07a72", "#f4f0e4", "#d7e4a8"];
      pen.fillStyle = colors[(h * 4) | 0];
      pen.fillRect(px0 + 5, py0 + 6, 2, 2);
      pen.fillStyle = "#3e6a32";
      pen.fillRect(px0 + 6, py0 + 8, 1, 2);
    }
  } else if (ch === "p") {
    pen.fillStyle = h > 0.5 ? "#c4a36e" : "#b89562";
    pen.fillRect(px0, py0, 16, 16);
    pen.fillStyle = "#a68455";
    pen.fillRect(px0 + 2, py0 + 3, 2, 1);
    pen.fillRect(px0 + 8, py0 + 10, 3, 1);
    pen.fillStyle = "#d8c090";
    pen.fillRect(px0 + 11, py0 + 5, 1, 1);
  } else if (ch === "m") {
    pen.fillStyle = h > 0.5 ? "#8d9274" : "#7e8464";
    pen.fillRect(px0, py0, 16, 16);
    pen.fillStyle = "#6a7054";
    pen.fillRect(px0 + 3, py0 + 4, 3, 2);
    pen.fillRect(px0 + 10, py0 + 9, 2, 2);
  } else if (ch === "s") {
    pen.fillStyle = h > 0.6 ? "#e6d2a2" : "#dcc496";
    pen.fillRect(px0, py0, 16, 16);
    pen.fillStyle = "rgba(180,140,80,0.35)";
    pen.fillRect(px0 + ((h * 10) | 0), py0 + 6, 2, 1);
    const up = state.map.rows[y - 1] && state.map.rows[y - 1][x];
    if (up === "w" || up === "d") {
      pen.fillStyle = "#cbb888";
      pen.fillRect(px0, py0, 16, 4);
      pen.fillStyle = wave ? "#f7fbfb" : "#d5ebe8";
      pen.fillRect(px0 + 2, py0 + 1, 4, 1);
      pen.fillRect(px0 + 9, py0 + 2, 5, 1);
    }
  } else if (ch === "d" || ch === "w" || ch === "n" || ch === "l") {
    const deep = ch === "d" || ch === "n";
    pen.fillStyle = deep ? (wave ? "#164868" : "#1b5274") : wave ? "#2a7498" : "#3284ac";
    if (ch === "n") pen.fillStyle = wave ? "#12344e" : "#173e5c";
    pen.fillRect(px0, py0, 16, 16);
    pen.fillStyle = deep ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.28)";
    if (ch === "n") pen.fillStyle = "rgba(180,210,230,0.16)";
    pen.fillRect(px0 + 2 + wave * 3, py0 + 5, 6, 1);
    pen.fillRect(px0 + 8, py0 + 11 - wave, 5, 1);
    if (ch === "w") {
      pen.fillStyle = "rgba(232, 214, 170, 0.18)";
      pen.fillRect(px0, py0 + 12, 16, 4);
    }
    if (ch === "l") {
      const glow = 0.78 + 0.22 * Math.sin(time * 3 + x * 0.7 + y);
      pen.fillStyle = `rgba(255, 168, 40, ${glow})`;
      pen.fillRect(px0 + 1, py0 + 1, 14, 14);
      pen.fillStyle = "rgba(255, 244, 210, 0.95)";
      pen.fillRect(px0 + 3 + wave, py0 + 6, 4, 1);
      pen.fillRect(px0 + 8, py0 + 10, 3, 1);
    }
  } else if (ch === "b" || ch === "=") {
    pen.fillStyle = ch === "b" ? "#a56b38" : "#8d5a30";
    pen.fillRect(px0, py0, 16, 16);
    pen.fillStyle = "#c48a52";
    pen.fillRect(px0, py0 + 3, 16, 1);
    pen.fillRect(px0, py0 + 8, 16, 1);
    pen.fillRect(px0, py0 + 13, 16, 1);
    pen.fillStyle = "#6e4122";
    const row = state.map.rows[y];
    const left = row[x - 1];
    const right = row[x + 1];
    const up = state.map.rows[y - 1] && state.map.rows[y - 1][x];
    const down = state.map.rows[y + 1] && state.map.rows[y + 1][x];
    if (left !== "b" && left !== "=") pen.fillRect(px0, py0, 2, 16);
    if (right !== "b" && right !== "=") pen.fillRect(px0 + 14, py0, 2, 16);
    if (up !== "b" && up !== "=") pen.fillRect(px0, py0, 16, 2);
    if (down !== "b" && down !== "=") pen.fillRect(px0, py0 + 14, 16, 2);
  } else if (ch === "r" || ch === "T") {
    pen.fillStyle = ch === "T" ? (h > 0.5 ? "#6a645c" : "#5c564e") : "#8e877c";
    pen.fillRect(px0, py0, 16, 16);
    pen.fillStyle = ch === "T" ? "#3e3a36" : "#6e675e";
    pen.fillRect(px0 + 1, py0 + 2, 6, 5);
    pen.fillRect(px0 + 8, py0 + 8, 6, 5);
    pen.fillStyle = ch === "T" ? "#8a847c" : "#c2bbb0";
    pen.fillRect(px0 + 2, py0 + 3, 2, 1);
  } else if (ch === "o") {
    pen.fillStyle = "#141218";
    pen.fillRect(px0, py0, 16, 16);
    pen.fillStyle = "rgba(90,80,70,0.25)";
    pen.fillRect(px0 + 2, py0 + 4, 3, 2);
    pen.fillRect(px0 + 10, py0 + 9, 2, 2);
  } else if (ch === "f") {
    pen.fillStyle = h > 0.55 ? "#cbb89a" : "#bba888";
    pen.fillRect(px0, py0, 16, 16);
    pen.fillStyle = "rgba(90,70,48,0.28)";
    pen.fillRect(px0, py0, 16, 1);
    pen.fillRect(px0, py0, 1, 16);
  } else if (ch === "#") {
    pen.fillStyle = "#1c1612";
    pen.fillRect(px0, py0, 16, 16);
    if (h > 0.7) {
      pen.fillStyle = "#2a221c";
      pen.fillRect(px0 + 4, py0 + 5, 3, 2);
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

function drawThrone() {
  px(-18, 4, 36, 3, "#4a3018");
  px(-15, 1, 30, 4, "#6b4224");
  px(-12, -2, 24, 4, "#8a5a32");
  px(-9, -1, 18, 2, "#a33b34");
  px(-6, -1, 6, 1, "#c45050");
  px(-10, -28, 3, 18, "#4a3018");
  px(7, -28, 3, 18, "#4a3018");
  px(-10, -28, 20, 3, "#6b4224");
  px(-7, -25, 14, 12, "#3a2414");
  px(-11, -30, 3, 3, "#e6c86a");
  px(8, -30, 3, 3, "#e6c86a");
  px(-9, -20, 1, 1, "#e6c86a");
  px(8, -20, 1, 1, "#e6c86a");
  px(-8, -11, 16, 3, "#8c2f2f");
}

function drawChair(dir) {
  const wood = "#6b4224";
  const seat = "#8a5a32";
  const dark = "#5a3820";
  if (dir === "down") {
    px(-8, -28, 16, 3, wood);
    px(-8, -28, 2, 14, dark);
    px(6, -28, 2, 14, dark);
    px(-7, -8, 14, 3, seat);
    px(-7, -5, 2, 5, dark);
    px(5, -5, 2, 5, dark);
  } else if (dir === "up") {
    px(-8, -2, 16, 3, wood);
    px(-8, -12, 2, 13, dark);
    px(6, -12, 2, 13, dark);
    px(-7, -11, 14, 3, seat);
    px(-7, 0, 2, 4, dark);
    px(5, 0, 2, 4, dark);
  } else {
    px(-12, -22, 3, 16, wood);
    px(-12, -22, 6, 3, dark);
    px(-7, -8, 14, 3, seat);
    px(-5, -5, 2, 5, dark);
    px(5, -5, 2, 5, dark);
  }
}

function drawTable(e) {
  const x = Math.round(e.x);
  const y = Math.round(e.y);
  px(x - 76, y - 26, 152, 38, "#6e4122");
  px(x - 72, y - 24, 144, 32, "#a56b38");
  px(x - 72, y - 24, 144, 2, "#c48a52");
  px(x - 70, y + 10, 4, 6, "#5a381c");
  px(x - 24, y + 10, 4, 6, "#5a381c");
  px(x + 20, y + 10, 4, 6, "#5a381c");
  px(x + 66, y + 10, 4, 6, "#5a381c");
  px(x - 52, y - 18, 24, 10, "#c4a574");
  px(x - 50, y - 20, 20, 4, "#e6d3a4");
  px(x - 46, y - 22, 12, 6, "#8d4a32");
  px(x - 38, y - 14, 4, 3, "#6a8a3a");
  px(x - 48, y - 13, 3, 2, "#5e7a32");
  if (state.flags.meal) {
    px(x - 22, y - 18, 8, 6, "#e2b85a");
    px(x - 20, y - 20, 5, 3, "#f0d48a");
    px(x - 10, y - 15, 8, 5, "#f0d48a");
    px(x - 8, y - 17, 4, 2, "#fff0c4");
  } else {
    px(x - 20, y - 18, 16, 7, "#e2b85a");
    px(x - 18, y - 21, 12, 4, "#f0d48a");
    px(x - 14, y - 22, 6, 2, "#fff0c4");
  }
  px(x + 4, y - 14, 14, 6, "#e2b85a");
  px(x + 6, y - 16, 10, 3, "#f0d48a");
  px(x + 8, y - 17, 6, 2, "#fff0c4");
  px(x + 26, y - 22, 8, 3, "#e6d3a4");
  px(x + 27, y - 20, 6, 5, "#7a2430");
  px(x + 29, y - 15, 2, 3, "#c4a574");
  px(x + 26, y - 12, 8, 2, "#e6d3a4");
  px(x + 42, y - 26, 12, 14, "#6e4122");
  px(x + 44, y - 24, 8, 7, "#7a2430");
  px(x + 52, y - 20, 4, 3, "#5a381c");
  px(x + 43, y - 28, 10, 3, "#8a5a32");
  px(x + 8, y - 24, 12, 6, "#8d6a38");
  px(x + 10, y - 23, 8, 3, "#a33b34");
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
  const y = Math.round(e.y);
  const flap = Math.sin(time * 12) * 3;
  px(x - 5, y - 1, 10, 4, "#9a9488");
  px(x - 4, y - 2, 8, 3, "#f7f4ee");
  px(x - 9, y - 3 + flap, 6, 2, "#d9d3c6");
  px(x + 3, y - 3 - flap, 6, 2, "#d9d3c6");
  px(x - 8, y - 2 + flap, 5, 2, "#f7f4ee");
  px(x + 3, y - 2 - flap, 5, 2, "#f7f4ee");
  px(x - 7, y - 1 + flap, 3, 1, "#e7e2d8");
  px(x + 5, y - 1 - flap, 3, 1, "#e7e2d8");
  px(x + 4, y - 1, 3, 2, "#f2c396");
  px(x + 6, y - 1, 1, 1, "#3a2416");
  px(x - 1, y - 3, 2, 2, "#fffdf8");
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
  if (e.kind === "person") {
    if (e.riding) drawRider(e, time);
    else drawPerson(e, time);
  }
  else if (e.kind === "tree") drawTree(e);
  else if (e.kind === "house") drawHouse(e);
  else if (e.kind === "well") drawWell(e.x, e.y);
  else if (e.kind === "net") drawNet(e.x, e.y, time);
  else if (e.kind === "mast") drawMast(e.x, e.y);
  else if (e.kind === "stone") drawStone(e.x, e.y, e.big);
  else if (e.kind === "linen") drawLinen(e.x, e.y);
  else if (e.kind === "jar") drawJar(e);
  else if (e.kind === "table") drawTable(e);
  else if (e.kind === "lamp") drawLamp(e.x, e.y, time);
  else if (e.kind === "stall") drawStall(e);
  else if (e.kind === "dove") drawDove(e, time);
  else if (e.kind === "colt") drawColt(e);
  else if (e.kind === "cloak") drawCloak(e);
  else if (e.kind === "branch") drawBranch(e);
  else if (e.kind === "manger") drawManger(e);
  else if (e.kind === "stable") drawStable(e);
  else if (e.kind === "sheep") drawSheep(e);
  else if (e.kind === "star") drawStar(e, time);
  else if (e.kind === "rock") drawRock(e);
  else if (e.kind === "loaf") drawLoaf(e);
  else if (e.kind === "pinnacle") drawPinnacle(e);
  else if (e.kind === "realm") drawRealm(e);
  else if (e.kind === "scroll") drawScroll(e);
  else if (e.kind === "boat") drawBoat(e);
  else if (e.kind === "fish") drawFish(e);
  else if (e.kind === "cross") drawCross(e);
  else if (e.kind === "coin") drawCoin(e.x, e.y);
}

function drawCoin(x, y) {
  x = Math.round(x);
  y = Math.round(y);
  px(x - 3, y - 2, 6, 4, "#c9d0d8");
  px(x - 2, y - 3, 4, 1, "#f4f7fa");
  px(x - 1, y - 1, 2, 2, "#6e7780");
}

function drawBoat(e) {
  const x = Math.round(e.x);
  const y = Math.round(e.y + (e.sink || 0));
  pen.save();
  pen.globalAlpha = e.alpha == null ? 1 : e.alpha;
  px(x - 18, y - 6, 36, 8, "#8d5a30");
  px(x - 14, y - 8, 28, 3, "#c48a52");
  px(x - 24, y - 4, 8, 5, "#6e4122");
  px(x + 16, y - 4, 8, 5, "#6e4122");
  px(x - 28, y - 2, 6, 3, "#5a3820");
  px(x + 22, y - 2, 6, 3, "#5a3820");
  px(x - 16, y - 1, 32, 1, "#5a3820");
  px(x - 2, y - 22, 2, 16, "#5a3820");
  px(x, y - 20, 10, 8, "#f4efe4");
  px(x, y - 20, 10, 1, "#d9cbb6");
  pen.restore();
}

function drawFish(e) {
  const x = Math.round(e.x);
  const y = Math.round(e.y);
  const wag = Math.sin(state.time * 8 + x) > 0 ? 0 : 1;
  pen.save();
  pen.globalAlpha = e.alpha == null ? 1 : e.alpha;
  px(x - 4, y - 2, 7, 3, "#e09a42");
  px(x - 3, y - 3, 4, 1, "#f0c070");
  px(x + 3, y - 3 - wag, 3, 2, "#c46a28");
  px(x + 3, y + wag, 3, 2, "#c46a28");
  px(x - 1, y - 1, 1, 1, "#2a2118");
  pen.restore();
}

function drawScroll(e) {
  const x = Math.round(e.x);
  const y = Math.round(e.y);
  pen.save();
  pen.globalAlpha = e.alpha == null ? 1 : e.alpha;
  px(x - 8, y - 4, 3, 8, "#8d5a30");
  px(x + 5, y - 4, 3, 8, "#6e4122");
  px(x - 6, y - 3, 12, 6, "#f3e6c4");
  px(x - 4, y - 1, 8, 1, "#c4a574");
  px(x - 3, y + 1, 6, 1, "#a68455");
  pen.restore();
}

function drawRock(e) {
  const x = Math.round(e.x);
  const y = Math.round(e.y);
  pen.save();
  pen.globalAlpha = e.alpha == null ? 1 : e.alpha;
  px(x - 7, y - 4, 14, 5, "#7a756c");
  px(x - 5, y - 7, 10, 4, "#a39e92");
  px(x - 2, y - 9, 5, 3, "#6e6a62");
  pen.restore();
}

function drawLoaf(e) {
  const x = Math.round(e.x);
  const y = Math.round(e.y);
  pen.save();
  pen.globalAlpha = e.alpha == null ? 1 : e.alpha;
  px(x - 6, y - 8, 12, 5, "#e2b85a");
  px(x - 5, y - 11, 10, 4, "#f0d48a");
  px(x - 3, y - 12, 6, 2, "#fff0c4");
  px(x - 4, y - 7, 8, 1, "#a67c32");
  pen.restore();
}

function drawPinnacle(e) {
  const x = Math.round(e.x);
  const y = Math.round(e.y);
  pen.save();
  pen.globalAlpha = e.alpha == null ? 1 : e.alpha;
  px(x - 18, y - 18, 36, 16, "#e6d5b4");
  px(x - 18, y - 18, 36, 3, "#cbb892");
  px(x - 20, y - 23, 40, 6, "#7a342c");
  px(x - 16, y - 26, 32, 4, "#8c4034");
  px(x - 8, y - 46, 16, 22, "#efe6d4");
  px(x - 10, y - 52, 20, 7, "#7a342c");
  px(x - 4, y - 68, 8, 18, "#f7f1e4");
  px(x - 5, y - 74, 10, 7, "#7a342c");
  px(x - 2, y - 80, 4, 8, "#fffdf6");
  px(x - 5, y - 10, 10, 10, "#6e5438");
  pen.restore();
}

function drawRealm(e) {
  const x = Math.round(e.x);
  const y = Math.round(e.y);
  const glow = 0.55 + 0.45 * Math.sin(state.time * 3 + x);
  pen.save();
  pen.globalAlpha = e.alpha == null ? 1 : e.alpha;
  px(x - 14, y - 6, 28, 8, "#c4a574");
  px(x - 12, y - 16, 8, 11, "#8d5a30");
  px(x + 1, y - 13, 10, 8, "#a56b38");
  px(x - 3, y - 24, 5, 10, "#7a342c");
  px(x + 8, y - 18, 4, 6, "#6e5438");
  px(x - 8, y - 18, 4, 4, "#e6c56a");
  px(x + 4, y - 15, 3, 3, "#f0d48a");
  pen.globalAlpha *= glow;
  px(x - 1, y - 28, 3, 3, "#fff4c8");
  px(x + 6, y - 20, 2, 2, "#fff4c8");
  pen.restore();
}

function drawColt(e) {
  const x = Math.round(e.x);
  const y = Math.round(e.y);
  const step = e.moving ? Math.floor(state.time * 8) % 2 : 0;
  const dir = e.dir || "right";
  if (dir === "up" || dir === "down") {
    const head = dir === "up" ? -10 : 6;
    px(x - 6, y - 7, 12, 8, "#8a6844");
    px(x - 5, y - 9, 10, 3, "#a07850");
    px(x - 3, y + head, 6, 5, "#a07850");
    px(x - 4, y + head + (dir === "up" ? 0 : 3), 2, 2, "#6a5034");
    px(x + 2, y + head + (dir === "up" ? 0 : 3), 2, 2, "#6a5034");
    px(x - 5, y + 1 + step, 2, 4, "#5a4030");
    px(x + 3, y + 1 + (step ? 0 : 1), 2, 4, "#5a4030");
    return;
  }
  const face = dir === "left" ? -1 : 1;
  pen.save();
  pen.translate(x, y);
  pen.scale(face, 1);
  px(-8, -8, 14, 7, "#8a6844");
  px(4, -12, 6, 6, "#a07850");
  px(8, -14, 2, 3, "#6a5034");
  px(-6, -1 + step, 2, 5, "#5a4030");
  px(2, -1 + (step ? 0 : 1), 2, 5, "#5a4030");
  px(-8, -6, 3, 2, "#6a5034");
  pen.restore();
}

function drawRider(e, time) {
  const x = Math.round(e.x);
  const y = Math.round(e.y);
  const step = e.mountMoving ? Math.floor(state.time * 8) % 2 : 0;
  px(x - 16, y - 2, 28, 4, "rgba(24,18,12,0.28)");
  px(x - 16, y - 10, 24, 8, "#8a6844");
  px(x - 14, y - 12, 18, 3, "#a07850");
  px(x + 6, y - 18, 9, 8, "#a07850");
  px(x + 12, y - 20, 3, 3, "#6a5034");
  px(x + 8, y - 16, 2, 2, "#6a5034");
  px(x + 10, y - 14, 1, 1, "#2a2118");
  px(x - 18, y - 8, 4, 2, "#6a5034");
  px(x - 12, y + step, 3, 6, "#5a4030");
  px(x + 1, y + (step ? 0 : 1), 3, 6, "#5a4030");
  drawPerson(
    Object.assign({}, e, {
      x: x - 2,
      y: y - 16,
      dir: "right",
      moving: false,
      noShadow: true,
      seated: true,
      riding: false,
    }),
    time
  );
}

function drawCloak(e) {
  const x = Math.round(e.x);
  const y = Math.round(e.y);
  px(x - 7, y - 2, 14, 4, e.color || "#7a342c");
  px(x - 5, y - 3, 8, 2, e.trim || "#c46a4a");
  px(x + 2, y - 1, 4, 2, "#5a3820");
}

function drawBranch(e) {
  const x = Math.round(e.x);
  const y = Math.round(e.y);
  px(x - 6, y - 1, 12, 2, "#6a8a3a");
  px(x - 4, y - 3, 3, 2, "#7ea34a");
  px(x + 1, y - 4, 3, 3, "#8fb456");
  px(x + 3, y - 1, 2, 2, "#5e7a32");
}

export function tileAt(x, y) {
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

export function tryMove(dx, dy) {
  const p = state.player;
  if (!blocked(p.x + dx, p.y)) p.x += dx;
  if (!blocked(p.x, p.y + dy)) p.y += dy;
}

export function stepToward(e, dest, dt, speed) {
  if (!e || !dest || e.alpha === 0) return false;
  const dx = dest.x - e.x;
  const dy = dest.y - e.y;
  const d = Math.hypot(dx, dy);
  if (d <= 6) {
    e.moving = false;
    return true;
  }
  const step = Math.min((speed || 32) * dt, d);
  const nx = e.x + (dx / d) * step;
  const ny = e.y + (dy / d) * step;
  if (!isSolidChar(tileAt(nx, e.y))) e.x = nx;
  if (!isSolidChar(tileAt(e.x, ny))) e.y = ny;
  e.moving = true;
  if (Math.abs(dx) > Math.abs(dy)) e.dir = dx > 0 ? "right" : "left";
  else e.dir = dy > 0 ? "down" : "up";
  return false;
}

export function walkPlayer(tx, ty, speed, onArrive) {
  state.walk = {
    x: tx * TILE + TILE / 2,
    y: ty * TILE + TILE / 2,
    speed: speed || 64,
    onArrive: onArrive || null,
  };
}

function drawManger(e) {
  const x = Math.round(e.x);
  const y = Math.round(e.y);
  px(x - 11, y - 8, 22, 7, "#6b4224");
  px(x - 9, y - 10, 18, 3, "#8a5a32");
  px(x - 8, y - 12, 16, 3, "#d8b86a");
  px(x - 5, y - 13, 6, 2, "#e6cc78");
  px(x - 13, y - 6, 2, 8, "#5a3820");
  px(x + 11, y - 6, 2, 8, "#5a3820");
  px(x - 8, y - 7, 16, 2, "#c4a05a");
}

function drawStable(e) {
  const x = Math.round(e.x);
  const y = Math.round(e.y);
  px(x - 30, y - 22, 60, 5, "#6b4224");
  px(x - 26, y - 25, 52, 4, "#8a5a32");
  px(x - 22, y - 27, 44, 3, "#a06a3c");
  px(x - 26, y - 18, 3, 20, "#5a3820");
  px(x + 23, y - 18, 3, 20, "#5a3820");
  px(x - 23, y - 18, 46, 8, "#c4a574");
  px(x - 23, y - 18, 46, 2, "#a68455");
}

function drawSheep(e) {
  const x = Math.round(e.x);
  const y = Math.round(e.y);
  const bob = e.moving ? Math.floor(state.time * 8) % 2 : 0;
  px(x - 6, y - 6 - bob, 12, 6, "#f4f0e8");
  px(x - 5, y - 8 - bob, 8, 3, "#f7f4ee");
  px(x + 4, y - 7 - bob, 4, 4, "#f2c396");
  px(x + 7, y - 6 - bob, 1, 1, "#2a2118");
  px(x - 4, y - 1, 2, 3, "#2a2118");
  px(x + 2, y - 1, 2, 3, "#2a2118");
}

function drawStar(e, time) {
  const x = Math.round(e.x);
  const y = Math.round(e.y + Math.sin(time * 2) * 1);
  const c = Math.floor(time * 3) % 2 ? "#fff6d2" : "#f0c84b";
  px(x, y - 5, 2, 12, c);
  px(x - 5, y, 12, 2, c);
  px(x - 2, y - 2, 6, 6, c);
}

export function findEnt(id) {
  return state.entities.find((e) => e.id === id);
}

function chapterKey() {
  const ch = CHAPTERS[state.chapter];
  return ch ? ch.key : "";
}

export function jesus() {
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

export function completeChapter() {
  if (state.cleared) return;
  state.cleared = true;
  const ch = CHAPTERS[state.chapter];
  if (ch.after) ch.after();
  else openClear();
}

function aimCamera(focusX, focusY) {
  const mapW = state.map.w * TILE;
  const mapH = state.map.h * TILE;
  // Keep the person above the dialogue and the d-pad. Extra map space sits at the bottom.
  const anchorY = viewH * 0.4;
  const x = mapW <= viewW ? (mapW - viewW) / 2 : clamp(focusX - viewW / 2, 0, mapW - viewW);
  let y = focusY - anchorY;
  if (mapH <= viewH) y = clamp(y, mapH - viewH, 0);
  else y = clamp(y, 0, mapH - viewH);
  return { x, y };
}

function snapCamera() {
  const cam = aimCamera(state.player.x, state.player.y);
  state.cam.x = cam.x;
  state.cam.y = cam.y;
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
  state.walk = null;
  state.camDy = 0;
  setMusic(musicMode);
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
  if (!p || state.pose === "cross") {
    if (p) p.moving = false;
    return;
  }
  const ch = CHAPTERS[state.chapter];
  if (state.walk) {
    const done = stepToward(p, state.walk, dt, state.walk.speed);
    if (done) {
      const arrive = state.walk.onArrive;
      state.walk = null;
      if (arrive) arrive();
    }
    return;
  }
  if ((ch && ch.guided) || state.flags.watch) {
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
  let focusX = state.player.x;
  let focusY = state.player.y + (state.camDy || 0);
  if (state.mode === "title") {
    focusX = tp(16, 7).x;
    focusY = viewH / 2;
  } else if (state.pose === "cross") {
    focusX = tp(11, 4).x;
    focusY = viewH / 2;
  }
  const target = aimCamera(focusX, focusY);
  const k = 1 - Math.pow(0.001, dt);
  state.cam.x += (target.x - state.cam.x) * (state.mode === "title" ? 1 : k);
  state.cam.y += (target.y - state.cam.y) * (state.mode === "title" ? 1 : k);
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
  if (state.mode === "splash") return;
  if (!state.map) return;
  const chPlay = state.mode === "play" ? CHAPTERS[state.chapter] : null;
  const canWalkWhileTalking = !!(chPlay && chPlay.walkDuringTalk && !chPlay.guided);
  const playing = state.mode === "play" && !state.screen && (!state.dialogue.open || canWalkWhileTalking);
  if (state.mode === "title") updateTitle(dt);
  else if (playing) {
    updatePlayer(dt);
    CHAPTERS[state.chapter].update(dt);
    updateStorm(dt);
  }
  if (state.mode === "play" && !state.screen && CHAPTERS[state.chapter] && CHAPTERS[state.chapter].animate) {
    CHAPTERS[state.chapter].animate(dt);
  }
  updateDialogue(dt);
  updateCamera(dt);
  for (const g of state.gulls) {
    g.x += g.s * dt;
    if (g.x > viewW + 20) g.x = -20;
  }
}

function render() {
  pen.beginFrame();
  const camX = Math.round(state.cam.x);
  const camY = Math.round(state.cam.y);
  pen.save();
  if (state.shake > 0) {
    pen.translate((Math.random() - 0.5) * state.shake * 6, (Math.random() - 0.5) * state.shake * 6);
  }
  pen.fillStyle = "#120e0c";
  pen.fillRect(0, 0, viewW, viewH);

  if (state.mode === "splash") {
    drawSplash();
    pen.restore();
    return;
  }
  if (state.mode === "interlude") {
    renderInterludeWorld();
    pen.restore();
    return;
  }
  if (!state.map) {
    pen.restore();
    return;
  }

  pen.save();
  pen.translate(-camX, -camY);
  const x0 = Math.max(0, Math.floor(camX / TILE) - 1);
  const y0 = Math.max(0, Math.floor(camY / TILE) - 1);
  const x1 = Math.min(state.map.w - 1, Math.floor((camX + viewW) / TILE) + 1);
  const y1 = Math.min(state.map.h - 1, Math.floor((camY + viewH) / TILE) + 1);
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
      mark: state.player.mark || null,
      wounds: state.player.wounds,
      crown: state.player.crown,
      carry: state.player.carry,
      riding: state.player.riding,
      mountMoving: state.player.moving,
      seated: state.player.seated,
      chair: state.player.chair,
    });
  }
  drawables.sort((a, b) => a.y - b.y);
  for (const e of drawables) drawEntity(e, state.time);

  const j = state.mode === "interlude" ? null : jesus();
  const glow = state.player.look && state.player.look.halo && state.pose !== "cross" ? state.player : j;
  if (glow && glow.alpha !== 0) {
    pen.save();
    pen.globalCompositeOperation = "lighter";
    const g = pen.createRadialGradient(glow.x, glow.y - 16, 2, glow.x, glow.y - 16, 34);
    g.addColorStop(0, "rgba(255, 220, 150, 0.45)");
    g.addColorStop(1, "rgba(255, 220, 150, 0)");
    pen.fillStyle = g;
    pen.fillRect(glow.x - 36, glow.y - 52, 72, 72);
    pen.restore();
  }
  pen.restore();
  pen.useScreen();

  const ch = CHAPTERS[state.chapter];
  const room = ch && ch.light === "room";
  if (ch && (ch.night || room) && state.mode !== "title") {
    const sx = state.player.x - camX;
    const sy = state.player.y - camY - 10;
    const px0 = state.player.x - camX;
    const py0 = state.player.y - camY;
    lightCtx.clearRect(0, 0, viewW, viewH);
    const stormNight = chapterKey() === "sea" || chapterKey() === "storm";
    lightCtx.fillStyle = room ? "rgba(42, 22, 12, 0.84)" : stormNight ? "rgba(5, 8, 18, 0.78)" : "rgba(10, 14, 24, 0.5)";
    lightCtx.fillRect(0, 0, viewW, viewH);
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
    for (const lamp of state.entities) {
      const carried = !!lamp.torch && lamp.alpha !== 0;
      if ((lamp.kind !== "lamp" || !lamp.alpha) && !carried) continue;
      const side = carried ? (lamp.dir === "left" ? -6 : 6) : 0;
      const lx = lamp.x - camX + side;
      const ly = lamp.y - camY - (carried ? 26 : 10);
      const reach = room ? 52 : carried ? 42 : 36;
      const lg = lightCtx.createRadialGradient(lx, ly, 3, lx, ly, reach);
      lg.addColorStop(0, "rgba(0,0,0,0.92)");
      lg.addColorStop(0.6, "rgba(0,0,0,0.4)");
      lg.addColorStop(1, "rgba(0,0,0,0)");
      lightCtx.fillStyle = lg;
      lightCtx.fillRect(lx - reach - 4, ly - reach - 4, (reach + 4) * 2, (reach + 4) * 2);
    }
    const lx0 = Math.max(0, Math.floor(camX / TILE) - 1);
    const ly0 = Math.max(0, Math.floor(camY / TILE) - 1);
    const lx1 = Math.min(state.map.w - 1, Math.floor((camX + viewW) / TILE) + 1);
    const ly1 = Math.min(state.map.h - 1, Math.floor((camY + viewH) / TILE) + 1);
    lightCtx.fillStyle = "rgba(0,0,0,0.95)";
    for (let y = ly0; y <= ly1; y++) {
      for (let x = lx0; x <= lx1; x++) {
        if (state.map.rows[y][x] !== "l") continue;
        lightCtx.fillRect(x * TILE - camX, y * TILE - camY, TILE, TILE);
      }
    }
    lightCtx.globalCompositeOperation = "source-over";
    pen.drawImage(lightCanvas, 0, 0);

    if (!room && stormNight && !state.flags.calm) {
    pen.strokeStyle = "rgba(210,225,235,0.35)";
    for (let i = 0; i < 36; i++) {
      const rx = ((i * 97 + state.time * 140) % (viewW + 20)) - 10;
      const ry = (i * 53) % viewH;
      pen.beginPath();
      pen.moveTo(rx, ry);
      pen.lineTo(rx - 3, ry + 7);
      pen.stroke();
    }
    }
  } else if (chapterKey() === "garden" && state.mode !== "title") {
    pen.fillStyle = "rgba(255, 228, 200, 0.08)";
    pen.fillRect(0, 0, viewW, viewH);
    if (!reduceMotion) {
      for (let i = 0; i < 18; i++) {
        const mx = (i * 47 + state.time * 8) % viewW;
        const my = (i * 29 + Math.sin(state.time + i) * 6) % viewH;
        pen.fillStyle = "rgba(255,255,255,0.18)";
        pen.fillRect(mx, my, 2, 1);
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
    pen.globalAlpha = Math.max(0, a);
    pen.fillStyle = p.color;
    pen.fillRect(Math.round(p.x - camX), Math.round(p.y - camY), p.sz, p.sz);
    pen.globalAlpha = 1;
  }

  if (state.flags.rite) drawHeaven(camX, camY);
  if (state.flash > 0) {
    pen.fillStyle = `rgba(255,255,255,${state.flash})`;
    pen.fillRect(0, 0, viewW, viewH);
  }
  if (state.pose === "cross" && state.flags.dark) {
    pen.fillStyle = "rgba(8, 10, 18, 0.58)";
    pen.fillRect(0, 0, viewW, viewH);
  }
  pen.restore();
}

function drawHeaven(camX, camY) {
  const t = state.flags.riteT || 0;
  const open = clamp(t / 1.15, 0, 1);
  const px0 = state.player.x - camX;
  const py0 = state.player.y - camY;
  const top = clamp(py0 - 86, 18, 64);
  const riftW = 10 + open * 58;
  const riftH = 6 + open * 28;
  pen.save();
  pen.fillStyle = `rgba(186, 214, 232, ${0.18 * open})`;
  pen.fillRect(0, 0, viewW, top + riftH + 8);
  pen.fillStyle = `rgba(255, 248, 220, ${0.25 + 0.55 * open})`;
  pen.beginPath();
  pen.ellipse(px0, top, riftW, riftH, 0, 0, Math.PI * 2);
  pen.fill();
  pen.fillStyle = `rgba(255, 255, 250, ${0.55 * open})`;
  pen.beginPath();
  pen.ellipse(px0, top, riftW * 0.45, riftH * 0.45, 0, 0, Math.PI * 2);
  pen.fill();
  pen.strokeStyle = `rgba(255, 236, 180, ${0.28 * open})`;
  pen.lineWidth = 2;
  for (let i = -2; i <= 2; i++) {
    pen.beginPath();
    pen.moveTo(px0 + i * 10, top + riftH * 0.4);
    pen.lineTo(px0 + i * 16, py0 - 18);
    pen.stroke();
  }
  if (t > 3.15) {
    const shown = clamp((t - 3.15) / 1.5, 0, 1);
    const words = text("verse.beloved");
    const n = Math.max(1, Math.ceil(words.length * shown));
    const shownLine = words.slice(0, n);
    pen.globalAlpha = 0.35 + 0.65 * shown;
    pen.font = "12px 'Songti TC', 'PMingLiU', 'Noto Serif TC', serif";
    pen.textAlign = "center";
    pen.textBaseline = "middle";
    pen.fillStyle = "rgba(42, 28, 16, 0.45)";
    pen.fillText(shownLine, viewW / 2 + 1, 23);
    pen.fillStyle = "#fff6d0";
    pen.fillText(shownLine, viewW / 2, 22);
    pen.font = "9px 'Songti TC', 'PMingLiU', serif";
    pen.fillStyle = "#f0d48a";
    pen.fillText(text("father"), viewW / 2, 10);
  }
  pen.restore();
}

function drawCross(e) {
  const x = Math.round(e.x);
  const y = Math.round(e.y);
  const jesus = e.who === "jesus";
  const bow = jesus && state.flags.bow ? 2 : 0;
  const post = jesus ? 50 : 44;
  const wood = "#6b4224";
  const woodD = "#4a2e18";
  const skin = "#e8b88a";
  const robe = jesus ? "#f7f3ea" : e.shade ? "#5c564e" : "#6a5038";
  const robeD = jesus ? "#b7aa96" : e.shade ? "#3e3a36" : "#4a3824";
  const hair = jesus ? "#5a3820" : "#2a2118";
  const beamY = y - post + 18;
  const shoulder = beamY;

  px(x - 6, y - 1, 12, 2, "rgba(24,18,12,0.28)");
  px(x - 2, y - post, 4, post + 2, woodD);
  px(x - 1, y - post + 1, 2, post, wood);
  px(x - 14, beamY, 28, 3, woodD);
  px(x - 13, beamY + 1, 26, 1, wood);

  px(x - 4, shoulder, 8, 12, robeD);
  px(x - 3, shoulder + 1, 6, 10, robe);
  if (jesus) px(x - 3, shoulder + 4, 6, 2, "#a33b34");

  px(x - 13, shoulder + 3, 9, 2, skin);
  px(x + 4, shoulder + 3, 9, 2, skin);
  px(x - 13, shoulder + 2, 2, 2, jesus ? "#7a2030" : "#2a2118");
  px(x + 11, shoulder + 2, 2, 2, jesus ? "#7a2030" : "#2a2118");

  const hy = shoulder - 4 + bow;
  px(x - 3, hy, 6, 8, skin);
  px(x - 4, hy - 1, 8, 3, hair);
  px(x - 4, hy + 1, 1, 5, hair);
  px(x + 3, hy + 1, 1, 5, hair);
  if (bow) {
    px(x - 3, hy + 2, 6, 4, hair);
  } else {
    px(x - 2, hy + 3, 1, 1, "#3a2416");
    px(x + 1, hy + 3, 1, 1, "#3a2416");
    if (jesus) {
      px(x - 4, hy - 2, 8, 2, "#5a3a22");
      px(x - 3, hy - 3, 2, 1, "#8c2f2f");
      px(x + 1, hy - 3, 2, 1, "#8c2f2f");
      px(x - 2, hy + 6, 4, 2, hair);
      px(x - 3, hy - 7, 1, 1, "#f0c84b");
      px(x - 1, hy - 8, 2, 1, "#ffe7a0");
      px(x + 1, hy - 7, 1, 1, "#f0c84b");
    } else px(x - 2, hy + 6, 4, 2, hair);
  }

  const hip = shoulder + 12;
  px(x - 3, hip, 3, 7, robeD);
  px(x, hip, 3, 7, robe);
  px(x - 2, hip + 7, 4, 2, skin);
  px(x - 1, hip + 7, 2, 2, "#2a2118");
  if (jesus) {
    px(x - 1, shoulder + 6, 2, 2, "#7a2030");
    px(x - 1, hip + 7, 2, 2, "#7a2030");
    if (state.flags.pierced) px(x + 3, shoulder + 5, 2, 2, "#7a2030");
    px(x - 7, y - post - 8, 14, 6, "#e6d3a4");
    px(x - 7, y - post - 8, 14, 1, "#8a6840");
    px(x - 7, y - post - 3, 14, 1, "#8a6840");
    px(x - 5, y - post - 6, 8, 1, "#241910");
    px(x - 5, y - post - 4, 6, 1, "#241910");
  }
}

function renderInterludeWorld() {
  const t = state.time;
  const sky = pen.createLinearGradient(0, 0, 0, viewH);
  sky.addColorStop(0, "#141822");
  sky.addColorStop(0.55, "#3a2a38");
  sky.addColorStop(1, "#c47a55");
  pen.fillStyle = sky;
  pen.fillRect(0, 0, viewW, viewH);
  for (let i = 0; i < 28; i++) {
    const alpha = 0.3 + (i % 5) * 0.1;
    pen.fillStyle = `rgba(255,255,255,${alpha})`;
    pen.fillRect((i * 53) % viewW, (i * 37) % 90, 1, 1);
  }
  pen.fillStyle = "#1a1418";
  pen.beginPath();
  pen.moveTo(0, 150);
  pen.lineTo(70, 120);
  pen.lineTo(130, 146);
  pen.lineTo(190, 100);
  pen.lineTo(250, 140);
  pen.lineTo(320, 118);
  pen.lineTo(320, 192);
  pen.lineTo(0, 192);
  pen.fill();
  pen.fillStyle = "#120e12";
  const cx = 190;
  const cy = 100;
  pen.fillRect(cx, cy - 28, 3, 28);
  pen.fillRect(cx - 8, cy - 20, 19, 3);
  void t;
}

function currentGoal() {
  if (state.mode !== "play") return null;
  const ch = CHAPTERS[state.chapter];
  if (ch.guided || !ch.goal) return null;
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
  const on = sx > margin && sy > margin && sx < viewW - margin && sy < viewH - margin;
  if (on && dist(state.player, g) < 32) return;
  const bob = Math.sin(state.time * 4) * 2;
  pen.fillStyle = "#f0c84b";
  if (on) {
    const x = Math.round(sx);
    const y = Math.round(sy + bob);
    pen.fillRect(x - 1, y, 3, 2);
    pen.fillRect(x - 3, y + 2, 2, 2);
    pen.fillRect(x + 2, y + 2, 2, 2);
    return;
  }
  sx = clamp(sx, margin, viewW - margin);
  sy = clamp(sy, margin, viewH - margin);
  pen.fillRect(sx - 2, sy - 2, 4, 4);
}

/* ------------------------------ UI ------------------------------ */

const PLAY_KEY = "follow-play";
let stageKey = "";
let blockTitleUntil = 0;
let screenReadyAt = 0;
let screenPress = null;

function readResume() {
  try {
    const data = JSON.parse(sessionStorage.getItem(PLAY_KEY) || "null");
    if (!data || !Number.isInteger(data.chapter) || !CHAPTERS[data.chapter]) return null;
    return data;
  } catch (err) {
    return null;
  }
}

function rememberPlay(mode) {
  try {
    sessionStorage.setItem(PLAY_KEY, JSON.stringify({ chapter: state.chapter, mode }));
  } catch (err) {
    /* ignore */
  }
}

function forgetPlay() {
  try {
    sessionStorage.removeItem(PLAY_KEY);
  } catch (err) {
    /* ignore */
  }
}

function updateChrome() {
  const vv = window.visualViewport;
  const w = window.innerWidth;
  const h = window.innerHeight;
  let top = 0;
  let right = 0;
  let bottom = 0;
  let left = 0;
  if (vv) {
    top = Math.max(0, Math.round(vv.offsetTop));
    left = Math.max(0, Math.round(vv.offsetLeft));
    bottom = Math.max(0, Math.round(h - vv.height - vv.offsetTop));
    right = Math.max(0, Math.round(w - vv.width - vv.offsetLeft));
  }
  const root = document.documentElement;
  root.style.setProperty("--bar-top", top + "px");
  root.style.setProperty("--bar-right", right + "px");
  root.style.setProperty("--bar-bottom", bottom + "px");
  root.style.setProperty("--bar-left", left + "px");
}

function armScreenInput() {
  blockTitleUntil = performance.now() + 500;
}

function resize() {
  if (!canvas) return;
  updateChrome();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  if (vw < 2 || vh < 2) return;
  frame.style.width = vw + "px";
  frame.style.height = vh + "px";
  const key = vw + "x" + vh;
  if (key === stageKey) return;
  stageKey = key;
  const fit = Math.min(vw / DESIGN_W, vh / DESIGN_H);
  viewW = Math.max(1, Math.round(vw / fit));
  viewH = Math.max(1, Math.round(vh / fit));
  resizeView(viewW, viewH);
  lightCanvas.width = viewW;
  lightCanvas.height = viewH;
  pen.bindLight();
  state.scale = vw / viewW;
  canvas.style.width = vw + "px";
  canvas.style.height = vh + "px";
  splashArt.width = Math.round(vw);
  splashArt.height = Math.round(vh);
  splashArt.style.width = vw + "px";
  splashArt.style.height = vh + "px";
  frame.style.fontSize = Math.max(15, Math.round(fit * 5.2)) + "px";
  document.body.classList.add("controls-over");
}

function syncUI() {
  splashArt.classList.toggle("hidden", state.mode !== "splash");
  $("touch").classList.toggle("hidden", state.mode !== "play" || !!state.screen);
  const showHud = state.mode === "play";
  hudEl.classList.toggle("hidden", !showHud);
  if (showHud) {
    const ch = CHAPTERS[state.chapter];
    $("ch-name").textContent = text(ch.kicker) + " " + text(ch.title);
    $("role").textContent = state.roleName ? text("role." + String(state.roleName).replace(/^name\./, "")) : "";
    $("role").classList.toggle("hidden", !state.roleName);
    $("objective").textContent = state.dialogue.open ? "" : text(state.objective);
    $("progress").textContent = text(state.progress);
    $("progress").classList.toggle("hidden", !state.progress);
    $("held").textContent = text(state.held);
    $("held").classList.toggle("hidden", !state.held);
    const sea = chapterKey() === "sea";
    $("faith").classList.toggle("hidden", !sea);
    $("wind").classList.toggle("hidden", !sea);
    if (sea) {
      $("faith-fill").style.width = clamp(state.faith, 0, 100) + "%";
      const label = $("faith").querySelector("span");
      if (label) label.textContent = text("faith");
    }
    const showHint = !ch.guided && state.time < state.hintUntil && !state.dialogue.open && !state.screen;
    $("hint").classList.toggle("hidden", !showHint);
  }

  const d = state.dialogue;
  const showD = d.open && state.mode === "play" && state.screen !== "journal" && state.screen !== "pause";
  dialogueEl.classList.toggle("hidden", !showD);
  if (showD) {
    const line = currentLine();
    const full = lineBody(line);
    const shown = full.slice(0, Math.floor(d.prog));
    const done = line && d.prog >= full.length;
    $("d-name").textContent = line && line.name ? text(line.name) : "";
    const who =
      line && line.name === "jesus"
        ? "jesus"
        : line && (line.name === "you" || line.name === state.roleName)
          ? "you"
          : line && line.name
            ? "npc"
            : "narr";
    $("d-name").className = "who-" + who;
    $("d-text").textContent = shown;
    $("d-text").classList.toggle("verse", !!(line && (line.verse || line.ref)));
    $("d-ref").textContent = done && line && line.ref ? text(line.ref) : "";
    $("d-next").textContent = done ? text("cont") : "";
  }

  const near = showHud && !state.screen && !d.open ? nearestTalkable() : null;
  const chNow = CHAPTERS[state.chapter];
  const act = !near && showHud && !state.screen && !d.open && chNow && chNow.actLabel ? chNow.actLabel() : "";
  if (near || act) {
    tagEl.classList.remove("hidden");
    tagEl.textContent = near ? text(near.name) + " · " + text("talk") : text(act);
    const anchor = near || state.player;
    const x = (anchor.x - state.cam.x) * state.scale;
    const y = (anchor.y - 36 - state.cam.y) * state.scale;
    tagEl.style.transform = `translate(${x}px, ${y}px) translate(-50%, -100%)`;
  } else tagEl.classList.add("hidden");

  for (const f of state.floats) {
    const x = (f.x - state.cam.x) * state.scale;
    const y = (f.y - (1 - f.life / f.max) * 14 - state.cam.y) * state.scale;
    if (f.raw) f.el.textContent = text(f.raw);
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
  armScreenInput();
  screenReadyAt = performance.now() + 700;
  screenEl.innerHTML = `<div class="card">${html}</div>`;
  screenEl.querySelectorAll("button").forEach((btn) => {
    btn.type = "button";
  });
  screenEl.classList.remove("hidden");
}

function langButton() {
  return `<button class="btn" data-act="lang">${text("langSwitch")}</button>`;
}

function drawSplash() {
  splashArt.classList.remove("hidden");
  const cw = splashArt.width;
  const ch = splashArt.height;
  splashCtx.imageSmoothingEnabled = true;
  splashCtx.clearRect(0, 0, cw, ch);
  splashCtx.fillStyle = "#1a140f";
  splashCtx.fillRect(0, 0, cw, ch);
  if (!splashImage.complete || !splashImage.naturalWidth) return;
  const iw = splashImage.naturalWidth;
  const ih = splashImage.naturalHeight;
  const scale = Math.max(cw / iw, ch / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = (cw - dw) / 2;
  const dy = (ch - dh) * 0.22;
  splashCtx.drawImage(splashImage, dx, dy, dw, dh);
}

function renderSplash() {
  state.screen = "splash";
  screenEl.innerHTML = `
    <div class="splash">
      <div class="splash-top">
        <div>
          <h1>${text("gameTitle")}</h1>
          <div class="sub">${text("subtitle")}</div>
        </div>
        <button type="button" class="splash-lang" data-act="lang">${text("langSwitch")}</button>
      </div>
      <div class="splash-foot">
        <button type="button" class="splash-go" data-act="enter" data-primary>${text("splashEnter")}</button>
        <div class="splash-credit">${text("splashCredit")}</div>
        <p class="splash-bars">${text("hideBars")}</p>
      </div>
    </div>`;
  armScreenInput();
  screenEl.classList.remove("hidden");
}

function showSplash() {
  state.mode = "splash";
  state.screen = "splash";
  setMusic("solemn");
  renderSplash();
}

function renderTitle() {
  state.screen = "title";
  card(`
    <div class="sub">${text("subtitle")}</div>
    <h1>${text("gameTitle")}</h1>
    <p class="verse" style="text-align:center">${text("titleLead")}${text(VERSES.way)}${text("titleTail")}</p>
    <p class="ref">${text("ref_john_14_6")}</p>
    <div class="rule"></div>
    <p style="text-align:center">${text("titleHelp")}<br/>${text("titleKeys")}</p>
    <div class="row">
      <button class="btn primary" data-act="start" data-primary>${text("start")}</button>
      <button class="btn" data-act="select">${text("select")}</button>
      ${langButton()}
    </div>
    <p class="note">${text("titleNote")}<br/>${text("titleSpan")}</p>
  `);
}

function renderSelect() {
  state.screen = "select";
  const buttons = CHAPTERS.map(
    (ch, i) => `<button class="btn" data-act="chapter" data-arg="${i}">${text(ch.kicker)} ${text(ch.title)}<br/><span class="ref">${text(ch.ref)} · ${text("role." + String(ch.who || "jesus").replace(/^name\./, ""))}</span></button>`
  ).join("");
  card(`<h2>${text("choose")}</h2><div class="chapters">${buttons}</div><div class="row"><button class="btn ghost" data-act="title">${text("back")}</button>${langButton()}</div>`);
}

function renderCard() {
  const ch = CHAPTERS[state.chapter];
  state.screen = "card";
  card(`
    <div class="sub">${text(ch.kicker)}</div>
    <h2>${text(ch.title)}</h2>
    <p class="ref">${text(ch.ref)}</p>
    <div class="rule"></div>
    <p>${text(ch.intro)}</p>
    <div class="row">
      <button class="btn primary" data-act="begin" data-primary>${text("enter")}</button>
      <button class="btn ghost" data-act="title">${text("back")}</button>
      ${langButton()}
    </div>
  `);
}

function openClear() {
  const ch = CHAPTERS[state.chapter];
  state.mode = "clear";
  state.screen = "clear";
  rememberPlay("clear");
  const last = state.chapter >= CHAPTERS.length - 1;
  card(`
    <div class="sub">${text(ch.kicker)}</div>
    <h2>${text(ch.title)}</h2>
    <div class="rule"></div>
    <p class="verse" style="text-align:center">${text(ch.closing)}</p>
    <p class="ref">${text(ch.closingRef || "")}</p>
    <div class="row">
      ${last ? "" : `<button class="btn primary" data-act="next" data-primary>${text("next")}</button>`}
      <button class="btn ${last ? "primary" : ""}" data-act="title" ${last ? "data-primary" : ""}>${text("back")}</button>
      ${langButton()}
    </div>
  `);
}

function renderInterlude() {
  state.screen = "interlude";
  state.mode = "interlude";
  const lines = INTERLUDE.slice(0, state.interludeStep + 1)
    .map((line) => `<p class="${line.verse ? "verse" : ""}">${text(line.text)}</p>${line.ref ? `<p class="ref">${text(line.ref)}</p>` : ""}`)
    .join("");
  const done = state.interludeStep >= INTERLUDE.length - 1;
  card(`
    <div class="sub">${text("interludeKicker")}</div>
    <h2>${text("interludeTitle")}</h2>
    <div class="rule"></div>
    ${lines}
    <div class="row">
      ${
        done
          ? `<button class="btn primary" data-act="garden" data-primary>${text("toTomb")}</button>`
          : `<button class="btn primary" data-act="interlude-next" data-primary>${text("goOn")}</button>`
      }
      ${langButton()}
    </div>
  `);
  if (done) {
    INTERLUDE.forEach((line) => {
      if (line.ref) recordVerse(line.ref, line.text);
    });
  }
}

function paintEnding() {
  state.screen = "ending";
  const items = state.journal
    .map((v) => `<div class="journal-item"><div class="ref">${text(v.ref)}</div><div class="verse">${text(v.text)}</div></div>`)
    .join("");
  card(`
    <div class="sub">${text("endingKicker")}</div>
    <h2>${text("endingTitle")}</h2>
    <p class="verse" style="text-align:center">${text("titleLead")}${text(VERSES.withYou)}${text("titleTail")}</p>
    <p class="ref">${text("ref_matthew_28_20")}</p>
    <div class="rule"></div>
    <p>${text("endingBody")}</p>
    <p class="verse" style="text-align:center">${text("titleLead")}${text(VERSES.way)}${text("titleTail")}</p>
    <p class="ref">${text("ref_john_14_6")}</p>
    <div class="rule"></div>
    <p class="ref" style="text-align:left">${text("gathered")}</p>
    ${items || `<p>${text("endingEmpty")}</p>`}
    <div class="row">
      <button class="btn primary" data-act="title" data-primary>${text("endingAgain")}</button>
      ${langButton()}
    </div>
  `);
}

export function openEnding() {
  state.mode = "ending";
  setMusic("end");
  recordVerse("ref_john_14_6", VERSES.way);
  paintEnding();
}

function refreshLanguage() {
  $("btn-mute").textContent = music.muted ? text("unmute") : text("mute");
  $("btn-journal").textContent = text("journal") + (state.journal.length ? " " + state.journal.length : "");
  const line = currentLine();
  if (state.dialogue.open && line && state.dialogue.prog > 0) state.dialogue.prog = lineBody(line).length;
  if (state.screen === "splash") renderSplash();
  else if (state.screen === "title") renderTitle();
  else if (state.screen === "select") renderSelect();
  else if (state.screen === "card") renderCard();
  else if (state.screen === "clear") openClear();
  else if (state.screen === "interlude") renderInterlude();
  else if (state.screen === "ending") paintEnding();
  else if (state.screen === "journal") openJournal();
  else if (state.screen === "pause") openPause();
  syncUI();
}

function openJournal() {
  if (state.mode !== "play") return;
  state.screen = "journal";
  const items = state.journal
    .map((v) => `<div class="journal-item"><div class="ref">${text(v.ref)}</div><div class="verse">${text(v.text)}</div></div>`)
    .join("");
  card(`
    <h2>${text("journalTitle")}</h2>
    <div class="rule"></div>
    ${items || `<p>${text("journalEmpty")}</p>`}
    <div class="row"><button class="btn primary" data-act="close-screen" data-primary>${text("close")}</button></div>
  `);
}

function openPause() {
  state.screen = "pause";
  card(`
    <h2>${text("pause")}</h2>
    <p style="text-align:center">${text("pauseBody")}</p>
    <div class="row">
      <button class="btn primary" data-act="close-screen" data-primary>${text("resume")}</button>
      <button class="btn" data-act="journal">${text("journal")}</button>
      <button class="btn ghost" data-act="title">${text("back")}</button>
    </div>
  `);
}

function showTitle() {
  forgetPlay();
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
  rememberPlay("card");
  renderCard();
}

function beginPlay() {
  state.screen = null;
  screenEl.classList.add("hidden");
  state.mode = "play";
  state.hintUntil = state.time + 10;
  rememberPlay("play");
  CHAPTERS[state.chapter].onEnter();
}

function handleScreenAct(btn) {
  if (state.screen === "splash" && (!btn || btn.dataset.act !== "lang")) {
    ensureAudio();
    showTitle();
    return;
  }
  if (!btn) return;
  if (btn.dataset.act === "title" && performance.now() < blockTitleUntil) return;
  ensureAudio();
  const act = btn.dataset.act;
  const arg = btn.dataset.arg;
  if (act === "lang") toggleLanguage();
  else if (act === "start") openChapter(0);
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
}

screenEl.addEventListener("pointerdown", (e) => {
  screenPress = e.target.closest("[data-act]");
});

screenEl.addEventListener("pointercancel", () => {
  screenPress = null;
});

screenEl.addEventListener("pointerup", (e) => {
  if (!matchMedia("(pointer: coarse)").matches) return;
  if (screenEl.classList.contains("hidden")) return;
  if (performance.now() < screenReadyAt) return;
  const btn = e.target.closest("[data-act]");
  if (state.screen === "splash") {
    if (btn && btn.dataset.act === "lang") {
      if (btn !== screenPress) return;
    } else if (screenPress && screenPress !== btn) return;
  } else if (!btn || btn !== screenPress) return;
  screenPress = null;
  handleScreenAct(btn);
});

screenEl.addEventListener("click", (e) => {
  if (screenEl.classList.contains("hidden")) return;
  if (matchMedia("(pointer: coarse)").matches && e.isTrusted) return;
  handleScreenAct(e.target.closest("[data-act]"));
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

$("btn-lang").addEventListener("click", () => {
  ensureAudio();
  toggleLanguage();
});

onLanguageChange(refreshLanguage);

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
    if (state.screen) {
      const primary = document.querySelector("#screen [data-primary]");
      if (primary && primary.dataset.act !== "title") primary.click();
    } else input.confirmEdge = true;
  },
  () => {}
);

window.addEventListener("pointerdown", () => {
  ensureAudio();
});
window.addEventListener("resize", resize);
window.addEventListener("orientationchange", () => setTimeout(resize, 60));
if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", resize);
  window.visualViewport.addEventListener("scroll", resize);
}
let pullY = 0;
let gestureLock = false;

function edgeBand(id, fallback) {
  const el = document.getElementById(id);
  if (!el) return fallback;
  return Math.max(fallback, el.getBoundingClientRect().width);
}

document.addEventListener("touchstart", (e) => {
  if (e.touches.length !== 1) {
    gestureLock = true;
    e.preventDefault();
    return;
  }
  const touch = e.touches[0];
  pullY = touch.clientY;
  const onControl = e.target.closest("button, #screen, #hud-btns");
  gestureLock = !onControl && (touch.clientX < edgeBand("edge-left", 40) || touch.clientX > window.innerWidth - edgeBand("edge-right", 32));
  if (gestureLock) e.preventDefault();
}, { passive: false });
document.addEventListener("touchmove", (e) => {
  if (gestureLock || e.touches.length !== 1) {
    e.preventDefault();
    return;
  }
  const y = e.touches[0].clientY;
  const pullingDown = y > pullY + 1;
  const pullingUp = y < pullY - 1;
  pullY = y;
  const scroller = e.target.closest("#dialogue, #screen .card, #screen .chapters");
  const canScroll = scroller && scroller.scrollHeight > scroller.clientHeight + 8;
  const atTop = scroller && scroller.scrollTop <= 0;
  const atBottom = scroller && scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1;
  if (canScroll && !((atTop && pullingDown) || (atBottom && pullingUp))) return;
  e.preventDefault();
}, { passive: false });
document.addEventListener("touchend", () => {
  gestureLock = false;
});
document.addEventListener("touchcancel", () => {
  gestureLock = false;
});
document.addEventListener("gesturestart", (e) => e.preventDefault(), { passive: false });
document.addEventListener("gesturechange", (e) => e.preventDefault(), { passive: false });
document.addEventListener("click", (e) => {
  if (e.target.closest("a")) e.preventDefault();
}, true);
document.addEventListener("fullscreenchange", resize);
document.addEventListener("webkitfullscreenchange", resize);

function loop() {
  const now = performance.now();
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
      }       else if (state.mode === "play" && !CHAPTERS[state.chapter].guided && !state.walk && !state.flags.watch) {
        const ch = CHAPTERS[state.chapter];
        const near = nearestTalkable();
        if (near) ch.talk(near);
        else if (ch.onAct) ch.onAct();
      }
    }
  }

  update(dt);
  render();
  syncUI();
}

function resumeLostPage() {
  const resume = readResume();
  if (!resume) return;
  if (resume.mode === "play" && state.mode === "play" && state.chapter === resume.chapter && !state.screen) return;
  if (state.mode !== "splash" && state.mode !== "title") return;
  if (resume.mode === "play") {
    loadChapter(resume.chapter);
    beginPlay();
  } else if (resume.mode === "clear") {
    loadChapter(resume.chapter);
    openClear();
  } else openChapter(resume.chapter);
}

function keepThisPage() {
  if (!window.navigation || !matchMedia("(pointer: coarse)").matches) return;
  window.navigation.addEventListener("navigate", (event) => {
    try {
      if (!event.cancelable) return;
      const next = new URL(event.destination.url);
      const here = new URL(location.href);
      const sameDocument = next.origin === here.origin && next.pathname === here.pathname && next.search === here.search;
      if (sameDocument && event.navigationType !== "reload" && event.navigationType !== "traverse") return;
      event.preventDefault();
    } catch (err) {
      /* ignore */
    }
  });
}

export function boot() {
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  keepThisPage();
  try {
    if (localStorage.getItem("follow-mute") === "1") setMuted(true);
    else $("btn-mute").textContent = text("mute");
  } catch (err) {
    /* ignore */
  }
  $("btn-journal").textContent = text("journal");
  resize();
  if (!splashImage.src) splashImage.src = splashUrl;
  const resume = readResume();
  if (resume && resume.mode === "play") {
    loadChapter(resume.chapter);
    beginPlay();
  } else if (resume && resume.mode === "clear") {
    loadChapter(resume.chapter);
    openClear();
  } else if (resume) openChapter(resume.chapter);
  else showSplash();
  startLoop(loop);
  window.addEventListener("pageshow", resumeLostPage);
}
