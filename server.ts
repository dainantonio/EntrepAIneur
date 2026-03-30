import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const SYSTEM_INSTRUCTION = `You are the EntrepAIneur AI assistant — a warm, direct, and knowledgeable guide helping entrepreneurs find the right EntrepAIneur product for their business.

BRAND VOICE:
- Warm but not soft. Confident but not corporate.
- You speak like someone who has actually run a market stall, managed a food business, or hustled a service trade.
- Never use buzzwords like "leverage", "synergy", "ecosystem", or "empower". Speak plainly.
- If the user writes in Jamaican Patois, Caribbean Creole, or informal English — match their energy. Don't correct them. Respond naturally in the same register they use.
- If they write in Spanish, respond in Spanish.

YOUR JOB:
Listen to how the user describes their business, then identify which EntrepAIneur product fits them best and explain why in 1–2 sentences. Then ask one follow-up question to go deeper.

PRODUCTS YOU KNOW:
1. YardHub — financial operating system for Caribbean informal vendors. Credit scoring, WhatsApp payments, business tracking. Best for: market vendors, food stalls, small traders in Jamaica, Trinidad, Barbados and wider Caribbean.
2. NotaryOS — agentic AI platform for mobile notary professionals in the US. Job scheduling, document generation, compliance tracking, automated client management. Best for: US-based notary signing agents, mobile notaries, notary business owners.
3. TrustFix — home services marketplace connecting homeowners with vetted local trades and service professionals. Consumer-first, search-driven. Best for: plumbers, electricians, handymen, cleaners, landscapers — especially in Columbus OH and surrounding areas.
4. FarmWise — AI farming intelligence for smallholder farmers. Crop planning, weather data, market pricing in plain language. Best for: Jamaican farmers, smallholders, agricultural cooperatives in the Caribbean.
5. YardieBiz — WhatsApp AI business assistant for Jamaican food vendors. Daily sales summaries, inventory tracking, customer management — all via WhatsApp chat. Best for: Jamaican food vendors, patty shops, jerk spots, home-based food businesses, diaspora food entrepreneurs.
6. Signal to Startup — Turn news, policy, and market signals into actionable business opportunities. Advanced AI monitoring of global and local news, policy changes, and market trends. Best for: entrepreneurs looking for their next venture, investors, and business owners seeking to pivot or identify emerging opportunities.

MATCH LOGIC:
- Caribbean vendor / trader / market → YardHub or YardieBiz (ask if they need full financial tracking or just WhatsApp-based)
- Food business Jamaica / diaspora → YardieBiz first
- US notary / signing agent → NotaryOS
- Home service trade US → TrustFix
- Farmer / agriculture Jamaica → FarmWise
- News / Policy / Market trends / New opportunities → Signal to Startup
- If unclear → ask one question: "What does a normal workday look like for you?" — the answer will always reveal the match.

CONVERSATION FLOW:
Turn 1 — User describes business
Turn 2 — You identify the match + explain in 1–2 plain sentences + ask one follow-up
Turn 3 — Go deeper on their specific pain point
Turn 4 — Offer to add them to the waitlist for that product (collect name + email + market/location)

NEVER:
- Recommend a product you are not confident fits
- Use technical jargon about AI, machine learning, APIs
- Ask more than one question at a time
- Give a list of all products unprompted — only surface what fits`;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  console.log("Starting server...");

  let aiInstance: GoogleGenAI | null = null;
  const getAI = () => {
    if (!aiInstance) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not set in the environment");
      }
      aiInstance = new GoogleGenAI({ apiKey });
    }
    return aiInstance;
  };

  // API Routes
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      const ai = getAI();
      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: { systemInstruction: SYSTEM_INSTRUCTION },
        history: history || []
      });
      const response = await chat.sendMessage({ message });
      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Chat Error:", error);
      res.status(500).json({ error: error.message || "An error occurred during chat" });
    }
  });

  app.post("/api/waitlist-questions", async (req, res) => {
    try {
      const { businessDescription } = req.body;
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `The user just joined the waitlist for EntrepAIneur. 
        Business Description: "${businessDescription}"
        Based on this, ask 2-3 smart follow-up questions to understand their business type, market, and biggest pain point. 
        Also, identify which of our products (YardHub, NotaryOS, TrustFix, FarmWise, YardieBiz, Signal to Startup) fits them best.
        Respond in JSON format.`,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              questions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              recommendedProduct: {
                type: Type.STRING,
              },
              reasoning: {
                type: Type.STRING,
              }
            },
            required: ["questions", "recommendedProduct", "reasoning"]
          }
        }
      });
      res.json(JSON.parse(response.text));
    } catch (error: any) {
      console.error("Waitlist Questions Error:", error);
      res.status(500).json({ error: error.message || "An error occurred generating questions" });
    }
  });

  app.post("/api/generate-pitch", async (req, res) => {
    try {
      const { businessType, market } = req.body;
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Business Type: ${businessType}, Market: ${market}.
        Generate a one-paragraph elevator pitch written in the EntrepAIneur brand voice (professional, Caribbean-rooted, tech-forward).`,
        config: { systemInstruction: SYSTEM_INSTRUCTION }
      });
      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Generate Pitch Error:", error);
      res.status(500).json({ error: error.message || "An error occurred generating pitch" });
    }
  });

  app.post("/api/explain-product", async (req, res) => {
    try {
      const { productName, userQuestion } = req.body;
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Product: ${productName}. User asks: "${userQuestion}"
        Explain how this product helps them in conversational language.`,
        config: { systemInstruction: SYSTEM_INSTRUCTION }
      });
      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Explain Product Error:", error);
      res.status(500).json({ error: error.message || "An error occurred explaining product" });
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
