function hexToGrayscale(hex) {
    // Remove #
    hex = hex.replace('#', '');

    // Expand shorthand (#abc → #aabbcc)
    if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('');
    }

    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);

    // Luminance formula
    const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);

    // Convert back to hex
    const grayHex = gray.toString(16).padStart(2, '0');

    return `#${grayHex}${grayHex}${grayHex}`;
}