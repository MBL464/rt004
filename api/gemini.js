export default async function handler(req, res) {
  // ✅ CORS (biar tidak error)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ❌ Tolak selain POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;

    // ❌ Validasi input
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // 🔑 Ambil API key dari Vercel
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "API key not configured" });
    }

    // 🚀 Request ke Gemini
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: message }]
            }
          ]
        })
      }
    );

    const data = await response.json();

    // ❌ Kalau error dari Gemini
    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    // ✅ Ambil jawaban AI
    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "AI tidak memberikan jawaban";

    // ✅ Kirim ke frontend
    return res.status(200).json({ reply });

  } catch (error) {
    console.error("SERVER ERROR:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
