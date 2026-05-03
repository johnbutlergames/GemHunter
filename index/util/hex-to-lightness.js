function hexToLightness(hex) {
  // Remove leading # if present
  hex = hex.replace('#', '');

  // Handle shorthand (#abc → #aabbcc)
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }

  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  const lightness = (max + min) / 2;

  return lightness; // range: 0 → 1
}