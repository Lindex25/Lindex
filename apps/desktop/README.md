# LINDEX Personal Desktop

**MVP Electron Shell** for the LINDEX Personal AI Assistant.

## Overview

This is a minimal Electron desktop application that wraps the Next.js web UI (`apps/api-web`) in a native desktop shell. The Electron window loads the web interface and provides a foundation for future native desktop integrations.

## Development Setup

### Step 1: Start the Next.js Dev Server

From the `apps/api-web` directory, start the Next.js development server:

```bash
cd apps/api-web
npm run dev
```

This will start the web server on `http://localhost:3000`.

### Step 2: Launch the Electron Shell

In a separate terminal, from the `apps/desktop` directory, start the Electron app:

```bash
cd apps/desktop
npm install  # First time only
npm start
```

The Electron window will open and load the Next.js UI from `http://localhost:3000`.

## How It Works

The Electron shell acts as a native browser wrapper around the Next.js web application. This means:

- ✅ **Hot reloading works**: Any changes you make to the web UI in `apps/api-web` will automatically reflect in the Electron window
- ✅ **DevTools are open by default**: Use Chrome DevTools for debugging (same as web development)
- ✅ **Secure by default**: Node integration is disabled, context isolation is enabled

## Current Features

- Native desktop window (1200×800)
- Loads LINDEX web interface
- Standard desktop behaviors (minimize, maximize, close)
- Platform-specific window management (macOS dock integration)

## Roadmap: Native Desktop Integrations

This is the **MVP shell**. Future native integrations planned for the desktop app include:

- 🔜 **Drag and drop**: Drag files/folders into LINDEX for instant analysis
- 🔜 **Local file access**: Direct access to filesystem for indexing and search
- 🔜 **System tray integration**: Quick access from menu bar/system tray
- 🔜 **Global shortcuts**: Summon LINDEX with keyboard shortcuts
- 🔜 **Native notifications**: Desktop notifications for important events
- 🔜 **Offline mode**: Local-first functionality with sync
- 🔜 **Deep OS integration**: Context menus, file associations, etc.

## Architecture Notes

- **Technology**: Electron (Chromium + Node.js)
- **Security**: Context isolation enabled, Node integration disabled in renderer
- **Development**: Loads from `http://localhost:3000` (Next.js dev server)
- **Production**: Will bundle and serve the Next.js build locally

## Troubleshooting

**Electron window is blank or shows error:**
- Ensure the Next.js dev server is running on `http://localhost:3000`
- Check the DevTools console for errors

**Changes not reflecting:**
- The Next.js hot reload should work automatically
- If needed, refresh the Electron window: `Cmd+R` (macOS) or `Ctrl+R` (Windows/Linux)

**Port conflicts:**
- If port 3000 is in use, update the URL in `main.js` to match your Next.js dev server port

---

**Part of the LINDEX monorepo**
- `apps/api-web` - Next.js web interface
- `apps/mobile` - React Native mobile app
- `apps/desktop` - Electron desktop app (this project)


