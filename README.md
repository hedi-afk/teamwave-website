# TeamWave Website

A professional esports organization website built with React, TypeScript, Node.js, and MongoDB.

## 🚀 Quick Deploy to Vercel

### Option 1: Deploy with Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from project root**
   ```bash
   vercel
   ```

### Option 2: Deploy via GitHub

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with GitHub
   - Click "New Project"
   - Import your GitHub repository
   - Configure environment variables (see below)
   - Deploy!

## 🔧 Environment Variables

### Backend Environment Variables
Create a `.env` file in the `backend` directory:

```env
NODE_ENV=production
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=1d
```

### Frontend Environment Variables
Create a `.env` file in the `frontend` directory:

```env
REACT_APP_API_HOST=your-vercel-domain.vercel.app
REACT_APP_API_PORT=443
REACT_APP_API_PROTOCOL=https
```

### Vercel Environment Variables
Set these in your Vercel project settings:

**Backend Variables:**
- `MONGO_URI`: Your MongoDB connection string
- `JWT_SECRET`: Your JWT secret key
- `JWT_EXPIRATION`: Token expiration time (e.g., "1d")

**Frontend Variables:**
- `REACT_APP_API_HOST`: Your Vercel domain
- `REACT_APP_API_PORT`: 443 (for HTTPS)
- `REACT_APP_API_PROTOCOL`: https

## 📁 Project Structure

```
site/
├── frontend/          # React TypeScript frontend
├── backend/           # Node.js Express backend
├── vercel.json        # Vercel deployment config
└── package.json       # Root package.json
```

## 🛠️ Local Development

1. **Install dependencies**
   ```bash
   npm run install:all
   ```

2. **Start development servers**
   ```bash
   npm run dev
   ```

3. **Build for production**
   ```bash
   npm run build
   ```

## 🚀 Deployment Features

- **Automatic builds** on every push to main branch
- **Preview deployments** for pull requests
- **Serverless functions** for the backend API
- **Static hosting** for the React frontend
- **Custom domains** support
- **Environment variables** management

## 📝 Deployment Checklist

- [ ] MongoDB database set up
- [ ] Environment variables configured in Vercel
- [ ] GitHub repository connected to Vercel
- [ ] Custom domain configured (optional)
- [ ] SSL certificate enabled (automatic with Vercel)

## 🔗 Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas](https://www.mongodb.com/atlas)
- [React Documentation](https://reactjs.org/docs/)
- [Express.js Documentation](https://expressjs.com/)

## 📞 Support

For deployment issues or questions, please check:
1. Vercel deployment logs
2. Environment variables configuration
3. MongoDB connection string
4. API endpoint configuration

---

**TeamWave** - Professional Esports Organization 