import { findClosest } from "../utils/findClosest";
// === Border radius mapping ===
const radiusMap = {
    0: "none", // 0px
    2: "sm", // 0.125rem
    4: "", // 0.25rem (default rounded)
    6: "md", // 0.375rem
    8: "lg", // 0.5rem
    12: "xl", // 0.75rem
    16: "2xl", // 1rem
    24: "3xl", // 1.5rem
};
// === Border width mapping ===
const borderWidthMap = {
    1: "1",
    2: "2",
    4: "4",
    8: "8",
};
// === Opacity mapping (0-100%) ===
const opacityMap = {
    5: "5",
    10: "10",
    20: "20",
    25: "25",
    30: "30",
    40: "40",
    50: "50",
    60: "60",
    70: "70",
    75: "75",
    80: "80",
    90: "90",
    95: "95",
};
// === Spacing scale (used by padding formatter) ===
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
export function paddingToTailwind(padding) {
    if (!padding)
        return [];
    const classes = [];
    if (typeof padding === "number") {
        if (padding > 0) {
            const tailwindClass = findClosest(padding, spacingMap);
            if (tailwindClass)
                classes.push(`p-${tailwindClass}`);
            else
                classes.push(`p-[${padding}px]`);
        }
    }
    else if (typeof padding === "object") {
        const top = padding.top || 0;
        const right = padding.right || 0;
        const bottom = padding.bottom || 0;
        const left = padding.left || 0;
        if (top === right && right === bottom && bottom === left && top > 0) {
            const tailwindClass = findClosest(top, spacingMap);
            if (tailwindClass)
                classes.push(`p-${tailwindClass}`);
            else
                classes.push(`p-[${top}px]`);
        }
        else {
            if (top > 0) {
                const paddingTopClass = findClosest(top, spacingMap);
                classes.push(paddingTopClass ? `pt-${paddingTopClass}` : `pt-[${top}px]`);
            }
            if (right > 0) {
                const paddingRightClass = findClosest(right, spacingMap);
                classes.push(paddingRightClass ? `pr-${paddingRightClass}` : `pr-[${right}px]`);
            }
            if (bottom > 0) {
                const paddingBottomClass = findClosest(bottom, spacingMap);
                classes.push(paddingBottomClass ? `pb-${paddingBottomClass}` : `pb-[${bottom}px]`);
            }
            if (left > 0) {
                const paddingLeftClass = findClosest(left, spacingMap);
                classes.push(paddingLeftClass ? `pl-${paddingLeftClass}` : `pl-[${left}px]`);
            }
        }
    }
    return classes;
}
export function radiusToTailwind(radius) {
    if (!radius)
        return "";
    if (typeof radius === "number") {
        const radiusClass = findClosest(radius, radiusMap);
        if (radiusClass === "none")
            return "rounded-none";
        if (radiusClass === "")
            return "rounded";
        if (radiusClass)
            return `rounded-${radiusClass}`;
        return `rounded-[${radius}px]`;
    }
    else if (typeof radius === "object") {
        const topLeft = radius.topLeft || 0;
        const topRight = radius.topRight || 0;
        const bottomRight = radius.bottomRight || 0;
        const bottomLeft = radius.bottomLeft || 0;
        if (topLeft === topRight &&
            topRight === bottomRight &&
            bottomRight === bottomLeft) {
            const radiusClass = findClosest(topLeft, radiusMap);
            if (radiusClass === "none")
                return "rounded-none";
            if (radiusClass === "")
                return "rounded";
            if (radiusClass)
                return `rounded-${radiusClass}`;
            return `rounded-[${topLeft}px]`;
        }
        else {
            const classes = [];
            const topLeftClass = findClosest(topLeft, radiusMap);
            const topRightClass = findClosest(topRight, radiusMap);
            const bottomRightClass = findClosest(bottomRight, radiusMap);
            const bottomLeftClass = findClosest(bottomLeft, radiusMap);
            if (topLeftClass === "none") {
                // skip
            }
            else if (topLeftClass === "") {
                classes.push("rounded-tl");
            }
            else if (topLeftClass) {
                classes.push(`rounded-tl-${topLeftClass}`);
            }
            else if (topLeft > 0) {
                classes.push(`rounded-tl-[${topLeft}px]`);
            }
            if (topRightClass === "none") {
                // skip
            }
            else if (topRightClass === "") {
                classes.push("rounded-tr");
            }
            else if (topRightClass) {
                classes.push(`rounded-tr-${topRightClass}`);
            }
            else if (topRight > 0) {
                classes.push(`rounded-tr-[${topRight}px]`);
            }
            if (bottomRightClass === "none") {
                // skip
            }
            else if (bottomRightClass === "") {
                classes.push("rounded-br");
            }
            else if (bottomRightClass) {
                classes.push(`rounded-br-${bottomRightClass}`);
            }
            else if (bottomRight > 0) {
                classes.push(`rounded-br-[${bottomRight}px]`);
            }
            if (bottomLeftClass === "none") {
                // skip
            }
            else if (bottomLeftClass === "") {
                classes.push("rounded-bl");
            }
            else if (bottomLeftClass) {
                classes.push(`rounded-bl-${bottomLeftClass}`);
            }
            else if (bottomLeft > 0) {
                classes.push(`rounded-bl-[${bottomLeft}px]`);
            }
            return classes.join(" ");
        }
    }
    return "";
}
export function borderWidthToTailwind(width) {
    if (width === 1)
        return "border";
    const borderWidthClass = findClosest(width, borderWidthMap);
    if (borderWidthClass)
        return `border-${borderWidthClass}`;
    return `border-[${width}px]`;
}
export function ringWidthToTailwind(width) {
    const borderWidthClass = findClosest(width, borderWidthMap);
    if (borderWidthClass)
        return `ring-${borderWidthClass}`;
    return `ring-[${width}px]`;
}
export function opacityToTailwind(opacity) {
    if (opacity >= 1)
        return "";
    const percent = Math.round(opacity * 100);
    const opacityClass = findClosest(percent, opacityMap);
    if (opacityClass)
        return `${opacityClass}`;
    return `${percent}`;
}
export function colorToTailwind(hexColor, tailwindColorMap, colorDistance, colorType = "text") {
    const colorNameMap = tailwindColorMap;
    // Normalize short hex codes (#000 -> #000000)
    let normalizedHex = hexColor.toLowerCase();
    if (normalizedHex.length === 4) {
        // Expand 3-digit hex: #RGB -> #RRGGBB
        normalizedHex =
            "#" +
                normalizedHex[1] +
                normalizedHex[1] +
                normalizedHex[2] +
                normalizedHex[2] +
                normalizedHex[3] +
                normalizedHex[3];
    }
    // Step 1: Try exact match first
    if (colorNameMap[normalizedHex]) {
        const colorName = colorNameMap[normalizedHex];
        if (colorType === "bg")
            return `bg-${colorName}`;
        if (colorType === "border")
            return `border-${colorName}`;
        return `text-${colorName}`;
    }
    // Step 2: Find closest matching color
    let minimumDistance = Infinity;
    let closestColorName = null;
    for (const [mapHexColor, colorName] of Object.entries(colorNameMap)) {
        const distance = colorDistance(normalizedHex, mapHexColor);
        if (distance < minimumDistance) {
            minimumDistance = distance;
            closestColorName = colorName;
        }
    }
    // Step 3: Use closest match if found
    if (closestColorName) {
        if (colorType === "bg")
            return `bg-${closestColorName}`;
        if (colorType === "border")
            return `border-${closestColorName}`;
        return `text-${closestColorName}`;
    }
    // Step 4: Fallback to arbitrary value (last resort)
    if (colorType === "bg")
        return `bg-[${hexColor}]`;
    if (colorType === "border")
        return `border-[${hexColor}]`;
    return `text-[${hexColor}]`;
}
