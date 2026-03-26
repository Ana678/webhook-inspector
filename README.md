# Webhook Inspector

A modern, full-stack application designed to capture, view, and inspect webhook requests in real-time. This project was developed as a **learning exercise** to explore webhooks architecture and modern web technologies.

> [!IMPORTANT]
> 🚧 **Work in Progress:** This project is currently under construction and is intended for educational purposes.

## 🚀 Tech Stack

The project is built using a monorepo structure (pnpm workspaces) with a focus on type safety and performance.

### Frontend (`/web`)
* **React 19**: Leveraging the latest features for UI development.
* **Vite**: For an extremely fast development environment and optimized builds.
* **TypeScript**: Ensuring type safety across the entire client-side application.
* **Tailwind CSS**: For utility-first responsive styling.
* **Lucide React**: For a clean and consistent icon set.

### Backend (`/api`)
* **Fastify**: A highly efficient and low-overhead web framework for Node.js.
* **Drizzle ORM**: A next-generation TypeScript ORM for SQL databases.
* **PostgreSQL**: A powerful, open-source relational database.
* **Zod**: Used for schema declaration and rigorous data validation.
* **Docker**: For containerized database management.

## 🛠️ Interesting Libraries

* **@fastify/type-provider-zod**: Provides seamless integration between Fastify and Zod for end-to-end type safety in API routes.
* **Scalar**: Generates a beautiful, interactive API reference documentation available at the `/docs` endpoint.
* **UUIDv7**: Implementation of time-sortable unique identifiers, perfect for logging webhook events chronologically.
* **Biome**: An extremely fast toolchain for linting and formatting code.
* **TanStack Query (React Query)**: For efficient data fetching, caching, and state synchronization.

## 📖 Project Structure

* `web/`: The React-based dashboard to visualize incoming webhooks.
* `api/`: The Fastify server that receives webhooks and serves the dashboard data.
* `api/src/db/schema/`: Contains the database definitions (using Drizzle) for storing webhook payloads, headers, and metadata.

## 🔧 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v18+)
* [pnpm](https://pnpm.io/)
* [Docker](https://www.docker.com/)

### Installation & Setup

1.  **Clone the repository**
2.  **Install dependencies**:
    ```bash
    pnpm install
    ```
3.  **Setup the Database**:
    ```bash
    cd api
    docker-compose up -d
    ```
4.  **Run Migrations**:
    ```bash
    pnpm db:generate
    pnpm db:migrate
    ```
5.  **Start the Project**:
    * **Backend**: `cd api && pnpm dev`
    * **Frontend**: `cd web && pnpm dev`

---
*Created for learning purposes, focusing on Webhook integration and full-stack TypeScript development.*
