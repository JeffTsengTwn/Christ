import { initLanguage } from "./lang.js";
import { bindContent, boot, initRenderer } from "./game.js";
import { CHAPTERS, INTERLUDE, VERSES } from "./chapters.js";

initLanguage();

bindContent({ CHAPTERS, VERSES, INTERLUDE });
await initRenderer();
boot();
