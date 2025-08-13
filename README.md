# TeamWave Website

A professional esports organization website built with React, TypeScript, Node.js, and MongoDB.

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd site
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the `backend` directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/teamwave-db
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRATION=1d
   ```

   Create a `.env` file in the `frontend` directory:
   ```env
   REACT_APP_API_HOST=localhost
   REACT_APP_API_PORT=5000
   REACT_APP_API_PROTOCOL=http
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

   This will start both the backend (port 5000) and frontend (port 3000) servers.

## 📁 Project Structure

```
site/
├── frontend/          # React TypeScript frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── context/       # React context
│   └── public/            # Static assets
├── backend/           # Node.js Express backend
│   ├── controllers/   # Route controllers
│   ├── models/        # MongoDB models
│   ├── routes/        # API routes
│   ├── middleware/    # Express middleware
│   └── config/        # Configuration files
└── package.json       # Root package.json
```

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run frontend` - Start only the frontend server
- `npm run backend` - Start only the backend server
- `npm run build` - Build both frontend and backend for production
- `npm run install:all` - Install dependencies for all packages

### Backend API

The backend provides RESTful APIs for:

- **Authentication** - User registration and login
- **Events** - Tournament and event management
- **Members** - Team member profiles
- **Teams** - Team management
- **News** - News articles and updates
- **Partners** - Partner/sponsor information
- **Products** - Shop/merchandise
- **Videos** - Video content management
- **Contact** - Contact form submissions

### Frontend Features

- **Responsive Design** - Mobile-first approach
- **Admin Panel** - Content management interface
- **Image Upload** - File upload with cropping
- **Rich Text Editor** - Content editing capabilities
- **Real-time Updates** - Live data synchronization

## 🗄️ Database

The application uses MongoDB with the following collections:

- Users
- Events
- Members
- Teams
- News
- Partners
- Products
- Videos
- Contact Messages
- Registrations

## 🔧 Configuration

### Environment Variables

**Backend (.env in backend directory):**
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 5000)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRATION` - Token expiration time

**Frontend (.env in frontend directory):**
- `REACT_APP_API_HOST` - Backend API host
- `REACT_APP_API_PORT` - Backend API port
- `REACT_APP_API_PROTOCOL` - API protocol (http/https)

## 🧪 Testing

To run tests (when implemented):
```bash
npm test
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For questions or issues:
1. Check the console logs for errors
2. Verify environment variables are set correctly
3. Ensure MongoDB is running and accessible
4. Check API endpoints are responding

---

**TeamWave** - Professional Esports Organization 