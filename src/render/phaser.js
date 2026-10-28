import Phaser from "phaser";

class Matrix2 {
  constructor(a = 1, b = 0, c = 0, d = 1, tx = 0, ty = 0) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    this.tx = tx;
    this.ty = ty;
  }

  clone() {
    return new Matrix2(this.a, this.b, this.c, this.d, this.tx, this.ty);
  }

  translate(x, y) {
    this.tx += this.a * x + this.c * y;
    this.ty += this.b * x + this.d * y;
  }

  scale(x, y) {
    this.a *= x;
    this.b *= x;
    this.c *= y;
    this.d *= y;
  }

  apply(x, y) {
    return {
      x: this.a * x + this.c * y + this.tx,
      y: this.b * x + this.d * y + this.ty,
    };
  }
}

class CssGradient {
  constructor(type, coords) {
    this.type = type;
    this.coords = coords;
    this.stops = [];
  }

  addColorStop(offset, color) {
    this.stops.push({ offset, rgba: parseCssColor(color) });
    this.stops.sort((p, q) => p.offset - q.offset);
  }

  at(t) {
    const stops = this.stops;
    if (!stops.length) return { r: 255, g: 255, b: 255, alpha: 1 };
    if (t <= stops[0].offset) return stops[0].rgba;
    const last = stops[stops.length - 1];
    if (t >= last.offset) return last.rgba;
    for (let i = 1; i < stops.length; i++) {
      const s0 = stops[i - 1];
      const s1 = stops[i];
      if (t > s1.offset) continue;
      const span = s1.offset - s0.offset || 1;
      const k = (t - s0.offset) / span;
      return {
        r: s0.rgba.r + (s1.rgba.r - s0.rgba.r) * k,
        g: s0.rgba.g + (s1.rgba.g - s0.rgba.g) * k,
        b: s0.rgba.b + (s1.rgba.b - s0.rgba.b) * k,
        alpha: s0.rgba.alpha + (s1.rgba.alpha - s0.rgba.alpha) * k,
      };
    }
    return last.rgba;
  }
}

function parseCssColor(input) {
  if (typeof input !== "string") return { r: 255, g: 255, b: 255, alpha: 1 };
  const s = input.trim();
  if (s[0] === "#") {
    let hex = s.slice(1);
    if (hex.length === 3) hex = hex.split("").map((ch) => ch + ch).join("");
    const n = parseInt(hex.slice(0, 6), 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, alpha: 1 };
  }
  const m = s.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)/i);
  if (m) {
    return {
      r: Math.round(Number(m[1])),
      g: Math.round(Number(m[2])),
      b: Math.round(Number(m[3])),
      alpha: m[4] == null ? 1 : Number(m[4]),
    };
  }
  return { r: 255, g: 255, b: 255, alpha: 1 };
}

function packColor(c) {
  const r = Math.max(0, Math.min(255, Math.round(c.r)));
  const g = Math.max(0, Math.min(255, Math.round(c.g)));
  const b = Math.max(0, Math.min(255, Math.round(c.b)));
  return (r << 16) | (g << 8) | b;
}

const FONT_FAMILY = "Songti TC, PMingLiU, Noto Serif TC, serif";

class Pen {
  constructor() {
    this.scene = null;
    this.world = null;
    this.glow = null;
    this.screen = null;
    this.lightImage = null;
    this.lightTexture = null;
    this.lightCanvas = null;
    this.lightKey = 0;
    this.texts = [];
    this.textIndex = 0;
    this.layer = "world";
    this.stack = [];
    this.matrix = new Matrix2();
    this.path = [];
    this._fillStyle = "#000000";
    this._strokeStyle = "#000000";
    this._alpha = 1;
    this.lineWidth = 1;
    this.font = "12px sans-serif";
    this.textAlign = "left";
    this.textBaseline = "alphabetic";
    this.composite = "source-over";
    this.imageSmoothingEnabled = false;
  }

  bind(view) {
    this.scene = view.scene;
    this.world = view.world;
    this.glow = view.glow;
    this.screen = view.screen;
    this.lightImage = view.lightImage;
  }

  attachLight(canvas) {
    this.lightCanvas = canvas;
    this.bindLight();
  }

