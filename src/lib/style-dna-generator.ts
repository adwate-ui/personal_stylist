import { GoogleGenerativeAI } from "@google/generative-ai";
import { getFirstSearchResultUrl } from "./product-links";

// Model priority: Premium models first, free tier as fallback
const MODELS = {
  premium_primary: "gemini-3-pro-preview",      // Latest, most capable (Dec 2025)
  premium_secondary: "gemini-2.5-pro",          // Advanced reasoning
  free_primary: "gemini-3-flash-preview",       // Fast and intelligent
  free_secondary: "gemini-2.5-flash"            // Price-performance
};

export interface StyleDNA {
  archetype_name: string;
  summary: string;
  color_palette: {
    neutrals: string[];
    accents: string[];
    avoid: Array<{ color: string; reason: string }>;
    rationale: string;
  };
  must_have_staples: {
    [category: string]: {
      [type: string]: Array<{
        item: string;
        brand: string;
        why: string;
        product_url: string;
      }>;
    };
  };
  brand_recommendations: Array<{
    name: string;
    tier: string;
    why: string;
  }>;
  styling_wisdom: string[];
  generated_by_model?: string; // Track which model generated this DNA
}

interface UserProfile {
  name: string;
  gender: string;
  age: string;
  location: string;
  height: string;
  weight: string;
  bodyShape: string;
  fitPreference: string;
  skinTone: string;
  skinToneUndertone: string;
  eyeColor: string;
  hairColor: string;
  lifestyle: {
    work: boolean;
    casual: boolean;
    event: boolean;
    active: boolean;
  };
  archetypes: string[];
  brands: string[];
  priceRange: string;
  avatar_url?: string; // Optional uploaded photo
}

function buildPrompt(profile: UserProfile): string {
  const lifestyleContexts = [];
  if (profile.lifestyle.work) lifestyleContexts.push("corporate/professional settings");
  if (profile.lifestyle.casual) lifestyleContexts.push("casual/work-from-home environments");
  if (profile.lifestyle.event) lifestyleContexts.push("social events and evening occasions");
  if (profile.lifestyle.active) lifestyleContexts.push("active/athletic activities");

  const priceRangeMap: Record<string, { tier: string; range: string }> = {
    budget: { tier: "High Street", range: "Rs. 1,500 - 8,000" },
    mid: { tier: "Contemporary", range: "Rs. 8,000 - 40,000" },
    luxury: { tier: "Designer", range: "Rs. 40,000 - 1,50,000" },
    high_luxury: { tier: "Couture", range: "Rs. 1,50,000+" }
  };

  const priceInfo = priceRangeMap[profile.priceRange] || priceRangeMap.mid;

  return `You are a world-class personal stylist with expertise in fashion trends, color theory, body proportions, and luxury brands. Analyze this client profile and create their personalized Style DNA.

CLIENT PROFILE:
- Name: ${profile.name}
- Gender: ${profile.gender}
- Age: ${profile.age}
- Location: ${profile.location}
- Body Shape: ${profile.bodyShape}
- Height: ${profile.height} cm, Weight: ${profile.weight} kg
- Fit Preference: ${profile.fitPreference}
- Skin Tone: ${profile.skinTone}${profile.skinToneUndertone ? ` (Undertone: ${profile.skinToneUndertone})` : ''}
- Hair Color: ${profile.hairColor}
- Eye Color: ${profile.eyeColor}
- Lifestyle Needs: ${lifestyleContexts.join(", ") || "balanced mix"}
- Aesthetic Preferences: ${profile.archetypes.join(", ") || "versatile"}
- Admired Brands: ${profile.brands.join(", ") || "various"}
- Budget: ${priceInfo.tier} (${priceInfo.range} per item)

YOUR TASK:
Create a comprehensive Style DNA that feels personalized, professional, and actionable. Return ONLY valid JSON (no markdown, no backticks) with this exact structure:

{
  "archetype_name": "A unique 2-3 word style archetype name that captures their essence",
  "summary": "2-3 sentences describing their style identity and what makes them unique",
  "color_palette": {
    "neutrals": ["#hexcode1", "#hexcode2", "#hexcode3", "#hexcode4"],
    "accents": ["#hexcode1", "#hexcode2", "#hexcode3"],
    "avoid": [
      { "color": "Color Name", "reason": "Why this color doesn't work for them" },
      { "color": "Color Name", "reason": "Why this color doesn't work for them" }
    ],
    "rationale": "2-3 sentences explaining WHY these colors were chosen based on their skin tone, lifestyle, and aesthetic preferences"
  },
  "must_have_staples": {
    "tops": {
      "shirts": [
        {
          "item": "Specific item description",
          "brand": "Specific brand from their tier",
          "why": "Why this item is essential for them",
          "product_url": "leave empty, will be generated"
        }
      ],
      "sweaters": [...same structure as shirts]
    },
    "bottoms": {
      "trousers": [...],
      "jeans": [...]
    },
    "outerwear": {
      "jackets": [...],
      "coats": [...]
    },
    "footwear": {
      "everyday": [...],
      "formal": [...]
    }
  },
  "brand_recommendations": [
    {
      "name": "Brand Name (MUST be from ${priceInfo.tier} tier)",
      "tier": "${priceInfo.tier}",
      "why": "Why this brand aligns with their style and needs"
    }
  ],
  "styling_wisdom": [
    "Actionable styling tip 1",
    "Actionable styling tip 2",
    "Actionable styling tip 3"
  ]
}

IMPORTANT REQUIREMENTS:
1. All hex codes must be valid CSS colors (#RRGGBB format)
2. Color palette should be based on their skin tone (${profile.skinTone}) and complement their hair (${profile.hairColor}) and eyes (${profile.eyeColor})
3. Must-have staples should include 10-15 items total across all categories
4. Each staple must specify a brand from the ${priceInfo.tier} tier ONLY
5. Brand recommendations must ONLY include brands from ${priceInfo.tier} tier (budget examples: Zara, H&M, Mango; mid: Sandro, Reiss, Theory; luxury: Gucci, Prada, YSL)
6. Consider their body shape (${profile.bodyShape}) and fit preference (${profile.fitPreference}) in recommendations
7. Styling wisdom should be specific to their lifestyle needs
8. Return ONLY the JSON object, no other text${profile.avatar_url ? '\n\nIMPORTANT: The user has provided a photo. Use this to refine your recommendations based on their actual appearance, style, and body proportions visible in the image.' : ''}`;
}

