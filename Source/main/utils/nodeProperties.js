// Determine node sizing (HUG / FILL / fixed)
export function nodeSize(node) {
    if ("layoutSizingHorizontal" in node && "layoutSizingVertical" in node) {
        const width = node.layoutSizingHorizontal === "FILL"
            ? "fill"
            : node.layoutSizingHorizontal === "HUG"
                ? null
                : node.width;
        const height = node.layoutSizingVertical === "FILL"
            ? "fill"
            : node.layoutSizingVertical === "HUG"
                ? null
                : node.height;
        return { width, height };
    }
    return { width: node.width, height: node.height };
}
export function getTag(node) {
    return node.type === "TEXT" ? "p" : "div";
}
// === PROPERTY EXTRACTOR FOR UI ===
/* eslint-disable @typescript-eslint/no-explicit-any */
export function getCommonRadius(node) {
    // rectangleCornerRadii
    if ("rectangleCornerRadii" in node) {
        const [topLeft, topRight, bottomRight, bottomLeft] = node
            .rectangleCornerRadii;
        if (topLeft === topRight &&
            topLeft === bottomRight &&
            topLeft === bottomLeft) {
            return { all: topLeft };
        }
        return { topLeft, topRight, bottomRight, bottomLeft };
    }
    //  cornerRadius
    if ("cornerRadius" in node &&
        node.cornerRadius !== figma.mixed &&
        node.cornerRadius !== undefined &&
        node.cornerRadius !== null) {
        return { all: node.cornerRadius };
    }
    // per-corner
    if ("topLeftRadius" in node) {
        if (node.topLeftRadius === node.topRightRadius &&
            node.topLeftRadius === node.bottomRightRadius &&
            node.topLeftRadius === node.bottomLeftRadius) {
            return { all: node.topLeftRadius };
        }
        return {
            topLeft: node.topLeftRadius,
            topRight: node.topRightRadius,
            bottomRight: node.bottomRightRadius,
            bottomLeft: node.bottomLeftRadius,
        };
    }
    return { all: 0 };
}
export function extractNodeProperties(node) {
    const out = {
        id: node.id,
        name: node.name,
        type: node.type,
    };
    // geometry / transform properties
    if ("width" in node)
        out.width = node.width;
    if ("height" in node)
        out.height = node.height;
    if ("x" in node)
        out.x = node.x;
    if ("y" in node)
        out.y = node.y;
    if ("rotation" in node)
        out.rotation = node.rotation;
    // corner radius - numeric fields
    out.cornerRadius = getCommonRadius(node);
    if ("padding" in node)
        out.padding = node.padding;
    if ("gap" in node)
        out.gap = node.gap;
    if ("itemSpacing" in node)
        out.itemSpacing = node.itemSpacing;
    if ("layoutMode" in node)
        out.layoutMode = node.layoutMode;
    if ("layoutGrow" in node)
        out.layoutGrow = node.layoutGrow;
    if ("layoutAlign" in node)
        out.layoutAlign = node.layoutAlign;
    // text properties
    if (node.type === "TEXT") {
        const textNode = node;
        if (textNode.fontName !== figma.mixed) {
            out.fontFamily = textNode.fontName.family;
            out.fontSize = textNode.fontSize;
            out.fontWeight = textNode.fontName.style;
            out.lineHeight = textNode.lineHeight;
        }
        out.textContent = textNode.characters;
        out.textAlign = textNode.textAlignHorizontal;
    }
    // fill properties
    if ("fills" in node && Array.isArray(node.fills)) {
        const fills = node.fills;
        if (fills.length > 0 && fills[0].type === "SOLID") {
            const c = fills[0].color;
            out.fill = `rgba(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)},${fills[0].opacity || 1})`;
        }
    }
    // stroke properties
    if ("strokes" in node && Array.isArray(node.strokes)) {
        const strokes = node.strokes;
        if (strokes.length > 0 && strokes[0].type === "SOLID") {
            const c = strokes[0].color;
            out.stroke = `rgba(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)},${strokes[0].opacity || 1})`;
            out.strokeWidth = node.strokeWeight;
        }
    }
    // opacity
    if ("opacity" in node)
        out.opacity = node.opacity;
    return out;
}