  bindLight() {
    if (!this.lightCanvas || !this.scene) return;
    const textures = this.scene.textures;
    const oldKey = this.lightTexture ? this.lightTexture.key : null;
    this.lightKey += 1;
    const key = "light-" + this.lightKey;
    this.lightTexture = textures.addCanvas(key, this.lightCanvas);
    this.lightImage.setTexture(key);
    this.lightImage.setDisplaySize(this.lightCanvas.width, this.lightCanvas.height);
    if (oldKey && textures.exists(oldKey)) textures.remove(oldKey);
  }

  beginFrame() {
    this.world.clear();
    this.glow.clear();
    this.screen.clear();
    this.layer = "world";
    this.stack.length = 0;
    this.matrix = new Matrix2();
    this.path = [];
    this._fillStyle = "#000000";
    this._strokeStyle = "#000000";
    this._alpha = 1;
    this.lineWidth = 1;
    this.composite = "source-over";
    this.textIndex = 0;
    for (const text of this.texts) text.setVisible(false);
    if (this.lightImage) this.lightImage.setVisible(false);
  }

  useScreen() {
    this.layer = "screen";
  }

  get fillStyle() {
    return this._fillStyle;
  }

  set fillStyle(value) {
    this._fillStyle = value;
  }

  get strokeStyle() {
    return this._strokeStyle;
  }

  set strokeStyle(value) {
    this._strokeStyle = value;
  }

  get globalAlpha() {
    return this._alpha;
  }

  set globalAlpha(value) {
    this._alpha = value;
  }

  get globalCompositeOperation() {
    return this.composite;
  }

  set globalCompositeOperation(value) {
    this.composite = value;
  }

  save() {
    this.stack.push({
      matrix: this.matrix.clone(),
      fillStyle: this._fillStyle,
      strokeStyle: this._strokeStyle,
      alpha: this._alpha,
      lineWidth: this.lineWidth,
      font: this.font,
      textAlign: this.textAlign,
      textBaseline: this.textBaseline,
      composite: this.composite,
      layer: this.layer,
    });
  }

  restore() {
    const prev = this.stack.pop();
    if (!prev) return;
    this.matrix = prev.matrix;
    this._fillStyle = prev.fillStyle;
    this._strokeStyle = prev.strokeStyle;
    this._alpha = prev.alpha;
    this.lineWidth = prev.lineWidth;
    this.font = prev.font;
    this.textAlign = prev.textAlign;
    this.textBaseline = prev.textBaseline;
    this.composite = prev.composite;
    this.layer = prev.layer;
  }

  translate(x, y) {
    this.matrix.translate(x, y);
  }

  scale(x, y) {
    this.matrix.scale(x, y);
  }

  createLinearGradient(x0, y0, x1, y1) {
    return new CssGradient("linear", { x0, y0, x1, y1 });
  }

  createRadialGradient(x0, y0, r0, x1, y1, r1) {
    return new CssGradient("radial", { x0, y0, r0, x1, y1, r1 });
  }

  beginPath() {
    this.path = [];
  }

  moveTo(x, y) {
    this.path.push({ op: "m", ...this.matrix.apply(x, y) });
  }

  lineTo(x, y) {
    this.path.push({ op: "l", ...this.matrix.apply(x, y) });
  }

  ellipse(cx, cy, rx, ry) {
    const center = this.matrix.apply(cx, cy);
    this.path.push({
      op: "e",
      x: center.x,
      y: center.y,
      rx: Math.abs(rx * (this.matrix.a || 1)),
      ry: Math.abs(ry * (this.matrix.d || 1)),
    });
  }

  fillRect(x, y, w, h) {
    const p0 = this.matrix.apply(x, y);
    const p1 = this.matrix.apply(x + w, y + h);
    const left = Math.round(Math.min(p0.x, p1.x));
    const top = Math.round(Math.min(p0.y, p1.y));
    const width = Math.round(Math.abs(p1.x - p0.x));
    const height = Math.round(Math.abs(p1.y - p0.y));
    if (width <= 0 || height <= 0 || this._alpha <= 0) return;
    if (this._fillStyle instanceof CssGradient) {
      this.fillGradientRect(left, top, width, height, this._fillStyle);
      return;
    }
    const paint = this.paintOf(this._fillStyle);
    if (!paint) return;
    this.graphics().fillStyle(paint.color, paint.alpha).fillRect(left, top, width, height);
  }

