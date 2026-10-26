[中文](README.md) | English

# Follow

A life from the four Gospels. A small pixel game for the web: from Bethlehem to Golgotha, on to the empty tomb on the first day of the week, and to the mountain in Galilee. In each chapter you play the person who was there, and walk the words through to the end.

The picture is 320×192, scaled up by whole numbers to fit the window. In Chinese, Scripture is quoted from the Chinese Union Version. The English is a translation of those lines for this game. The game follows the four Gospels. It does not take the place of the Bible.

## Development

Node.js is required.

```bash
npm install
npm run dev
```

The dev server opens at [http://localhost:5173](http://localhost:5173). If that port is taken, Vite uses the next free one.

```bash
npm run build    # writes to dist/
npm run preview  # previews the build
npm run deploy   # pushes main and waits until GitHub Pages finishes
```

Before the first deploy, open the repository **Settings → Pages** and set Source to **GitHub Actions**. The site is then at [https://jefftsengtwn.github.io/Christ/](https://jefftsengtwn.github.io/Christ/). `npm run deploy` needs the [GitHub CLI](https://cli.github.com/) installed and signed in.

## Controls

| Action | Keyboard | Touch |
| --- | --- | --- |
| Move | Arrow keys or WASD | D-pad at the lower left |
| Talk, continue, confirm | Space, E, or Enter | “Talk”, or tap the dialogue box |
| Scripture journal | J, or “Scripture” at the upper right | Same |
| Mute | M, or “Mute” at the upper right | Same |
| Pause | Esc | — |
| Language | — | “EN” or “中文” at the upper right; the title screen has the same button |

A coarse pointer (phone or tablet) shows the d-pad and the Talk button. Mute is stored in the browser’s `localStorage` under the key `follow-mute`, and the language under `follow-lang`. If the system has “reduce motion” turned on, particles and screen shake are skipped.

Some chapters walk forward on their own, and you mainly finish the words. In the others you walk up to someone and talk, or follow the goal at the bottom of the screen. Verses you pass through are kept in the journal, and you can read them again at the end of a chapter and in the ending.

## Chapters

From the title you can “Begin walking” and play all twenty-eight chapters in order, or “Choose a chapter” and enter one directly.

| Chapter | Title | Scripture | You are |
| --- | --- | --- | --- |
| 1 | Bethlehem | Luke 2; Matthew 1–2 | An angel |
| 2 | The Temple | Luke 2:41–52 | Mary |
| 3 | The Jordan | Matthew 3:13–17 | Jesus |
| 4 | The Wilderness | Matthew 4:1–11 | Jesus |
| 5 | Nazareth | Luke 4:16–30 | Jesus |
| 6 | Deep Water | Luke 5:1–11 | Simon |
| 7 | The Wedding at Cana | John 2:1–11 | A servant |
| 8 | For God So Loved the World | John 3:1–17 | Nicodemus |
| 9 | The Twelve | Mark 3:13–19 | Jesus |
| 10 | He Reached Out | Matthew 8; Mark 2; Mark 10 | Jesus |
| 11 | Blasphemy | Mark 2:5–17; Mark 3:6 | A scribe |
| 12 | On the Mountain | Matthew 5:1–7 | Jesus |
| 13 | The Storm Stilled | Mark 4:35–41 | Peter |
| 14 | Walking on the Water | Matthew 14:22–33 | Peter |
| 15 | Five Loaves and Two Fish | John 6:1–13 | John |
| 16 | Lazarus | John 11:1–44 | Jesus |
| 17 | One Man Dies | John 11:45–53 | Caiaphas |
| 18 | The Lost | Luke 19:1–10 | Zacchaeus |
| 19 | The Holy City | Matthew 21:1–13; Mark 11:18 | Jesus |
| 20 | Thirty Pieces of Silver | Matthew 26:3–5, 14–16 | Judas |
| 21 | The Last Supper | John 13; Matthew 26:20–35 | Jesus |
| 22 | Gethsemane | Matthew 26:36–56; John 18 | Jesus |
| 23 | Before the Rooster Crows | John 18:15–27; Luke 22:54–62 | Peter |
| 24 | Pilate | Matthew 27; John 18–19 | Jesus |
| 25 | Golgotha | Luke 23; John 19; Matthew 27 | Jesus |
| 26 | At Dawn | Matthew 28:1–10 | Mary Magdalene |
| 27 | Do You Love Me? | John 21:1–19 | Peter |
| 28 | The Mountain in Galilee | Matthew 28:16–20 | Peter |

“Walking on the Water” has a faith meter: keep your eyes on Jesus and walk across the water. Night, indoor, and storm chapters add light and weather. Golgotha becomes the scene of the crosses; when the words are finished, the next chapter begins. After the mountain in Galilee comes the ending, which lists the verses gathered along the way.

## Language

The interface, chapter titles, dialogue, and Scripture share one set of keys. To change the wording, edit `assets/dict.csv` (columns `key,zh,en`) and generate the dictionary. That step needs Python 3. Playing the game needs only Node.js.

```bash
python3 scripts/gen_dict.py
```

The script writes `src/dict.js`. At runtime, `text(key)` in `src/lang.js` reads the line for the current language.

## Project layout

```
index.html          page shell, interface styles, touch controls
vite.config.js      dev server (port 5173)
assets/dict.csv     Chinese and English dictionary (key, Chinese, English)
scripts/gen_dict.py builds src/dict.js from dict.csv
src/main.js         loads the chapters and starts the game
src/lang.js         language switch, and text(key) for each line
src/dict.js         generated Chinese and English lines
src/chapters.js     scripture, the twenty-eight chapters, and their maps
src/game.js         movement, dialogue, music, interface, and drawing
src/render/pixi.js  pixel drawing through PixiJS
```

Maps are grids of characters (grass, path, water, wall, floor, and so on). People and props are drawn as pixel blocks. Background music is Web Audio and changes with the chapter (peace, morning, storm, solemn, ending). There are no external audio files.

## Stack

- [Vite](https://vite.dev/) 8
- [PixiJS](https://pixijs.com/) 8
- Plain ES modules, with no front-end framework
