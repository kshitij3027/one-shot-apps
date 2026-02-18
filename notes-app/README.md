# Notes App

A single-page notes application with CRUD operations, localStorage persistence, Markdown support, and creation dates.

## Features

- Create, edit, and delete notes
- Notes persist in localStorage across browser sessions
- Markdown editing with live preview (powered by marked.js)
- Creation date displayed on each note card
- Dark theme with responsive two-column layout
- Mobile-friendly with list/editor toggle navigation

## Tech Stack

- **Frontend:** Vanilla JavaScript (IIFE pattern), HTML5, CSS3
- **Markdown:** [marked.js](https://github.com/markedjs/marked) via CDN
- **Persistence:** localStorage
- **Containerization:** Docker (nginx:alpine)

## How to Run

### Docker (recommended)

```bash
docker compose up --build -d
```

Open [http://localhost:8083](http://localhost:8083) in your browser.

To stop:

```bash
docker compose down
```

### Static

Open `index.html` directly in a browser, or serve with any static file server.

## Design Decisions

- **IIFE pattern** for zero-dependency encapsulation (matches sibling projects)
- **Event delegation** via `data-action` attributes for clean event handling
- **Newest-first** note list ordering
- **CSS custom properties** for consistent theming
- **marked.js CDN** with escaped-text fallback if CDN is unavailable
