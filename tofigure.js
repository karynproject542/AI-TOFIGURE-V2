import fetch from 'node-fetch';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ status: false, message: 'Method not allowed' });
    const body = await new Promise((resolve, reject) => {
      let data = '';
      req.on('data', chunk => data += chunk);
      req.on('end', () => resolve(data));
      req.on('error', err => reject(err));
    });
    let parsed;
    try { parsed = JSON.parse(body); } catch(e) { return res.status(400).json({ status:false, message:'Invalid JSON' }); }
    const { imageUrl } = parsed;
    if (!imageUrl) return res.status(400).json({ status:false, message:'Missing imageUrl' });

    const apiUrl = `https://api.nekolabs.my.id/ai/convert/tofigure?imageUrl=${encodeURIComponent(imageUrl)}`;
    const r = await fetch(apiUrl);
    if (!r.ok) return res.status(502).json({ status:false, message:'Upstream error' });
    const json = await r.json();
    if (!json.status) return res.status(500).json({ status:false, message:'Processing failed' });

    return res.status(200).json({ status:true, result: json.result });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ status:false, message: e.message });
  }
}
