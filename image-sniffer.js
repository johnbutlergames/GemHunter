const sharp = require("sharp");

function toHex(r, g, b) {
    return "#" + [r, g, b].map(v => v.toString(16).padStart(2, "0")).join("");
}

function extractDominantColors(data, width, height, channels, numColors = 6) {
    // Sample every Nth pixel for speed
    const pixels = [];
    const step = 4;
    for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
            const idx = (y * width + x) * channels;
            pixels.push({
                r: data[idx],
                g: data[idx + 1],
                b: data[idx + 2]
            });
        }
    }

    // Quantize to buckets of 32 to group similar colors
    const buckets = {};
    for (const p of pixels) {
        const key = `${Math.floor(p.r / 32)},${Math.floor(p.g / 32)},${Math.floor(p.b / 32)}`;
        if (!buckets[key]) buckets[key] = { count: 0, r: 0, g: 0, b: 0 };
        buckets[key].count++;
        buckets[key].r += p.r;
        buckets[key].g += p.g;
        buckets[key].b += p.b;
    }

    // Sort by frequency, take top N
    return Object.values(buckets)
        .sort((a, b) => b.count - a.count)
        .slice(0, numColors)
        .map(b => toHex(
            Math.round(b.r / b.count),
            Math.round(b.g / b.count),
            Math.round(b.b / b.count)
        ));
}

async function extractBiomepaletteFromURL(url) {
    return await extractBiomepalette(await imageToBlob(url));
}

async function extractBiomePalette(buffer) {
    const { data, info } = await sharp(buffer)
        .resize(100, 100) // downsample for speed
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
                colors.push({
                    r: data[idx],
                    g: data[idx + 1],
                    b: data[idx + 2]
                });
            }
        }
        return averageColor(colors);
    }

    function averageColor(colors) {
        const avg = colors.reduce((acc, c) => ({
            r: acc.r + c.r,
            g: acc.g + c.g,
            b: acc.b + c.b
        }), { r: 0, g: 0, b: 0 });

        const len = colors.length;
        return toHex(
            Math.round(avg.r / len),
            Math.round(avg.g / len),
            Math.round(avg.b / len)
        );
    }

    // console.log("Extracted biome pa;lette:", {
    //     sky: sampleStrip(0.0, 0.25),
    //     horizon: sampleStrip(0.25, 0.45),
    //     midground: sampleStrip(0.45, 0.65),
    //     ground: sampleStrip(0.65, 0.85),
    //     foreground: sampleStrip(0.85, 1.0)
    // });

    const palette = {
        sky: sampleStrip(0.0, 0.25),
        horizon: sampleStrip(0.25, 0.45),
        midground: sampleStrip(0.45, 0.65),
        ground: sampleStrip(0.65, 0.85),
        foreground: sampleStrip(0.85, 1.0),
        dominant: extractDominantColors(data, width, height, channels, 8)
    };

    return palette;
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