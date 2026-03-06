# Deployment Guide

The CarPark system is designed for easy deployment across various environments including Windows Servers, Linux VPS, and Docker.

## Prerequisites
- Node.js (v18 or higher)
- PostgreSQL
- SMTP Server (e.g., Mailtrap for testing, SendGrid/AWS SES for production)

## 1. Setup Database
1. Create a PostgreSQL database called `carpark`.
2. Run the migration script located in `database/migrations/01_initial_schema.sql` against your database to set up the schema.

## 2. Backend Deployment
1. Navigate to the `backend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` (or create a `.env` file) and fill in your variables:
   ```env
   PORT=5000
   DATABASE_URL=postgres://user:password@localhost:5432/carpark
   JWT_SECRET=your_super_secret_key
   SMTP_HOST=your_smtp_host
   SMTP_PORT=2525
   SMTP_USER=user
   SMTP_PASS=password
   SMTP_FROM=noreply@carpark.com
   ```
4. Build the application:
   ```bash
   npm run build
   ```
5. Start the server (cron jobs will be initialized automatically on server start):
   ```bash
   npm start
   ```

## 3. Frontend Deployment
1. Navigate to the `frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the frontend with your backend API URL if needed (default is localhost:5000).
4. Build the static files:
   ```bash
   npm run build
   ```
5. Serve the `dist` directory using any static file server like Nginx, Apache, or serve:
   ```bash
   npx serve -s dist
   ```

## Docker Deployment (Optional)
You can choose to containerize both backend and frontend. Create a `Dockerfile` for each and use `docker-compose` to run PostgreSQL, the backend API, and the static front-end server simultaneously.
