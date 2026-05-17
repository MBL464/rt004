export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const { history, systemPrompt } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        console.error("API Key Vercel kosong!");
        return res.status(500).json({ error: 'API Key Vercel belum diisi' });
    }

    // Kita gunakan model gemini-1.5-flash yang paling stabil dan cepat
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const payload = { 
        systemInstruction: { parts: [{ text: systemPrompt }] }, 
        contents: history 
    };

    try {
        const geminiRes = await fetch(url, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(payload) 
        });
        
        const data = await geminiRes.json();

        // CEK ERROR: Jika Google menolak, tampilkan pesan aslinya di Logs Vercel
        if (!geminiRes.ok || data.error) {
            console.error("Ditolak oleh Google:", data.error);
            return res.status(500).json({ error: `Ditolak Google: ${data.error?.message || 'Error tidak diketahui'}` });
        }

        // Jika sukses, ambil jawaban AI
        const text = data.candidates[0].content.parts[0].text;
        res.status(200).json({ text: text });

    } catch (error) {
        console.error("Vercel Gagal Terhubung:", error); 
        res.status(500).json({ error: 'Server Vercel gagal memproses data' });
    }
}
