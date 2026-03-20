import { GET } from '@/app/api/health/route';

describe('/api/health route', () => {
  test('returns a no-store health payload', async () => {
    const response = await GET();
    const data = (await response.json()) as {
      status: string;
      timestamp: string;
      service: string;
    };

    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(data.status).toBe('ok');
    expect(data.service).toBe('suanming-web');
    expect(Number.isNaN(Date.parse(data.timestamp))).toBe(false);
  });
});
