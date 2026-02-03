# CLAUDE.md - ZooYorkTimes Scraper

## Project Overview

The **ZooYorkTimes Scraper** is a full-stack MERN application that allows users to search, display, and save articles from the New York Times Article Search API. Users can query articles by keywords and date ranges, save interesting articles to a MongoDB database, and manage their saved articles collection.

**Tech Stack**: MongoDB + Express.js + React + Node.js
**Live Demo**: https://zooyorktimes-scraper.herokuapp.com/
**License**: AGPL-3.0

## Architecture

### Monorepo Structure
```
├── server.js                 # Express server (port 3002)
├── package.json              # Backend dependencies
├── controllers/              # Business logic
├── models/                   # MongoDB schemas
├── routes/                   # API endpoints
├── scripts/                  # Build & utility scripts
└── client/                   # React frontend (separate package)
    ├── src/
    │   ├── pages/           # Route components
    │   ├── components/      # Reusable UI components
    │   └── utils/API.js     # API client
    └── build/               # Production build served by Express
```

### Backend (Express API)
- **Entry Point**: [`server.js`](fleet-file://b1l8lgfucek9iv3u4hlc/Users/wrainaud/air/ZooYorkTimes-Scraper/server.js?type=file&root=%252F)
- **Database**: MongoDB via Mongoose ODM
- **API Routes**: RESTful endpoints under `/api/`
- **Static Serving**: React build from `client/build/`
- **Health Checks**: Database connectivity monitoring

### Frontend (React SPA)
- **Entry Point**: [`client/src/index.js`](fleet-file://b1l8lgfucek9iv3u4hlc/Users/wrainaud/air/ZooYorkTimes-Scraper/client/src/index.js?type=file&root=%252F)
- **Routing**: React Router DOM (v4)
- **Styling**: Bootstrap (via CDN)
- **HTTP Client**: Axios for API calls
- **Pages**: Main (search), Saved (collection), NoMatch (404)

## Key Files & Components

### Backend Components

| File | Purpose |
|------|---------|
| [`server.js`](fleet-file://b1l8lgfucek9iv3u4hlc/Users/wrainaud/air/ZooYorkTimes-Scraper/server.js?type=file&root=%252F) | Express server setup, MongoDB connection, static serving |
| [`models/article.js`](fleet-file://b1l8lgfucek9iv3u4hlc/Users/wrainaud/air/ZooYorkTimes-Scraper/models/article.js?type=file&root=%252F) | Article schema with unique URL constraint |
| [`controllers/articlesController.js`](fleet-file://b1l8lgfucek9iv3u4hlc/Users/wrainaud/air/ZooYorkTimes-Scraper/controllers/articlesController.js?type=file&root=%252F) | CRUD operations for articles |
| [`routes/api/articles.js`](fleet-file://b1l8lgfucek9iv3u4hlc/Users/wrainaud/air/ZooYorkTimes-Scraper/routes/api/articles.js?type=file&root=%252F) | Article API endpoints |

### Frontend Components

| File | Purpose |
|------|---------|
| [`client/src/App.js`](fleet-file://b1l8lgfucek9iv3u4hlc/Users/wrainaud/air/ZooYorkTimes-Scraper/client/src/App.js?type=file&root=%252F) | Root component with routing |
| [`client/src/pages/Main/Main.js`](fleet-file://b1l8lgfucek9iv3u4hlc/Users/wrainaud/air/ZooYorkTimes-Scraper/client/src/pages/Main/Main.js?type=file&root=%252F) | Article search page |
| [`client/src/pages/Saved/Saved.js`](fleet-file://b1l8lgfucek9iv3u4hlc/Users/wrainaud/air/ZooYorkTimes-Scraper/client/src/pages/Saved/Saved.js?type=file&root=%252F) | Saved articles management |
| [`client/src/utils/API.js`](fleet-file://b1l8lgfucek9iv3u4hlc/Users/wrainaud/air/ZooYorkTimes-Scraper/client/src/utils/API.js?type=file&root=%252F) | API client functions |

## Development Setup

### Prerequisites
- **Node.js** (with npm/yarn)
- **MongoDB** (v5.0-7.0)
- **NYT API Key** from [developer.nytimes.com](https://developer.nytimes.com/signup)

### Installation
```bash
git clone https://github.com/wrainaud/ZooYorkTimes-Scraper.git
cd ZooYorkTimes-Scraper
yarn install
cd client && yarn install && cd ..
```

### Environment Configuration
Create [`client/.env`](fleet-file://b1l8lgfucek9iv3u4hlc/Users/wrainaud/air/ZooYorkTimes-Scraper/client/.env?type=file&root=%252F):
```
REACT_APP_NYT_API_KEY=your_nyt_api_key_here
```

### Running the Application
```bash
# Start MongoDB (macOS with Homebrew)
brew services start mongodb-community@7.0

# Start development servers
yarn start
# This runs: concurrently "nodemon server.js" "npm run client"
```

**Access Points**:
- Frontend: http://localhost:3002 (React build served by Express)
- Backend API: http://localhost:3002/api/
- Database: mongodb://127.0.0.1:27017/nytreact

## API Endpoints

### Article Management
- `GET /api/saved` - Retrieve all saved articles
- `POST /api/saved` - Save a new article (idempotent by URL)
- `DELETE /api/saved/:id` - Delete article by MongoDB ObjectId

### Health Check
- `GET /api/health` - Database connectivity status

### New York Times Integration
- Frontend calls NYT Article Search API directly from browser
- API key required in `client/.env`

## Database Schema

### Article Model
```javascript
{
  title: String (required),
  url: String (required, unique),
  date: Date (optional),
  _id: ObjectId (auto-generated)
}
```

**Features**:
- Unique constraint on `url` prevents duplicates
- Idempotent saves via MongoDB upsert
- Date field for chronological sorting

## Build & Deployment

### Development Scripts
- `yarn start` - Run both servers concurrently
- `yarn server` - Backend only
- `yarn client` - Frontend build + serve
- `yarn build` - Production React build
- `yarn seed` - Database seeding

### Production Build
1. `yarn build` - Creates optimized React build in `client/build/`
2. Express serves static files from `client/build/`
3. SPA routing: non-API routes fall back to React app

## Error Handling & Resilience

### Database Resilience
- Health check endpoint monitors MongoDB connection
- Graceful degradation when database unavailable
- Frontend disables save functionality on database errors
- API returns 503 when database disconnected

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| MongoDB ECONNREFUSED | Start MongoDB: `brew services start mongodb-community@7.0` |
| API 503 Database unavailable | Check MongoDB connection and `MONGODB_URI` |
| Port 3000 in use | Express defaults to 3002; set `PORT` env var |
| Module errors on modern Node | Remove `node_modules`, reinstall dependencies |

## Testing Strategy
- **Current State**: No automated tests (`"test": "echo \"Error: no test specified\" && exit 1"`)
- **Recommended**: Add unit tests for controllers, integration tests for API endpoints, React component tests

## Contributing

1. Create feature branch from `master`
2. Make changes following existing patterns
3. Test locally with `yarn start`
4. Submit pull request to `master`

**Architecture Guidelines**:
- Keep frontend/backend separation clean
- Use idempotent operations where possible
- Maintain error handling patterns
- Follow React component composition patterns

## License
AGPL-3.0