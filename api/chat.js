export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const { history, systemPrompt } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        console.error("API Key Vercel kosong!");
        return res.status(500).json({ error: 'API Key Vercel belum diisi' });
    }

    // KITA KEMBALI MENGGUNAKAN VERSI 2.5 FLASH YANG STABIL
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
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

        // SISTEM KEAMANAN 1: Cek jika Google menolak (misal: API key salah/kuota habis)
        if (!geminiRes.ok || data.error) {
            console.error("Ditolak oleh Google:", data.error);
            return res.status(500).json({ error: `Ditolak Google: ${data.error?.message || 'Penyebab tidak diketahui'}` });
        }

        // SISTEM KEAMANAN 2: Pastikan Google benar-benar mengirim teks jawaban
        if (data.candidates && data.candidates.length > 0) {
            const text = data.candidates[0].content.parts[0].text;
            res.status(200).json({ text: text });
        } else {
            console.error("Google tidak membalas dengan teks:", data);
            res.status(500).json({ error: 'AI memproses, tapi tidak ada teks jawaban.' });
        }

    } catch (error) {
        console.error("Vercel Gagal Terhubung:", error); 
        res.status(500).json({ error: 'Server Vercel gagal mengirim data ke Google' });
    }
}
