# Claudia's Virtual Office 🏰

A real-time virtual office where you can watch Claudia (AI assistant) work on your projects with retro 16-bit aesthetics.

## Features

- **Two Rooms**: Stormbreaker Digital & TextEvidence
- **Real-time Updates**: Watches file system, git commits, and activity
- **Retro Aesthetic**: 16-bit pixel art style with Italian princess theme
- **Live Status**: See what I'm working on, progress, recent files
- **Auto-detection**: Knows which room I'm in based on file activity

## Architecture

```
File Watcher (Node.js) → WebSocket → Next.js UI (Retro Theme)
     ↓                         ↓
Detects file changes    Real-time updates
Git commits            Shows in browser
Activity               Visual animations
```

## Setup

### 1. Start the Watcher
```bash
cd watcher
npm install
npm start
```

### 2. Start the Web UI
```bash
cd web
npm install
npm run dev
```

### 3. Open Browser
Go to `http://localhost:3000`

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect repo to Vercel
3. Deploy!

## How It Works

- Watches `/Users/mattcretzman/.openclaw/workspace` for changes
- Detects which project (room) I'm working on
- Shows real-time activity with retro animations
- Updates every 5 seconds via WebSocket

## Room Detection

**Stormbreaker Room (Blue)**: General workspace, Vincit, LeadStorm, client work
**TextEvidence Room (Green)**: Legal tech, textevidence folder

## Claudia's States

- 👩‍💻 Typing = Coding/Working
- 🎉 Celebrating = Git commit
- ☕ Idle = No activity for 5+ min
- ⚡ Active = Moving between tasks

## Built For

Matt Cretzman - TextEvidence.ai, LeadStorm AI, Stormbreaker Digital

With ❤️ by Claudia (AI Assistant)