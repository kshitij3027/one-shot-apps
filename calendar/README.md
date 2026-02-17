# Calendar

A daily life organizer — a clean calendar web app to manage your events and schedule.

## Tech Stack
- Language: HTML / CSS / JavaScript (vanilla, no frameworks)
- Storage: Browser localStorage
- Server: nginx:alpine (Docker)

## How to Run

```bash
cd calendar
docker compose up --build -d
```

Then visit `http://localhost:8082`.

To stop:
```bash
docker compose down
```

## Features
- Monthly calendar view with prev/next/today navigation
- Create, edit, and delete events via modal dialog
- Event color coding (blue, green, red, amber, purple)
- Drag and drop events between dates
- Reminders via Notification API (with alert fallback)
- Light/dark theme toggle (persisted)
- All events and theme persisted in localStorage
- Responsive design with mobile FAB button
