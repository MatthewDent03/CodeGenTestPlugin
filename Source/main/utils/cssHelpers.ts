export function indent(level: number): string {
  return "  ".repeat(level);
}

// === FILL HELPERS ===
// solid fill as #rrggbb or null if none
export function getFillColor(node: SceneNode): string | null {
  if ("fills" in node && Array.isArray(node.fills) && node.fills.length > 0) {
    const paint = node.fills[0];
    if (paint.type === "SOLID") {
      const red = Math.round(paint.color.r * 255);
      const green = Math.round(paint.color.g * 255);
      const blue = Math.round(paint.color.b * 255);
      return `#${red.toString(16).padStart(2, "0")}${green
        .toString(16)
        .padStart(2, "0")}${blue.toString(16).padStart(2, "0")}`;
    }
  }
  return null;
}

// === STROKE HELPERS ===
// solid stroke as { color, width, opacity } or null
export function getStroke(
  node: SceneNode,
): { color: string; width: number; opacity: number; position?: string } | null {
  if (
    "strokes" in node &&
    Array.isArray((node as any).strokes) &&
    (node as any).strokes.length > 0
  ) {
    const paint = (node as any).strokes[0];
    if (paint && paint.type === "SOLID") {
      const red = Math.round(paint.color.r * 255);
      const green = Math.round(paint.color.g * 255);
      const blue = Math.round(paint.color.b * 255);
      const position = (node as any).strokeAlign || "CENTER";
      return {
        color: `#${red.toString(16).padStart(2, "0")}${green
          .toString(16)
          .padStart(2, "0")}${blue.toString(16).padStart(2, "0")}`,
        width: (node as any).strokeWeight || 1,
        opacity: paint.opacity !== undefined ? paint.opacity : 1,
        position,
      };
    }
  }
  return null;
}

// === PADDING HELPER ===
// Handle both uniform and mixed padding values
export function getPaddingCSS(node: SceneNode): string {
  const hasSidePadding =
    "paddingTop" in node &&
    "paddingRight" in node &&
    "paddingBottom" in node &&
    "paddingLeft" in node;

  if (hasSidePadding) {
    const top = Number((node as any).paddingTop) || 0;
    const right = Number((node as any).paddingRight) || 0;
    const bottom = Number((node as any).paddingBottom) || 0;
    const left = Number((node as any).paddingLeft) || 0;

    if (top === 0 && right === 0 && bottom === 0 && left === 0) return "";

    // all equal - single value
    if (top === right && right === bottom && bottom === left) {
      return ` padding:${top}px;`;
    }

    // individual sides
    return ` padding:${top}px ${right}px ${bottom}px ${left}px;`;
  }

  // Backward compatibility for custom node mocks with a `padding` field
  if ("padding" in node) {
    const padding = (node as any).padding;
    if (!padding) return "";

    if (typeof padding === "object" && padding !== null) {
      const top = padding.top || 0;
      const right = padding.right || 0;
      const bottom = padding.bottom || 0;
      const left = padding.left || 0;

      if (top === right && right === bottom && bottom === left) {
        return ` padding:${top}px;`;
      }

      return ` padding:${top}px ${right}px ${bottom}px ${left}px;`;
    }

    if (typeof padding === "number") {
      return ` padding:${padding}px;`;
    }
  }

  return "";
}

// === CORNER RADIUS HELPER ===
// Handle both uniform and mixed corner radius values
export function getBorderRadiusCSS(node: SceneNode): string {
  if (!("cornerRadius" in node)) return "";

  const cornerRadius = (node as any).cornerRadius;
  if (cornerRadius === undefined || cornerRadius === null) return "";

  // Check cornerRadius object
  if (typeof cornerRadius === "object" && cornerRadius !== null) {
    const topLeft = cornerRadius.topLeft || 0;
    const topRight = cornerRadius.topRight || 0;
    const bottomRight = cornerRadius.bottomRight || 0;
    const bottomLeft = cornerRadius.bottomLeft || 0;

    if (
      topLeft === topRight &&
      topRight === bottomRight &&
      bottomRight === bottomLeft
    ) {
      return ` border-radius:${topLeft}px;`;
    }

    // individual corners
    return ` border-radius:${topLeft}px ${topRight}px ${bottomRight}px ${bottomLeft}px;`;
  }

  // If number - border radius
  if (typeof cornerRadius === "number" && !Number.isNaN(cornerRadius)) {
    return ` border-radius:${cornerRadius}px;`;
  }

  return "";
}

// === AUTO-LAYOUT CSS HELPER ===
// Generate flex and gap CSS for auto-layout frames
export function getFlexGapCSS(node: SceneNode): string {
  if (!("layoutMode" in node)) return "";

  const layoutMode = (node as any).layoutMode;
  const itemSpacing = (node as any).itemSpacing || 0;

  let css = "";

  if (layoutMode === "HORIZONTAL") {
    css += " display:flex; flex-direction:row;";
    if (itemSpacing > 0) {
      css += ` gap:${itemSpacing}px;`;
    }
  } else if (layoutMode === "VERTICAL") {
    css += " display:flex; flex-direction:column;";
    if (itemSpacing > 0) {
      css += ` gap:${itemSpacing}px;`;
    }
  }

  return css;
}

// === OPACITY HELPER ===
// Extract opacity from node
export function getOpacityCSS(node: SceneNode): string {
  if (!("opacity" in node)) return "";
  const opacity = (node as any).opacity;
  if (opacity !== undefined && opacity !== null && opacity < 1) {
    return ` opacity:${opacity};`;
  }
  return "";
}

// === SHADOW HELPER ===
// Extract box shadows and drop shadows
export function getShadowCSS(node: SceneNode): string {
  if (!("effects" in node)) return "";

  const effects = (node as any).effects;
  if (!Array.isArray(effects) || effects.length === 0) return "";

  const shadows: string[] = [];

  for (const effect of effects) {
    if (effect.type === "DROP_SHADOW" || effect.type === "INNER_SHADOW") {
      const offsetX = effect.offset?.x || 0;
      const offsetY = effect.offset?.y || 0;
      const radius = effect.radius || 0;
      const spread = effect.spread || 0;
      const color = effect.color
        ? `rgba(${Math.round(effect.color.r * 255)}, ${Math.round(
            effect.color.g * 255,
          )}, ${Math.round(effect.color.b * 255)}, ${effect.color.a || 1})`
        : "rgba(0,0,0,0.5)";
      const inset = effect.type === "INNER_SHADOW" ? "inset " : "";

      shadows.push(
        `${inset}${offsetX}px ${offsetY}px ${radius}px ${spread}px ${color}`,
      );
    }
  }

  if (shadows.length > 0) {
    return ` box-shadow:${shadows.join(", ")};`;
  }
  return "";
}
