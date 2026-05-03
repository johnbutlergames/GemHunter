const sharp = require("sharp");

function toHex(r, g, b) {
    return "#" + [r, g, b].map(v => v.toString(16).padStart(2, "0")).join("");
}

function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }
    return { h, s, l };
}

function colorDistance(c1, c2) {
    return Math.sqrt(
        Math.pow(c1.r - c2.r, 2) +
        Math.pow(c1.g - c2.g, 2) +
        Math.pow(c1.b - c2.b, 2)
    );
}

function extractDominantColors(data, width, height, channels, numColors = 6) {
    const step = 4;
    const buckets = {};
    for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
            const idx = (y * width + x) * channels;
            const r = data[idx], g = data[idx + 1], b = data[idx + 2];
            const key = `${Math.floor(r/32)},${Math.floor(g/32)},${Math.floor(b/32)}`;
            if (!buckets[key]) buckets[key] = { count: 0, r: 0, g: 0, b: 0 };
            buckets[key].count++;
            buckets[key].r += r;
            buckets[key].g += g;
            buckets[key].b += b;
        }
    }
    return Object.values(buckets)
        .sort((a, b) => b.count - a.count)
        .slice(0, numColors)
        .map(b => toHex(
            Math.round(b.r / b.count),
            Math.round(b.g / b.count),
            Math.round(b.b / b.count)
        ));
}

function extractAccentColors(data, width, height, channels, numAccents = 4) {
    const candidates = [];
    const step = 3;

    for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
            const idx = (y * width + x) * channels;
            const r = data[idx], g = data[idx + 1], b = data[idx + 2];
            const { s, l } = rgbToHsl(r, g, b);

            // Only vivid, non-white, non-black pixels
            if (s > 0.12 && l > 0.12 && l < 0.88) { 
                candidates.push({ r, g, b, score: s });
            }
        }
    }

    candidates.sort((a, b) => b.score - a.score);

    // Pick colors visually distinct from each other
    const accents = [];
    for (const c of candidates) {
        const tooClose = accents.some(a => colorDistance(a, c) < 35);
        if (!tooClose) {
            accents.push(c);
            if (accents.length >= numAccents) break;
        }
    }

    return accents.map(c => toHex(c.r, c.g, c.b));
}

async function extractBiomePalette(buffer) {
    const { data, info } = await sharp(buffer)
        .resize(100, 100)
        .raw()
        .toBuffer({ resolveWithObject: true });

    const { width, height, channels } = info;

    function sampleStrip(yStart, yEnd) {
        const colors = [];
        const startRow = Math.floor(yStart * height);
        const endRow = Math.floor(yEnd * height);
        for (let y = startRow; y < endRow; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * channels;
                colors.push({ r: data[idx], g: data[idx + 1], b: data[idx + 2] });
            }
        }
        return averageColor(colors);
    }

    function averageColor(colors) {
        const avg = colors.reduce((acc, c) => ({
            r: acc.r + c.r, g: acc.g + c.g, b: acc.b + c.b
        }), { r: 0, g: 0, b: 0 });
        const len = colors.length;
        return toHex(Math.round(avg.r / len), Math.round(avg.g / len), Math.round(avg.b / len));
    }

    const palette = {
        sky:        sampleStrip(0.0, 0.25),
        horizon:    sampleStrip(0.25, 0.45),
        midground:  sampleStrip(0.45, 0.65),
        ground:     sampleStrip(0.65, 0.85),
        foreground: sampleStrip(0.85, 1.0),
        dominant:   extractDominantColors(data, width, height, channels, 8),
        accents:    extractAccentColors(data, width, height, channels, 6),
    };

    console.log("Biome palette:", JSON.stringify(palette, null, 2));
    return palette;
}

async function extractBiomepaletteFromURL(url) {
    return await extractBiomePalette(await imageToBlob(url));
}

const { createCanvas, loadImage } = require('canvas');

async function imageToBlob(url) {
    const img = await loadImage(url);

    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(img, 0, 0);

    return new Promise((resolve) => {
        canvas.toBuffer((err, buffer) => {
            resolve(new Blob([buffer], { type: 'image/png' }));
        });
    });
}

module.exports = { extractBiomePalette, extractBiomepaletteFromURL };