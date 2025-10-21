# 🚀 Travelport Flight Search POC - Deployment Guide

## Quick Start Deployment

### Option 1: Vercel (Recommended - 5 minutes)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial deployment"
   git push origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Set environment variables in Vercel dashboard:
     ```
     TRAVELPORT_USERNAME=your_username
     TRAVELPORT_PASSWORD=your_password
     TRAVELPORT_CLIENT_ID=your_client_id
     TRAVELPORT_CLIENT_SECRET=your_client_secret
     ```
   - Deploy!

### Option 2: Railway

1. **Connect to Railway:**
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub repository
   - Set environment variables in Railway dashboard
   - Deploy automatically!

### Option 3: Heroku

1. **Install Heroku CLI:**
   ```bash
   npm install -g heroku
   ```

2. **Deploy:**
   ```bash
   heroku create your-app-name
   heroku config:set TRAVELPORT_USERNAME=your_username
   heroku config:set TRAVELPORT_PASSWORD=your_password
   heroku config:set TRAVELPORT_CLIENT_ID=your_client_id
   heroku config:set TRAVELPORT_CLIENT_SECRET=your_client_secret
   git push heroku main
   ```

## Environment Variables Required

| Variable | Description | Example |
|----------|-------------|---------|
| `TRAVELPORT_USERNAME` | Your Travelport username | `TP83533767` |
| `TRAVELPORT_PASSWORD` | Your Travelport password | `your_password` |
| `TRAVELPORT_CLIENT_ID` | OAuth client ID | `pp-2r85eJ8HT7YVZwUqVLPxZBjiEjpuUuP6r3zfLPjO` |
| `TRAVELPORT_CLIENT_SECRET` | OAuth client secret | `your_client_secret` |
| `PORT` | Server port (auto-set by platforms) | `3000` |

## Features Included

✅ **Flight Search** - Search flights with multiple criteria  
✅ **Price Comparison** - Compare pricing with different PCCs  
✅ **Price Breakdown** - Detailed pricing with taxes and fees  
✅ **Brand Descriptions** - Human-readable brand names  
✅ **Connection Filtering** - Direct/connecting flight options  
✅ **Responsive Design** - Works on all devices  

## Security Notes

- 🔒 **Never commit API credentials** to version control
- 🔒 **Use environment variables** for all sensitive data
- 🔒 **Enable HTTPS** (automatic on most platforms)
- 🔒 **Set up proper CORS** for production domains

## Post-Deployment Testing

1. **Health Check:** Visit `https://your-app.vercel.app/api/health`
2. **Flight Search:** Test the main search functionality
3. **Price Comparison:** Test with different PCC values
4. **Mobile Responsive:** Test on mobile devices

## Troubleshooting

### Common Issues:

1. **Environment Variables Not Set:**
   - Check platform dashboard for environment variables
   - Ensure all required variables are configured

2. **API Authentication Fails:**
   - Verify Travelport credentials are correct
   - Check API endpoint URLs

3. **CORS Issues:**
   - Update CORS settings for production domain
   - Check browser console for errors

## Support

For deployment issues:
- Check platform-specific documentation
- Review environment variable configuration
- Test API connectivity
- Check server logs for errors

---

**Ready to deploy? Choose your platform and follow the steps above!** 🚀
