# Roofund - Email Transaction Tracker

A modern web application that connects to your email accounts and helps track transaction emails, order confirmations, and refunds.

## 🚀 Features

- **Real IMAP Email Connections** - Connects to actual email servers (no simulation!)
- **Universal Email Support** - Works with Gmail, Outlook, Yahoo, and any IMAP provider
- **Transaction Email Scanning** - Fetches and analyzes purchase confirmations
- **Modern UI** - Built with React, TypeScript, Tailwind CSS, and shadcn/ui

## 🏗️ Architecture

- **Frontend**: Vite + React + TypeScript + shadcn/ui
- **Backend**: Express.js + node-imap for real email connections
- **No Database Required** - Credentials stored locally for testing

## 🔧 Setup & Installation

### Quick Start
```bash
# Install frontend dependencies
npm install

# Install backend dependencies  
cd server && npm install && cd ..

# Start both servers
./start-servers.sh
```

### Manual Setup
```bash
# Terminal 1: Start backend
cd server
npm run dev

# Terminal 2: Start frontend
npm run dev
```

The app will be available at:
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3001

## 📧 Email Provider Setup

### Gmail
1. Enable 2-factor authentication
2. Go to Google Account → Security → 2-Step Verification → App passwords
3. Generate App Password (16 characters with dashes)
4. Use App Password instead of regular password
5. IMAP Settings: `imap.gmail.com:993` (SSL)

### Outlook/Hotmail  
1. Enable 2-factor authentication (recommended)
2. IMAP Settings: `outlook.office365.com:993` (SSL)
3. Use regular password or App Password

### Yahoo Mail
1. Enable 2-factor authentication
2. Go to Account Security → Generate app password
3. IMAP Settings: `imap.mail.yahoo.com:993` (SSL)

## 🧪 Testing Real Connections

1. Enter your email credentials in the app
2. The backend will attempt a real IMAP connection
3. Invalid credentials will show specific error messages
4. Valid credentials will successfully connect and fetch emails

**Test Cases:**
- ❌ Wrong password → "Invalid credentials (Failure)"
- ❌ Wrong IMAP host → "Connection failed"  
- ❌ Gmail without App Password → Authentication error
- ✅ Valid credentials → Connection successful

## 🔒 Security

- No credentials stored on server
- CORS protection
- Helmet security headers
- Connection timeouts
- Error message sanitization

## 📁 Project Structure

```
/
├── src/                 # Frontend React app
│   ├── components/      # UI components
│   ├── store/          # Zustand state management
│   └── pages/          # App pages
├── server/             # Backend Express API
│   ├── server.js       # Main server file
│   └── package.json    # Backend dependencies
└── start-servers.sh    # Startup script
```

## 🚀 Production Deployment

### Backend (Vercel/Railway/Heroku)
```bash
cd server
npm start
```

### Frontend (Netlify/Vercel)
```bash
npm run build
# Deploy dist/ folder
```

Update `CORS_ORIGIN` environment variable to your frontend domain.

## 🛠️ Development

### Available Scripts

**Frontend:**
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

**Backend:**
- `npm run dev` - Start with nodemon (auto-reload)
- `npm start` - Start production server

### API Endpoints

- `POST /api/email/test-connection` - Test IMAP credentials
- `POST /api/email/fetch-latest` - Fetch latest email from inbox
- `GET /health` - Health check

## 🔍 Troubleshooting

**"IMAP connection failed"**
- Check email provider requires App Password
- Verify IMAP host and port are correct
- Ensure 2FA is enabled for provider

**"Connection timeout"**
- Check internet connection
- Try different IMAP host (some providers have multiple)
- Firewall may be blocking IMAP ports

**Frontend can't reach backend**
- Ensure backend is running on port 3001
- Check CORS configuration
- Verify frontend is calling correct API URL

## 📄 License

MIT License - feel free to use this project for learning and development.