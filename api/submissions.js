const DATABASE_URL = (process.env.FIREBASE_DATABASE_URL || 'https://laptop-privacy-default-rtdb.firebaseio.com').replace(/\/$/, '');

function normalise(value) {
  if (!value || typeof value !== 'object') return [];
  return Object.entries(value).map(([id, item]) => ({ id, ...item })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export default async function handler(request, response) {
  try {
    if (request.method === 'GET') {
      const result = await fetch(`${DATABASE_URL}/ideaJams.json`, { cache: 'no-store' });
      if (!result.ok) return response.status(502).json({ error: 'Firebase read failed' });
      return response.status(200).json(normalise(await result.json()));
    }
    if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' });

    const { text, name, email, photo } = request.body || {};
    if (!text || !name || !email) return response.status(400).json({ error: 'Idea, name and email are required' });
    const item = { text: String(text).trim().slice(0, 280), name: String(name).slice(0, 120), email: String(email).slice(0, 160), photo: String(photo || '').slice(0, 1000), createdAt: new Date().toISOString() };
    const result = await fetch(`${DATABASE_URL}/ideaJams.json`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) });
    if (!result.ok) return response.status(502).json({ error: 'Firebase write failed' });
    const created = await result.json();
    return response.status(201).json({ id: created.name, ...item });
  } catch (error) {
    console.error('firebase-submission-api', error);
    return response.status(503).json({ error: 'Firebase is unavailable' });
  }
}
