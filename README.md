# StaticWebsite

A personal Jekyll site I use as a sandbox for testing web ideas. The main focus right now is **Secure Vault Breaker 3D** — a browser-based raycaster game built entirely on this site's pages.

## The Raycaster Experiment

The raycaster page is being built **strictly using AI assistance** (GitHub Copilot) to see just how far you can push a coding tool on a project like this — no manual engine code, no copied tutorials. Every function, texture, mechanic, and feature comes from prompting an AI and iterating on the result. It's as much an experiment in AI-assisted development as it is a game.

## Secure Vault Breaker 3D — How to Play

You're a hacker dropped into a procedurally generated 3D facility. Find and crack every terminal before your nerve holds out.

### Controls

| Key | Action |
| --- | --- |
| `↑` / `↓` | Walk forward / backward |
| `←` / `→` | Turn left / right |
| `E` | Interact with a terminal |
| `Space` | Place a wall at the block you're facing |
| `Shift` | Remove the wall you're facing |
| `Escape` | Pause / resume |
| `Q` | Quit out of an open terminal |

### Hacking Terminals

When you open a terminal you have **10 attempts** to guess its 4-digit code (digits 0–9).

After each guess you get per-digit feedback:

| Symbol | Meaning |
| --- | --- |
| 🟢 | Right digit, right position |
| 🟡 | Right digit, wrong position |
| 🔴 | Wrong digit |

Hack every terminal on the map to win. Your total time is recorded — try to beat it on the next run.

### Tips

- Type `help` into the terminal guess box for a quick in-game reminder.
- Open the browser DevTools console and type `help()` for the same info.
- Use `Space` and `Shift` to reshape the maze to your advantage.

## Contact

Questions, feedback, or just want to chat about the project?

📧 [blaine@bettencourt.dev](mailto:blaine@bettencourt.dev)

## License

Code is licensed under [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/) — free to use and modify with attribution, no commercial use.
