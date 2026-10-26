import { Application, Container, FillGradient, Graphics, Sprite, Text, Texture } from "pixi.js";

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
    this.stops.push({ offset, color });
  }
}

function parseCssColor(input) {
  if (typeof input !== "string") return { color: 0xffffff, alpha: 1 };
  const s = input.trim();
  if (s[0] === "#") {
    let hex = s.slice(1);
    if (hex.length === 3) hex = hex.split("").map((ch) => ch + ch).join("");
    return { color: parseInt(hex.slice(0, 6), 16), alpha: 1 };
  }
  const m = s.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)/i);
  if (m) {
    const r = Math.round(Number(m[1]));
    const g = Math.round(Number(m[2]));
    const b = Math.round(Number(m[3]));
    return { color: (r << 16) | (g << 8) | b, alpha: m[4] == null ? 1 : Number(m[4]) };
  }
  return { color: 0xffffff, alpha: 1 };
}

class Pen {
  constructor() {
    this.world = null;
    this.glow = null;
    this.screen = null;
    this.textLayer = null;
    this.lightSprite = null;
    this.lightTexture = null;
    this.lightCanvas = null;
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
    this.world = view.world;
    this.glow = view.glow;
    this.screen = view.screen;
    this.textLayer = view.textLayer;
    this.lightSprite = view.lightSprite;
  }

  attachLight(canvas) {
    this.lightCanvas = canvas;
    this.bindLight();
  }

  bindLight() {
    if (!this.lightCanvas || !this.lightSprite) return;
    if (this.lightTexture) this.lightTexture.destroy(true);
    this.lightTexture = Texture.from(this.lightCanvas);
    this.lightTexture.source.scaleMode = "nearest";
    this.lightSprite.texture = this.lightTexture;
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
    for (const text of this.texts) text.visible = false;
    if (this.lightSprite) this.lightSprite.visible = false;
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
    const paint = this.paintOf(this._fillStyle);
    if (!paint) return;
    this.graphics().rect(left, top, width, height).fill(paint);
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
    const family = this.font.replace(/^\d+px\s*/, "").replace(/['"]/g, "");
    text.style.fontSize = size;
    text.style.fontFamily = family;
    text.style.fill = typeof this._fillStyle === "string" ? this._fillStyle : "#fff6d0";
    text.style.align = "center";
    text.text = String(value);
    const ax = this.textAlign === "center" ? 0.5 : this.textAlign === "right" ? 1 : 0;
    const ay = this.textBaseline === "middle" ? 0.5 : this.textBaseline === "bottom" ? 1 : 0;
    text.anchor.set(ax, ay);
    text.position.set(Math.round(point.x), Math.round(point.y));
    text.alpha = this._alpha;
    text.visible = true;
  }

  drawImage(image, dx, dy) {
    if (!this.lightSprite || image !== this.lightCanvas) return;
    const point = this.matrix.apply(dx, dy);
    this.lightSprite.position.set(Math.round(point.x), Math.round(point.y));
    this.lightSprite.scale.set(this.matrix.a || 1, this.matrix.d || 1);
    this.lightSprite.alpha = this._alpha;
    this.lightSprite.visible = true;
    this.lightTexture.source.update();
  }

  graphics() {
    if (this.composite === "lighter") return this.glow;
    return this.layer === "screen" ? this.screen : this.world;
  }

  paintOf(style) {
    if (this._alpha <= 0) return null;
    if (style instanceof CssGradient) {
      return { fill: this.gradientOf(style), alpha: this._alpha };
    }
    const color = parseCssColor(style);
    const alpha = color.alpha * this._alpha;
    if (alpha <= 0) return null;
    return { color: color.color, alpha };
  }

  gradientOf(style) {
    const stops = style.stops.map((stop) => ({ offset: stop.offset, color: stop.color }));
    if (style.type === "linear") {
      return new FillGradient({
        type: "linear",
        start: this.matrix.apply(style.coords.x0, style.coords.y0),
        end: this.matrix.apply(style.coords.x1, style.coords.y1),
        colorStops: stops,
        textureSpace: "global",
      });
    }
    const sx = Math.abs(this.matrix.a) || 1;
    const sy = Math.abs(this.matrix.d) || 1;
    return new FillGradient({
      type: "radial",
      center: this.matrix.apply(style.coords.x0, style.coords.y0),
      innerRadius: style.coords.r0 * sx,
      outerCenter: this.matrix.apply(style.coords.x1, style.coords.y1),
      outerRadius: style.coords.r1 * sx,
      scale: sy / sx,
      colorStops: stops,
      textureSpace: "global",
    });
  }

  paintPath(doFill) {
    if (!this.path.length) return;
    const g = this.graphics();
    const first = this.path[0];
    if (first.op === "e") {
      g.ellipse(first.x, first.y, Math.max(first.rx, 0.5), Math.max(first.ry, 0.5));
    } else {
      const points = [];
      for (const cmd of this.path) points.push(cmd.x, cmd.y);
      g.poly(points, true);
    }
    if (doFill) {
      const paint = this.paintOf(this._fillStyle);
      if (paint) g.fill(paint);
    } else {
      const color = parseCssColor(this._strokeStyle);
      g.stroke({
        width: Math.max(1, this.lineWidth * Math.abs(this.matrix.a || 1)),
        color: color.color,
        alpha: color.alpha * this._alpha,
        cap: "square",
        join: "miter",
      });
    }
    this.path = [];
  }

  takeText() {
    let text = this.texts[this.textIndex];
    if (!text) {
      text = new Text({
        text: "",
        resolution: 1,
        roundPixels: true,
        style: {
          fontFamily: "Songti TC, PMingLiU, Noto Serif TC, serif",
          fontSize: 12,
          fill: "#fff6d0",
        },
      });
      this.textLayer.addChild(text);
      this.texts.push(text);
    }
    this.textIndex += 1;
    return text;
  }
}

export const pen = new Pen();

let app = null;

export async function mountGame(placeholder) {
  app = new Application();
  await app.init({
    width: 320,
    height: 192,
    background: "#120e0c",
    antialias: false,
    resolution: 1,
    autoDensity: false,
    preference: "webgl",
    roundPixels: true,
  });
  const world = new Graphics();
  const glow = new Graphics();
  const screen = new Graphics();
  const textLayer = new Container();
  const lightSprite = new Sprite(Texture.EMPTY);
  world.roundPixels = true;
  glow.roundPixels = true;
  glow.blendMode = "add";
  screen.roundPixels = true;
  lightSprite.visible = false;
  lightSprite.roundPixels = true;
  app.stage.addChild(world, glow, lightSprite, screen, textLayer);
  app.stage.eventMode = "none";
  pen.bind({ world, glow, screen, textLayer, lightSprite });
  app.canvas.id = "game";
  placeholder.replaceWith(app.canvas);
  return app.canvas;
}

export function resizeView(w, h) {
  app.renderer.resize(w, h);
}

export function startLoop(fn) {
  app.ticker.add(fn);
}
