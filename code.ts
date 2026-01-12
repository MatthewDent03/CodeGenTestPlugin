/**
 * Tailwind Conversion Tables
 * Maps Figma pixel values to standard Tailwind classes (INLINED)
 * All values match default Tailwind v3 design scale
 */

// Font size mapping (default Tailwind scale)
const fontSizeMap: Record<number, string> = {
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

// Line height mapping (unitless, relative to font size)
const lineHeightMap: Record<number, string> = {
  1: "none",
  1.25: "tight",
  1.375: "snug",
  1.5: "normal",
  1.625: "relaxed",
  2: "loose",
};

// Letter spacing mapping (em-based, converted from px / fontSize)
const letterSpacingMap: Record<number, string> = {
  "-0.05": "tighter",
  "-0.025": "tight",
  "0": "normal",
  "0.025": "wide",
  "0.05": "wider",
  "0.1": "widest",
};

// Spacing scale (padding, gap, width, height, inset - default Tailwind)
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

// Border radius mapping (default Tailwind scale)
const radiusMap: Record<number, string> = {
  0: "none", // 0px
  2: "sm", // 0.125rem
  4: "", // 0.25rem (default rounded)
  6: "md", // 0.375rem
  8: "lg", // 0.5rem
  12: "xl", // 0.75rem
  16: "2xl", // 1rem
  24: "3xl", // 1.5rem
};

// Border width mapping
const borderWidthMap: Record<number, string> = {
  1: "1",
  2: "2",
  4: "4",
  8: "8",
};

// Opacity mapping (0-100%)
const opacityMap: Record<number, string> = {
  0: "0",
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
  100: "100",
};

// Font weight mapping
const fontWeightMap: Record<number, string> = {
  100: "thin",
  200: "extralight",
  300: "light",
  400: "normal",
  500: "medium",
  600: "semibold",
  700: "bold",
  800: "extrabold",
  900: "black",
};

// Blur mapping (default Tailwind scale)
const blurMap: Record<number, string> = {
  4: "sm", // 4px
  8: "", // 8px (default blur)
  12: "md", // 12px
  16: "lg", // 16px
  24: "xl", // 24px
  40: "2xl", // 40px
  64: "3xl", // 64px
};

/**
 * Find closest Tailwind value from a map with tolerance
 * Snaps to nearest value within tolerance (default ±2px)
 * Returns closest match otherwise
 */
function findClosest(
  value: number,
  map: Record<number, string>,
  tolerance: number = 2
): string | null {
  const keys = Object.keys(map)
    .map(Number)
    .sort((a, b) => a - b);
  if (keys.length === 0) return null;

  // 1. Exact match
  if (map[value]) return map[value];

  // 2. Within tolerance
  for (const key of keys) {
    if (Math.abs(key - value) <= tolerance) {
      return map[key];
    }
  }

  // 3. Closest match
  let closest = keys[0];
  for (const key of keys) {
    if (Math.abs(key - value) < Math.abs(closest - value)) {
      closest = key;
    }
  }
  return map[closest] || null;
}

function pxToSize(px: number, prefix: string = "w"): string {
  const tailwindClass = findClosest(px, spacingMap);
  if (tailwindClass) return `${prefix}-${tailwindClass}`;
  return `${prefix}-[${px}px]`;
}

function pxToFontSize(px: number): string {
  const tailwindClass = findClosest(px, fontSizeMap);
  if (tailwindClass) return `text-${tailwindClass}`;
  return `text-[${px}px]`;
}

function pxToLineHeight(px: number, fontSize: number = 16): string {
  const ratio = Math.max(1, Math.min(px / fontSize, 2));
  const rounded = Math.round(ratio * 100) / 100;
  const tailwindClass = findClosest(rounded, lineHeightMap);
  if (tailwindClass) return `leading-${tailwindClass}`;
  return `leading-[${px}px]`;
}

function pxToLetterSpacing(px: number, fontSize: number = 16): string {
  if (px === 0) return "";
  const em = px / fontSize;
  const rounded = Math.round(em * 1000) / 1000;
  const tailwindClass = findClosest(rounded, letterSpacingMap);
  if (tailwindClass) return `tracking-${tailwindClass}`;
  return `tracking-[${px}px]`;
}

function pxToSpacing(px: number, prefix: string = "gap"): string {
  if (px === 0) return "";
  const tailwindClass = findClosest(px, spacingMap);
  if (tailwindClass) return `${prefix}-${tailwindClass}`;
  return `${prefix}-[${px}px]`;
}

function paddingToTailwind(padding: any): string[] {
  if (!padding) return [];
  const classes: string[] = [];
  if (typeof padding === "number") {
    if (padding > 0) {
      const cls = findClosest(padding, spacingMap);
      if (cls) classes.push(`p-${cls}`);
      else classes.push(`p-[${padding}px]`);
    }
  } else if (typeof padding === "object") {
    const top = padding.top || 0;
    const right = padding.right || 0;
    const bottom = padding.bottom || 0;
    const left = padding.left || 0;
    if (top === right && right === bottom && bottom === left && top > 0) {
      const cls = findClosest(top, spacingMap);
      if (cls) classes.push(`p-${cls}`);
      else classes.push(`p-[${top}px]`);
    } else {
      if (top > 0) {
        const cls = findClosest(top, spacingMap);
        classes.push(cls ? `pt-${cls}` : `pt-[${top}px]`);
      }
      if (right > 0) {
        const cls = findClosest(right, spacingMap);
        classes.push(cls ? `pr-${cls}` : `pr-[${right}px]`);
      }
      if (bottom > 0) {
        const cls = findClosest(bottom, spacingMap);
        classes.push(cls ? `pb-${cls}` : `pb-[${bottom}px]`);
      }
      if (left > 0) {
        const cls = findClosest(left, spacingMap);
        classes.push(cls ? `pl-${cls}` : `pl-[${left}px]`);
      }
    }
  }
  return classes;
}

function radiusToTailwind(radius: any): string {
  if (!radius) return "";
  if (typeof radius === "number") {
    const cls = findClosest(radius, radiusMap);
    if (cls === "none") return "rounded-none";
    if (cls === "") return "rounded";
    if (cls) return `rounded-${cls}`;
    return `rounded-[${radius}px]`;
  } else if (typeof radius === "object") {
    const tl = radius.topLeft || 0;
    const tr = radius.topRight || 0;
    const br = radius.bottomRight || 0;
    const bl = radius.bottomLeft || 0;
    if (tl === tr && tr === br && br === bl) {
      const cls = findClosest(tl, radiusMap);
      if (cls === "none") return "rounded-none";
      if (cls === "") return "rounded";
      if (cls) return `rounded-${cls}`;
      return `rounded-[${tl}px]`;
    } else {
      const classes: string[] = [];
      const tlCls = findClosest(tl, radiusMap);
      const trCls = findClosest(tr, radiusMap);
      const brCls = findClosest(br, radiusMap);
      const blCls = findClosest(bl, radiusMap);
      if (tlCls === "none") {
        // skip
      } else if (tlCls === "") {
        classes.push("rounded-tl");
      } else if (tlCls) {
        classes.push(`rounded-tl-${tlCls}`);
      } else if (tl > 0) {
        classes.push(`rounded-tl-[${tl}px]`);
      }
      if (trCls === "none") {
        // skip
      } else if (trCls === "") {
        classes.push("rounded-tr");
      } else if (trCls) {
        classes.push(`rounded-tr-${trCls}`);
      } else if (tr > 0) {
        classes.push(`rounded-tr-[${tr}px]`);
      }
      if (brCls === "none") {
        // skip
      } else if (brCls === "") {
        classes.push("rounded-br");
      } else if (brCls) {
        classes.push(`rounded-br-${brCls}`);
      } else if (br > 0) {
        classes.push(`rounded-br-[${br}px]`);
      }
      if (blCls === "none") {
        // skip
      } else if (blCls === "") {
        classes.push("rounded-bl");
      } else if (blCls) {
        classes.push(`rounded-bl-${blCls}`);
      } else if (bl > 0) {
        classes.push(`rounded-bl-[${bl}px]`);
      }
      return classes.join(" ");
    }
  }
  return "";
}

function borderWidthToTailwind(width: number): string {
  if (width === 1) return "border";
  const cls = findClosest(width, borderWidthMap);
  if (cls) return `border-${cls}`;
  return `border-[${width}px]`;
}

function opacityToTailwind(opacity: number): string {
  if (opacity >= 1) return "";
  const percent = Math.round(opacity * 100);
  const cls = findClosest(percent, opacityMap);
  if (cls) return `opacity-${cls}`;
  return "";
}

/**
 * Convert hex to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Calculate color distance (RGB Euclidean squared - matching nearest-color library)
 */
function colorDistance(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);

  if (!rgb1 || !rgb2) return Infinity;

  // Use squared distance (no sqrt) for performance, matches nearest-color library
  return (
    Math.pow(rgb1.r - rgb2.r, 2) +
    Math.pow(rgb1.g - rgb2.g, 2) +
    Math.pow(rgb1.b - rgb2.b, 2)
  );
}

