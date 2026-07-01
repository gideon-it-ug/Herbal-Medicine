import { buildMediaUrl, API_ORIGIN } from './services/api';

test('buildMediaUrl returns absolute URLs for relative media paths', () => {
  expect(buildMediaUrl('plants/neem.jpg')).toBe(`${API_ORIGIN}/media/plants/neem.jpg`);
  expect(buildMediaUrl('/media/plants/neem.jpg')).toBe(`${API_ORIGIN}/media/plants/neem.jpg`);
  expect(buildMediaUrl('https://example.com/image.jpg')).toBe('https://example.com/image.jpg');
});

test('buildMediaUrl returns empty string for falsy paths', () => {
  expect(buildMediaUrl('')).toBe('');
  expect(buildMediaUrl(null)).toBe('');
});
