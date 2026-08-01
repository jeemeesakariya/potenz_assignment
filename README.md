# Job Application Portal API

A RESTful Node.js API where candidates can create an account, upload a resume, browse sample jobs, apply once per job, and track their applications.

## Technology

- Node.js 20+ and Express 5
- MongoDB with Mongoose
- JWT bearer authentication and bcrypt password hashing
- Multer resume uploads (PDF, DOC, and DOCX; 5 MB by default)

## Setup

1. Install Node.js 20+ and start a local MongoDB instance (or create a MongoDB Atlas database).
2. Clone the repository and install packages:

   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env` and change `JWT_SECRET` to a long, random value:

   ```bash
   cp .env.example .env
   ```

   On Windows PowerShell, use `Copy-Item .env.example .env`.

4. Add the sample jobs (this command is idempotent):

   ```bash
   npm run seed
   ```

5. Start the API:

   ```bash
   npm run dev
   ```

The API defaults to `http://localhost:3000`. Run `npm start` in production and `npm test` for the automated smoke tests.

## Interactive API documentation

After starting the server, open:

- Swagger UI: `http://localhost:3000/api-docs`
- Raw OpenAPI JSON: `http://localhost:3000/api-docs.json`

Use the **Authorize** button in Swagger UI and paste the JWT returned by registration or login. Swagger then sends the bearer token to protected endpoints. Resume uploads can also be tested directly from the page.

## Environment variables

| Key | Required | Description |
|---|---:|---|
| `PORT` | No | HTTP port; defaults to `3000` |
| `NODE_ENV` | No | Use `production` on a deployed server |
| `MONGODB_URI` | Yes in production | MongoDB connection string |
| `JWT_SECRET` | Yes in production | Secret used to sign JWTs; use at least 32 random characters |
| `JWT_EXPIRES_IN` | No | Token lifetime; defaults to `7d` |
| `MAX_RESUME_SIZE_MB` | No | Maximum resume size; defaults to `5` |
| `UPLOAD_DIR` | No | Resume storage directory; defaults to `uploads/resumes` |
| `CORS_ORIGIN` | No | Allowed frontend origin; comma-separated values are supported, defaults to `*` |

`.env.example` contains a complete development template. Uploaded files and `.env` are intentionally excluded from Git.

## Authentication

Protected endpoints require the token returned by register or login:

```http
Authorization: Bearer <token>
```

All errors use the form `{ "error": "Description" }`. Passwords must contain at least 8 characters.

## API endpoints

### Health check

`GET /health`

Response `200`:

```json
{ "status": "ok" }
```

### Register

`POST /api/auth/register`

```json
{
  "name": "Asha Sharma",
  "email": "asha@example.com",
  "password": "strong-pass-123"
}
```

Response `201`:

```json
{
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "66a77c2406f42b59ae182111",
    "name": "Asha Sharma",
    "email": "asha@example.com",
    "resume": null
  }
}
```

### Login

`POST /api/auth/login`

```json
{
  "email": "asha@example.com",
  "password": "strong-pass-123"
}
```

Response `200` has the same `token` and `user` shape as registration. Invalid credentials return `401`.

### Current candidate

`GET /api/auth/me` — protected

Response `200`:

```json
{
  "user": {
    "id": "66a77c2406f42b59ae182111",
    "name": "Asha Sharma",
    "email": "asha@example.com",
    "resume": null
  }
}
```

### List jobs

`GET /api/jobs`

The list is paginated for predictable performance. Use `?page=1&limit=20`; `limit` can be at most 100.

Response `200`:

```json
{
  "count": 3,
  "jobs": [
    {
      "_id": "66a77c2406f42b59ae182222",
      "title": "Junior Node.js Developer",
      "company": "Potenz Technologies",
      "location": "Remote",
      "description": "Build and maintain REST APIs using Node.js, Express, and MongoDB.",
      "employmentType": "Full-time",
      "isActive": true
    }
  ]
}
```

`GET /api/jobs/:id` returns one active job or `404`.

### Upload or replace resume

`POST /api/resumes` — protected, `multipart/form-data`

The form field must be named `resume`. Allowed files are PDF, DOC, and DOCX.

