import { pxToPosition, pxToSize } from "../converters/tailwindConverters";
import { borderWidthToTailwind, opacityToTailwind, radiusToTailwind, ringWidthToTailwind, } from "../formatters/tailwindFormatters";
import { getFillColor, getStroke } from "../utils/cssHelpers";
import { nameToClass } from "../utils/nameToClass";
import { nodeSize } from "../utils/nodeProperties";
export function addNodeNameClass(node, classList) {
    if (node.name) {
        classList.push(nameToClass(node.name, `node-${node.id}`));
    }
}
export function addNodeSizeClasses(node, classList) {
    const size = nodeSize(node);
    if (size.width === "fill")
        classList.push("w-full");
    else if (size.width === null)
        classList.push("w-auto");
    else
        classList.push(pxToSize(size.width, "w"));
    if (size.height === "fill")
        classList.push("h-full");
    else if (size.height === null)
        classList.push("h-auto");
    else
        classList.push(pxToSize(size.height, "h"));
}
export function addNodePositionClasses(node, parent, classList, includeRelativeFallback) {
    const isParentFlex = parent &&
        "layoutMode" in parent &&
        parent.layoutMode !== "NONE";
    if ("x" in node && "y" in node && !isParentFlex) {
        classList.push("absolute");
        classList.push(pxToPosition(node.x, "left"));
        classList.push(pxToPosition(node.y, "top"));
        return;
    }
    if (includeRelativeFallback) {
        classList.push("relative");
    }
}
export function addNodeBackgroundClass(node, classList, colorToTailwind) {
    const fill = getFillColor(node);
    if (fill)
        classList.push(colorToTailwind(fill, "bg"));
}
export function addNodeRadiusClass(node, classList) {
    if ("cornerRadius" in node) {
        const radiusClass = radiusToTailwind(node.cornerRadius);
        if (radiusClass)
            classList.push(radiusClass);
    }
}
export function addNodeStrokeClasses(node, classList, colorToTailwind) {
    const stroke = getStroke(node);
    if (!stroke)
        return;
    if (stroke.position === "OUTSIDE") {
        classList.push(ringWidthToTailwind(stroke.width));
        const ringColor = colorToTailwind(stroke.color, "border").replace(/^border-/, "ring-");
        classList.push(ringColor);
        if (stroke.opacity < 1) {
            const opacityClass = opacityToTailwind(stroke.opacity);
            if (opacityClass)
                classList.push(`ring-opacity-${opacityClass}`);
        }
        return;
    }
    classList.push(borderWidthToTailwind(stroke.width));
    classList.push(colorToTailwind(stroke.color, "border"));
    if (stroke.opacity < 1) {
        const opacityClass = opacityToTailwind(stroke.opacity);
        if (opacityClass)
            classList.push(`border-opacity-${opacityClass}`);
    }
    if (stroke.position === "INSIDE") {
        classList.push("stroke-inside");
    }
}
