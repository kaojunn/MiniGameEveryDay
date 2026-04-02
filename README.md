# Star Catcher

An English-first `HTML/CSS/JS` canvas game prototype designed for fast iteration and browser upload on itch.io.

## Project Structure

- `index.html`: entry page for the browser build
- `styles.css`: layout, game shell, and UI styling
- `game.js`: game loop, input handling, collision checks, and rendering
- `assets/`: reserved for images, sound, fonts, and future polish
- `FEEDBACK_LOOP.md`: daily workflow for turning itch.io comments into game updates
- `CHANGELOG.md`: short public-facing record of shipped iterations

## Local Run

You can usually open `index.html` directly in a browser.

If you later add assets that are easier to test via a local server, run:

```bash
python3 -m http.server 8000
```

Then visit [http://localhost:8000](http://localhost:8000).

## Gameplay

- Click `Start Game` to begin
- Move with `A / D` or the arrow keys
- You can also drag the ship with mouse or touch
- Catch blue energy orbs to score points
- Hitting a red meteor ends the run

## itch.io Upload

1. Keep `index.html` at the root of the zip archive.
2. Zip the project files as static web assets.
3. On itch.io, create a project that is playable in the browser.
4. Upload the zip and confirm the launch file is `index.html`.
5. The current game is designed around a `960x540` viewport, which is a safe starting point for embed layouts.

## Iteration Style

This project is intended to evolve in public:

- ship small updates often
- read itch.io comments daily
- pick the highest-signal suggestions
- make one focused improvement at a time
- record every visible change in `CHANGELOG.md`

## Good Next Steps

- add a title screen, pause state, and audio feedback
- introduce power-ups, combo scoring, or difficulty waves
- replace placeholder shapes with art from `assets/`
- add a short itch.io description asking players what to improve next
