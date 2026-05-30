/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { recommendCleaningProductsRuleBased } from "./src/utils/ruleEngine";
import { createServer as createViteServer } from "vite";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper to initialize Gemini SDK safely and lazy-loaded
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    return null;
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// REST route for product recommendations
app.post("/api/recommend", async (req, res) => {
  try {
    const {
      industryType,
      facilitySize,
      numberRooms,
      cleaningFrequency,
      hygieneLevel,
      budget,
      ecoFriendly,
      specialRequirements,
      areaToClean,
      forceRuleBased = false
    } = req.body;

    const requirements = {
      industryType: industryType || "General",
      facilitySize: facilitySize || "Medium (1000-5000 sq ft)",
      numberRooms: String(numberRooms || "5"),
      cleaningFrequency: cleaningFrequency || "Daily",
      hygieneLevel: hygieneLevel || "Standard",
      budget: budget || "Standard",
      ecoFriendly: ecoFriendly || "No preference",
      specialRequirements: specialRequirements || "",
      areaToClean: areaToClean || "All typical areas"
    };

    // If API key is not present/invalid, or rule-based is forced, use Rule-Based Engine
    const ai = getGeminiClient();
    if (!ai || forceRuleBased) {
      console.log("Serving rule-based recommendations (No API key or forced rule-based)...");
      const localResult = recommendCleaningProductsRuleBased(requirements);
      res.json(localResult);
      return;
    }

    console.log("Querying Gemini 3.5 Flash for product alignment...");
    
    const prompt = `You are an AI Product Recommendation Assistant for a professional cleaning supplies manufacturer.
Recommend appropriate cleaning products based on the customer's specific facility requirements.

Customer Inputs:
- Industry: ${requirements.industryType}
- Size of Facility: ${requirements.facilitySize}
- Number of Rooms: ${requirements.numberRooms}
- Cleaning Frequency: ${requirements.cleaningFrequency}
- Hygiene Tier Required: ${requirements.hygieneLevel}
- Budget Category: ${requirements.budget}
- Eco-Friendly Preference: ${requirements.ecoFriendly}
- Areas to be Cleaned: ${requirements.areaToClean}
- Special Custom Requirements: ${requirements.specialRequirements}

Please analyze these constraints and generate the requested recommendations exactly conforming to the provided schema. Make sure to:
1. Provide a professional, concise executive Cleaning Requirement Summary.
2. Recommend 2 to 5 suitable cleaning products customized for this industry. For each product, specify its professional Product Name, its appropriate Category (e.g. General Cleaning, Floor Care, Sanitation, Heavy Duty, Window Cleaning), its specific Purpose, recommended precise Dilution / Usage instructions, and its Priority Level (one of "Essential", "Recommended", "Optional"). Adjust product formulas/names according to their Eco-Friendly preference (e.g. refer to bio-degradable, certified green soaps if high eco preference, or highly concentrated industrial packs if economy budget).
3. Provide an estimated quantity suggestion based on the facility size, room count, and cleaning frequency.
4. List 3 to 4 safety considerations (e.g. PPE, chemical mixing bans).
5. List 2 to 3 additional professional maintenance recommendations (e.g. color-coded microfibre cloths, scrubbing interval suggestions).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert cleaning chemicals formulary advisor and operations consultant. Keep names realistic and focus on high-efficiency cleaning. Never mention internal database metrics.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "Brief recap of the facility size, rooms, industry type, budget, and hygiene needs."
            },
            recommendedProducts: {
              type: Type.ARRAY,
              description: "List of custom recommended cleaning supplies.",
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Professional product name, styled or blended with eco or value traits." },
                  category: { type: Type.STRING, description: "Cleaning supply classification." },
                  purpose: { type: Type.STRING, description: "Exactly why this product is crucial for their specified facility." },
                  usage: { type: Type.STRING, description: "Practical instructions on application or dilution ratios." },
                  priority: { 
                    type: Type.STRING, 
                    enum: ["Essential", "Recommended", "Optional"],
                    description: "Strictly select from Essential, Recommended, or Optional."
                  }
                },
                required: ["name", "category", "purpose", "usage", "priority"]
              }
            },
            quantitySuggestion: { 
              type: Type.STRING, 
              description: "Specific quantified suggestion for the month based on sq-ft/frequency." 
            },
            safetyNotes: {
              type: Type.ARRAY,
              description: "List of 3 to 4 safety considerations.",
              items: { type: Type.STRING }
            },
            additionalRecommendations: {
              type: Type.ARRAY,
              description: "List of 2 to 3 operational cleaning recommendations.",
              items: { type: Type.STRING }
            }
          },
          required: [
            "summary",
            "recommendedProducts",
            "quantitySuggestion",
            "safetyNotes",
            "additionalRecommendations"
          ]
        }
      }
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("Empty response output received from Gemini API");
    }

    const data = JSON.parse(textOutput.trim());
    res.json({
      ...data,
      isAiGenerated: true
    });

  } catch (error: any) {
    console.error("Gemini recommendation error fell back to rule-based:", error);
    // Graceful fallback to local rule-based recommendations on error
    const reqBody = req.body;
    const requirements = {
      industryType: reqBody.industryType || "General",
      facilitySize: reqBody.facilitySize || "Medium (1000-5000 sq ft)",
      numberRooms: String(reqBody.numberRooms || "5"),
      cleaningFrequency: reqBody.cleaningFrequency || "Daily",
      hygieneLevel: reqBody.hygieneLevel || "Standard",
      budget: reqBody.budget || "Standard",
      ecoFriendly: reqBody.ecoFriendly || "No preference",
      specialRequirements: reqBody.specialRequirements || "",
      areaToClean: reqBody.areaToClean || "All typical areas"
    };
    
    const localResult = recommendCleaningProductsRuleBased(requirements);
    res.json({
      ...localResult,
      fallbackWarning: true,
      errorMessage: error.message || "Failed to contact Gemini engine. Reverted to precise baseline recommendations."
    });
  }
});

// Configure Vite or Static Files
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite dev middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode with static file delivery...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running successfully on port ${PORT}`);
  });
}

setupServer();
