function lightenHex(hex, amount = 0.2) {
    // amount: 0 → 1 (e.g. 0.2 = 20% lighter)

    hex = hex.replace('#', '');

    // Expand shorthand
    if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('');
    }

    let r = parseInt(hex.slice(0, 2), 16) / 255;
    let g = parseInt(hex.slice(2, 4), 16) / 255;
    let b = parseInt(hex.slice(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let l = (max + min) / 2;

    // Increase lightness toward 1
    l = l + (1 - l) * amount;

    // Convert back to RGB via scaling
    if (max === min) {
        r = g = b = l; // grayscale
    } else {
        const scale = l / ((max + min) / 2);
        r = Math.min(1, r * scale);
        g = Math.min(1, g * scale);
        b = Math.min(1, b * scale);
    }

    const toHex = (v) =>
        Math.round(v * 255).toString(16).padStart(2, '0');

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}