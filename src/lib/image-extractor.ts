


export interface ExtractedImage {
    url: string;
    width?: number;
    height?: number;
    size?: number;
    type?: string;
    name?: string;
}

export interface ExtractionResult {
    id: string;
    status: 'pending' | 'running' | 'done' | 'error';
    url: string;
    images: ExtractedImage[];
}

const API_BASE = "https://api.extract.pics/v0";

/**
 * Extracts images from a given URL using the Image Extractor API.
 * @param targetUrl The product URL to extract images from.
 * @param apiKey The Image Extractor API key.
 * @returns A promise that resolves to the best matching image URL, or null if failed.
 */
export async function extractBestImage(targetUrl: string, apiKey: string): Promise<string | null> {
    try {
        console.log("🚀 Starting extraction for:", targetUrl);

        // 1. Start Extraction
        const startRes = await fetch(`${API_BASE}/extractions`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                url: targetUrl,
                mode: "advanced", // Use advanced mode for better results
                ignoreInlineImages: true
            })
        });

        if (!startRes.ok) {
            console.error("❌ Failed to start extraction:", await startRes.text());
            return null;
        }

        const startData = await startRes.json();
        const extractionId = startData.id;
        console.log("🆔 Extraction ID:", extractionId);

        // 2. Poll for Completion
        let attempts = 0;
        const maxAttempts = 10; // Wait up to 20 seconds (2s interval)

        while (attempts < maxAttempts) {
            await new Promise(r => setTimeout(r, 2000)); // Wait 2s

            const statusRes = await fetch(`${API_BASE}/extractions/${extractionId}`, {
                headers: { "Authorization": `Bearer ${apiKey}` }
            });

            if (!statusRes.ok) continue;

            const statusData: ExtractionResult = await statusRes.json();
            console.log("📊 Status:", statusData.status);

            if (statusData.status === 'done') {
                return selectBestImage(statusData.images, targetUrl);
            }

            if (statusData.status === 'error') {
                console.error("❌ Extraction failed on server.");
                return null;
            }

            attempts++;
        }

        console.warn("⏳ Extraction timed out.");
        return null;

    } catch (e) {
        console.error("💥 Exception in extractBestImage:", e);
        return null;
    }
}

/**
 * Selects the most relevant image from the extracted list.
 */
function selectBestImage(images: ExtractedImage[], targetUrl: string): string | null {
    if (!images || images.length === 0) return null;

    // Filter out obviously bad images (too small)
    const candidates = images.filter(img => {
        // Assume valid images are decent size. 
        // If width/height is missing, we accept it tentatively.
        if (img.width && img.width < 200) return false;
        if (img.height && img.height < 200) return false;
        // Filter out svgs unless they are large (unlikely for product photos)
        if (img.url.endsWith('.svg')) return false;
        return true;
    });

    if (candidates.length === 0) return null;

    // Sort by relevance logic
    // 1. Name match: Does the image filename match parts of the URL (slug)?
    // 2. Size: Larger is usually better for product photos.

    const urlSlug = targetUrl.split('/').pop()?.split('?')[0].toLowerCase() || "";

    candidates.sort((a, b) => {
        const aScore = getItemScore(a, urlSlug);
        const bScore = getItemScore(b, urlSlug);
        return bScore - aScore; // Descending
    });

    console.log("🏆 Best image selected:", candidates[0].url);
    return candidates[0].url;
}

function getItemScore(img: ExtractedImage, slug: string): number {
    let score = 0;

    // Size score (capped contribution)
    const area = (img.width || 0) * (img.height || 0);
    if (area > 0) score += Math.min(area, 1000000) / 10000; // max 100 points for size

    // Name match score
    const filename = img.name?.toLowerCase() || "";
    if (filename && slug.includes(filename)) {
        score += 50;
    }

    // Negative score for common generic names
    if (filename.includes('logo') || filename.includes('icon') || filename.includes('banner')) {
        score -= 100;
    }

    return score;
}
