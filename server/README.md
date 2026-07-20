# AVICS Backend

Backend folder structure for the Accident Vehicle Insurance Claim Management System.

Per project scope, **no database and no business APIs are implemented** — this
is a working Express + CORS server scaffold, ready for future API modules to
be added under `routes/`, `controllers/`, and `services/`.

## Stack

- Node.js
- Express.js
- CORS
- dotenv
- Nodemon (dev)

## Getting Started

```bash
npm install
npm run dev
```

Server runs at `http://localhost:5000`.

Verify it's running:

```bash
curl http://localhost:5000/api/health
```

## Folder Structure

```
backend/
  server.js          Express app entry point
  .env                Environment variables (PORT, CORS_ORIGIN, etc.)
  config/             App configuration (config.js)
  routes/             Route definitions (index.js aggregates all routes)
  controllers/        Request handlers (healthController.js)
  middleware/          errorHandler.js, requestLogger.js
  services/           Business logic layer (placeholder, empty until APIs are added)
  utils/              logger.js and other shared helpers
```

## Adding a New Module

1. Create `routes/<module>Routes.js`
2. Create `controllers/<module>Controller.js`
3. Create `services/<module>Service.js` for business logic
4. Mount the route in `routes/index.js`
