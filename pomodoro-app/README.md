# Pomodoro App

A web-based Pomodoro timer using the Pomodoro Technique: 25-minute work sessions and 5-minute breaks (vanilla JS, HTML, CSS).

## How to Run

From this directory:

```bash
docker compose up --build
```

Open [http://localhost:8085](http://localhost:8085) in your browser.

## Tech Stack

- Vanilla JavaScript, HTML, CSS
- Served via nginx in Docker (port 8085)

## Features

- **Sound:** When a session reaches 00:00, a short beep plays (Web Audio API). Some browsers require a user click (e.g. Start) before allowing audio.