function colorToTailwind(
  hex: string,
  type: "bg" | "text" | "border" = "text"
): string {
  const colorMap: Record<string, string> = {
    // Grayscale
    "#000000": "black",
    "#ffffff": "white",
    "#f9fafb": "gray-50",
    "#f3f4f6": "gray-100",
    "#e5e7eb": "gray-200",
    "#d1d5db": "gray-300",
    "#9ca3af": "gray-400",
    "#6b7280": "gray-500",
    "#4b5563": "gray-600",
    "#374151": "gray-700",
    "#1f2937": "gray-800",
    "#111827": "gray-900",
    // Slate
    "#f8fafc": "slate-50",
    "#f1f5f9": "slate-100",
    "#e2e8f0": "slate-200",
    "#cbd5e1": "slate-300",
    "#94a3b8": "slate-400",
    "#64748b": "slate-500",
    "#475569": "slate-600",
    "#334155": "slate-700",
    "#1e293b": "slate-800",
    // Zinc
    "#fafafa": "zinc-50",
    "#f4f4f5": "zinc-100",
    "#e4e4e7": "zinc-200",
    "#d4d4d8": "zinc-300",
    "#a1a1aa": "zinc-400",
    "#71717a": "zinc-500",
    "#52525b": "zinc-600",
    "#3f3f46": "zinc-700",
    "#27272a": "zinc-800",
    "#18181b": "zinc-900",
    // Stone
    "#fafaf9": "stone-50",
    "#f5f5f4": "stone-100",
    "#e7e5e4": "stone-200",
    "#d6d3d1": "stone-300",
    "#a8a29e": "stone-400",
    "#78716c": "stone-500",
    "#57534e": "stone-600",
    "#44403c": "stone-700",
    "#292524": "stone-800",
    "#1c1917": "stone-900",
    // Red
    "#fef2f2": "red-50",
    "#fee2e2": "red-100",
    "#fecaca": "red-200",
    "#fca5a5": "red-300",
    "#f87171": "red-400",
    "#ef4444": "red-500",
    "#dc2626": "red-600",
    "#b91c1c": "red-700",
    "#7f1d1d": "red-900",
    // Blue
    "#eff6ff": "blue-50",
    "#dbeafe": "blue-100",
    "#bfdbfe": "blue-200",
    "#93c5fd": "blue-300",
    "#60a5fa": "blue-400",
    "#3b82f6": "blue-500",
    "#2563eb": "blue-600",
    "#1d4ed8": "blue-700",
    "#1e40af": "blue-800",
    // Green
    "#f0fdf4": "green-50",
    "#dcfce7": "green-100",
    "#bbf7d0": "green-200",
    "#86efac": "green-300",
    "#4ade80": "green-400",
    "#22c55e": "green-500",
    "#16a34a": "green-600",
    "#15803d": "green-700",
    // Purple
    "#faf5ff": "purple-50",
    "#f3e8ff": "purple-100",
    "#e9d5ff": "purple-200",
    "#d8b4fe": "purple-300",
    "#c084fc": "purple-400",
    "#a855f7": "purple-500",
    "#9333ea": "purple-600",
    "#7e22ce": "purple-700",
  };

  // Normalize short hex codes (#000 -> #000000)
  let normalized = hex.toLowerCase();
  if (normalized.length === 4) {
    normalized =
      "#" +
      normalized[1] +
      normalized[1] +
      normalized[2] +
      normalized[2] +
      normalized[3] +
      normalized[3];
  }

  // 1. Try exact match
  if (colorMap[normalized]) {
    const className = colorMap[normalized];
    if (type === "bg") return `bg-${className}`;
    if (type === "border") return `border-${className}`;
    return `text-${className}`;
  }

  // 2. Find closest color (no threshold - always return closest like nearest-color library)
  let minDistanceSq = Infinity;
  let closestColor: string | null = null;

  for (const [mapHex, className] of Object.entries(colorMap)) {
    const distanceSq = colorDistance(normalized, mapHex);
    if (distanceSq < minDistanceSq) {
      minDistanceSq = distanceSq;
      closestColor = className;
    }
  }

  if (closestColor) {
    if (type === "bg") return `bg-${closestColor}`;
    if (type === "border") return `border-${closestColor}`;
    return `text-${closestColor}`;
  }

  // 3. Fallback to arbitrary (only if colorMap is empty)
  if (type === "bg") return `bg-[${hex}]`;
  if (type === "border") return `border-[${hex}]`;
  return `text-[${hex}]`;
}

