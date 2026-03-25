export function applySolidColor(node, property, color, opacity = 1) {
    if (property === "stroke" && "strokes" in node) {
        const strokePaint = {
            type: "SOLID",
            color,
            opacity,
        };
        node.strokes = [strokePaint];
        return "stroke";
    }
    if ("fills" in node) {
        const fillPaint = {
            type: "SOLID",
            color,
            opacity,
        };
        node.fills = [fillPaint];
        return "fill";
    }
    return null;
}
