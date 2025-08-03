# 🚀 TeamWave Deployment Guide

## Quick Start - Deploy to Vercel

### Step 1: Prepare Your Repository

1. **Initialize Git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create GitHub Repository**:
   - Go to [GitHub](https://github.com)
   - Create a new repository
   - Push your code:
   ```bash
   git remote add origin https://github.com/yourusername/teamwave-website.git
   git push -u origin main
   ```

### Step 2: Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel**:
   - Visit [vercel.com](https://vercel.com)
   - Sign up/Login with GitHub

2. **Import Project**:
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect the configuration

3. **Configure Environment Variables**:
   - Go to Project Settings → Environment Variables
   - Add the following variables:

   **Backend Variables:**
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/teamwave-db
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRATION=1d
   ```

   **Frontend Variables:**
   ```
   REACT_APP_API_HOST=your-vercel-domain.vercel.app
   REACT_APP_API_PORT=443
   REACT_APP_API_PROTOCOL=https
   ```

4. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete

#### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

### Step 3: Set Up MongoDB

1. **Create MongoDB Atlas Account**:
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a free account

2. **Create Database**:
   - Create a new cluster
   - Create a database named `teamwave-db`
   - Create a user with read/write permissions

3. **Get Connection String**:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your user password

4. **Update Vercel Environment Variables**:
   - Go to your Vercel project settings
   - Update `MONGO_URI` with your connection string

### Step 4: Test Your Deployment

1. **Check API Health**:
   - Visit: `https://your-domain.vercel.app/api/health`
   - Should return: `{"status":"OK","timestamp":"...","environment":"production"}`

2. **Test Frontend**:
   - Visit: `https://your-domain.vercel.app`
   - Should show the TeamWave website

3. **Test Admin Panel**:
   - Visit: `https://your-domain.vercel.app/admin`
   - Login with admin credentials

## 🔧 Troubleshooting

### Common Issues:

1. **Build Fails**:
   - Check Vercel build logs
   - Ensure all dependencies are in package.json
   - Verify TypeScript compilation

2. **API Not Working**:
   - Check MongoDB connection string
   - Verify environment variables in Vercel
   - Check API routes in `/api/health`

3. **Images Not Loading**:
   - Check uploads directory permissions
   - Verify static file serving configuration

4. **CORS Errors**:
   - Ensure CORS is properly configured
   - Check frontend API URL configuration

### Debug Endpoints:

- `/api/health` - API health check
- `/api/test` - Basic API test
- `/api/debug-files` - File system debugging

## 📝 Post-Deployment Checklist

- [ ] MongoDB connection working
- [ ] Admin panel accessible
- [ ] Image uploads working
- [ ] All API endpoints responding
- [ ] Frontend loading correctly
- [ ] Environment variables set
- [ ] Custom domain configured (optional)

## 🔗 Useful Commands

```bash
# Local development
npm run dev

# Build for production
npm run build

# Deploy to Vercel
vercel --prod

# Check deployment status
vercel ls

# View deployment logs
vercel logs
```

## 📞 Support

If you encounter issues:

1. Check Vercel deployment logs
2. Verify environment variables
3. Test API endpoints individually
4. Check MongoDB connection
5. Review browser console for frontend errors

---

**TeamWave** - Professional Esports Organization 