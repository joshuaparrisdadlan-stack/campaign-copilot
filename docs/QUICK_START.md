# Campaign Copilot - Quick Start

## Prerequisites

✅ **Node.js 18+ required** (20.x recommended)

If you see `npm is not recognized`, you need to install Node.js first.

## Installation Steps

### 1. Install Node.js
- Download from: https://nodejs.org/ (LTS version)
- Install with default settings
- **Restart your terminal** after installation

### 2. Verify Installation
```powershell
node --version
npm --version
```

### 3. Install Project Dependencies
```powershell
cd C:\Users\jparris\Downloads\Projects\campaign-copilot
npm install
```

### 4. Start Development Server
```powershell
npm run dev
```

### 5. Open in Browser
Navigate to: **http://localhost:5173**

## First Steps in the App

1. **Load Demo Data:**
   - Click the "Load Seahaven" button in the Quest Tracker
   - This loads NPCs, quests, and leads for testing

2. **Test Session Suggestions:**
   - Enter a location (or it auto-fills from hub)
   - Type: "The Sleek Sophia is at anchor"
   - Click "Suggest Next 3 Options"
   - See hub-aware suggestions!

3. **Explore Features:**
   - Add/edit quests
   - Manage NPCs and business ideas
   - Add leads
   - Switch between hubs

## Available Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run linter

## That's It!

The app is ready to use. All data is stored locally in your browser.

