import fetch from 'node-fetch';
import FormData from 'form-data';

export const config = { api: { bodyParser: false } };

function bufferFromStream(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (c) => chunks.push(c));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', (e) => reject(e));
  });
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const buffer = await bufferFromStream(req);
    if (!buffer || !buffer.length) return res.status(400).json({ error: 'No file uploaded' });

    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', buffer, 'upload.jpg');

    const r = await fetch('https://catbox.moe/user/api.php', { method: 'POST', body: form });
    const text = await r.text();
    if (!text.startsWith('http')) return res.status(500).json({ error: 'Catbox upload failed', raw: text });
    return res.status(200).json({ url: text.trim() });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}
