const config = require('../config');

const errorResponse = (description) => ({
  description,
  content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
});

module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'Job Application Portal API',
    version: '1.0.0',
    description: 'Register candidates, upload resumes, browse jobs, and track applications.',
  },
  servers: [{ url: '/', description: config.nodeEnv === 'production' ? 'Deployed server' : 'Current server' }],
  tags: [
    { name: 'System' },
    { name: 'Authentication' },
    { name: 'Jobs' },
    { name: 'Resumes' },
    { name: 'Applications' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      Error: {
        type: 'object',
        required: ['error'],
        properties: { error: { type: 'string', example: 'Description of the error' } },
      },
      Resume: {
        type: 'object',
        properties: {
          originalName: { type: 'string', example: 'resume.pdf' },
          storedName: { type: 'string' },
          mimeType: { type: 'string', example: 'application/pdf' },
          size: { type: 'integer', example: 48210 },
          uploadedAt: { type: 'string', format: 'date-time' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '66a77c2406f42b59ae182111' },
          name: { type: 'string', example: 'Asha Sharma' },
          email: { type: 'string', format: 'email', example: 'asha@example.com' },
          resume: { allOf: [{ $ref: '#/components/schemas/Resume' }], nullable: true },
        },
      },
      Job: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '66a77c2406f42b59ae182222' },
          title: { type: 'string', example: 'Junior Node.js Developer' },
          company: { type: 'string', example: 'Potenz Technologies' },
          location: { type: 'string', example: 'Remote' },
          description: { type: 'string' },
          employmentType: { type: 'string', enum: ['Full-time', 'Part-time', 'Contract', 'Internship'] },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Application: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '66a77c2406f42b59ae182333' },
          candidate: { type: 'string' },
          job: { $ref: '#/components/schemas/Job' },
          coverLetter: { type: 'string' },
          status: { type: 'string', enum: ['submitted', 'reviewing', 'shortlisted', 'rejected', 'hired'] },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          token: { type: 'string' },
          user: { $ref: '#/components/schemas/User' },
        },
      },
    },
  },
  paths: {
    '/': {
      get: {
        tags: ['System'], summary: 'API information',
        responses: { 200: { description: 'Service links' } },
      },
    },
    '/health': {
      get: {
        tags: ['System'], summary: 'Liveness check',
        responses: { 200: { description: 'Process is running' } },
      },
    },
    '/ready': {
      get: {
        tags: ['System'], summary: 'Database readiness check',
        responses: { 200: { description: 'API and database are ready' }, 503: { description: 'Database is disconnected' } },
      },
    },
    '/api/auth/register': {
      post: {
        tags: ['Authentication'], summary: 'Register a candidate',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: {
            type: 'object', required: ['name', 'email', 'password'],
            properties: {
              name: { type: 'string', example: 'Asha Sharma' },
              email: { type: 'string', format: 'email', example: 'asha@example.com' },
              password: { type: 'string', format: 'password', minLength: 8, example: 'strong-pass-123' },
            },
          } } },
        },
        responses: {
          201: { description: 'Candidate registered', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
          400: errorResponse('Invalid request'), 409: errorResponse('Email already registered'),
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Authentication'], summary: 'Log in',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: {
            type: 'object', required: ['email', 'password'],
            properties: {
              email: { type: 'string', format: 'email', example: 'asha@example.com' },
              password: { type: 'string', format: 'password', example: 'strong-pass-123' },
            },
          } } },
        },
        responses: {
          200: { description: 'Login successful', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
          400: errorResponse('Missing credentials'), 401: errorResponse('Invalid credentials'),
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Authentication'], summary: 'Get current candidate', security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Candidate profile', content: { 'application/json': { schema: {
            type: 'object', properties: { user: { $ref: '#/components/schemas/User' } },
          } } } },
          401: errorResponse('Authentication required'),
        },
      },
    },
    '/api/jobs': {
      get: {
        tags: ['Jobs'], summary: 'List active jobs',
        responses: { 200: { description: 'Active jobs', content: { 'application/json': { schema: {
          type: 'object', properties: {
            count: { type: 'integer' }, jobs: { type: 'array', items: { $ref: '#/components/schemas/Job' } },
          },
        } } } } },
      },
    },
    '/api/jobs/{id}': {
      get: {
        tags: ['Jobs'], summary: 'Get one active job',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Job details', content: { 'application/json': { schema: {
            type: 'object', properties: { job: { $ref: '#/components/schemas/Job' } },
          } } } },
          400: errorResponse('Invalid job ID'), 404: errorResponse('Job not found'),
        },
      },
    },
    '/api/resumes': {
      post: {
        tags: ['Resumes'], summary: 'Upload or replace a resume', security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'multipart/form-data': { schema: {
            type: 'object', required: ['resume'],
            properties: { resume: { type: 'string', format: 'binary', description: 'PDF, DOC, or DOCX' } },
          } } },
        },
        responses: {
          201: { description: 'Resume uploaded', content: { 'application/json': { schema: {
            type: 'object', properties: { message: { type: 'string' }, resume: { $ref: '#/components/schemas/Resume' } },
          } } } },
          400: errorResponse('Invalid file'), 401: errorResponse('Authentication required'),
        },
      },
    },
    '/api/resumes/download': {
      get: {
        tags: ['Resumes'], summary: 'Download the current resume', security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Resume file', content: { 'application/octet-stream': { schema: { type: 'string', format: 'binary' } } } },
          401: errorResponse('Authentication required'), 404: errorResponse('No resume uploaded'),
        },
      },
    },
    '/api/applications': {
      post: {
        tags: ['Applications'], summary: 'Apply for a job', security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: {
            type: 'object', required: ['jobId'],
            properties: {
              jobId: { type: 'string', example: '66a77c2406f42b59ae182222' },
              coverLetter: { type: 'string', maxLength: 3000 },
            },
          } } },
        },
        responses: {
          201: { description: 'Application submitted', content: { 'application/json': { schema: {
            type: 'object', properties: { message: { type: 'string' }, application: { $ref: '#/components/schemas/Application' } },
          } } } },
          400: errorResponse('Resume or valid job ID required'), 401: errorResponse('Authentication required'),
          404: errorResponse('Job not found'), 409: errorResponse('Already applied'),
        },
      },
      get: {
        tags: ['Applications'], summary: 'List my applications', security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Candidate applications', content: { 'application/json': { schema: {
            type: 'object', properties: {
              count: { type: 'integer' }, applications: { type: 'array', items: { $ref: '#/components/schemas/Application' } },
            },
          } } } },
          401: errorResponse('Authentication required'),
        },
      },
    },
    '/api/applications/{id}': {
      get: {
        tags: ['Applications'], summary: 'Get one of my applications', security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Application details', content: { 'application/json': { schema: {
            type: 'object', properties: { application: { $ref: '#/components/schemas/Application' } },
          } } } },
          400: errorResponse('Invalid application ID'), 401: errorResponse('Authentication required'),
          404: errorResponse('Application not found'),
        },
      },
    },
  },
};
