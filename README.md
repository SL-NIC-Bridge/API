# SL-NIC-Bridge API

A robust Node.js API built with Express, PostgreSQL, Prisma, TypeScript, and comprehensive logging.

## 🚀 Features

- **Express.js** - Fast, unopinionated web framework
- **PostgreSQL** - Powerful, open-source database
- **Prisma** - Modern database toolkit and ORM
- **TypeScript** - Type-safe JavaScript
- **Winston** - Comprehensive logging with file rotation
- **Security** - Helmet, CORS, rate limiting
- **Testing** - Jest configuration ready
- **ESLint** - Code quality and consistency

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd API
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/sl_nic_bridge_db?schema=public"
   PORT=3000
   NODE_ENV=development
   JWT_SECRET=your-super-secret-jwt-key-here
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Seed the database with initial data
   npm run db:seed
   ```

## 🚀 Running the Application

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

## 📚 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build TypeScript to JavaScript |
| `npm start` | Start production server |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema changes to database |
| `npm run db:migrate` | Run database migrations |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:seed` | Seed database with initial data |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues |
| `npm test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |

## 🗄️ Database Schema

The API includes the following models:

### User
- `id` - Unique identifier
- `email` - Email address (unique)
- `name` - Full name
- `password` - Hashed password
- `role` - User role (USER/ADMIN)
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

### Post
- `id` - Unique identifier
- `title` - Post title
- `content` - Post content
- `published` - Publication status
- `authorId` - Reference to User
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

## 🔌 API Endpoints

### Health Check
- `GET /api/health` - Check API and database status

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Root
- `GET /` - API information

## 🏗️ Architecture

The API follows a layered architecture pattern:

### Controllers Layer
- **Business Logic**: All business logic is contained in controller classes
- **BaseController**: Provides common functionality like validation, logging, and response handling
- **Separation of Concerns**: Routes only handle HTTP routing, controllers handle business logic
- **Reusability**: Common utilities can be shared across controllers

### Routes Layer
- **Thin Layer**: Routes only define endpoints and delegate to controllers
- **Clean Imports**: Uses index files for cleaner imports
- **HTTP Specific**: Handles only HTTP-related concerns

### DTOs & Validation
- **Data Transfer Objects**: Strongly typed request/response interfaces
- **Request Validation**: Joi schemas for input validation
- **Type Safety**: Full TypeScript support with proper type checking
- **API Documentation**: Self-documenting API through DTOs

### Repository Layer
- **Data Access**: Centralized database operations
- **Query Abstraction**: Prisma queries separated from business logic
- **Error Handling**: Consistent database error handling and logging
- **Type Safety**: Safe return types without sensitive data (e.g., no passwords)
- **Reusability**: Common database operations shared across controllers

## 📝 Logging

The API uses Winston for comprehensive logging:

- **Console logging** in development
- **File rotation** for production logs
- **Request/response logging** with timing
- **Error logging** with stack traces
- **Structured JSON logs** for easy parsing

Log files are stored in the `logs/` directory:
- `combined-YYYY-MM-DD.log` - All logs
- `error-YYYY-MM-DD.log` - Error logs only

## 🔒 Security Features

- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - Request throttling
- **Input Validation** - Request data validation
- **Error Handling** - Secure error responses

## 🧪 Testing

The project includes Jest configuration for testing:

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📁 Project Structure

```
src/
├── config/          # Configuration files
│   ├── database.ts  # Prisma client setup
│   └── logger.ts    # Winston logger setup
├── controllers/     # Business logic layer
│   ├── baseController.ts # Base controller with common functionality
│   ├── userController.ts # User business logic
│   ├── healthController.ts # Health check logic
│   └── index.ts     # Controller exports
├── repositories/    # Data access layer
│   ├── baseRepository.ts # Base repository with common operations
│   ├── userRepository.ts # User database operations
│   ├── healthRepository.ts # Health check database operations
│   └── index.ts     # Repository exports
├── middleware/      # Express middleware
│   ├── logger.ts    # Request logging
│   ├── errorHandler.ts # Error handling
│   └── validation.ts # Request validation
├── routes/          # API routes (thin layer)
│   ├── health.ts    # Health check endpoint
│   └── users.ts     # User CRUD endpoints
├── types/           # TypeScript type definitions
│   └── dto/         # Data Transfer Objects
│       ├── common.dto.ts # Common DTOs
│       ├── user.dto.ts # User DTOs
│       ├── health.dto.ts # Health DTOs
│       └── index.ts # DTO exports
├── validation/      # Joi validation schemas
│   ├── user.validation.ts # User validation schemas
│   └── index.ts     # Validation exports
├── prisma/          # Database related
│   ├── schema.prisma # Prisma schema
│   └── seed.ts      # Database seeding
├── __tests__/       # Test files
├── app.ts           # Express app setup
└── index.ts         # Server entry point
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
