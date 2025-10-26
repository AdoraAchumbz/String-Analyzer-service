const request = require('supertest');
const { app, server } = require('../src/index');
const { sha256 } = require('../src/utils/analyzer');

afterAll(() => {
  server.close();
});

describe('String Analyzer API', () => {
  const base = '/strings';
  const sample = 'racecar';
  const sampleHash = sha256(sample);

  test('POST /strings creates a string', async () => {
    const res = await request(app)
      .post(base)
      .send({ value: sample })
      .set('Accept', 'application/json');
    expect(res.status).toBe(201);
    expect(res.body.id).toBe(sampleHash);
    expect(res.body.properties.is_palindrome).toBe(true);
  });

  test('POST same string returns 409', async () => {
    const res = await request(app).post(base).send({ value: sample });
    expect(res.status).toBe(409);
  });

  test('GET /strings?is_palindrome=true returns our string', async () => {
    const res = await request(app).get(base + '?is_palindrome=true');
    expect(res.status).toBe(200);
    expect(res.body.count).toBeGreaterThanOrEqual(1);
  });

  test('GET /strings/:value returns item', async () => {
    const res = await request(app).get(base + '/' + encodeURIComponent(sample));
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(sampleHash);
  });

  test('DELETE /strings/:value removes item', async () => {
    const res = await request(app).delete(base + '/' + encodeURIComponent(sample));
    expect(res.status).toBe(204);
  });
});
