# 🚀 Deployment Guide

## Environment Variables Required

Set these environment variables in your deployment platform:

```bash
TRAVELPORT_USERNAME=your_username
TRAVELPORT_PASSWORD=your_password  
TRAVELPORT_BRANCH=your_branch
TRAVELPORT_ENDPOINT=https://api.pp.travelport.com
TRAVELPORT_ACCESS_GROUP=006C2E1A-5BAF-4503-BA51-B51F163E4727
PORT=3000
NODE_ENV=production
```

## Deployment Options

### 1. Vercel (Recommended)
- Free tier available
- Automatic deployments from GitHub
- Built-in environment variable management

**Steps:**
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### 2. Railway
- Simple deployment
- Good for Node.js apps
- Free tier available

**Steps:**
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

### 3. Heroku
- Classic platform
- Free tier discontinued, but cheap options available

**Steps:**
1. Install Heroku CLI
2. Create Heroku app
3. Set environment variables
4. Deploy with Git

### 4. DigitalOcean App Platform
- Good performance
- Reasonable pricing

**Steps:**
1. Connect GitHub repository
2. Configure app.yaml
3. Set environment variables
4. Deploy

## Security Considerations

1. **Never commit API credentials** to version control
2. **Use environment variables** for all sensitive data
3. **Enable HTTPS** (most platforms do this automatically)
4. **Set up proper CORS** for production domains
5. **Consider rate limiting** for production use

## Post-Deployment Checklist

- [ ] Environment variables configured
- [ ] HTTPS enabled
- [ ] CORS configured for production domain
- [ ] API credentials working
- [ ] Flight search functionality tested
- [ ] Price comparison working
- [ ] Error handling in place
