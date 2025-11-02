# Write Characters

Write Characters is a Vite + React application that helps learners practise writing Chinese characters.  It provides stroke guidance, instant pronunciation, on-device handwriting feedback, and optional OCR-based character extraction from uploaded photos.

## Features

- **Interactive practice canvas** – Draw each character inside a 米字格 canvas and clear or undo strokes as you refine your writing.
- **Lightweight handwriting feedback** – Receive a score and improvement tips generated entirely in the browser using pixel-analysis heuristics, so no API key is required.
- **Traditional ↔ Simplified switching** – Convert the practice list between traditional and simplified characters with one click while keeping duplicate characters out of the queue.
- **Audio pronunciation** – Listen to Taiwanese Mandarin speech synthesis for the active character through the browser's built-in speech engine.
- **Photo import with OCR** – Extract characters from reference sheets or handwriting using Tesseract.js, then add them directly into your practice set.
- **Progress guardrails** – Encourage mastery by locking character switching until a baseline score (70+) is achieved.

## Tech stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) for local development and production builds
- [Tesseract.js](https://tesseract.projectnaptha.com/) (loaded via CDN) for optional OCR in the browser

## Getting started

### Prerequisites

- Node.js 18+
- [pnpm](https://pnpm.io/) 10 (preferred – see `packageManager` in `package.json`)

> **Tip:** You can use `npm` or `yarn` if you prefer; replace the commands below with the equivalent for your package manager.

### Installation

```bash
pnpm install
```

### Run the development server

```bash
pnpm dev
```

The app is served at [http://localhost:5173](http://localhost:5173) by default. Hot module replacement is enabled.

### Create a production build

```bash
pnpm build
```

### Preview the production build locally

```bash
pnpm preview
```

## Project structure

```
write_characters/
├── App.tsx                  # Top-level orchestration of canvas, controls, feedback, OCR, and speech logic
├── components/              # UI building blocks (canvas, selectors, feedback display, icons, dialogs)
├── services/                # Browser-only services: handwriting heuristics, OCR, character conversions
├── types.ts                 # Shared TypeScript types for evaluation responses and component props
├── index.tsx                # React root renderer
├── vite.config.ts           # Vite configuration
└── metadata.json            # AI Studio deployment metadata
```

## Browser capabilities & limitations

- **Speech synthesis:** The pronunciation feature relies on the browser's `speechSynthesis` API. Unsupported browsers will show an error message instead of playing audio.
- **OCR downloads:** Tesseract.js workers and language data are loaded from a CDN on demand. Ensure network access is available when importing characters from photos.
- **Local-only evaluation:** Handwriting scores are computed entirely on the client. They provide formative feedback but are not a substitute for detailed calligraphy critique.

## Contributing

1. Fork the repository and create a feature branch.
2. Install dependencies and run the dev server to verify your changes.
3. Format and lint your code according to the existing style (Prettier/ESLint configuration can be added in future PRs).
4. Open a pull request describing the motivation and key changes.

## License

This project is released under the MIT License. See [LICENSE](LICENSE) for details (or create one if it does not yet exist).
