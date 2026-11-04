
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 10000;
const API_KEY = process.env.GEMINI_API_KEY;
const PRIMARY_MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";

app.use(express.json({ limit: "30kb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/health", (_req, res) => {
  res.json({ ok: true, app: "ROHIT AI" });
});

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

async function callGemini(model, prompt, system) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(API_KEY)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 1800
          }
        })
      }
    );

    const data = await response.json();

    if (response.ok) {
      const answer = (data?.candidates?.[0]?.content?.parts || [])
        .map(part => part.text || "")
        .join("\n").trim();

      if (!answer) throw new Error("AI returned an empty response.");
      return { answer, model };
    }

    const error = new Error(
      data?.error?.message || "AI provider error."
    );
    error.status = response.status;

    if (response.status !== 503 || attempt === 1) {
      throw error;
    }

    await wait(1200);
  }
}

app.post("/api/generate", async (req, res) => {
  try {
    if (!API_KEY) {
      return res.status(503).json({
        error: "GEMINI_API_KEY is missing in Render Environment."
      });
    }

    const { prompt, tool = "chat" } = req.body || {};

    if (typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({
        error: "Please enter a message."
      });
    }

    if (prompt.length > 12000) {
      return res.status(413).json({
        error: "Message is too long."
      });
    }

    const system = `You are ROHIT AI, a helpful all-in-one assistant.
Reply in the same language as the user.
Use natural Hindi/Hinglish when appropriate.
Give accurate, clear and practical answers.
For horror stories, create original suspenseful stories.
For video prompts, maintain character consistency.
Never claim you generated an image or video when you only wrote a prompt.
Selected tool: ${tool}.`;

    const models = [
      PRIMARY_MODEL,
      "gemini-3.6-flash",
      "gemini-3.5-flash-lite"
    ];

    let lastError;

    for (const model of [...new Set(models)]) {
      try {
        const result = await callGemini(
          model,
          prompt.trim(),
          system
        );

        return res.json(result);
      } catch (error) {
        lastError = error;
        console.error(model, error.status, error.message);

        if (error.status !== 503) {
          return res.status(error.status || 500).json({
            error: error.message
          });
        }
      }
    }

    return res.status(503).json({
      error: "All AI models are currently busy. Please try again shortly."
    });

  } catch (error) {
    console.error("Generation error:", error.message);
    return res.status(500).json({
      error: "Server error. Please try again."
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`ROHIT AI running on port ${PORT}`);
});
