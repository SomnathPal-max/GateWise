import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import "dotenv/config";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import hpp from "hpp";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function startServer() {
  const app = express();
  const PORT = 3000;

  // 1. Helmet: Secure HTTP headers
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    frameguard: false,
  }));

  // 1b. Trust proxy for rate limiting (since it runs behind a proxy)
  app.set("trust proxy", 1);

  // 2. CORS: Cross-Origin Resource Sharing protection
  app.use(cors());

  // 3. Rate Limiting: Prevent brute-force and DDoS attacks
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { error: "Too many requests, please try again later." }
  });
  app.use("/api/", apiLimiter);

  // 4. Body Parser with Size Limit: Prevent large payload DOS attacks
  app.use(express.json({ limit: "5mb" }));

  // 5. HPP: Prevent HTTP Parameter Pollution
  app.use(hpp());

  // API route for AI concierge
  app.post("/api/concierge", async (req, res) => {
    try {
      const { stadiumData, profile, prompt, isProactive } = req.body;

      const systemInstruction = `You are GateWise, an AI concierge inside a stadium app for fans at a large tournament event.

You will receive:
1. A JSON snapshot of current gate/zone occupancy, incidents, and match clock.
2. A fan profile (seat section, accessibility needs, language).
3. A fan's question or the app's request for a proactive nudge.

Your job:
- Reason over the data, don't just report it. Compare options (e.g. walk time vs. congestion vs. accessibility) and explain the trade-off in one short sentence.
- Always personalize using the fan profile (seat location, accessibility, language).
- If an incident affects the fan's best option, factor it in automatically and mention it.
- Keep responses short: 1 recommendation + 1 reason, not a list of everything.
- Respond in the fan's preferred language (e.g., if language is "es", respond in Spanish).
- If asked for a proactive nudge, generate ONE short, time-aware message based on predicted_peak_in_min values.`;

      let userMessage = "";
      if (isProactive) {
         userMessage = `Generate a proactive nudge based on this data.\n\nStadium Data:\n${JSON.stringify(stadiumData)}\n\nProfile:\n${JSON.stringify(profile)}`;
      } else {
         userMessage = `Fan asks: "${prompt}"\n\nStadium Data:\n${JSON.stringify(stadiumData)}\n\nProfile:\n${JSON.stringify(profile)}`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: userMessage,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              recommendation: {
                type: Type.STRING,
                description: "short actionable sentence"
              },
              reason: {
                type: Type.STRING,
                description: "short explanation referencing the actual data"
              },
              alternative: {
                type: Type.STRING,
                description: "optional second option if relevant"
              }
            },
            required: ["recommendation", "reason"]
          }
        }
      });

      const text = response.text || "{}";
      const result = JSON.parse(text);
      res.json(result);
    } catch (error: any) {
      console.error("Error calling Gemini API:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:\${PORT}`);
  });
}

startServer();
