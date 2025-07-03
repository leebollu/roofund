# 🚀 Deployment Guide

You need to deploy the backend to a hosting service and update the frontend to use the deployed API URL.

## Option 1: Railway (Recommended) ⚡

Railway is perfect for Node.js APIs and has a generous free tier.

### Steps:
1. **Sign up**: Go to [railway.app](https://railway.app) 
2. **Connect GitHub**: Link your repository
3. **Deploy Backend**:
   ```bash
   cd server
   git init
   git add .
   git commit -m "Initial backend"
   git push origin main
   ```
4. **Railway will auto-deploy** and give you a URL like `https://your-app.railway.app`

### Environment Variables on Railway:
- `NODE_ENV` = `production`
- `CORS_ORIGIN` = `https://id-preview--76b842c5-34fb-4c76-97fb-ad23c3c90c2d.lovable.app`

## Option 2: Vercel 🔷

### Steps:
1. **Sign up**: Go to [vercel.com](https://vercel.com)
2. **Install CLI**: `npm i -g vercel`
3. **Deploy**:
   ```bash
   cd server
   vercel --prod
   ```

## Option 3: Render 🟢

### Steps:
1. **Sign up**: Go to [render.com](https://render.com)
2. **Create Web Service** from GitHub repo
3. **Configure**:
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && npm start`

## Option 4: Quick Test with ngrok 🚇

For immediate testing without deployment:

```bash
# Terminal 1: Start backend
cd server && npm run dev

# Terminal 2: Expose backend publicly
npx ngrok http 3001
```

Copy the ngrok URL (e.g., `https://abc123.ngrok.io`) and update the frontend.

## Update Frontend API URL

Once you have a deployed backend URL:

1. **Edit** `src/config/api.ts`
2. **Replace** `https://your-backend-domain.com` with your actual URL
3. **Build and deploy** frontend

```typescript
// src/config/api.ts
const getApiBaseUrl = (): string => {
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:3001';
  }
  
  // Update this with your deployed backend URL
  return 'https://your-actual-backend-url.railway.app';
};
```

## Testing

After deployment:
1. ✅ Check backend health: `https://your-backend-url.com/health`
2. ✅ Test CORS: Open browser dev tools, try connecting email
3. ✅ Verify API calls work from your Lovable app

## Environment Variables

Set these on your hosting platform:

```env
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://id-preview--76b842c5-34fb-4c76-97fb-ad23c3c90c2d.lovable.app
```

## Security Notes

- Backend validates all inputs
- No credentials stored on server
- CORS properly configured
- Production security headers enabled