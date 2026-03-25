// Determine node sizing (HUG / FILL / fixed)
export function nodeSize(node: any): {
  width: number | "fill" | null;
  height: number | "fill" | null;
} {
  if ("layoutSizingHorizontal" in node && "layoutSizingVertical" in node) {
    const width =
      node.layoutSizingHorizontal === "FILL"
        ? "fill"
        : node.layoutSizingHorizontal === "HUG"
          ? null
          : node.width;

    const height =
      node.layoutSizingVertical === "FILL"
        ? "fill"
        : node.layoutSizingVertical === "HUG"
          ? null
          : node.height;

    return { width, height };
  }

  return { width: node.width, height: node.height };
}

export function getTag(node: SceneNode): string {
  return node.type === "TEXT" ? "p" : "div";
}

// === PROPERTY EXTRACTOR FOR UI ===
/* eslint-disable @typescript-eslint/no-explicit-any */
export function getCommonRadius(node: SceneNode) {
  // rectangleCornerRadii
  if ("rectangleCornerRadii" in node) {
    const [topLeft, topRight, bottomRight, bottomLeft] = (node as any)
      .rectangleCornerRadii as any;
    if (
      topLeft === topRight &&
      topLeft === bottomRight &&
      topLeft === bottomLeft
    ) {
      return { all: topLeft };
    }

    return { topLeft, topRight, bottomRight, bottomLeft };
  }

  //  cornerRadius
  if (
    "cornerRadius" in node &&
    (node as any).cornerRadius !== figma.mixed &&
    (node as any).cornerRadius !== undefined &&
    (node as any).cornerRadius !== null
  ) {
    return { all: (node as any).cornerRadius };
  }

  // per-corner
  if ("topLeftRadius" in node) {
    if (
      (node as any).topLeftRadius === (node as any).topRightRadius &&
      (node as any).topLeftRadius === (node as any).bottomRightRadius &&
      (node as any).topLeftRadius === (node as any).bottomLeftRadius
    ) {
      return { all: (node as any).topLeftRadius };
    }

    return {
      topLeft: (node as any).topLeftRadius,
      topRight: (node as any).topRightRadius,
      bottomRight: (node as any).bottomRightRadius,
      bottomLeft: (node as any).bottomLeftRadius,
    };
  }

  return { all: 0 };
}

export function extractNodeProperties(node: SceneNode) {
  const out: any = {
    id: node.id,
    name: node.name,
    type: node.type,
  };

  // geometry / transform properties
  if ("width" in node) out.width = (node as any).width;
  if ("height" in node) out.height = (node as any).height;
  if ("x" in node) out.x = (node as any).x;
  if ("y" in node) out.y = (node as any).y;
  if ("rotation" in node) out.rotation = (node as any).rotation;
  // corner radius - numeric fields
  out.cornerRadius = getCommonRadius(node);
  if ("padding" in node) out.padding = (node as any).padding;
  if ("gap" in node) out.gap = (node as any).gap;
  if ("itemSpacing" in node) out.itemSpacing = (node as any).itemSpacing;
  if ("layoutMode" in node) out.layoutMode = (node as any).layoutMode;
  if ("layoutGrow" in node) out.layoutGrow = (node as any).layoutGrow;
  if ("layoutAlign" in node) out.layoutAlign = (node as any).layoutAlign;

  // text properties
  if (node.type === "TEXT") {
    const textNode = node as TextNode;
    if (textNode.fontName !== figma.mixed) {
      out.fontFamily = (textNode.fontName as FontName).family;
      out.fontSize = textNode.fontSize;
      out.fontWeight = (textNode.fontName as FontName).style;
      out.lineHeight = textNode.lineHeight;
    }
    out.textContent = textNode.characters;
    out.textAlign = textNode.textAlignHorizontal;
  }

  // fill properties
  if ("fills" in node && Array.isArray((node as any).fills)) {
    const fills = (node as any).fills;
    if (fills.length > 0 && fills[0].type === "SOLID") {
      const c = fills[0].color;
      out.fill = `rgba(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)},${fills[0].opacity || 1})`;
    }
  }

  // stroke properties
  if ("strokes" in node && Array.isArray((node as any).strokes)) {
    const strokes = (node as any).strokes;
    if (strokes.length > 0 && strokes[0].type === "SOLID") {
      const c = strokes[0].color;
      out.stroke = `rgba(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)},${strokes[0].opacity || 1})`;
      out.strokeWidth = (node as any).strokeWeight;
    }
  }

  // opacity
  if ("opacity" in node) out.opacity = (node as any).opacity;

  return out;
}
