# Happy Birthday, Patooti! 🎁

A tiny 8-bit birthday game: one big present to unwrap, a birthday reveal, then three mini presents (camera, flowers, duck plushie).

There's no build step and nothing to install. All the pixel art, music and sound effects are generated in code.

## Run it

Double-click `index.html`, or serve the folder:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Customise

Everything personal is in **`js/config.js`**:

| What | Where |
|---|---|
| Instruction boxes for each small present | `intros` |
| Flower message (full reveal) | `messages.flowers.text` |
| Duck message | `messages.duck.text` |
| Party cam texts (caption, error messages) | `camera` |
| Nickname / greeting / subtitle | `nickname`, `greeting`, `subtitle` |
| Colours | `colors` |
| Speeds | `timing` |
| Volumes | `audio` |

## Code map

- `js/pixel.js`: pixel sprite engine plus the small sprites (hearts, stars, cursor)
- `js/art.js`: duck plushie, bouquet, camera illustrations
- `js/gift.js`: reusable gift box with its unwrap animations
- `js/presents/*.js`: one file per present (camera photo booth, flowers, duck, book date). Each registers itself in `BD.presents`; optional hooks: `decorate`, `introArt`, `open`, `celebrate`.
- `js/audio.js`: original chiptune loop and sound effects (WebAudio)
- `js/fx.js`: particles (confetti, fireworks, petals, hearts)
- `js/main.js`: scene flow
