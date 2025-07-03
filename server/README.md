# Email IMAP Server

This is the backend server that provides real IMAP email connections for the Roofund app.

## Features

- **Real IMAP Connections**: Connects to actual email servers using credentials
- **Production-Grade Security**: Helmet, CORS, timeouts, and error handling
- **Universal Email Support**: Works with Gmail, Outlook, Yahoo, and any IMAP provider

## API Endpoints

### POST /api/email/test-connection
Tests if email credentials can successfully connect to the IMAP server.

**Request Body:**
```json
{
  "email": "user@gmail.com",
  "password": "app-password-here",
  "imapHost": "imap.gmail.com",
  "imapPort": 993,
  "imapSecurity": "ssl"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email connection successful"
}
```

### POST /api/email/fetch-latest
Fetches the latest email from the user's inbox.

**Request Body:** Same as test-connection

**Response:**
```json
{
  "success": true,
  "email": {
    "uid": 12345,
    "subject": "Your order confirmation",
    "from": "orders@amazon.com",
    "date": "2024-07-03T10:30:00.000Z",
    "snippet": "Thank you for your order..."
  }
}
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Start the server:
```bash
npm run dev  # Development mode with nodemon
npm start    # Production mode
```

## Environment Variables

- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `CORS_ORIGIN` - Allowed frontend origin (default: http://localhost:8080)

## Email Provider Setup

### Gmail
- Enable 2-factor authentication
- Generate App Password: Google Account → Security → 2-Step Verification → App passwords
- Use App Password (16 characters with dashes) instead of regular password
- IMAP: imap.gmail.com:993 (SSL)

### Outlook/Hotmail
- Enable 2-factor authentication (recommended)
- IMAP: outlook.office365.com:993 (SSL)
- Use regular password or App Password

### Yahoo Mail
- Enable 2-factor authentication
- Generate App Password: Account Security → Generate app password
- IMAP: imap.mail.yahoo.com:993 (SSL)

## Security Features

- Helmet for security headers
- CORS protection
- Connection timeouts (30s for test, 60s for fetch)
- Error message sanitization
- No credential storage on server