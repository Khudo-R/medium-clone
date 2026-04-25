# Medium Clone API

A feature-rich RESTful API built with Node.js, Express, and TypeScript, inspired by Medium. This project demonstrates a scalable architectural pattern with standardized modules, comprehensive OpenAPI documentation, and robust integration testing.

## 🚀 Features

- **User Management**: Authentication with JWT, user registration, profiles, and bio updates.
- **Articles**: Full CRUD support with slug-based retrieval, tag management, and ownership protection.
- **Comments**: Interactive commenting system on articles.
- **API Documentation**: Interactive Swagger UI available at `/api-docs`.
- **Standardized Architecture**: Consistent Error handling, Zod-based validation inside controllers, and typed service layers.

## 🛠 Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT & Bcrypt
- **Validation**: Zod
- **Documentation**: Swagger UI & @asteasolutions/zod-to-openapi
- **Testing**: Vitest & Supertest
- **Logging**: Pino

## 🛠 Getting Started for Developers

### Prerequisites

- Node.js (v18+)
- pnpm (recommended) or npm
- PostgreSQL database

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Khudo-R/medium-clone.git
   cd medium-clone
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Environment Setup**:
   Create a `.env` file in the root directory and configure your environment variables:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/medium_clone"
   JWT_SECRET="your_secure_jwt_secret"
   PORT=3000
   NODE_ENV="development"
   ```

4. **Database Migration**:
   ```bash
   pnpm prisma:migrate
   ```

### Development Scripts

- `pnpm dev`: Start the development server with hot-reload.
- `pnpm build`: Compile TypeScript to JavaScript.
- `pnpm start`: Run the compiled production build.
- `pnpm lint`: Run ESLint checks.
- `pnpm format`: Format code with Prettier.

### Testing

1. **Setup test environment**:
   Ensure you have a `.env.test` file configured for a dedicated test database.
   
2. **Run tests**:
   ```bash
   pnpm test
   ```

## 📖 API Documentation

Once the server is running, visit:
- **Interactive UI**: `http://localhost:3000/api-docs`
- **OpenAPI JSON**: `http://localhost:3000/api-docs.json`
