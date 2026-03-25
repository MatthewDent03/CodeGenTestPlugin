export function hexToRgb(hexColor) {
    // Pattern matches hex colors: #RRGGBB
    const hexPattern = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
    const matchResult = hexPattern.exec(hexColor);
    if (!matchResult) {
        return null; // Invalid hex format
    }
    // Parse each hex pair (2 characters) as a base-16 number
    return {
        red: parseInt(matchResult[1], 16),
        green: parseInt(matchResult[2], 16),
        blue: parseInt(matchResult[3], 16),
    };
}
export function hexToFigmaColor(hexColor) {
    const rgbColor = hexToRgb(hexColor);
    // Return null if hex color couldn't be parsed
    if (!rgbColor) {
        return null;
    }
    // Normalize RGB values from 0-255 range to 0-1 range for Figma
    return {
        r: rgbColor.red / 255,
        g: rgbColor.green / 255,
        b: rgbColor.blue / 255,
    };
}
/**
 * Calculate the Euclidean distance between two hex colors
 * Used to find the closest matching token to a selected color
 */
export function colorDistance(hexColor1, hexColor2) {
    const rgbColor1 = hexToRgb(hexColor1);
    const rgbColor2 = hexToRgb(hexColor2);
    // If either color is invalid, return infinity
    if (!rgbColor1 || !rgbColor2) {
        return Infinity;
    }
    // Calculate squared Euclidean distance
    const redDifference = rgbColor1.red - rgbColor2.red;
    const greenDifference = rgbColor1.green - rgbColor2.green;
    const blueDifference = rgbColor1.blue - rgbColor2.blue;
    return (Math.pow(redDifference, 2) +
        Math.pow(greenDifference, 2) +
        Math.pow(blueDifference, 2));
}
