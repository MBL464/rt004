export default async function handler(req, res) {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message kosong" });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "API key tidak ada" });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
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

    // 🔥 HANDLE ERROR DARI GEMINI
    if (!response.ok) {
      console.error("Gemini error:", data);
      return res.status(500).json({
        error: "Gemini gagal",
        detail: data
      });
    }

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Tidak ada respon";

    return res.status(200).json({ reply });

  } catch (err) {
    console.error("SERVER ERROR:", err);

    return res.status(500).json({
      error: "Server error",
      detail: err.message
    });
  }
}
