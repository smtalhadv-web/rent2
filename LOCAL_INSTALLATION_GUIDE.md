# 🏠 Local Installation Guide - Plaza Rent Management System

## 📋 Prerequisites

Before starting, make sure you have these installed on your computer:

### 1. Install Node.js
- Download from: https://nodejs.org/
- Choose "LTS" version (recommended)
- Run the installer and follow instructions

### 2. Verify Installation
Open Command Prompt (Windows) or Terminal (Mac/Linux) and run:
```bash
node --version
# Should show: v18.x.x or higher

npm --version
# Should show: 9.x.x or higher
```

---

## 🚀 Step-by-Step Local Installation

### Step 1: Download/Clone the Project

**Option A: If you have the ZIP file**
```bash
# Extract the ZIP file to a folder
# Example: C:\Projects\plaza-rent-app
```

**Option B: If using Git**
```bash
git clone <your-repository-url>
cd plaza-rent-app
```

---

### Step 2: Open Terminal in Project Folder

**Windows:**
1. Open the project folder
2. Hold `Shift` + Right Click
3. Select "Open PowerShell window here" or "Open Command Prompt here"

**Or use Command Prompt:**
```bash
cd C:\path\to\plaza-rent-app
```

**Mac/Linux:**
```bash
cd /path/to/plaza-rent-app
```

---

### Step 3: Install Dependencies

Run this command:
```bash
npm install
```

Wait for it to complete (may take 2-5 minutes).

---

### Step 4: Run the Application

**For Development (with hot reload):**
```bash
npm run dev
```

You'll see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

**Open your browser and go to:** `http://localhost:5173`

---

### Step 5: Build for Production

```bash
npm run build
```

This creates a `dist` folder with production-ready files.

---

### Step 6: Preview Production Build

```bash
npm run preview
```

This runs the production build locally at `http://localhost:4173`

---

## 📱 Install as PWA (Progressive Web App)

### On Desktop (Chrome):

1. Open `http://localhost:5173` in Chrome
2. Look for the **install icon** (➕) in the address bar
3. Click "Install"
4. App will open as a standalone window!

### On Mobile:

1. Open `http://192.168.x.x:5173` on your phone (use Network URL)
2. **Android Chrome:** Menu → "Add to Home Screen"
3. **iPhone Safari:** Share button → "Add to Home Screen"

---

## 🔧 Common Commands

| Command | Purpose |
|---------|---------|
| `npm install` | Install all dependencies |
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

---

## 🌐 Access from Other Devices (Same Network)

1. Find your computer's IP address:
   - **Windows:** `ipconfig` → Look for IPv4 Address
   - **Mac/Linux:** `ifconfig` or `ip addr`

2. When you run `npm run dev`, note the Network URL:
   ```
   ➜  Network: http://192.168.1.100:5173/
   ```

3. Open this URL on your phone or other computers on the same WiFi!

---

## 🔥 Run with HTTPS (Required for PWA on Network)

Create a file `vite.config.local.ts`:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [react(), basicSsl()],
  server: {
    https: true,
    host: true
  }
})
```

Then run:
```bash
npm install -D @vitejs/plugin-basic-ssl
npm run dev
```

---

## 📁 Project Structure

```
plaza-rent-app/
├── public/
│   ├── manifest.json      # PWA manifest
│   ├── sw.js              # Service Worker
│   ├── icons/             # App icons
│   └── .htaccess          # Apache routing
├── src/
│   ├── components/        # React components
│   ├── pages/             # Page components
│   ├── types/             # TypeScript types
│   ├── App.tsx            # Main app
│   └── main.tsx           # Entry point
├── index.html             # HTML template
├── package.json           # Dependencies
└── vite.config.ts         # Vite config
```

---

## 🔐 Login Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Owner | owner | owner123 |
| Accountant | accountant | acc123 |

---

## ❓ Troubleshooting

### Error: "npm is not recognized"
- Node.js is not installed. Download from https://nodejs.org/

### Error: "EACCES permission denied"
```bash
# Mac/Linux - Run with sudo
sudo npm install
```

### Error: "Port 5173 is already in use"
```bash
# Use different port
npm run dev -- --port 3000
```

### App not loading on phone
1. Make sure phone and computer are on same WiFi
2. Use the Network URL, not localhost
3. Check firewall settings

### PWA Install button not showing
1. Must use HTTPS or localhost
2. Clear browser cache
3. Check browser console for errors

---

## 🖥️ Deploy on Local Network Server

### Option 1: Using serve (Simple)

```bash
# Install serve globally
npm install -g serve

# Build the project
npm run build

# Serve the dist folder
serve -s dist -l 3000
```

Access at: `http://localhost:3000`

### Option 2: Using PM2 (Production)

```bash
# Install PM2
npm install -g pm2

# Install serve
npm install -g serve

# Build
npm run build

# Start with PM2
pm2 start "serve -s dist -l 80" --name plaza-app

# Auto-start on boot
pm2 startup
pm2 save
```

### Option 3: Using XAMPP/WAMP

1. Build: `npm run build`
2. Copy `dist` folder contents to `htdocs` (XAMPP) or `www` (WAMP)
3. Access: `http://localhost/`

---

## ✅ Quick Start Summary

```bash
# 1. Open terminal in project folder

# 2. Install dependencies
npm install

# 3. Run development server
npm run dev

# 4. Open browser
# http://localhost:5173

# 5. Login with: admin / admin123
```

**That's it! Your app is running locally! 🎉**

---

## 📞 Need Help?

If you encounter any issues:
1. Check the Troubleshooting section above
2. Make sure all prerequisites are installed
3. Try deleting `node_modules` folder and run `npm install` again

```bash
# Windows
rmdir /s /q node_modules
npm install

# Mac/Linux
rm -rf node_modules
npm install
```
