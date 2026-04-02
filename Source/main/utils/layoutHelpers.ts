import { findClosest } from "./findClosest";

// === Spacing scale ===
const spacingMap: Record<number, string> = {
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

/**
 * Map Figma alignment to Tailwind justify
 */
export function getAlignmentClasses(node: SceneNode): string[] {
  const classes: string[] = [];

  if (!("layoutMode" in node)) return classes;

  const layoutMode = (node as any).layoutMode;
  if (layoutMode === "NONE") return classes;

  // Primary axis alignment
  const primaryAlign = (node as any).primaryAxisAlignItems;
  if (primaryAlign === "CENTER") classes.push("justify-center");
  else if (primaryAlign === "SPACE_BETWEEN") classes.push("justify-between");
  else if (primaryAlign === "MAX") classes.push("justify-end");
  else if (primaryAlign === "MIN") classes.push("justify-start");

  // Counter axis alignment
  const counterAlign = (node as any).counterAxisAlignItems;
  if (counterAlign === "CENTER") classes.push("items-center");
  else if (counterAlign === "MAX") classes.push("items-end");
  else if (counterAlign === "MIN") classes.push("items-start");
  else if (counterAlign === "BASELINE") classes.push("items-baseline");

  return classes;
}

/**
 * Get wrapping classes for auto-layout
 */
export function getWrappingClasses(node: SceneNode): string[] {
  const classes: string[] = [];

  if (!("layoutMode" in node)) return classes;

  const layoutWrap = (node as any).layoutWrap;
  if (layoutWrap === "WRAP") {
    classes.push("flex-wrap");
  } else if (layoutWrap === "NO_WRAP") {
    classes.push("flex-nowrap");
  }

  return classes;
}

export function layoutModeToTailwind(
  layoutMode: string,
  itemSpacing: number,
): string[] {
  const classes: string[] = ["flex"];
  if (layoutMode === "HORIZONTAL") {
    classes.push("flex-row");
  } else if (layoutMode === "VERTICAL") {
    classes.push("flex-col");
  }
  if (itemSpacing > 0) {
    const gapCls = findClosest(itemSpacing, spacingMap, 2);
    if (gapCls) classes.push(`gap-${gapCls}`);
    else classes.push(`gap-[${itemSpacing}px]`);
  }
  return classes;
}

// === AUTO-LAYOUT TAILWIND HELPER ===
// Generate flex and gap classes for auto-layout frames
export function getAutoLayoutTailwind(node: SceneNode): string[] {
  const classes: string[] = [];

  if (!("layoutMode" in node)) return classes;

  const layoutMode = (node as any).layoutMode;
  const itemSpacing = (node as any).itemSpacing || 0;

  // Check frame auto-layout enabled
  if (layoutMode === "HORIZONTAL") {
    classes.push("flex", "flex-row");
    if (itemSpacing > 0) {
      classes.push(`gap-[${itemSpacing}px]`);
    }
  } else if (layoutMode === "VERTICAL") {
    classes.push("flex", "flex-col");
    if (itemSpacing > 0) {
      classes.push(`gap-[${itemSpacing}px]`);
    }
  }

  return classes;
}

// === FONT WEIGHT & STYLE HELPER ===
// Extract font weight and style from fontName
export function getFontWeightAndStyle(node: SceneNode): {
  weight: string;
  style: string;
} {
  const result = { weight: "", style: "" };

  if (node.type !== "TEXT") return result;

  const textNode = node as TextNode;
  if (textNode.fontName === figma.mixed) return result;

  const font = textNode.fontName as FontName;
  const style = font.style ? font.style.toLowerCase() : "";

  // Extract weight
  if (style.includes("bold")) result.weight = "bold";
  else if (style.includes("600")) result.weight = "600";
  else if (style.includes("500")) result.weight = "500";
  else if (style.includes("semibold")) result.weight = "600";
  else result.weight = "normal";

  // Extract italic
  if (style.includes("italic")) result.style = "italic";

  return result;
}
