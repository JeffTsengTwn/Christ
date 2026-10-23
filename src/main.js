import { bindContent, boot, initRenderer } from "./game.js";
import { CHAPTERS, INTERLUDE, VERSES } from "./chapters.js";

bindContent({ CHAPTERS, VERSES, INTERLUDE });
await initRenderer();
boot();