```bash
curl -X POST http://localhost:3000/api/resumes \
  -H "Authorization: Bearer $TOKEN" \
  -F "resume=@./resume.pdf"
```

Response `201`:

```json
{
  "message": "Resume uploaded successfully",
  "resume": {
    "originalName": "resume.pdf",
    "storedName": "1754000000000-uuid.pdf",
    "mimeType": "application/pdf",
    "size": 48210,
    "uploadedAt": "2026-08-01T10:00:00.000Z"
  }
}
```

`GET /api/resumes/download` — protected — downloads the current candidate's resume.

### Submit an application

`POST /api/applications` — protected

The candidate must upload a resume first and may apply to a job only once.

```json
{
  "jobId": "66a77c2406f42b59ae182222",
  "coverLetter": "I enjoy building reliable Node.js services and would love to contribute."
}
```

Response `201`:

```json
{
  "message": "Application submitted successfully",
  "application": {
    "_id": "66a77c2406f42b59ae182333",
    "candidate": "66a77c2406f42b59ae182111",
    "job": {
      "_id": "66a77c2406f42b59ae182222",
      "title": "Junior Node.js Developer",
      "company": "Potenz Technologies"
    },
    "coverLetter": "I enjoy building reliable Node.js services and would love to contribute.",
    "status": "submitted",
    "createdAt": "2026-08-01T10:05:00.000Z"
  }
}
```

Duplicate applications return `409`.

### View applications

`GET /api/applications` — protected

This endpoint accepts the same `page` and `limit` query parameters.

Response `200`:

```json
{
  "count": 1,
  "applications": [
    {
      "_id": "66a77c2406f42b59ae182333",
      "job": {
        "title": "Junior Node.js Developer",
        "company": "Potenz Technologies"
      },
      "status": "submitted",
      "createdAt": "2026-08-01T10:05:00.000Z"
    }
  ]
}
```

`GET /api/applications/:id` returns one application owned by the authenticated candidate. A user cannot view another user's application.

## Deployment

The application is ready for a Node.js host or a container platform. A deployment needs:

- Node.js 20 or newer
- A MongoDB connection string, such as MongoDB Atlas
- `NODE_ENV=production`
- A unique `JWT_SECRET` containing at least 32 characters
- A persistent disk mounted for `UPLOAD_DIR` if resumes must survive restarts

The server listens on `0.0.0.0` and honors the platform-provided `PORT`. It handles `SIGTERM`/`SIGINT` for graceful shutdown. Use `/health` as the liveness endpoint and `/ready` as the readiness endpoint; readiness returns `503` until MongoDB is connected.

### Deploy with Docker

Build and run locally:

```bash
docker build -t job-portal-api .
docker run --rm -p 3000:3000 \
  -e MONGODB_URI="mongodb+srv://..." \
  -e JWT_SECRET="replace-with-at-least-32-random-characters" \
  -e CORS_ORIGIN="https://your-frontend.example" \
  -v job-portal-uploads:/app/uploads \
  job-portal-api
```

Run `npm run seed` to bulk-synchronize 200 deterministic, realistic demo jobs. The operation is idempotent, so it can be rerun safely without creating duplicates. Do not commit the production `.env` file.

> Many cloud services use an ephemeral filesystem. Without a persistent disk, uploaded resumes disappear during redeployment. For a larger production system, replace local Multer disk storage with private object storage.

## Project structure

```text
src/
  controllers/      HTTP request and response handling
  middleware/       JWT and upload middleware
  models/           Mongoose models
  repositories/     Database queries and persistence
  routes/           Express endpoint declarations
  services/         Validation and business logic
  utils/            Shared errors and async helpers
  app.js            Express configuration
  config.js         Environment configuration
  docs/openapi.js   Swagger/OpenAPI specification
  sampleJobs.js     Seed data
  seed.js           Idempotent job seeder
  server.js         Database connection and HTTP listener
test/               Node test runner tests
Dockerfile          Production container image
```

## Notes for production

The included disk storage is suitable for this assignment and a single server. For a distributed production deployment, store resumes in private object storage (such as S3), validate file contents in addition to MIME type, scan uploads for malware, enforce HTTPS, rotate JWT secrets, and add rate limiting and logging.
