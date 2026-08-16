const request = require('supertest');
jest.mock('./config/db', () => jest.fn());
const app = require('./server');

describe('Server Initialization', () => {
  it('should have health endpoint configured', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
