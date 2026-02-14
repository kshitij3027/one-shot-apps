# Border Radius Previewer

A webapp that lets users change border-radius values and preview different shapes in real time.

## Features

- **Preview box**: A box with `border-radius` applied that updates live as you change values
- **4 corner controls**: Adjust top-left, top-right, bottom-right, and bottom-left radii (in px)
- **Copy CSS**: Copy the generated `border-radius` CSS to the clipboard
- **Advanced mode (bonus)**: Toggle to 8-value elliptical mode for complex shapes (horizontal and vertical radii per corner)

## Tech Stack

- HTML
- CSS
- JavaScript (vanilla)

## How to Run

### With Docker (recommended)

```bash
docker compose up --build -d
```

Then open http://localhost:8081 in your browser.

### Without Docker

Open `index.html` in a browser, or serve the folder with a static server (e.g. `npx serve .`).

## What I Learned

<!-- Fill in as the project evolves -->
