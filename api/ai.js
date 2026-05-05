export default async function handler(req, res) {
  // 🔒 hanya izinkan POST
  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Method not allowed" });
  }

  try {
    const { message } = req.body;

    // 🔴 validasi input
    if (!message) {
      return res.status(400).json({ reply: "Pesan kosong" });
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=" + process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Kamu adalah asisten RT 004 Digital.
Jawab dengan ramah, singkat, dan jelas.

Pertanyaan: ${message}`,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    // 🔍 debug (lihat di Vercel logs kalau perlu)
    console.log("GEMINI RAW:", JSON.stringify(data, null, 2));

    // 🔥 ambil semua text dari parts (biar tidak kosong)
    let reply = "";
    const parts = data?.candidates?.[0]?.content?.parts;

    if (parts && parts.length > 0) {
      reply = parts
        .map((p) => p.text || "")
        .join(" ")
        .trim();
    }

    // 🔁 fallback kalau kosong
    if (!reply) {
      console.log("EMPTY RESPONSE:", JSON.stringify(data, null, 2));
      reply = "AI lagi mikir 🤔, coba ulang ya...";
    }

    return res.status(200).json({ reply });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    return res.status(500).json({
      reply: "Server error, coba lagi nanti 🙏",
    });
  }
}