/**
 * Map Figma alignment to Tailwind justify-* and items-* classes
 */
function getAlignmentClasses(node: SceneNode): string[] {
  const classes: string[] = [];

  if (!("layoutMode" in node)) return classes;

  const layoutMode = (node as any).layoutMode;
  if (layoutMode === "NONE") return classes;

  // Primary axis alignment (justify-*)
  const primaryAlign = (node as any).primaryAxisAlignItems;
  if (primaryAlign === "CENTER") classes.push("justify-center");
  else if (primaryAlign === "SPACE_BETWEEN") classes.push("justify-between");
  else if (primaryAlign === "MAX") classes.push("justify-end");
  else if (primaryAlign === "MIN") classes.push("justify-start");

  // Counter axis alignment (items-*)
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
function getWrappingClasses(node: SceneNode): string[] {
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

function layoutModeToTailwind(
  layoutMode: string,
  itemSpacing: number
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

// ======================================================
// PLUGIN UI (FIGMA MODE)
// Open the panel and stream basic selection info to the iframe.
// ======================================================
if (figma.editorType === "figma") {
  figma.showUI(__uiFiles__.main, { width: 320, height: 400 });

  figma.on("selectionchange", () => {
    const node = figma.currentPage.selection[0];

    if (!node) {
      figma.ui.postMessage({ type: "no-selection" });
      return;
    }

    const props = extractNodeProperties(node);

    figma.ui.postMessage({
      type: "selection-update",
      data: props,
    });
  });
}

// ======================================================
// INDENT HELPER
// Two-space indentation for generated HTML
// ======================================================
function indent(level: number): string {
  return "  ".repeat(level);
}

// ======================================================
// FILL HELPERS
// solid fill as #rrggbb or null if none
// ======================================================
function getFillColor(node: SceneNode): string | null {
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

// ======================================================
// STROKE HELPERS
// solid stroke as { color, width, opacity } or null
// ======================================================
function getStroke(
  node: SceneNode
): { color: string; width: number; opacity: number } | null {
  if ("strokes" in node && node.strokes.length > 0) {
    const paint = node.strokes[0];
    if (paint.type === "SOLID") {
      const red = Math.round(paint.color.r * 255);
      const green = Math.round(paint.color.g * 255);
      const blue = Math.round(paint.color.b * 255);
      return {
        color: `#${red.toString(16).padStart(2, "0")}${green
          .toString(16)
          .padStart(2, "0")}${blue.toString(16).padStart(2, "0")}`,
        width: (node as any).strokeWeight || 1,
        opacity: paint.opacity !== undefined ? paint.opacity : 1,
      };
    }
  }
  return null;
}

// ======================================================
// PADDING HELPER
// Handle both uniform and mixed padding values
// ======================================================
function getPaddingCSS(node: SceneNode): string {
  if (!("padding" in node)) return "";

  const padding = (node as any).padding;
  if (!padding) return "";

  // Check if padding is an object with different sides
  if (typeof padding === "object" && padding !== null) {
    const top = padding.top || 0;
    const right = padding.right || 0;
    const bottom = padding.bottom || 0;
    const left = padding.left || 0;

    // If all equal, use single value
    if (top === right && right === bottom && bottom === left) {
      return ` padding:${top}px;`;
    }

    // Otherwise use individual sides
    return ` padding:${top}px ${right}px ${bottom}px ${left}px;`;
  }

  // If it's a number, use as uniform padding
  if (typeof padding === "number") {
    return ` padding:${padding}px;`;
  }

  return "";
}

// ======================================================
// CORNER RADIUS HELPER
// Handle both uniform and mixed corner radius values
// ======================================================
function getBorderRadiusCSS(node: SceneNode): string {
  if (!("cornerRadius" in node)) return "";

  const cornerRadius = (node as any).cornerRadius;
  if (cornerRadius === undefined || cornerRadius === null) return "";

  // Check if cornerRadius is an object with different corners
  if (typeof cornerRadius === "object" && cornerRadius !== null) {
    const topLeft = cornerRadius.topLeft || 0;
    const topRight = cornerRadius.topRight || 0;
    const bottomRight = cornerRadius.bottomRight || 0;
    const bottomLeft = cornerRadius.bottomLeft || 0;

    // If all equal, use single value
    if (
      topLeft === topRight &&
      topRight === bottomRight &&
      bottomRight === bottomLeft
    ) {
      return ` border-radius:${topLeft}px;`;
    }

    // Otherwise use individual corners
    return ` border-radius:${topLeft}px ${topRight}px ${bottomRight}px ${bottomLeft}px;`;
  }

  // If it's a number, use as uniform border radius
  if (typeof cornerRadius === "number" && !Number.isNaN(cornerRadius)) {
    return ` border-radius:${cornerRadius}px;`;
  }

  return "";
}

// ======================================================
// PADDING TAILWIND HELPER
// Generate Tailwind padding classes from padding values
// ======================================================
function getPaddingTailwind(node: SceneNode): string[] {
  const classes: string[] = [];

  if (!("padding" in node)) return classes;

  const padding = (node as any).padding;
  if (!padding) return classes;

  // Check if padding is an object with different sides
  if (typeof padding === "object" && padding !== null) {
    const top = padding.top || 0;
    const right = padding.right || 0;
    const bottom = padding.bottom || 0;
    const left = padding.left || 0;

    // If all equal, use single value
    if (top === right && right === bottom && bottom === left) {
      if (top > 0) classes.push(`p-[${top}px]`);
    } else {
      // Otherwise use individual sides
      if (top > 0) classes.push(`pt-[${top}px]`);
      if (right > 0) classes.push(`pr-[${right}px]`);
      if (bottom > 0) classes.push(`pb-[${bottom}px]`);
      if (left > 0) classes.push(`pl-[${left}px]`);
    }
  } else if (typeof padding === "number" && padding > 0) {
    classes.push(`p-[${padding}px]`);
  }

  return classes;
}

// ======================================================
// AUTO-LAYOUT TAILWIND HELPER
// Generate flex and gap classes for auto-layout frames
// ======================================================
function getAutoLayoutTailwind(node: SceneNode): string[] {
  const classes: string[] = [];

  if (!("layoutMode" in node)) return classes;

  const layoutMode = (node as any).layoutMode;
  const itemSpacing = (node as any).itemSpacing || 0;

  // Check if frame has auto-layout enabled
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

// ======================================================
// AUTO-LAYOUT CSS HELPER
// Generate flex and gap CSS for auto-layout frames
// ======================================================
function getFlexGapCSS(node: SceneNode): string {
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

// ======================================================
// FONT WEIGHT & STYLE HELPER
// Extract font weight and style from fontName
// ======================================================
function getFontWeightAndStyle(node: SceneNode): {
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

// ======================================================
// OPACITY HELPER
// Extract opacity from node
// ======================================================
function getOpacityCSS(node: SceneNode): string {
  if (!("opacity" in node)) return "";
  const opacity = (node as any).opacity;
  if (opacity !== undefined && opacity !== null && opacity < 1) {
    return ` opacity:${opacity};`;
  }
  return "";
}

// ======================================================
// SHADOW HELPER
// Extract box shadows and drop shadows
// ======================================================
function getShadowCSS(node: SceneNode): string {
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
            effect.color.g * 255
          )}, ${Math.round(effect.color.b * 255)}, ${effect.color.a || 1})`
        : "rgba(0,0,0,0.5)";
      const inset = effect.type === "INNER_SHADOW" ? "inset " : "";

      shadows.push(
        `${inset}${offsetX}px ${offsetY}px ${radius}px ${spread}px ${color}`
      );
    }
  }

  if (shadows.length > 0) {
    return ` box-shadow:${shadows.join(", ")};`;
  }
  return "";
}

// ======================================================
// INLINE CSS BUILDER
// Size, position, fill, stroke, rotation, radius as style text.
// ======================================================
function buildCSS(node: SceneNode, parent?: SceneNode): string {
  let cssText = `width:${node.width}px; height:${node.height}px;`;

  if ("x" in node && "y" in node) {
    cssText += ` position:absolute; left:${node.x}px; top:${node.y}px;`;
  }

  const fill = getFillColor(node);
  if (fill) cssText += ` background:${fill};`;

  const stroke = getStroke(node);
  if (stroke) cssText += ` border:${stroke.width}px solid ${stroke.color};`;

  if ("rotation" in node && node.rotation !== 0) {
    cssText += ` transform:rotate(${-node.rotation}deg); transform-origin:left top;`;
  }

  cssText += getBorderRadiusCSS(node);
  cssText += getPaddingCSS(node);
  cssText += getFlexGapCSS(node);

  return cssText;
}

// ======================================================
// TAG PICKER
// Text nodes become <p>, everything else becomes <div>.
// ======================================================
function getTag(node: SceneNode): string {
  return node.type === "TEXT" ? "p" : "div";
}

// ======================================================
// HTML CONVERTER
// Turn Figma nodes into plain HTML with inline styles.
// ======================================================
function convertNode(
  node: SceneNode,
  level: number = 0,
  parent?: SceneNode
): string {
  const htmlTag = getTag(node);

  if (node.type === "TEXT") {
    return convertTextNodeHTML(node as TextNode, htmlTag, level, parent);
  }

  if ("children" in node && node.children.length > 0) {
    return convertFrameHTML(node as FrameNode, htmlTag, level, parent);
  }

  return `${indent(level)}<${htmlTag} style="${buildCSS(
    node,
    parent
  )}"></${htmlTag}>\n`;
}

function convertTextNodeHTML(
  node: TextNode,
  htmlTag: string,
  level: number,
  parent?: SceneNode
): string {
  let cssText = `width:${node.width}px; height:${node.height}px;`;

  // Check if parent is flex layout - if so, don't add absolute positioning
  const isParentFlex =
    parent && "layoutMode" in parent && (parent as any).layoutMode !== "NONE";
  if (!isParentFlex) {
    cssText += ` position:absolute; left:${node.x}px; top:${node.y}px;`;
  }

  const fill = getFillColor(node);
  if (fill) cssText += ` color:${fill};`;

  if (typeof node.fontSize === "number")
    cssText += ` font-size:${node.fontSize}px;`;

  if (node.fontName !== figma.mixed) {
    const font = node.fontName as FontName;
    cssText += ` font-family:'${font.family}';`;
    const fontProps = getFontWeightAndStyle(node);
    if (fontProps.weight && fontProps.weight !== "normal")
      cssText += ` font-weight:${fontProps.weight};`;
    if (fontProps.style) cssText += ` font-style:${fontProps.style};`;
  }

  // Add line height if available
  if ("lineHeight" in node) {
    const lineHeight = (node as any).lineHeight;
    if (lineHeight && typeof lineHeight === "object" && "value" in lineHeight) {
      cssText += ` line-height:${lineHeight.value}${lineHeight.unit || "px"};`;
    }
  }

  // Add letter spacing if available
  if ("letterSpacing" in node) {
    const letterSpacing = (node as any).letterSpacing;
    if (
      letterSpacing &&
      typeof letterSpacing === "object" &&
      "value" in letterSpacing
    ) {
      cssText += ` letter-spacing:${letterSpacing.value}${
        letterSpacing.unit || "px"
      };`;
    }
  }

  cssText += getOpacityCSS(node);
  cssText += getShadowCSS(node);

  switch (node.textAlignHorizontal) {
    case "CENTER":
      cssText += " text-align:center;";
      break;
    case "RIGHT":
      cssText += " text-align:right;";
      break;
    default:
      cssText += " text-align:left;";
  }

  return `${indent(level)}<${htmlTag} style="${cssText}">${
    node.characters
  }</${htmlTag}>\n`;
}

function convertFrameHTML(
  node: FrameNode,
  htmlTag: string,
  level: number,
  parent?: SceneNode
): string {
  let cssText = `position:absolute; width:${node.width}px; height:${node.height}px; left:${node.x}px; top:${node.y}px;`;

  const fill = getFillColor(node);
  if (fill) cssText += ` background:${fill};`;

  const stroke = getStroke(node);
  if (stroke) cssText += ` border:${stroke.width}px solid ${stroke.color};`;

  cssText += getBorderRadiusCSS(node);
  cssText += getPaddingCSS(node);
  cssText += getFlexGapCSS(node);
  cssText += getOpacityCSS(node);
  cssText += getShadowCSS(node);

  let childrenHtml = "";
  for (const child of node.children) {
    childrenHtml += convertNode(child, level + 1, node);
  }

  return `${indent(
    level
  )}<${htmlTag} class="frame" style="${cssText}">\n${childrenHtml}${indent(
    level
  )}</${htmlTag}>\n`;
}

// ======================================================
// TAILWIND CONVERTER
// Turn Figma nodes into HTML that uses Tailwind utility classes.
// ======================================================
function convertNodeTailwind(
  node: SceneNode,
  level: number = 0,
  parent?: SceneNode
): string {
  const htmlTag = getTag(node);

  if (node.type === "TEXT") {
    return convertTextNodeTailwind(node as TextNode, htmlTag, level, parent);
  }

  if ("children" in node && node.children.length > 0) {
    return convertFrameTailwind(node as FrameNode, htmlTag, level, parent);
  }

  return convertShapeTailwind(node, htmlTag, level, parent);
}

function convertShapeTailwind(
  node: SceneNode,
  htmlTag: string,
  level: number,
  parent?: SceneNode
): string {
  const classList: string[] = [];

  // Width and height
  classList.push(pxToSize(node.width, "w"));
  classList.push(pxToSize(node.height, "h"));

  // Background color
  const fill = getFillColor(node);
  if (fill) classList.push(colorToTailwind(fill, "bg"));

  // Check if parent is a flex container - if so, don't add absolute positioning
  const isParentFlex =
    parent && "layoutMode" in parent && (parent as any).layoutMode !== "NONE";
  if ("x" in node && "y" in node && !isParentFlex) {
    classList.push("absolute");
    classList.push(pxToSpacing(node.x, "left"));
    classList.push(pxToSpacing(node.y, "top"));
  }

  // Border radius
  if ("cornerRadius" in node) {
    const radiusClass = radiusToTailwind((node as any).cornerRadius);
    if (radiusClass) classList.push(radiusClass);
  }

  // Stroke/Border
  const stroke = getStroke(node);
  if (stroke) {
    classList.push(borderWidthToTailwind(stroke.width));
    classList.push(colorToTailwind(stroke.color, "border"));
    if (stroke.opacity < 1) {
      const opacityClass = opacityToTailwind(stroke.opacity);
      if (opacityClass) classList.push(`border-${opacityClass}`);
    }
  }

  return `${indent(level)}<${htmlTag} class="${classList
    .filter(Boolean)
    .join(" ")}"></${htmlTag}>\n`;
}

function convertTextNodeTailwind(
  node: TextNode,
  htmlTag: string,
  level: number,
  parent?: SceneNode
) {
  const textClasses: string[] = [];

  // Color (text)
  const fill = getFillColor(node);
  if (fill) {
    textClasses.push(colorToTailwind(fill, "text"));
  }

  // Font size
  if (typeof node.fontSize === "number") {
    textClasses.push(pxToFontSize(node.fontSize));
  }

  // Font family and weight/style
  if (node.fontName !== figma.mixed) {
    const font = node.fontName as FontName;
    textClasses.push(`font-['${font.family}']`);
    const fontProps = getFontWeightAndStyle(node);
    if (fontProps.weight === "bold") textClasses.push("font-bold");
    else if (fontProps.weight === "600") textClasses.push("font-semibold");
    else if (fontProps.weight === "500") textClasses.push("font-medium");
    if (fontProps.style === "italic") textClasses.push("italic");
  }

  // Line height
  if ("lineHeight" in node) {
    const lineHeight = (node as any).lineHeight;
    if (lineHeight && typeof lineHeight === "object" && "value" in lineHeight) {
      const fontSize = typeof node.fontSize === "number" ? node.fontSize : 16;
      const lh = pxToLineHeight(lineHeight.value, fontSize);
      if (lh) textClasses.push(lh);
    }
  }

  // Letter spacing
  if ("letterSpacing" in node) {
    const letterSpacing = (node as any).letterSpacing;
    if (
      letterSpacing &&
      typeof letterSpacing === "object" &&
      "value" in letterSpacing &&
      letterSpacing.value !== 0
    ) {
      const fontSize = typeof node.fontSize === "number" ? node.fontSize : 16;
      const ls = pxToLetterSpacing(letterSpacing.value, fontSize);
      if (ls) textClasses.push(ls);
    }
  }

  // Opacity
  if ("opacity" in node) {
    const opacity = (node as any).opacity;
    if (opacity !== undefined && opacity < 1) {
      const op = opacityToTailwind(opacity);
      if (op) textClasses.push(op);
    }
  }

  // Text alignment
  switch (node.textAlignHorizontal) {
    case "CENTER":
      textClasses.push("text-center");
      break;
    case "RIGHT":
      textClasses.push("text-right");
      break;
    default:
      textClasses.push("text-left");
  }

  return `${indent(level)}<${htmlTag} class="${textClasses.join(" ")}">${
    node.characters
  }</${htmlTag}>\n`;
}

function convertFrameTailwind(
  node: FrameNode,
  htmlTag: string,
  level: number,
  parent?: SceneNode
): string {
  const classList: string[] = [];

  // Width and height
  classList.push(pxToSize(node.width, "w"));
  classList.push(pxToSize(node.height, "h"));

  // Positioning
  const isParentFlex =
    parent && "layoutMode" in parent && (parent as any).layoutMode !== "NONE";
  if ("x" in node && "y" in node && !isParentFlex) {
    classList.push("absolute");
    classList.push(pxToSpacing(node.x, "left"));
    classList.push(pxToSpacing(node.y, "top"));
  } else {
    classList.push("relative");
  }

  // Background color
  const fill = getFillColor(node);
  if (fill) classList.push(colorToTailwind(fill, "bg"));

  // Border radius
  if ("cornerRadius" in node) {
    const radiusClass = radiusToTailwind((node as any).cornerRadius);
    if (radiusClass) classList.push(radiusClass);
  }

  // Stroke/Border
  const stroke = getStroke(node);
  if (stroke) {
    classList.push(borderWidthToTailwind(stroke.width));
    classList.push(colorToTailwind(stroke.color, "border"));
    if (stroke.opacity < 1) {
      const opacityClass = opacityToTailwind(stroke.opacity);
      if (opacityClass) classList.push(`border-${opacityClass}`);
    }
  }

  // Padding
  classList.push(...paddingToTailwind((node as any).padding));

  // Auto-layout (flex direction and gap)
  if ("layoutMode" in node) {
    const layoutMode = (node as any).layoutMode;
    const itemSpacing = (node as any).itemSpacing || 0;
    if (layoutMode !== "NONE") {
      classList.push(...layoutModeToTailwind(layoutMode, itemSpacing));
      classList.push(...getAlignmentClasses(node));
      classList.push(...getWrappingClasses(node));
    }
  }

  // Opacity
  if ("opacity" in node) {
    const opacityClass = opacityToTailwind((node as any).opacity);
    if (opacityClass) classList.push(opacityClass);
  }

  // Shadows
  if ("effects" in node) {
    const effects = (node as any).effects;
    if (Array.isArray(effects) && effects.length > 0) {
      for (const effect of effects) {
        if (effect.type === "DROP_SHADOW") {
          classList.push("shadow-lg");
          break;
        }
      }
    }
  }

  let childrenHtml = "";
  for (const child of node.children) {
    childrenHtml += convertNodeTailwind(child, level + 1, node);
  }

  return `${indent(level)}<${htmlTag} class="${classList
    .filter(Boolean)
    .join(" ")}">\n${childrenHtml}${indent(level)}</${htmlTag}>\n`;
}

// ======================================================
// PROPERTY EXTRACTOR FOR UI
// ======================================================
/* eslint-disable @typescript-eslint/no-explicit-any */
function extractNodeProperties(node: SceneNode) {
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
  if ("cornerRadius" in node) out.cornerRadius = (node as any).cornerRadius;
  if ("padding" in node) out.padding = (node as any).padding;
  if ("gap" in node) out.gap = (node as any).gap;
  if ("itemSpacing" in node) out.itemSpacing = (node as any).itemSpacing;
  if ("layoutMode" in node) out.layoutMode = (node as any).layoutMode;

  // Text properties
  if (node.type === "TEXT") {
    const t = node as TextNode;
    if (typeof t.fontSize === "number") out.fontSize = t.fontSize;
    if (t.fontName !== figma.mixed) out.fontName = t.fontName as FontName;
    out.characters = t.characters;
    out.textAlignHorizontal = t.textAlignHorizontal;
  }

  // Fills / strokes
  if ("fills" in node) {
    try {
      out.fills = Array.isArray((node as any).fills)
        ? (node as any).fills.map((p: any) => {
            if (!p) return p;
            if (p.type === "SOLID")
              return { type: "SOLID", color: p.color, opacity: p.opacity };
            return { type: p.type };
          })
        : (node as any).fills;
    } catch (e) {
      out.fills = (node as any).fills;
    }
    const singleFill = getFillColor(node);
    if (singleFill) out.fill = singleFill;
  }

  if ("strokes" in node) {
    try {
      out.strokes = Array.isArray((node as any).strokes)
        ? (node as any).strokes.map((s: any) => {
            if (!s) return s;
            if (s.type === "SOLID")
              return { type: "SOLID", color: s.color, opacity: s.opacity };
            return { type: s.type };
          })
        : (node as any).strokes;
    } catch (e) {
      out.strokes = (node as any).strokes;
    }
    if ((node as any).strokeWeight)
      out.strokeWeight = (node as any).strokeWeight;
    const firstStroke = getStroke(node);
    if (firstStroke) out.stroke = firstStroke;
  }

  // Children
  if ("children" in node) {
    out.children = (node as any).children.map((child: SceneNode) => {
      const childOut: any = extractNodeProperties(child as SceneNode);
      return childOut;
    });
  }

  return out;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// ======================================================
// CODEGEN MODE
// When Dev Mode asks, return HTML or Tailwind snippets for the selection.
// ======================================================
if (figma.editorType === "dev" && figma.mode === "codegen") {
  figma.codegen.on("generate", ({ node, language }) => {
    if (!node) {
      return [
        { title: "HTML", language: "HTML", code: "<!-- No selection -->" },
      ];
    }

    if (language === "HTML") {
      return [{ title: "HTML", language: "HTML", code: convertNode(node, 0) }];
    }

    if (language === "TAILWIND_HTML") {
      return [
        {
          title: "Tailwind HTML",
          language: "HTML",
          code: convertNodeTailwind(node, 0),
        },
      ];
    }

    return [{ title: "HTML", language: "HTML", code: convertNode(node, 0) }];
  });
} else {
  // Allow editor UI to stay open
}
