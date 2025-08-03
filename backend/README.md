# TeamWave API Server

This is the backend server for the TeamWave e-sports website. It provides API endpoints for managing teams, events, members, and products.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)
- [MongoDB](https://www.mongodb.com/) (local or Atlas)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory with the following variables:
   ```
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/teamwave-db
   JWT_SECRET=your-secret-key
   JWT_EXPIRATION=1d
   ```

3. Build the TypeScript code:
   ```bash
   npm run build
   ```

### Running the Server

#### Development mode
```bash
npm run dev
```

#### Production mode
```bash
npm start
```

### Seeding the Database

To populate the database with sample data:
```bash
npm run seed
```

To remove all data:
```bash
npm run seed:destroy
```

## API Endpoints

### Products

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get a product by ID
- `GET /api/products/category/:category` - Get products by category
- `POST /api/products` - Create a new product
- `PUT /api/products/:id` - Update a product
- `DELETE /api/products/:id` - Delete a product

### Teams

- `GET /api/teams` - Get all teams
- `GET /api/teams/:id` - Get a team by ID
- `GET /api/teams/game/:game` - Get teams by game
- `GET /api/teams/status/:status` - Get teams by status
- `POST /api/teams` - Create a new team
- `PUT /api/teams/:id` - Update a team
- `DELETE /api/teams/:id` - Delete a team

### Events

- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get an event by ID
- `GET /api/events/game/:game` - Get events by game
- `GET /api/events/status/:status` - Get events by status
- `GET /api/events/upcoming` - Get upcoming events
- `POST /api/events` - Create a new event
- `PUT /api/events/:id` - Update an event
- `DELETE /api/events/:id` - Delete an event

### Members

- `GET /api/members` - Get all members
- `GET /api/members/:id` - Get a member by ID
- `GET /api/members/username/:username` - Get a member by username
- `GET /api/members/team/:team` - Get members by team
- `GET /api/members/game/:game` - Get members by game
- `POST /api/members` - Create a new member
- `PUT /api/members/:id` - Update a member
- `DELETE /api/members/:id` - Delete a member

## Project Structure

```
server/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/          # Mongoose models
├── routes/          # API routes
├── dist/            # Compiled TypeScript
├── .env             # Environment variables
├── index.ts         # Entry point
└── package.json     # Dependencies and scripts
``` 