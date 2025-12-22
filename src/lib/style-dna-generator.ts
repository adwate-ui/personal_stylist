import { GoogleGenerativeAI } from "@google/generative-ai";
import { getProductLink } from "./product-links";

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
        image_url?: string;
      }>;
    };
  };

  styling_wisdom: string[];
  style_pillars?: string[];
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
    "neutrals": [
      { "hex": "#hexcode", "name": "Color Name" },
      { "hex": "#hexcode", "name": "Color Name" },
      { "hex": "#hexcode", "name": "Color Name" },
      { "hex": "#hexcode", "name": "Color Name" }
    ],
    "accents": [
      { "hex": "#hexcode", "name": "Color Name" },
      { "hex": "#hexcode", "name": "Color Name" },
      { "hex": "#hexcode", "name": "Color Name" }
    ],
    "avoid": [
      { "color": "#hexcode", "reason": "Why this color doesn't work for them" },
      { "color": "#hexcode", "reason": "Why this color doesn't work for them" }
    ],
    "rationale": "DETAILED explanation covering:\\n    1) Why these specific colors were chosen based on skin tone, hair, and eye color\\n    2) Specific product color recommendations (e.g., 'Navy blazer', 'Cream trousers', 'Burgundy accessories')\\n    3) How to combine these colors effectively\\n    4) Seasonal variations if applicable"
  },
  "must_have_staples": {
    "tops": {
      "quantity_recommendation": {
        "total": "Number based on lifestyle (e.g., '12-15 tops total')",
        "breakdown": "Breakdown by type (e.g., '5 shirts, 4 t-shirts, 3 polos')",
        "color_split": "Color distribution (e.g., '40% neutrals, 40% core colors, 20% accents')"
      },
      "shirts": [
        {
          "item": "Specific item description",
          "brand": "Specific OFFICIAL brand website or high-end retailer (NO eBay, Mercari, Poshmark, or reseller sites)",
          "why": "Why this item is essential for them",
          "color": "Recommended color from their palette with quantity (e.g., '2 white, 1 navy')"
        }
      ],
      "t_shirts": [],
      "polos": []
    },
    "bottoms": {
      "quantity_recommendation": {
        "total": "Number based on lifestyle",
        "breakdown": "Breakdown by type",
        "color_split": "Color distribution"
      },
      "jeans": [],
      "chinos": [],
      "trousers": []
    },
    "outerwear": {
    "belts": {
      "casual": [...],
      "formal": [...]
    },
    "jewelry": {
      "everyday": [...]
    }
  },

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
4. Each staple must specify a brand strictly from the ${priceInfo.tier} tier. Use client's Admired Brands only if they match this tier.

6. Ensure recommended brands are generally accessible in ${profile.location}.
7. Consider their body shape (${profile.bodyShape}) and fit preference (${profile.fitPreference}) in recommendations
8. Styling wisdom should be specific to their lifestyle needs
9. Return ONLY the JSON object, no other text${profile.avatar_url ? '\n\nIMPORTANT: The user has provided a photo. Use this to refine your recommendations based on their actual appearance, style, and body proportions visible in the image.' : ''}`;
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

    console.log(`[Style DNA] Attempting model ${i + 1}/${modelsToTry.length}: ${modelName}`);

    try {
      const model = genAI.getGenerativeModel({ model: modelName });

      let result;
      const avatarUrl = profile.avatar_url?.trim();

      if (avatarUrl) {
        // Include photo in analysis
        try {
          const imageResponse = await fetch(avatarUrl);
          if (!imageResponse.ok) {
            throw new Error(`Avatar fetch failed: ${imageResponse.status}`);
          }
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
          console.warn(`Could not load avatar from ${avatarUrl}:`, imgError);
          result = await model.generateContent(prompt);
        }
      } else {
        result = await model.generateContent(prompt);
      }

      // Debug: Log the full response structure
      console.log('[Style DNA] Full result object:', JSON.stringify({
        hasResponse: !!result.response,
        hasCandidates: !!result.response?.candidates,
        candidatesLength: result.response?.candidates?.length,
        firstCandidate: result.response?.candidates?.[0] ? 'exists' : 'missing'
      }));

      // Extract text from response with multiple fallback strategies
      let text = '';

      try {
        // Strategy 1: Try the candidates array (most reliable)
        if (result.response?.candidates?.[0]?.content?.parts?.[0]?.text) {
          text = result.response.candidates[0].content.parts[0].text;
          console.log('[Style DNA] ✅ Extracted text via candidates array');
        }
        // Strategy 2: Try direct text() method (some SDK versions)
        else if (typeof result.response.text === 'function') {
          text = result.response.text();
          console.log('[Style DNA] ✅ Extracted text via text() method');
        }
        // Strategy 3: Check if response itself has text property
        else if (result.response?.text) {
          text = result.response.text;
          console.log('[Style DNA] ✅ Extracted text via text property');
        }
      } catch (extractError: any) {
        console.error('[Style DNA] Text extraction error:', extractError);
        console.error('[Style DNA] Response structure:', JSON.stringify(result.response, null, 2));
        throw new Error(`Failed to extract text from Gemini response: ${extractError?.message || 'Unknown error'}`);
      }

      if (!text) {
        console.error('[Style DNA] No text found in response. Full response:', JSON.stringify(result.response, null, 2));
        throw new Error('No text content in Gemini response');
      }

      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();

      const parsed = JSON.parse(cleanJson);

      // Generate product URLs using Cloudflare Worker
      if (parsed.must_have_staples) {
        for (const category in parsed.must_have_staples) {
          const categoryData = parsed.must_have_staples[category];

          if (typeof categoryData !== 'object' || categoryData === null) continue;

          // FIX: Handle case where Gemini returns { "0": item, "1": item } directly under category
          // instead of { "Type": [items] }
          const keys = Object.keys(categoryData);
          const isDirectItemList = keys.every(k => !isNaN(parseInt(k)) || k === 'quantity_recommendation');

          if (isDirectItemList) {
            console.log(`[Style DNA] ⚠️ Detected direct item list for category ${category}, normalizing...`);
            const collectedItems = [];
            for (const key of keys) {
              if (key === 'quantity_recommendation') continue;
              const item = categoryData[key];
              if (typeof item === 'object' && item !== null) {
                collectedItems.push(item);
              }
            }
            // Reconstruct as { "Essential": [items] }
            parsed.must_have_staples[category] = { "Essentials": collectedItems };
          }

          // Re-fetch category data after potential normalization
          const normalizedCategoryData = parsed.must_have_staples[category];

          for (const type in normalizedCategoryData) {
            let items = normalizedCategoryData[type];

            // Filter out non-array stuff like quantity_recommendation if it wasn't caught above
            if (!Array.isArray(items)) {
              // Try one last rescue: is `items` actually a single item object?
              if (typeof items === 'object' && items !== null && (items as any).item) {
                items = [items]; // Wrap single item in array
                normalizedCategoryData[type] = items;
              } else {
                console.warn(`[Style DNA] ⚠️ Skipping ${category}/${type} - not an array and not a recognized item`);
                delete normalizedCategoryData[type]; // Remove bad key to prevent UI crash
                continue;
              }
            }

            const updatedItems = [];

            for (const item of items) {
              try {
                const productData = await getProductLink({
                  brand: item.brand || '',
                  name: item.item || '',
                  color: item.color || ''
                });
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

            categoryData[type] = updatedItems;
          }
        }
      }

      // Final normalization pass: Ensure critical arrays are actually arrays
      // Gemini 1.5 Pro sometimes returns arrays as objects { "0": ... }
      const normalizeArray = (arr: any) => {
        if (Array.isArray(arr)) return arr;
        if (typeof arr === 'object' && arr !== null) {
          const values = Object.values(arr);
          // Heuristic: if keys are indices "0", "1", etc, it's an array
          const keys = Object.keys(arr);
          if (keys.every(k => !isNaN(parseInt(k)))) return values;
          // Fallback: If it looks like a list of items
          if (values.length > 0 && typeof values[0] === 'object') return values;
        }
        return [];
      };

      if (parsed.color_palette) {
        parsed.color_palette.neutrals = normalizeArray(parsed.color_palette.neutrals);
        parsed.color_palette.accents = normalizeArray(parsed.color_palette.accents);
        parsed.color_palette.avoid = normalizeArray(parsed.color_palette.avoid);

        if (parsed.color_palette.seasonal_variations) {
          parsed.color_palette.seasonal_variations.spring_summer = normalizeArray(parsed.color_palette.seasonal_variations.spring_summer);
          parsed.color_palette.seasonal_variations.fall_winter = normalizeArray(parsed.color_palette.seasonal_variations.fall_winter);
        }
      }



      // Store which model generated this DNA
      parsed.generated_by_model = modelName;

      console.log(`[Style DNA] ✅ Successfully generated with ${modelName}`);
      return parsed as StyleDNA;
    } catch (error: any) {
      console.error(`[Style DNA] ❌ Model ${modelName} failed:`, error.message);

      const isQuotaError = error?.message?.includes("429") || error?.message?.includes("quota");

      if (isQuotaError && !isLastModel) {
        console.warn(`[Style DNA] Quota exceeded for ${modelName}, trying next model...`);
        continue;
      }

      if (isLastModel) {
        console.error("[Style DNA] All models failed. Last error:", error);
        throw new Error(
          error?.message?.includes("API key")
            ? "Invalid Gemini API Key. Please check your settings."
            : "Failed to generate Style DNA. Please try again."
        );
      }

      // For any other error on non-last model, try next model
      console.warn(`[Style DNA] Trying next model due to error in ${modelName}...`);
      continue;
    }
  }

  throw new Error("All models failed to generate Style DNA");
}
