# Job Application Portal API

A modular REST API where candidates can register, upload a resume, browse jobs, apply once per job, and track their applications.

## Live deployment

- API: [https://potenz-assignment.onrender.com](https://potenz-assignment.onrender.com)
- Swagger UI: [https://potenz-assignment.onrender.com/api-docs](https://potenz-assignment.onrender.com/api-docs)
- Health: [https://potenz-assignment.onrender.com/health](https://potenz-assignment.onrender.com/health)
- Readiness: [https://potenz-assignment.onrender.com/ready](https://potenz-assignment.onrender.com/ready)

The API is hosted on Render Free, so the first request after inactivity can take about one minute while the service wakes up.

## Main features

- Candidate registration and login with bcrypt password hashing and JWT authentication
- Joi schemas with friendly field-level validation errors
- PDF, DOC, and DOCX resume upload with configurable size limits
- Paginated job and application listings with a maximum page size of 100
- One application per candidate and job
- Resume snapshots stored with applications
- 200 deterministic demo jobs, seeded efficiently with bulk upserts
- Swagger/OpenAPI documentation and an import-ready production Postman collection
- Health/readiness endpoints, graceful shutdown, Docker support, and production environment checks

## Technology

- Node.js 20+ and Express 5
- MongoDB with Mongoose
- JWT bearer authentication and bcrypt password hashing
- Multer resume uploads (PDF, DOC, and DOCX; 5 MB by default)
- Joi request validation
- Swagger/OpenAPI and Postman
- Docker and Render deployment

## Architecture

```text
Request → Route → Validation/Auth middleware → Controller → Service → Repository → Mongoose → MongoDB
```

Routes only declare endpoints, controllers handle HTTP concerns, services contain business rules, and repositories own database access. This separation keeps the API easier to test and extend.

## Local setup

1. Install Node.js 20+ and start a local MongoDB instance (or create a MongoDB Atlas database).
2. Clone the repository and install packages:

   ```bash
   npm ci
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

The API defaults to `http://localhost:3000`. The seed command synchronizes 200 jobs without creating duplicates; 188 are active and visible through the public API.

## Interactive API documentation

After starting the server, open:

- Swagger UI: `http://localhost:3000/api-docs`
- Raw OpenAPI JSON: `http://localhost:3000/api-docs.json`

Use the **Authorize** button in Swagger UI and paste the JWT returned by registration or login. Swagger then sends the bearer token to protected endpoints. Resume uploads can also be tested directly from the page.

## Postman collection

Import these files into Postman:

1. [`01/Potenz-Job-Portal-API.postman_collection.json`](01/Potenz-Job-Portal-API.postman_collection.json)
2. [`01/Potenz-Job-Portal-Production.postman_environment.json`](01/Potenz-Job-Portal-Production.postman_environment.json)

Select **Potenz Job Portal - Production**, then run the numbered folders in order. Registration automatically creates a unique email and saves the JWT; listing jobs saves a `jobId`; submitting an application saves its `applicationId`. Select a local resume file manually in the upload request. See [`01/README.md`](01/README.md) for the short instructions.

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

Passwords must contain between 8 and 72 characters. Invalid input returns all detected field errors in one response:

```json
{
  "error": "Please correct the invalid request data",
  "details": [
    { "field": "email", "message": "email must be a valid email address" },
    { "field": "password", "message": "password must contain at least 8 characters" }
  ]
}
```

Authentication, conflict, and missing-resource errors use `{ "error": "Description" }` with the appropriate HTTP status.

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
  "count": 20,
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
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 188,
    "totalPages": 10
  }
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
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

`GET /api/applications/:id` returns one application owned by the authenticated candidate. A user cannot view another user's application.

## Useful commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start locally with automatic restart |
| `npm start` | Start normally |
| `npm run seed` | Idempotently synchronize 200 demo jobs |
| `npm test` | Run Node.js API tests |
| `npm run lint` | Run ESLint |
| `npm run validate` | Run lint and tests |

## Deployment

The current production API is deployed from the `main` branch to Render using the repository's `Dockerfile`. Render automatically rebuilds and deploys after a new commit is pushed.

Current production configuration:

```text
Provider: Render Free
Runtime: Docker
Database: MongoDB Atlas
Health check: /health
Production URL: https://potenz-assignment.onrender.com
```

Required Render environment variables:

```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=at-least-32-random-characters
JWT_EXPIRES_IN=7d
MAX_RESUME_SIZE_MB=5
UPLOAD_DIR=/app/uploads/resumes
CORS_ORIGIN=*
```

Do not commit secrets or the production `.env` file. For a real frontend, replace `CORS_ORIGIN=*` with its exact HTTPS origin.

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

> **Temporary resume storage:** Render Free has an ephemeral filesystem. Resume files can disappear when the service sleeps, restarts, or redeploys, although their MongoDB metadata remains. This is acceptable for the assignment demo. Migrate the resume service to private object storage before using real candidate data.

## Project structure

```text
01/                 Import-ready Postman collection and environment
src/
  controllers/      HTTP request and response handling
  middleware/       JWT and upload middleware
  models/           Mongoose models
  repositories/     Database queries and persistence
  routes/           Express endpoint declarations
  services/         Validation and business logic
  utils/            Shared errors and async helpers
  validators/       Joi schemas for bodies, params, and queries
  app.js            Express configuration
  config.js         Environment configuration
  docs/openapi.js   Swagger/OpenAPI specification
  sampleJobs.js     Seed data
  seed.js           Idempotent job seeder
  server.js         Database connection and HTTP listener
test/               Node test runner tests
Dockerfile          Production container image
.env.example        Safe environment-variable template
```

## Notes for production

The included disk storage is suitable only for this assignment and temporary testing. Before handling real candidate data, use private object storage, validate file signatures in addition to MIME types, scan uploads for malware, restrict CORS, add rate limiting and structured logging, rotate secrets, and establish retention/deletion policies for personal data.
