# Webhook Inspector

A modern, full-stack application designed to capture, inspect, and automatically generate TypeScript handlers for webhook requests. Features real-time visualization with AI-powered handler code generation.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Running](#-running)
- [API Documentation](#-api-documentation)
- [Architecture](#-architecture)

## ✨ Features

- **Webhook Capture**: Real-time webhook request logging and inspection
- **AI Handler Generation**: Automatically generate TypeScript/Zod handlers from webhook payloads using Claude AI
- **Interactive Dashboard**: Modern React UI for viewing and managing webhooks
- **Type-Safe API**: End-to-end type safety with Zod validation
- **Database Persistence**: Store and retrieve webhook history
- **Auto-Generated Docs**: Interactive API documentation with Scalar

## 🚀 Tech Stack

### Frontend (`/web`)
- **React 19** - Latest UI framework with newest features
- **Vite** - Lightning-fast build tool and dev server
- **TypeScript** - Full type safety
- **Tailwind CSS** - Utility-first styling
- **TanStack Router** - Modern routing
- **TanStack Query** - Data fetching & caching
- **Lucide React** - Beautiful icons

### Backend (`/api`)
- **Fastify** - High-performance Node.js web framework
- **Drizzle ORM** - Type-safe SQL ORM
- **PostgreSQL** - Relational database
- **Zod** - Schema validation
- **Claude AI API** - Handler generation
- **Docker** - Database containerization

### Tools & Libraries
- **@fastify/type-provider-zod** - Fastify + Zod integration
- **Scalar** - Interactive API docs at `/docs`
- **UUIDv7** - Time-sortable identifiers
- **Biome** - Fast linter & formatter

## 📁 Project Structure

```
.
├── api/                 # Fastify backend
│   ├── src/
│   │   ├── db/         # Drizzle schemas & migrations
│   │   ├── routes/     # API endpoints
│   │   ├── server.ts   # Server setup
│   │   └── env.ts      # Environment variables
│   └── package.json
├── web/                # React frontend
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── routes/     # Page routes
│   │   ├── http/       # API client
│   │   └── main.tsx    # Entry point
│   └── package.json
└── pnpm-workspace.yaml # Monorepo configuration
```

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [pnpm](https://pnpm.io/)
- [Docker](https://www.docker.com/)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd webhook-inspector
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Setup environment variables**
   ```bash
   cd api
   cp .env.example .env  # Configure with your credentials
   ```

4. **Start PostgreSQL**
   ```bash
   docker-compose up -d
   ```

5. **Run database migrations**
   ```bash
   pnpm db:generate
   pnpm db:migrate
   ```

## 🚀 Running

### Development Mode

**Terminal 1 - Backend:**
```bash
cd api
pnpm dev
```
Backend runs on `http://localhost:3000`

**Terminal 2 - Frontend:**
```bash
cd web
pnpm dev
```
Frontend runs on `http://localhost:5173`

### Production Build
```bash
pnpm build
pnpm start
```

## 📚 API Documentation

Interactive API documentation is available at:
```
http://localhost:3000/docs
```

### Key Endpoints

- `POST /webhooks/:id/capture` - Capture webhook payload
- `GET /webhooks` - List all webhooks
- `GET /webhooks/:id` - Get webhook details
- `DELETE /webhooks/:id` - Delete webhook
- `POST /api/generate` - Generate TypeScript handler from webhook payloads

## 🏗️ Architecture

### Data Flow

1. **Webhook Capture** → External service sends POST to `/webhooks/:id/capture`
2. **Storage** → Payload persisted to PostgreSQL with UUIDv7
3. **Dashboard** → React UI displays captured webhooks in real-time
4. **Handler Generation** → AI analyzes payloads and generates TypeScript + Zod handlers
5. **Code Output** → Generated handlers returned for implementation

### Type Safety

- Zod schemas for all API contracts
- TypeScript inference from Zod
- End-to-end type checking with Fastify type provider
- Database types auto-generated from Drizzle schemas

---

*By Ana678*
