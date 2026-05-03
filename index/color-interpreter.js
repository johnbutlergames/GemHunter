async function interpretBiomeColors(description, palette) {
    const prompt = `You are a color designer for a pixel art RPG game. 

Here is a biome description:
"${description}"

Here is a color palette extracted from an AI-generated image of this biome:
- Sky: ${palette.sky}
- Horizon: ${palette.horizon}
- Midground: ${palette.midground}
- Ground: ${palette.ground}
- Foreground: ${palette.foreground}
- Dominant colors found in image: ${palette.dominant.join(', ')}
- Accent colors found in image: ${palette.accents.join(', ')}

Based on the description AND these extracted colors, return a JSON object with the following keys and hex color values that would make a vibrant, visually interesting pixel art map. Make the colors vivid and saturated — avoid muddy or gray tones unless the description specifically calls for them.
The accent colors might represent flowers, rocks, or other details, so feel free to use them for the accent colors in the output. The dominant colors can be used for the main elements like sky, ground, grass, etc.

{
  "sky": "#hex",
  "ground": "#hex",
  "ground-accent": "#hex",
  "grass": "#hex",
  "grass-accent": "#hex",
  "plant": "#hex",
  "plant-accent": "#hex",
  "rock": "#hex",
  "water": "#hex or null if no water",
  "lava": "#hex or null if no lava",
  "snow": "#hex or null if no snow"
  "flower-primary": "#hex or null if no flowers",
  "flower-secondary": "#hex or null if no flowers"
}

Return ONLY the JSON object. No explanation, no markdown, no backticks.`;

    const raw = await sendPrompt(prompt);
    try {
        return JSON.parse(raw.trim());
    } catch (e) {
        console.error("Failed to parse color response:", raw);
        return null;
    }
}