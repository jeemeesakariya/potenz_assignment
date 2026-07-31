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
