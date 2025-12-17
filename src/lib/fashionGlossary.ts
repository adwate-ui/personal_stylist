export const FASHION_GLOSSARY: Record<string, string> = {
    // Silhouettes & Cuts
    "silhouette": "The overall outline or shape of a garment.",
    "bespoke": "Clothing made to an individual buyer's specifications; custom-made.",
    "bias cut": "Fabric cut at a 45-degree angle to allowing it to drape softly over the body's curves.",
    "peplum": "A short, gathered or pleated strip of fabric attached at the waist of a woman's jacket, dress, or blouse.",
    "empire waist": "A fitted bodice ending just below the bust, giving a high-waisted appearance.",
    "drop waist": "A waistline that sits below the natural waist, often at the hips.",
    "a-line": "A silhouette that is narrower at the top and flares gently wider toward the bottom.",

    // Footwear & Accessories
    "chukka": "A specific variation of ankle-high boots usually made from suede or leather with open lacing.",
    "loafer": "A slip-on shoe with no laces, often featuring a low heel and moccasin-like construction.",
    "sneaker": "A shoe designed primarily for sports or physical exercise, but mostly used for everyday casual wear.",
    "brogue": "A low-heeled shoe or boot characterized by sturdy leather uppers with decorative perforations (broguing).",
    "espadrille": "A casual shoe with a canvas or cotton fabric upper and a flexible sole made of esparto rope.",
    "oxford": "A classic dress shoe with closed lacing, where the shoelace eyelets tabs are attached under the vamp.",
    "derby": "A boot or shoe with open lacing, meaning that the eyelets are sewn on top of the vamp.",
    "chelsea boot": "A close-fitting, ankle-high boot with an elastic side panel.",
    "mule": "A shoe that has no back or constraint around the foot's heel.",

    // Tops & Jackets
    "blazer": "A structured jacket resembling a suit jacket but cut more casually.",
    "tunic": "A loose garment, typically sleeveless and reaching to the knees, as worn in ancient Greece and Rome.",
    "cardigan": "A knitted sweater opening down the front, typically with buttons.",
    "bomber jacket": "A short jacket gathered at the waist and cuffs by elasticated bands and typically having a zip front.",
    "trench coat": "A loose-belted, double-breasted raincoat in a military style.",
    "camisole": "A loose-fitting sleeveless undergarment or top for women, typically with thin straps.",

    // Bottoms & Dresses
    "culottes": "Women's knee-length trousers, cut with full legs to resemble a skirt.",
    "chino": "Casual trousers made from chino cloth, a twill fabric, typically khaki-colored.",
    "palazzo": "Long women's trousers cut with a loose, extremely wide leg that flares out from the waist.",
    "pencil skirt": "A slim-fitting skirt with a straight, narrow cut.",
    "sheath dress": "A fitted, straight-cut dress, often without a waist seam.",

    // Fabrics & Materials
    "cashmere": "A soft, fine wool obtained from the cashmere goat.",
    "bouclé": "A yarn with a looped or curled ply, or the fabric made from this yarn.",
    "brocade": "A rich fabric, usually silk, woven with a raised pattern, typically with gold or silver thread.",
    "chambray": "A lightweight clothing fabric with colored warp and white filling yarns.",
    "organza": "A thin, stiff, transparent fabric made of silk or a synthetic yarn.",
    "taffeta": "A crisp, smooth, plain-woven fabric with a slight sheen.",
    "tweed": "A rough-surfaced woolen cloth, typically of mixed flecked colors.",

    // Styles & Aesthetics
    "old money": "A style characterized by understated luxury, classic pieces, and high-quality materials without overt logos.",
    "avant-garde": "Experimental, innovative, or unorthodox concepts in fashion.",
    "haute couture": "Expensive, fashionable clothes produced by leading fashion houses.",
    "minimalist": "A style focused on clean lines, simple geometric shapes, and a lack of decorative detail.",
    "eclectic": "A style that derives ideas, style, or taste from a broad and diverse range of sources.",
    "bohemian": "Unconventional and artistic style, often involving loose, flowing fabrics and colorful patterns.",
    "preppy": "A classic, neat style inspired by the clothing of American preparatory schools.",
    "streetwear": "Casual clothing of a style worn especially by members of various urban youth subcultures.",
    "utilitarian": "Fashion that prioritizes function, practicality, and comfort.",
    "monochrome": "An outfit consisting of pieces of one single color or shades of that color.",

    // Techniques & Details
    "trompe-l'œil": "Visual illusion in art/fashion, used to trick the eye into perceiving a painted detail as a three-dimensional object.",
    "appliqué": "Ornamental needlework in which pieces of fabric are sewn or stuck onto a large piece of fabric to form a picture or pattern.",
    "embroidery": "The art or process of forming decorative designs with hand or machine needlework.",
    "pleating": "A type of fold formed by doubling fabric back upon itself and securing it in place.",
    "ruching": "A gathering of fabric or ribbon to produce a ripple or ruffle effect.",

    // Industry Terms
    "atelier": "A workshop or studio, especially one used by an artist or fashion designer.",
    "capsule wardrobe": "A collection of a few essential items of clothing that do not go out of fashion.",
    "prêt-à-porter": "Designer clothes sold ready-to-wear rather than made to measure.",
    "sartorial": "Relating to tailoring, clothes, or style of dress.",
    "texture": "The perceived surface quality of a garment or fabric."
};

/**
 * matches terms in the text and returns an array of segments/terms
 */
export function getGlossarySegments(text: string) {
    if (!text) return [text];

    // Create a regex that captures the terms, case-insensitive.
    // Escape special characters in keys just in case.
    const terms = Object.keys(FASHION_GLOSSARY).sort((a, b) => b.length - a.length); // match longest first
    const pattern = new RegExp(`(${terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');

    // Split key keeps delimiters because of capturing group ()
    return text.split(pattern);
}
