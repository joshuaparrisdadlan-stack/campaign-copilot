# Campaign Copilot - Setup Guide

## Node.js Installation Required

The `npm` command is not found, which means Node.js is not installed or not in your system PATH.

### Step 1: Install Node.js

1. **Download Node.js:**
   - Go to: https://nodejs.org/
   - Download the **LTS (Long Term Support)** version (recommended: v20.x or v18.x)
   - Choose the Windows Installer (.msi) for your system (64-bit)

2. **Install Node.js:**
   - Run the installer
   - Follow the installation wizard
   - **Important:** Make sure to check "Add to PATH" during installation
   - Complete the installation

3. **Verify Installation:**
   - Close and reopen your PowerShell/terminal
   - Run these commands to verify:
     ```powershell
     node --version
     npm --version
     ```
   - You should see version numbers (e.g., `v20.11.0` and `10.2.4`)

### Step 2: Install Project Dependencies

Once Node.js is installed:

```powershell
cd C:\Users\jparris\Downloads\Projects\campaign-copilot
npm install
```

This will install all required dependencies (React, Vite, TailwindCSS, etc.)

### Step 3: Run the Development Server

```powershell
npm run dev
```

The app will start and you should see:
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Open your browser to `http://localhost:5173` to see the app!

## Alternative: Using nvm (Node Version Manager)

If you prefer to manage multiple Node.js versions:

1. **Install nvm-windows:**
   - Download from: https://github.com/coreybutler/nvm-windows/releases
   - Install `nvm-setup.exe`

2. **Install Node.js via nvm:**
   ```powershell
   nvm install 20
   nvm use 20
   ```

3. **Then proceed with Step 2 above**

## Troubleshooting

### If npm is still not found after installing Node.js:

1. **Restart your terminal/PowerShell** - PATH changes require a new session
2. **Check PATH manually:**
   ```powershell
   $env:PATH
   ```
   Look for a path like `C:\Program Files\nodejs\`

3. **Add Node.js to PATH manually if needed:**
   - Open System Properties → Environment Variables
   - Add `C:\Program Files\nodejs\` to your User PATH
   - Restart terminal

### If you get permission errors:

Run PowerShell as Administrator and try again.

## Quick Test After Setup

Once everything is installed, test the app:

1. **Install dependencies:**
   ```powershell
   npm install
   ```

2. **Start dev server:**
   ```powershell
   npm run dev
   ```

3. **Open browser:** http://localhost:5173

4. **Test features:**
   - Click "Load Seahaven" to load demo data
   - Add a quest
   - Add an NPC
   - Get session suggestions

## Need Help?

If you continue to have issues:
1. Make sure Node.js is installed: https://nodejs.org/
2. Verify installation: `node --version` and `npm --version`
3. Check that you're in the project directory
4. Try restarting your terminal after installation

