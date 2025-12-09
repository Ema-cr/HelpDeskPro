# Vercel Deployment Guide

## Quick Deploy

1. **Install Vercel CLI** (if not already installed):
```bash
npm i -g vercel
```

2. **Login to Vercel**:
```bash
vercel login
```

3. **Deploy**:
```bash
vercel --prod
```

## Environment Variables Setup

Go to your Vercel dashboard → Settings → Environment Variables and add:

### Required Variables:
```
MONGODB_URI=mongodb+srv://your-connection-string
JWT_SECRET=your-jwt-secret-key-min-32-chars
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM="HelpDeskPro <your-email@gmail.com>"
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
CRON_REMINDER_ENABLED=true
CRON_REMINDER_HOURS_THRESHOLD=24
```

## After Deployment

1. Update `NEXT_PUBLIC_APP_URL` with your actual Vercel URL
2. Redeploy: `vercel --prod`
3. Test all functionality:
   - Login (client/agent)
   - Create ticket
   - Add comments
   - Update ticket status
   - Email notifications

## Cron Jobs on Vercel

### Option 1: Vercel Cron Jobs (Pro Plan Required)
Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/reminders",
    "schedule": "0 */6 * * *"
  }]
}
```

### Option 2: External Cron Service (Free)
Use services like:
- https://cron-job.org
- https://www.easycron.com
- GitHub Actions

Setup a cron job to call:
```
POST https://your-app.vercel.app/api/cron/reminders
```

## MongoDB Atlas Setup

1. Whitelist Vercel IP addresses or use `0.0.0.0/0` (all IPs)
2. Create a database user with read/write permissions
3. Get connection string from Atlas dashboard

## Troubleshooting

### Build Errors
```bash
npm run build
```
Fix any TypeScript errors before deploying.

### Database Connection Issues
- Verify MongoDB Atlas IP whitelist
- Check connection string format
- Test locally first

### Email Not Working
- Verify SMTP credentials
- Check Gmail app password
- Review Vercel function logs
