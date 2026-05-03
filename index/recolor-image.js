/**
 * Recolor a grayscale image using hard mapping (no interpolation).
 * Returns a new HTMLImageElement.
 * @param {HTMLImageElement} img
 * @param {number[]} grayValues
 * @param {string[]} colors
 * @returns {Promise<HTMLImageElement>}
 */
async function recolorImage(img, grayValues, colors) {
    // helper
    function hexToRgb(hex) {
        hex = hex.replace("#", "");
        if (hex.length === 3) {
            hex = hex.split("").map(c => c + c).join("");
        }
        const num = parseInt(hex, 16);
        return {
            r: (num >> 16) & 255,
            g: (num >> 8) & 255,
            b: num & 255
        };
    }

    if (grayValues.length !== colors.length) {
        throw new Error("grayValues and colors must have same length");
    }

    // build lookup table
    const map = new Array(256);
    for (let i = 0; i < grayValues.length; i++) {
        for (let j = -2; j <= 2; j++) {
            map[hexToRgb(grayValues[i]).r + j] = hexToRgb(colors[i]);
        }
    }

    // draw to canvas
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // recolor
    for (let i = 0; i < data.length; i += 4) {
        const gray = data[i]; // assume grayscale
        const c = map[gray];
        if (c) {
            data[i] = c.r;
            data[i + 1] = c.g;
            data[i + 2] = c.b;
        }
    }

    ctx.putImageData(imageData, 0, 0);
    document.body.appendChild(canvas);

    // convert canvas → Blob → Image
    const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));
    if (!blob) throw new Error("Failed to create blob");

    const url = URL.createObjectURL(blob);

    const outImg = new Image();
    outImg.src = url;

    await new Promise((resolve, reject) => {
        outImg.onload = resolve;
        outImg.onerror = reject;
    });

    // optional: release blob URL after load
    URL.revokeObjectURL(url);

    return outImg;
}