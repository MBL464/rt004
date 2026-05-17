export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const { history, systemPrompt } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'API Key Vercel belum diisi' });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const payload = { systemInstruction: { parts: [{ text: systemPrompt }] }, contents: history };

    try {
        const geminiRes = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const data = await geminiRes.json();
        const text = data.candidates[0].content.parts[0].text;
        res.status(200).json({ text: text });
    } catch (error) {
        console.error(error); res.status(500).json({ error: 'Gagal terhubung ke AI' });
    }
}
