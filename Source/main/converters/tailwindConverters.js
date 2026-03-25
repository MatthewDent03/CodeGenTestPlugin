import { findClosest } from "../utils/findClosest";
// === Font size mapping ===
const fontSizeMap = {
    12: "xs", // 0.75rem
    14: "sm", // 0.875rem
    16: "base", // 1rem
    18: "lg", // 1.125rem
    20: "xl", // 1.25rem
    24: "2xl", // 1.5rem
    30: "3xl", // 1.875rem
    36: "4xl", // 2.25rem
    48: "5xl", // 3rem
    60: "6xl", // 3.75rem
    72: "7xl", // 4.5rem
    96: "8xl", // 6rem
};
// === Line height mapping ===
const lineHeightMap = {
    1: "none",
    1.25: "tight",
    1.375: "snug",
    1.5: "normal",
    1.625: "relaxed",
    2: "loose",
};
// === Letter spacing mapping ===
const letterSpacingMap = {
    "-0.05": "tighter",
    "-0.025": "tight",
    "0": "normal",
    "0.025": "wide",
    "0.05": "wider",
    "0.1": "widest",
};
// === Spacing scale ===
const spacingMap = {
    0: "0", // 0px
    1: "px", // 1px
    2: "0.5", // 2px
    4: "1", // 4px
    6: "1.5", // 6px
    8: "2", // 8px
    10: "2.5", // 10px
    12: "3", // 12px
    14: "3.5", // 14px
    16: "4", // 16px
    20: "5", // 20px
    24: "6", // 24px
    28: "7", // 28px
    32: "8", // 32px
    36: "9", // 36px
    40: "10", // 40px
    44: "11", // 44px
    48: "12", // 48px
    56: "14", // 56px
    64: "16", // 64px
    80: "20", // 80px
    96: "24", // 96px
    112: "28", // 112px
    128: "32", // 128px
    144: "36", // 144px
    160: "40", // 160px
    176: "44", // 176px
    192: "48", // 192px
    208: "52", // 208px
    224: "56", // 224px
    240: "60", // 240px
    256: "64", // 256px
    288: "72", // 288px
    320: "80", // 320px
    384: "96", // 384px
};
export function pxToSize(px, prefix = "w") {
    const tailwindClass = findClosest(px, spacingMap);
    if (tailwindClass)
        return `${prefix}-${tailwindClass}`;
    return `${prefix}-[${px}px]`;
}
export function pxToFontSize(px) {
    const tailwindClass = findClosest(px, fontSizeMap);
    if (tailwindClass)
        return `text-${tailwindClass}`;
    return `text-[${px}px]`;
}
export function pxToLineHeight(px, fontSize = 16) {
    const ratio = Math.max(1, Math.min(px / fontSize, 2));
    const rounded = Math.round(ratio * 100) / 100;
    const tailwindClass = findClosest(rounded, lineHeightMap);
    if (tailwindClass)
        return `leading-${tailwindClass}`;
    return `leading-[${px}px]`;
}
export function pxToLetterSpacing(px, fontSize = 16) {
    if (px === 0)
        return "";
    const em = px / fontSize;
    const rounded = Math.round(em * 1000) / 1000;
    const tailwindClass = findClosest(rounded, letterSpacingMap);
    if (tailwindClass)
        return `tracking-${tailwindClass}`;
    return `tracking-[${px}px]`;
}
export function pxToSpacing(px, prefix = "gap") {
    if (px === 0)
        return "";
    const tailwindClass = findClosest(px, spacingMap);
    if (tailwindClass)
        return `${prefix}-${tailwindClass}`;
    return `${prefix}-[${px}px]`;
}
export function pxToPosition(px, prefix = "left") {
    if (px === 0)
        return "";
    return `${prefix}-[${px}px]`;
}
