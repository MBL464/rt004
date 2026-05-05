export default async function handler(req, res) {
  try {
    const { message } = req.body;

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
              parts: [{ text: message }],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    console.log("GEMINI RAW:", JSON.stringify(data, null, 2)); // 🔥 PENTING

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    res.status(200).json({
      reply: reply || "AI tidak merespon",
    });

  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ reply: "Server error" });
  }
}