export async function generateStyleDNAWithAI(profile: UserProfile, apiKey: string): Promise<StyleDNA> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const prompt = buildPrompt(profile);

  const modelsToTry = [
    MODELS.premium_primary,
    MODELS.premium_secondary,
    MODELS.free_primary,
    MODELS.free_secondary
  ];

  for (let i = 0; i < modelsToTry.length; i++) {
    const modelName = modelsToTry[i];
    const isLastModel = i === modelsToTry.length - 1;

    try {
      const model = genAI.getGenerativeModel({ model: modelName });

      let result;
      if (profile.avatar_url) {
        // Include photo in analysis
        try {
          const imageResponse = await fetch(profile.avatar_url);
          const imageBuffer = await imageResponse.arrayBuffer();
          const base64Image = Buffer.from(imageBuffer).toString('base64');

          result = await model.generateContent([
            { text: prompt },
            {
              inlineData: {
                data: base64Image,
                mimeType: 'image/jpeg'
              }
            }
          ]);
        } catch (imgError) {
          console.warn('Could not load photo, continuing without it:', imgError);
          result = await model.generateContent(prompt);
        }
      } else {
        result = await model.generateContent(prompt);
      }
      const response = await result.response;
      const text = response.text();
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();

      const parsed = JSON.parse(cleanJson);

      // Generate product URLs using Cloudflare Worker
      if (parsed.must_have_staples) {
        for (const category in parsed.must_have_staples) {
          for (const type in parsed.must_have_staples[category]) {
            const items = parsed.must_have_staples[category][type];
            const updatedItems = [];

            for (const item of items) {
              try {
                // Fetch actual product URL using worker
                const productData = await getFirstSearchResultUrl(
                  item.brand || '',
                  item.item || '',
                  item.color || ''
                );
                updatedItems.push({
                  ...item,
                  product_url: productData.url,
                  image_url: productData.imageUrl // Also store image URL
                });
              } catch (error) {
                console.warn(`Failed to fetch product URL for ${item.brand} ${item.item}:`, error);
                // Fallback to '#' if worker fails
                updatedItems.push({
                  ...item,
                  product_url: '#'
                });
              }
            }

            parsed.must_have_staples[category][type] = updatedItems;
          }
        }
      }

      // Store which model generated this DNA
      parsed.generated_by_model = modelName;

      return parsed as StyleDNA;
    } catch (error: any) {
      const isQuotaError = error?.message?.includes("429") || error?.message?.includes("quota");

      if (isQuotaError && !isLastModel) {
        console.warn(`Model ${modelName} quota exceeded, trying next model...`);
        continue;
      }

      if (isLastModel) {
        console.error("Style DNA generation failed:", error);
        throw new Error(
          error?.message?.includes("API key")
            ? "Invalid Gemini API Key. Please check your settings."
            : "Failed to generate Style DNA. Please try again."
        );
      }

      console.warn(`Model ${modelName} failed: ${error?.message}`);
      continue;
    }
  }

  throw new Error("All models failed to generate Style DNA");
}