  fill() {
    this.paintPath(true);
  }

  stroke() {
    this.paintPath(false);
  }

  fillText(value, x, y) {
    const text = this.takeText();
    const point = this.matrix.apply(x, y);
    const size = parseInt(this.font, 10) || 12;
    const family = this.font.replace(/^\d+px\s*/, "").replace(/['"]/g, "") || FONT_FAMILY;
    text.setFontSize(size);
    text.setFontFamily(family);
    text.setColor(typeof this._fillStyle === "string" ? this._fillStyle : "#fff6d0");
    text.setText(String(value));
    const ax = this.textAlign === "center" ? 0.5 : this.textAlign === "right" ? 1 : 0;
    const ay = this.textBaseline === "middle" ? 0.5 : this.textBaseline === "bottom" ? 1 : 0;
    text.setOrigin(ax, ay);
    text.setPosition(Math.round(point.x), Math.round(point.y));
    text.setAlpha(this._alpha);
    text.setVisible(true);
  }

  drawImage(image, dx, dy) {
    if (!this.lightImage || image !== this.lightCanvas || !this.lightTexture) return;
    const point = this.matrix.apply(dx, dy);
    this.lightImage.setPosition(Math.round(point.x), Math.round(point.y));
    this.lightImage.setDisplaySize(
      this.lightCanvas.width * Math.abs(this.matrix.a || 1),
      this.lightCanvas.height * Math.abs(this.matrix.d || 1)
    );
    this.lightImage.setAlpha(this._alpha);
    this.lightImage.setVisible(true);
    this.lightTexture.refresh();
  }

  graphics() {
    if (this.composite === "lighter") return this.glow;
    return this.layer === "screen" ? this.screen : this.world;
  }

  paintOf(style) {
    if (this._alpha <= 0) return null;
    const color = style instanceof CssGradient ? style.at(0) : parseCssColor(style);
    const alpha = color.alpha * this._alpha;
    if (alpha <= 0) return null;
    return { color: packColor(color), alpha };
  }

  fillGradientRect(left, top, width, height, style) {
    const g = this.graphics();
    if (style.type === "linear") {
      const s = this.matrix.apply(style.coords.x0, style.coords.y0);
      const e = this.matrix.apply(style.coords.x1, style.coords.y1);
      const vertical = Math.abs(e.y - s.y) >= Math.abs(e.x - s.x);
      const span = vertical ? e.y - s.y : e.x - s.x;
      const length = vertical ? height : width;
      const step = Math.max(1, Math.ceil(length / 96));
      for (let i = 0; i < length; i += step) {
        const size = Math.min(step, length - i);
        const pos = (vertical ? top : left) + i + size / 2;
        const t = span ? Math.max(0, Math.min(1, (pos - (vertical ? s.y : s.x)) / span)) : 0;
        const c = style.at(t);
        const alpha = c.alpha * this._alpha;
        if (alpha <= 0) continue;
        g.fillStyle(packColor(c), alpha);
        if (vertical) g.fillRect(left, top + i, width, size);
        else g.fillRect(left + i, top, size, height);
      }
      return;
    }
    const center = this.matrix.apply(style.coords.x1, style.coords.y1);
    const sx = Math.abs(this.matrix.a) || 1;
    const sy = Math.abs(this.matrix.d) || 1;
    const r0 = style.coords.r0 * sx;
    const r1 = style.coords.r1 * sx;
    const rings = 14;
    const additive = this.composite === "lighter";
    const bands = [];
    for (let k = 0; k < rings; k++) {
      const c = style.at((k + 0.5) / rings);
      bands.push({ radius: r0 + ((r1 - r0) * (k + 1)) / rings, c });
    }
    for (let k = rings - 1; k >= 0; k--) {
      const band = bands[k];
      let color;
      let alpha;
      if (additive) {
        const next = k + 1 < rings ? bands[k + 1].c : { r: 0, g: 0, b: 0, alpha: 0 };
        alpha = band.c.alpha - next.alpha;
        if (alpha <= 0.002) continue;
        color = packColor({
          r: (band.c.r * band.c.alpha - next.r * next.alpha) / alpha,
          g: (band.c.g * band.c.alpha - next.g * next.alpha) / alpha,
          b: (band.c.b * band.c.alpha - next.b * next.alpha) / alpha,
        });
      } else {
        alpha = band.c.alpha;
        color = packColor(band.c);
      }
      alpha *= this._alpha;
      if (alpha <= 0) continue;
      g.fillStyle(color, alpha);
      g.fillEllipse(center.x, center.y, band.radius * 2, band.radius * 2 * (sy / sx), 24);
    }
  }

  paintPath(doFill) {
    if (!this.path.length) return;
    const g = this.graphics();
    const first = this.path[0];
    if (doFill) {
      const paint = this.paintOf(this._fillStyle);
      if (!paint) {
        this.path = [];
        return;
      }
      g.fillStyle(paint.color, paint.alpha);
      if (first.op === "e") {
        g.fillEllipse(first.x, first.y, Math.max(first.rx, 0.5) * 2, Math.max(first.ry, 0.5) * 2, 24);
      } else {
        g.fillPoints(this.path.map((cmd) => ({ x: cmd.x, y: cmd.y })), true, true);
      }
    } else {
      const color = parseCssColor(this._strokeStyle);
      const alpha = color.alpha * this._alpha;
      if (alpha > 0) {
        g.lineStyle(Math.max(1, this.lineWidth * Math.abs(this.matrix.a || 1)), packColor(color), alpha);
        if (first.op === "e") {
          g.strokeEllipse(first.x, first.y, Math.max(first.rx, 0.5) * 2, Math.max(first.ry, 0.5) * 2, 24);
        } else {
          g.strokePoints(this.path.map((cmd) => ({ x: cmd.x, y: cmd.y })), false, false);
        }
      }
    }
    this.path = [];
  }

  takeText() {
    let text = this.texts[this.textIndex];
    if (!text) {
      text = this.scene.add.text(0, 0, "", {
        fontFamily: FONT_FAMILY,
        fontSize: "12px",
        color: "#fff6d0",
        resolution: 1,
      });
      text.setVisible(false);
      this.texts.push(text);
    }
    this.textIndex += 1;
    return text;
  }
}

export const pen = new Pen();

let game = null;
let stage = null;
let tick = null;

class Stage extends Phaser.Scene {
  constructor(onReady) {
    super({ key: "stage" });
    this.onReady = onReady;
  }

  create() {
    const world = this.add.graphics();
    const glow = this.add.graphics();
    glow.setBlendMode(Phaser.BlendModes.ADD);
    const lightImage = this.add.image(0, 0, "__DEFAULT").setOrigin(0, 0).setVisible(false);
    const screen = this.add.graphics();
    this.cameras.main.setRoundPixels(true);
    pen.bind({ scene: this, world, glow, screen, lightImage });
    stage = this;
    this.onReady(this.game.canvas);
  }

  update() {
    if (tick) tick();
  }
}

function rendererType() {
  try {
    const wanted = new URLSearchParams(location.search).get("renderer");
    if (wanted === "webgl") return Phaser.WEBGL;
    if (wanted === "canvas") return Phaser.CANVAS;
  } catch (err) {
    /* ignore */
  }
  return Phaser.CANVAS;
}

export function mountGame(placeholder) {
  return new Promise((resolve) => {
    game = new Phaser.Game({
      type: rendererType(),
      canvas: placeholder,
      parent: null,
      width: 320,
      height: 192,
      backgroundColor: "#120e0c",
      pixelArt: true,
      roundPixels: true,
      antialias: false,
      banner: false,
      autoFocus: false,
      disableContextMenu: false,
      audio: { noAudio: true },
      input: { keyboard: false, mouse: false, touch: false, gamepad: false },
      dom: { createContainer: false },
      scale: {
        mode: Phaser.Scale.NONE,
        autoCenter: Phaser.Scale.NO_CENTER,
        expandParent: false,
      },
      scene: new Stage(resolve),
    });
  });
}

export function resizeView(w, h) {
  if (!game) return;
  game.scale.resize(w, h);
  if (stage) stage.cameras.resize(w, h);
}

export function startLoop(fn) {
  tick = fn;
}
