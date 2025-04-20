# Node Express TypeScript Boilerplate

A production-ready RESTful API boilerplate built with Node.js, Express, TypeScript, and MongoDB.

## Features

- **TypeScript** - Type safety for your JavaScript code
- **Express.js** - Fast, unopinionated, minimalist web framework for Node.js
- **MongoDB with Mongoose** - Object Data Modeling for MongoDB
- **Authentication & Authorization** - JWT-based authentication with refresh tokens
- **Session Management** - Limit to two active sessions per user
- **API Documentation** - Auto-generated API documentation
- **API Validation** - Request data validation using Zod
- **Error Handling** - Centralized error handling with custom API errors
- **Logging** - Using Winston for application logging
- **Testing** - Unit and integration tests using Jest
- **Environment Variables** - Using dotenv for environment configuration
- **Linting & Formatting** - ESLint and Prettier for consistent code style
- **Security** - Set security-related HTTP headers using Helmet
- **Compression** - Gzip compression for HTTP responses
- **CORS** - Cross-Origin Resource Sharing enabled
- **Rate Limiting** - Protect against brute-force attacks
- **Versioned API** - Support for API versioning (e.g., /api/v1)

## Project Structure

```
node-express-boilerplate/
├── src/                        # Source files
│   ├── config/                 # Configuration files
│   ├── controllers/            # Controller files
│   ├── interfaces/             # TypeScript interfaces
│   ├── middlewares/            # Custom middlewares
│   ├── models/                 # Mongoose models
│   ├── routes/                 # API routes
│   │   └── v1/                 # API version 1 routes
│   ├── services/               # Business logic
│   ├── utils/                  # Utility functions
│   ├── validations/            # Request validations
│   ├── app.ts                  # Express app setup
│   └── index.ts                # App entry point
├── tests/                      # Test files
├── .env                        # Environment variables
├── .eslintrc                   # ESLint configuration
├── .prettierrc                 # Prettier configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Project dependencies
```

## Getting Started

### Prerequisites

- Node.js (>= 14.x)
- MongoDB

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/node-express-boilerplate.git
cd node-express-boilerplate
```

2. Install dependencies

```bash
npm install
```

3. Create environment files

```bash
cp .env.example .env
```

4. Start development server

```bash
npm run dev
```

### Environment Variables

```
# Environment
NODE_ENV=development

# Server
PORT=3000
HOST=localhost

# MongoDB
MONGODB_URI=mongodb://localhost:27017/express-boilerplate

# JWT
JWT_SECRET=your-secret-key
JWT_ACCESS_EXPIRATION_MINUTES=30
JWT_REFRESH_EXPIRATION_DAYS=30

# CORS
CORS_ORIGIN=*
```

### Available Scripts

- `npm run dev` - Start development server with hot-reloading
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Check for linting errors
- `npm run lint:fix` - Fix linting errors
- `npm run format` - Format code with Prettier
- `npm test` - Run tests

## API Endpoints

### Auth Routes

- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user

### Protected Routes

- `GET /api/v1/home` - Example protected route

## License

This project is licensed under the MIT License.
