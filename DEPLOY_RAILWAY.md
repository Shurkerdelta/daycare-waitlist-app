# Quick Deploy to Railway (5 Minutes)

Railway is the easiest and most economical option for testing. Free $5 credit/month.

## Step 1: Push to GitHub

Make sure your code is on GitHub:
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

## Step 2: Deploy on Railway

### Option A: Via Website (Easiest)

1. **Go to:** https://railway.app
2. **Sign up** with GitHub
3. **Click:** "New Project"
4. **Select:** "Deploy from GitHub repo"
5. **Choose** your repository
6. **Railway auto-detects** and deploys!

That's it! Railway will:
- ✅ Detect Node.js automatically
- ✅ Install dependencies (`npm install`)
- ✅ Start your server (`node server.js`)
- ✅ Provide HTTPS URL automatically

### Option B: Via CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

## Step 3: Get Your URL

After deployment, Railway provides:
- **HTTPS URL:** `https://your-app-name.railway.app`
- Share this URL - it works from anywhere!

## Step 4: Update Environment Variables (Optional)

If you need custom configuration:
1. Go to your project on Railway
2. Click "Variables" tab
3. Add environment variables:
   - `PORT` (auto-set, don't change)
   - `NODE_ENV=production`
   - Any other config you need

## That's It! 🎉

Your app is now live at: `https://your-app-name.railway.app`

## Monitoring

- **Logs:** View in Railway dashboard
- **Metrics:** See usage in dashboard
- **Redeploy:** Push to GitHub = auto-redeploy

## Cost

- **Free:** $5 credit/month (usually enough for testing)
- **After credit:** Pay-as-you-go (~$0.01/hour for small apps)

## Troubleshooting

### Build fails
- Check logs in Railway dashboard
- Ensure `package.json` has all dependencies
- Verify `Procfile` or `railway.json` exists

### App not responding
- Check if it's sleeping (first request may be slow)
- View logs for errors
- Verify port is using `process.env.PORT`

### CORS errors
- Your server already has `cors()` enabled
- Should work automatically

## Next Steps

1. **Test your deployed URL**
2. **Share with others** for testing
3. **Monitor usage** in Railway dashboard
4. **Upgrade** if you need more resources

---

**Time to deploy:** ~5 minutes  
**Cost:** Free (with $5 credit)  
**Difficulty:** ⭐ Very Easy
