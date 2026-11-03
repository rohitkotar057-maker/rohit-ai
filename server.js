const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 10000;
const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";

app.use(express.json({ limit: "30kb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/health", (_req, res) => res.json({ ok: true, app: "ROHIT AI" }));

app.post("/api/generate", async (req, res) => {
  try {
    if (!API_KEY) {
      return res.status(503).json({
        error: "AI key is not configured yet. Add GEMINI_API_KEY in your hosting dashboard."
      });
    }

    const { prompt, tool = "chat" } = req.body || {};
    if (typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({ error: "Please enter a message." });
    }
    if (prompt.length > 12000) {
      return res.status(413).json({ error: "Message is too long. Please shorten it." });
    }

    const system = `You are ROHIT AI, a helpful all-in-one assistant. Reply in the same language as the user, preferably natural Hindi/Hinglish when the user writes that way. Be accurate, clear, practical, and concise. For horror stories, make them original and suspenseful. For video prompts, preserve character consistency and include camera, motion, audio, duration and aspect ratio when relevant. For image prompts, give a polished copy-ready prompt. Never claim you generated an image or video when you only wrote a prompt. Tool selected: ${tool}.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:generateContent?key=${encodeURIComponent(API_KEY)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: "user", parts: [{ text: prompt.trim() }] }],
          generationConfig: { temperature: 0.8, maxOutputTokens: 1800 }
        })
      }
    );

    const data = await response.json();
    if (!response.ok) {
      const message = data?.error?.message || "The AI provider returned an error.";
      return res.status(response.status).json({ error: message });
    }

    const answer = (data?.candidates?.[0]?.content?.parts || [])
      .map(part => part.text || "")
      .join("\n").trim();

    if (!answer) return res.status(502).json({ error: "AI returned an empty response. Please try again." });
    res.json({ answer, model: MODEL });
  } catch (error) {
    console.error("Generation error:", error.message);
    res.status(500).json({ error: "Server error. Please try again in a moment." });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`ROHIT AI running on port ${PORT}`);
});
