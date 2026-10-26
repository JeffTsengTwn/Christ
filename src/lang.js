import { dict } from "./dict.js";

let lang = "zh";
const listeners = [];

export function getLanguage() {
  return lang;
}

export function text(key) {
  if (key == null || key === "") return "";
  const pack = dict[lang] || dict.zh;
  return pack[key] ?? dict.zh[key] ?? String(key);
}

export function onLanguageChange(fn) {
  listeners.push(fn);
}

export function applyChrome() {
  document.documentElement.lang = lang === "en" ? "en" : "zh-Hant";
  document.body.classList.toggle("lang-en", lang === "en");
  document.title = text("docTitle");
  const btn = document.getElementById("btn-lang");
  if (btn) btn.textContent = text("langSwitch");
  const faith = document.querySelector("#faith span");
  if (faith) faith.textContent = text("faith");
  const wind = document.getElementById("wind");
  if (wind) wind.textContent = text("wind");
  const hint = document.getElementById("hint");
  if (hint) hint.textContent = text("hint");
  const talk = document.getElementById("btn-talk");
  if (talk) {
    talk.textContent = text("spaceBtn");
    talk.setAttribute("aria-label", text("spaceBtn"));
  }
  for (const dir of ["up", "down", "left", "right"]) {
    const pad = document.querySelector(`.pad button.${dir}`);
    if (pad) pad.setAttribute("aria-label", text(dir));
  }
}

export function setLanguage(next) {
  lang = next === "en" ? "en" : "zh";
  try {
    localStorage.setItem("follow-lang", lang);
  } catch (err) {
    /* ignore */
  }
  applyChrome();
  for (const fn of listeners) fn(lang);
}

export function toggleLanguage() {
  setLanguage(lang === "zh" ? "en" : "zh");
}

export function initLanguage() {
  try {
    const saved = localStorage.getItem("follow-lang");
    if (saved === "en" || saved === "zh") lang = saved;
  } catch (err) {
    /* ignore */
  }
  applyChrome();
}
