# TOTP 2FA Client

React frontend for the TOTP 2FA demo application.

## Quick Start

```bash
cd client
npm install
npm start
```

App runs on `http://localhost:3000` (or next available port)

## Prerequisites

- Backend must be running on `http://localhost:3000`
- Node.js 18+

## Default Credentials

- Username: `demo`
- Password: `password123`

## Features

### Login Flow
1. Enter username and password
2. If 2FA is enabled, enter OTP from your authenticator app
3. Or use a backup code if OTP unavailable

### Setup 2FA with Mobile Authenticator (QR Flow)

**Step 1: Generate QR Code**
1. Log in to the dashboard
2. Click "Generate QR Code" button
3. A QR code will be displayed on screen

**Step 2: Scan with Your Phone**
1. Open your authenticator app (Google Authenticator, Authy, Microsoft Authenticator, etc.)
2. Scan the QR code displayed on the web page
3. If you can't scan, you can manually enter the secret code shown below the QR

**Step 3: Enter OTP to Confirm**
1. After scanning, your authenticator app will show a 6-digit code
2. Enter that code in the input field on the web page
3. Click "Confirm & Enable 2FA"

Your device is now registered and can be used for login!

### Backup Codes
- Generate backup codes for emergency access when you don't have your phone
- Each code can only be used once
- Store these securely - they won't be shown again

## Project Structure

```
client/src/
├── App.js              # Main app with routing
├── components/
│   ├── Login.js        # Login form with 2FA
│   └── Dashboard.js    # Device management UI
└── App.css             # Global styles
```

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production

## Tech Stack

- React 19
- Axios (API calls)
