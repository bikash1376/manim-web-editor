# manim-web-editor

An interactive browser-based code editor for creating mathematical animations with [manim-web](https://github.com/maloyan/manim-web).

Write animation code in the built-in editor, hit **Play Animation**, and see the result instantly — no build step or local setup needed.

## Features

- **Live Preview** — Execute manim-web code and see animations rendered in real-time
- **Example Gallery** — Load pre-built examples covering shapes, transforms, graphs, 3D scenes, and more
- **Autocomplete** — Intelligent code completions for all manim-web exports
- **Dark / Light Mode** — Toggle between themes
- **Editor Zoom** — Ctrl/Cmd + Scroll to zoom the code editor
- **Custom Scenes** — Supports `ZoomedScene`, `ThreeDScene`, `InteractiveScene`, and standard `Scene`

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Built With

- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- [manim-web](https://github.com/maloyan/manim-web) — Mathematical animation engine
- [CodeMirror](https://codemirror.net/) via [@uiw/react-codemirror](https://github.com/uiwjs/react-codemirror)
- [Base Web](https://baseweb.design/) — UI components

## Links

- **manim-web GitHub**: [github.com/maloyan/manim-web](https://github.com/maloyan/manim-web)
- **API Docs**: [maloyan.github.io/manim-web](https://maloyan.github.io/manim-web/)

## License

MIT
