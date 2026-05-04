export default async function handler(req, res) {
  // 🔥 CORS WAJIB
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // 🔥 HANDLE PREFLIGHT (INI YANG KAMU KURANG)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message kosong" });
    }

    const apiKey = process.env.GEMINI_API_KEY;

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
              parts: [
  {
    text: `
Kamu adalah asisten RT bernama "Pemuda Pintar".

Gaya bicara:
- Santai
- Ramah
- Singkat
- Gunakan bullet point jika perlu

Jawab pertanyaan ini:
${message}
`
  }
]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json(data);
    }

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Tidak ada respon";

    return res.status(200).json({ reply });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
