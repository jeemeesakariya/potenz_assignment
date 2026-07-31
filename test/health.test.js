const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/app');

test('GET /health reports service health', async () => {
  const response = await request(app).get('/health').expect(200);
  assert.deepEqual(response.body, { status: 'ok' });
});

test('unknown routes return a JSON 404', async () => {
  const response = await request(app).get('/missing').expect(404);
  assert.equal(response.body.error, 'Route not found');
});

test('GET / exposes service links', async () => {
  const response = await request(app).get('/').expect(200);
  assert.equal(response.body.documentation, '/api-docs');
  assert.equal(response.body.health, '/health');
});

test('GET /api-docs.json exposes a valid OpenAPI document', async () => {
  const response = await request(app).get('/api-docs.json').expect(200);
  assert.equal(response.body.openapi, '3.0.3');
  assert.ok(response.body.paths['/api/applications']);
  assert.equal(response.body.components.securitySchemes.bearerAuth.scheme, 'bearer');
});

test('GET /ready reports unavailable without a database connection', async () => {
  const response = await request(app).get('/ready').expect(503);
  assert.equal(response.body.status, 'not_ready');
});
