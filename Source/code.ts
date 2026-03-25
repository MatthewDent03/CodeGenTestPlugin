import { toReactTailwindComponent } from "./main/codegen/reactTailwind";
import { findClosest } from "./main/utils/findClosest";
import { nameToClass } from "./main/utils/nameToClass";

// === Font size mapping ===
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

// === Line height mapping ===
const lineHeightMap: Record<number, string> = {
  1: "none",
  1.25: "tight",
  1.375: "snug",
  1.5: "normal",
  1.625: "relaxed",
  2: "loose",
};

// === Letter spacing mapping ===
const letterSpacingMap: Record<number, string> = {
  "-0.05": "tighter",
  "-0.025": "tight",
  "0": "normal",
  "0.025": "wide",
  "0.05": "wider",
  "0.1": "widest",
};

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

// === Border radius mapping ===
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

// === Border width mapping ===
const borderWidthMap: Record<number, string> = {
  1: "1",
  2: "2",
  4: "4",
  8: "8",
};

// === Opacity mapping (0-100%) ===
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

// === Shadow mapping (by blur radius px) ===
const shadowRadiusMap: Record<number, string> = {
  0: "none",
  2: "sm",
  3: "",
  6: "md",
  10: "lg",
  15: "xl",
  25: "2xl",
};

// === Tailwind color map (full v3 palette) ===
const tailwindColorMap: Record<string, string> = {
  // === SPECIAL COLORS ===
  "#000000": "black",
  "#ffffff": "white",

  // === GRAYSCALE NEUTRALS ===
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
  "#0f172a": "slate-900",
  "#020617": "slate-950",

  // Gray
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
  "#030712": "gray-950",

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
  "#09090b": "zinc-950",

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
  "#0c0a09": "stone-950",

  // === WARM COLORS ===
  // Red
  "#fef2f2": "red-50",
  "#fee2e2": "red-100",
  "#fecaca": "red-200",
  "#fca5a5": "red-300",
  "#f87171": "red-400",
  "#ef4444": "red-500",
  "#dc2626": "red-600",
  "#b91c1c": "red-700",
  "#991b1b": "red-800",
  "#7f1d1d": "red-900",
  "#450a0a": "red-950",

  // Orange
  "#fff7ed": "orange-50",
  "#ffedd5": "orange-100",
  "#fed7aa": "orange-200",
  "#fdba74": "orange-300",
  "#fb923c": "orange-400",
  "#f97316": "orange-500",
  "#ea580c": "orange-600",
  "#c2410c": "orange-700",
  "#9a3412": "orange-800",
  "#7c2d12": "orange-900",
  "#431407": "orange-950",

  // Amber
  "#fffbeb": "amber-50",
  "#fef3c7": "amber-100",
  "#fde68a": "amber-200",
  "#fcd34d": "amber-300",
  "#fbbf24": "amber-400",
  "#f59e0b": "amber-500",
  "#d97706": "amber-600",
  "#b45309": "amber-700",
  "#92400e": "amber-800",
  "#78350f": "amber-900",
  "#451a03": "amber-950",

  // Yellow
  "#fefce8": "yellow-50",
  "#fef9c3": "yellow-100",
  "#fef08a": "yellow-200",
  "#fde047": "yellow-300",
  "#facc15": "yellow-400",
  "#eab308": "yellow-500",
  "#ca8a04": "yellow-600",
  "#a16207": "yellow-700",
  "#854d0e": "yellow-800",
  "#713f12": "yellow-900",
  "#422006": "yellow-950",

  // Lime
  "#f7fee7": "lime-50",
  "#ecfccb": "lime-100",
  "#d9f99d": "lime-200",
  "#bef264": "lime-300",
  "#a3e635": "lime-400",
  "#84cc16": "lime-500",
  "#65a30d": "lime-600",
  "#4d7c0f": "lime-700",
  "#3f6212": "lime-800",
  "#365314": "lime-900",
  "#1a2e05": "lime-950",

  // === GREEN COLORS ===
  // Green
  "#f0fdf4": "green-50",
  "#dcfce7": "green-100",
  "#bbf7d0": "green-200",
  "#86efac": "green-300",
  "#4ade80": "green-400",
  "#22c55e": "green-500",
  "#16a34a": "green-600",
  "#15803d": "green-700",
  "#166534": "green-800",
  "#14532d": "green-900",
  "#052e16": "green-950",

  // Emerald
  "#ecfdf5": "emerald-50",
  "#d1fae5": "emerald-100",
  "#a7f3d0": "emerald-200",
  "#6ee7b7": "emerald-300",
  "#34d399": "emerald-400",
  "#10b981": "emerald-500",
  "#059669": "emerald-600",
  "#047857": "emerald-700",
  "#065f46": "emerald-800",
  "#064e3b": "emerald-900",
  "#022c22": "emerald-950",

  // Teal
  "#f0fdfa": "teal-50",
  "#ccfbf1": "teal-100",
  "#99f6e4": "teal-200",
  "#5eead4": "teal-300",
  "#2dd4bf": "teal-400",
  "#14b8a6": "teal-500",
  "#0d9488": "teal-600",
  "#0f766e": "teal-700",
  "#115e59": "teal-800",
  "#134e4a": "teal-900",
  "#042f2e": "teal-950",

  // === BLUE COLORS ===
  // Cyan
  "#ecfeff": "cyan-50",
  "#cffafe": "cyan-100",
  "#a5f3fc": "cyan-200",
  "#67e8f9": "cyan-300",
  "#22d3ee": "cyan-400",
  "#06b6d4": "cyan-500",
  "#0891b2": "cyan-600",
  "#0e7490": "cyan-700",
  "#155e75": "cyan-800",
  "#164e63": "cyan-900",
  "#083344": "cyan-950",

  // Sky
  "#f0f9ff": "sky-50",
  "#e0f2fe": "sky-100",
  "#bae6fd": "sky-200",
  "#7dd3fc": "sky-300",
  "#38bdf8": "sky-400",
  "#0ea5e9": "sky-500",
  "#0284c7": "sky-600",
  "#0369a1": "sky-700",
  "#075985": "sky-800",
  "#0c4a6e": "sky-900",
  "#082f49": "sky-950",

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
  "#1e3a8a": "blue-900",
  "#172554": "blue-950",

  // Indigo
  "#eef2ff": "indigo-50",
  "#e0e7ff": "indigo-100",
  "#c7d2fe": "indigo-200",
  "#a5b4fc": "indigo-300",
  "#818cf8": "indigo-400",
  "#6366f1": "indigo-500",
  "#4f46e5": "indigo-600",
  "#4338ca": "indigo-700",
  "#3730a3": "indigo-800",
  "#312e81": "indigo-900",
  "#1e1b4b": "indigo-950",

  // === PURPLE COLORS ===
  // Violet
  "#f5f3ff": "violet-50",
  "#ede9fe": "violet-100",
  "#ddd6fe": "violet-200",
  "#c4b5fd": "violet-300",
  "#a78bfa": "violet-400",
  "#8b5cf6": "violet-500",
  "#7c3aed": "violet-600",
  "#6d28d9": "violet-700",
  "#5b21b6": "violet-800",
  "#4c1d95": "violet-900",
  "#2e1065": "violet-950",

  // Purple
  "#faf5ff": "purple-50",
  "#f3e8ff": "purple-100",
  "#e9d5ff": "purple-200",
  "#d8b4fe": "purple-300",
  "#c084fc": "purple-400",
  "#a855f7": "purple-500",
  "#9333ea": "purple-600",
  "#7e22ce": "purple-700",
  "#6b21a8": "purple-800",
  "#581c87": "purple-900",
  "#3b0764": "purple-950",

  // Fuchsia
  "#fdf4ff": "fuchsia-50",
  "#fae8ff": "fuchsia-100",
  "#f5d0fe": "fuchsia-200",
  "#f0abfc": "fuchsia-300",
  "#e879f9": "fuchsia-400",
  "#d946ef": "fuchsia-500",
  "#c026d3": "fuchsia-600",
  "#a21caf": "fuchsia-700",
  "#86198f": "fuchsia-800",
  "#701a75": "fuchsia-900",
  "#4a044e": "fuchsia-950",

  // === PINK COLORS ===
  // Pink
  "#fdf2f8": "pink-50",
  "#fce7f3": "pink-100",
  "#fbcfe8": "pink-200",
  "#f9a8d4": "pink-300",
  "#f472b6": "pink-400",
  "#ec4899": "pink-500",
  "#db2777": "pink-600",
  "#be185d": "pink-700",
  "#9d174d": "pink-800",
  "#831843": "pink-900",
  "#500724": "pink-950",

  // Rose
  "#fff1f2": "rose-50",
  "#ffe4e6": "rose-100",
  "#fecdd3": "rose-200",
  "#fda4af": "rose-300",
  "#fb7185": "rose-400",
  "#f43f5e": "rose-500",
  "#e11d48": "rose-600",
  "#be123c": "rose-700",
  "#9f1239": "rose-800",
  "#881337": "rose-900",
  "#4c0519": "rose-950",
};

function pxToSize(px: number, prefix: string = "w"): string {
  const tailwindClass = findClosest(px, spacingMap);
  if (tailwindClass) return `${prefix}-${tailwindClass}`;
  return `${prefix}-[${px}px]`;
}

// Determine node sizing (HUG / FILL / fixed)
function nodeSize(node: any): {
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

function pxToPosition(px: number, prefix: string = "left"): string {
  if (px === 0) return "";
  return `${prefix}-[${px}px]`;
}

function paddingToTailwind(padding: any): string[] {
  if (!padding) return [];
  const classes: string[] = [];
  if (typeof padding === "number") {
    if (padding > 0) {
      const tailwindClass = findClosest(padding, spacingMap);
      if (tailwindClass) classes.push(`p-${tailwindClass}`);
      else classes.push(`p-[${padding}px]`);
    }
  } else if (typeof padding === "object") {
    const top = padding.top || 0;
    const right = padding.right || 0;
    const bottom = padding.bottom || 0;
    const left = padding.left || 0;
    if (top === right && right === bottom && bottom === left && top > 0) {
      const tailwindClass = findClosest(top, spacingMap);
      if (tailwindClass) classes.push(`p-${tailwindClass}`);
      else classes.push(`p-[${top}px]`);
    } else {
      if (top > 0) {
        const paddingTopClass = findClosest(top, spacingMap);
        classes.push(
          paddingTopClass ? `pt-${paddingTopClass}` : `pt-[${top}px]`,
        );
      }
      if (right > 0) {
        const paddingRightClass = findClosest(right, spacingMap);
        classes.push(
          paddingRightClass ? `pr-${paddingRightClass}` : `pr-[${right}px]`,
        );
      }
      if (bottom > 0) {
        const paddingBottomClass = findClosest(bottom, spacingMap);
        classes.push(
          paddingBottomClass ? `pb-${paddingBottomClass}` : `pb-[${bottom}px]`,
        );
      }
      if (left > 0) {
        const paddingLeftClass = findClosest(left, spacingMap);
        classes.push(
          paddingLeftClass ? `pl-${paddingLeftClass}` : `pl-[${left}px]`,
        );
      }
    }
  }
  return classes;
}

function radiusToTailwind(radius: any): string {
  if (!radius) return "";
  if (typeof radius === "number") {
    const radiusClass = findClosest(radius, radiusMap);
    if (radiusClass === "none") return "rounded-none";
    if (radiusClass === "") return "rounded";
    if (radiusClass) return `rounded-${radiusClass}`;
    return `rounded-[${radius}px]`;
  } else if (typeof radius === "object") {
    const topLeft = radius.topLeft || 0;
    const topRight = radius.topRight || 0;
    const bottomRight = radius.bottomRight || 0;
    const bottomLeft = radius.bottomLeft || 0;
    if (
      topLeft === topRight &&
      topRight === bottomRight &&
      bottomRight === bottomLeft
    ) {
      const radiusClass = findClosest(topLeft, radiusMap);
      if (radiusClass === "none") return "rounded-none";
      if (radiusClass === "") return "rounded";
      if (radiusClass) return `rounded-${radiusClass}`;
      return `rounded-[${topLeft}px]`;
    } else {
      const classes: string[] = [];
      const topLeftClass = findClosest(topLeft, radiusMap);
      const topRightClass = findClosest(topRight, radiusMap);
      const bottomRightClass = findClosest(bottomRight, radiusMap);
      const bottomLeftClass = findClosest(bottomLeft, radiusMap);
      if (topLeftClass === "none") {
        // skip
      } else if (topLeftClass === "") {
        classes.push("rounded-tl");
      } else if (topLeftClass) {
        classes.push(`rounded-tl-${topLeftClass}`);
      } else if (topLeft > 0) {
        classes.push(`rounded-tl-[${topLeft}px]`);
      }
      if (topRightClass === "none") {
        // skip
      } else if (topRightClass === "") {
        classes.push("rounded-tr");
      } else if (topRightClass) {
        classes.push(`rounded-tr-${topRightClass}`);
      } else if (topRight > 0) {
        classes.push(`rounded-tr-[${topRight}px]`);
      }
      if (bottomRightClass === "none") {
        // skip
      } else if (bottomRightClass === "") {
        classes.push("rounded-br");
      } else if (bottomRightClass) {
        classes.push(`rounded-br-${bottomRightClass}`);
      } else if (bottomRight > 0) {
        classes.push(`rounded-br-[${bottomRight}px]`);
      }
      if (bottomLeftClass === "none") {
        // skip
      } else if (bottomLeftClass === "") {
        classes.push("rounded-bl");
      } else if (bottomLeftClass) {
        classes.push(`rounded-bl-${bottomLeftClass}`);
      } else if (bottomLeft > 0) {
        classes.push(`rounded-bl-[${bottomLeft}px]`);
      }
      return classes.join(" ");
    }
  }
  return "";
}

function borderWidthToTailwind(width: number): string {
  if (width === 1) return "border";
  const borderWidthClass = findClosest(width, borderWidthMap);
  if (borderWidthClass) return `border-${borderWidthClass}`;
  return `border-[${width}px]`;
}

function opacityToTailwind(opacity: number): string {
  if (opacity >= 1) return "";
  const percent = Math.round(opacity * 100);
  const opacityClass = findClosest(percent, opacityMap);
  if (opacityClass) return `${opacityClass}`;
  return `${percent}`;
}

function effectShadowToTailwind(node: SceneNode): string {
  if (!("effects" in node)) return "";

  const effects = (node as any).effects;
  if (!Array.isArray(effects) || effects.length === 0) return "";

  const firstShadow = effects.find(
    (effect: any) =>
      effect &&
      effect.visible !== false &&
      (effect.type === "DROP_SHADOW" || effect.type === "INNER_SHADOW"),
  );

  if (!firstShadow) return "";
  if (firstShadow.type === "INNER_SHADOW") return "shadow-inner";

  const radius = Number(firstShadow.radius || 0);
  const shadowClass = findClosest(radius, shadowRadiusMap, 2);
  if (shadowClass === "none") return "shadow-none";
  if (shadowClass === "") return "shadow";
  if (shadowClass) return `shadow-${shadowClass}`;
  return "shadow-lg";
}

function shadowEffectsFromToken(tokenName: string): any[] | null {
  const black = { r: 0, g: 0, b: 0 };
  const presets: Record<string, any[]> = {
    none: [],
    sm: [
      {
        type: "DROP_SHADOW",
        color: { ...black, a: 0.05 },
        offset: { x: 0, y: 1 },
        radius: 2,
        spread: 0,
        visible: true,
        blendMode: "NORMAL",
      },
    ],
    DEFAULT: [
      {
        type: "DROP_SHADOW",
        color: { ...black, a: 0.1 },
        offset: { x: 0, y: 1 },
        radius: 3,
        spread: 0,
        visible: true,
        blendMode: "NORMAL",
      },
      {
        type: "DROP_SHADOW",
        color: { ...black, a: 0.1 },
        offset: { x: 0, y: 1 },
        radius: 2,
        spread: -1,
        visible: true,
        blendMode: "NORMAL",
      },
    ],
    md: [
      {
        type: "DROP_SHADOW",
        color: { ...black, a: 0.1 },
        offset: { x: 0, y: 4 },
        radius: 6,
        spread: -1,
        visible: true,
        blendMode: "NORMAL",
      },
      {
        type: "DROP_SHADOW",
        color: { ...black, a: 0.1 },
        offset: { x: 0, y: 2 },
        radius: 4,
        spread: -2,
        visible: true,
        blendMode: "NORMAL",
      },
    ],
    lg: [
      {
        type: "DROP_SHADOW",
        color: { ...black, a: 0.1 },
        offset: { x: 0, y: 10 },
        radius: 8,
        spread: -3,
        visible: true,
        blendMode: "NORMAL",
      },
      {
        type: "DROP_SHADOW",
        color: { ...black, a: 0.1 },
        offset: { x: 0, y: 4 },
        radius: 6,
        spread: -4,
        visible: true,
        blendMode: "NORMAL",
      },
    ],
    xl: [
      {
        type: "DROP_SHADOW",
        color: { ...black, a: 0.1 },
        offset: { x: 0, y: 20 },
        radius: 13,
        spread: -5,
        visible: true,
        blendMode: "NORMAL",
      },
      {
        type: "DROP_SHADOW",
        color: { ...black, a: 0.04 },
        offset: { x: 0, y: 8 },
        radius: 10,
        spread: -6,
        visible: true,
        blendMode: "NORMAL",
      },
    ],
    "2xl": [
      {
        type: "DROP_SHADOW",
        color: { ...black, a: 0.25 },
        offset: { x: 0, y: 25 },
        radius: 25,
        spread: -12,
        visible: true,
        blendMode: "NORMAL",
      },
    ],
    inner: [
      {
        type: "INNER_SHADOW",
        color: { ...black, a: 0.05 },
        offset: { x: 0, y: 2 },
        radius: 4,
        spread: 0,
        visible: true,
        blendMode: "NORMAL",
      },
    ],
  };

  return tokenName in presets ? presets[tokenName] : null;
}

/**
 * Converts a hex color string (e.g. "#ef4444") to RGB object with values 0-255
 * Returns null if the hex format is invalid
 */
function hexToRgb(
  hexColor: string,
): { red: number; green: number; blue: number } | null {
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

// === Tailwind Token Registry (raw values) ===
const RAW_TAILWIND_TOKENS = {
  colors: {
    slate: {
      "50": "#f8fafc",
      "100": "#f1f5f9",
      "200": "#e2e8f0",
      "300": "#cbd5e1",
      "400": "#94a3b8",
      "500": "#64748b",
      "600": "#475569",
      "700": "#334155",
      "800": "#1e293b",
      "900": "#0f172a",
      "950": "#020617",
    },
    gray: {
      "50": "#f9fafb",
      "100": "#f3f4f6",
      "200": "#e5e7eb",
      "300": "#d1d5db",
      "400": "#9ca3af",
      "500": "#6b7280",
      "600": "#4b5563",
      "700": "#374151",
      "800": "#1f2937",
      "900": "#111827",
      "950": "#030712",
    },
    zinc: {
      "50": "#fafafa",
      "100": "#f4f4f5",
      "200": "#e4e4e7",
      "300": "#d4d4d8",
      "400": "#a1a1aa",
      "500": "#71717a",
      "600": "#52525b",
      "700": "#3f3f46",
      "800": "#27272a",
      "900": "#18181b",
      "950": "#09090b",
    },
    neutral: {
      "50": "#fafafa",
      "100": "#f5f5f5",
      "200": "#e5e5e5",
      "300": "#d4d4d4",
      "400": "#a3a3a3",
      "500": "#737373",
      "600": "#525252",
      "700": "#404040",
      "800": "#262626",
      "900": "#171717",
      "950": "#0a0a0a",
    },
    stone: {
      "50": "#fafaf9",
      "100": "#f5f5f4",
      "200": "#e7e5e4",
      "300": "#d6d3d1",
      "400": "#a8a29e",
      "500": "#78716c",
      "600": "#57534e",
      "700": "#44403c",
      "800": "#292524",
      "900": "#1c1917",
      "950": "#0c0a09",
    },
    red: {
      "50": "#fef2f2",
      "100": "#fee2e2",
      "200": "#fecaca",
      "300": "#fca5a5",
      "400": "#f87171",
      "500": "#ef4444",
      "600": "#dc2626",
      "700": "#b91c1c",
      "800": "#991b1b",
      "900": "#7f1d1d",
      "950": "#450a0a",
    },
    orange: {
      "50": "#fff7ed",
      "100": "#ffedd5",
      "200": "#fed7aa",
      "300": "#fdba74",
      "400": "#fb923c",
      "500": "#f97316",
      "600": "#ea580c",
      "700": "#c2410c",
      "800": "#9a3412",
      "900": "#7c2d12",
      "950": "#431407",
    },
    amber: {
      "50": "#fffbeb",
      "100": "#fef3c7",
      "200": "#fde68a",
      "300": "#fcd34d",
      "400": "#fbbf24",
      "500": "#f59e0b",
      "600": "#d97706",
      "700": "#b45309",
      "800": "#92400e",
      "900": "#78350f",
      "950": "#451a03",
    },
    yellow: {
      "50": "#fefce8",
      "100": "#fef9c3",
      "200": "#fef08a",
      "300": "#fde047",
      "400": "#facc15",
      "500": "#eab308",
      "600": "#ca8a04",
      "700": "#a16207",
      "800": "#854d0e",
      "900": "#713f12",
      "950": "#422006",
    },
    lime: {
      "50": "#f7fee7",
      "100": "#ecfccb",
      "200": "#d9f99d",
      "300": "#bef264",
      "400": "#a3e635",
      "500": "#84cc16",
      "600": "#65a30d",
      "700": "#4d7c0f",
      "800": "#3f6212",
      "900": "#365314",
      "950": "#1a2e05",
    },
    green: {
      "50": "#f0fdf4",
      "100": "#dcfce7",
      "200": "#bbf7d0",
      "300": "#86efac",
      "400": "#4ade80",
      "500": "#22c55e",
      "600": "#16a34a",
      "700": "#15803d",
      "800": "#166534",
      "900": "#14532d",
      "950": "#052e16",
    },
    emerald: {
      "50": "#ecfdf5",
      "100": "#d1fae5",
      "200": "#a7f3d0",
      "300": "#6ee7b7",
      "400": "#34d399",
      "500": "#10b981",
      "600": "#059669",
      "700": "#047857",
      "800": "#065f46",
      "900": "#064e3b",
      "950": "#022c22",
    },
    teal: {
      "50": "#f0fdfa",
      "100": "#ccfbf1",
      "200": "#99f6e4",
      "300": "#5eead4",
      "400": "#2dd4bf",
      "500": "#14b8a6",
      "600": "#0d9488",
      "700": "#0f766e",
      "800": "#115e59",
      "900": "#134e4a",
      "950": "#042f2e",
    },
    cyan: {
      "50": "#ecfeff",
      "100": "#cffafe",
      "200": "#a5f3fc",
      "300": "#67e8f9",
      "400": "#22d3ee",
      "500": "#06b6d4",
      "600": "#0891b2",
      "700": "#0e7490",
      "800": "#155e75",
      "900": "#164e63",
      "950": "#083344",
    },
    sky: {
      "50": "#f0f9ff",
      "100": "#e0f2fe",
      "200": "#bae6fd",
      "300": "#7dd3fc",
      "400": "#38bdf8",
      "500": "#0ea5e9",
      "600": "#0284c7",
      "700": "#0369a1",
      "800": "#075985",
      "900": "#0c4a6e",
      "950": "#082f49",
    },
    blue: {
      "50": "#eff6ff",
      "100": "#dbeafe",
      "200": "#bfdbfe",
      "300": "#93c5fd",
      "400": "#60a5fa",
      "500": "#3b82f6",
      "600": "#2563eb",
      "700": "#1d4ed8",
      "800": "#1e40af",
      "900": "#1e3a8a",
      "950": "#172554",
    },
    indigo: {
      "50": "#eef2ff",
      "100": "#e0e7ff",
      "200": "#c7d2fe",
      "300": "#a5b4fc",
      "400": "#818cf8",
      "500": "#6366f1",
      "600": "#4f46e5",
      "700": "#4338ca",
      "800": "#3730a3",
      "900": "#312e81",
      "950": "#1e1b4b",
    },
    violet: {
      "50": "#f5f3ff",
      "100": "#ede9fe",
      "200": "#ddd6fe",
      "300": "#c4b5fd",
      "400": "#a78bfa",
      "500": "#8b5cf6",
      "600": "#7c3aed",
      "700": "#6d28d9",
      "800": "#5b21b6",
      "900": "#4c1d95",
      "950": "#2e1065",
    },
    purple: {
      "50": "#faf5ff",
      "100": "#f3e8ff",
      "200": "#e9d5ff",
      "300": "#d8b4fe",
      "400": "#c084fc",
      "500": "#a855f7",
      "600": "#9333ea",
      "700": "#7e22ce",
      "800": "#6b21a8",
      "900": "#581c87",
      "950": "#3b0764",
    },
    fuchsia: {
      "50": "#fdf4ff",
      "100": "#fae8ff",
      "200": "#f5d0fe",
      "300": "#f0abfc",
      "400": "#e879f9",
      "500": "#d946ef",
      "600": "#c026d3",
      "700": "#a21caf",
      "800": "#86198f",
      "900": "#701a75",
      "950": "#4a044e",
    },
    pink: {
      "50": "#fdf2f8",
      "100": "#fce7f3",
      "200": "#fbcfe8",
      "300": "#f9a8d4",
      "400": "#f472b6",
      "500": "#ec4899",
      "600": "#db2777",
      "700": "#be185d",
      "800": "#9d174d",
      "900": "#831843",
      "950": "#500724",
    },
    rose: {
      "50": "#fff1f2",
      "100": "#ffe4e6",
      "200": "#fecdd3",
      "300": "#fda4af",
      "400": "#fb7185",
      "500": "#f43f5e",
      "600": "#e11d48",
      "700": "#be123c",
      "800": "#9f1239",
      "900": "#881337",
      "950": "#4c0519",
    },
    black: "#000000",
    white: "#ffffff",
  },
  spacing: {
    "0": "0px",
    px: "1px",
    "0.5": "2px",
    "1": "4px",
    "1.5": "6px",
    "2": "8px",
    "2.5": "10px",
    "3": "12px",
    "3.5": "14px",
    "4": "16px",
    "5": "20px",
    "6": "24px",
    "7": "28px",
    "8": "32px",
    "9": "36px",
    "10": "40px",
    "11": "44px",
    "12": "48px",
    "14": "56px",
    "16": "64px",
    "20": "80px",
    "24": "96px",
    "28": "112px",
    "32": "128px",
    "36": "144px",
    "40": "160px",
    "44": "176px",
    "48": "192px",
    "52": "208px",
    "56": "224px",
    "60": "240px",
    "64": "256px",
    "72": "288px",
    "80": "320px",
    "96": "384px",
  },
  typography: {
    fontSize: {
      xs: "12px",
      sm: "14px",
      base: "16px",
      lg: "18px",
      xl: "20px",
      "2xl": "24px",
      "3xl": "30px",
      "4xl": "36px",
      "5xl": "48px",
      "6xl": "60px",
      "7xl": "72px",
      "8xl": "96px",
      "9xl": "128px",
    },
    fontFamily: {
      sans: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      serif: "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif",
      mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
      inter: "Inter, sans-serif",
      segoe: "'Segoe UI', sans-serif",
      roboto: "Roboto, sans-serif",
      helvetica: "Helvetica, Arial, sans-serif",
      arial: "Arial, sans-serif",
      noto: "'Noto Sans', sans-serif",
      georgia: "Georgia, serif",
      cambria: "Cambria, serif",
      times: "'Times New Roman', Times, serif",
      sfmono: "SFMono-Regular, monospace",
      menlo: "Menlo, monospace",
      monaco: "Monaco, monospace",
      consolas: "Consolas, monospace",
      liberationmono: "'Liberation Mono', monospace",
      courier: "'Courier New', monospace",
      robotomono: "'Roboto Mono', monospace",
    },
    letterSpacing: {
      tighter: "-0.05em",
      tight: "-0.025em",
      normal: "0em",
      wide: "0.025em",
      wider: "0.05em",
      widest: "0.1em",
    },
    lineHeight: {
      none: "1",
      tight: "1.25",
      snug: "1.375",
      normal: "1.5",
      relaxed: "1.625",
      loose: "2",
    },
    fontWeight: {
      thin: "100",
      extralight: "200",
      light: "300",
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
      extrabold: "800",
      black: "900",
    },
  },
  effects: {
    borderWidth: {
      "0": "0px",
      "1": "1px",
      "2": "2px",
      "4": "4px",
      "8": "8px",
    },
    opacity: {
      "0": "0",
      "5": "0.05",
      "10": "0.1",
      "20": "0.2",
      "25": "0.25",
      "30": "0.3",
      "40": "0.4",
      "50": "0.5",
      "60": "0.6",
      "70": "0.7",
      "75": "0.75",
      "80": "0.8",
      "90": "0.9",
      "95": "0.95",
      "100": "1",
    },
    blur: {
      none: "0px",
      sm: "4px",
      DEFAULT: "8px",
      md: "12px",
      lg: "16px",
      xl: "24px",
      "2xl": "40px",
      "3xl": "64px",
    },
    shadow: {
      none: "none",
      sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
      md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
      xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
      "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
      inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
    },
  },
  gradients: {},
};

// W3C Design Token format type: includes value, type, and description metadata
type W3CToken = {
  $value: string;
  $type?: string;
  $description?: string;
};

// Infers token type based on the token's path in the token tree
function inferTokenType(path: string[]): string {
  const [category, subcategory] = path;
  if (category === "colors") return "color";
  if (category === "spacing") return "dimension";
  if (category === "typography") {
    if (subcategory === "fontFamily") return "fontFamily";
    if (subcategory === "fontWeight") return "fontWeight";
    if (subcategory === "lineHeight") return "number";
    return "dimension";
  }
  if (category === "effects") {
    if (subcategory === "opacity") return "number";
    if (subcategory === "shadow") return "shadow";
    return "dimension";
  }
  if (category === "gradients") return "gradient";
  return "string";
}

// Converts raw Tailwind token objects into W3C Design Token format
// Wraps string values with $value, $type, and $description metadata
function toW3CTokens(node: any, path: string[] = []): any {
  if (node && typeof node === "object" && !Array.isArray(node)) {
    // Skip nodes that are already in W3C format
    if ("$value" in node) return node;
    // Recursively process object properties
    const next: Record<string, unknown> = {};
    Object.entries(node).forEach(([key, value]) => {
      next[key] = toW3CTokens(value, [...path, key]);
    });
    return next;
  }

  if (typeof node === "string") {
    // Wrap primitive string values in W3C format with inferred type and path-based description
    const tokenType = inferTokenType(path);
    const description = path.join(".");
    const token: W3CToken = {
      $value: node,
      $type: tokenType,
      $description: description,
    };
    return token;
  }

  return node;
}

// Converts all raw Tailwind tokens to W3C Design Token Format 2025.10
const TAILWIND_TOKENS = toW3CTokens(RAW_TAILWIND_TOKENS);

/**
 * TokenRegistry manages access to design tokens
 */
class TokenRegistry {
  private tokenData: typeof TAILWIND_TOKENS;

  constructor(tokens: typeof TAILWIND_TOKENS) {
    this.tokenData = tokens;
  }

  private extractTokenValue(token: any): string | null {
    if (typeof token === "string") {
      return token;
    }
    if (token && typeof token === "object" && "$value" in token) {
      const tokenValue = (token as any).$value;
      return typeof tokenValue === "string" ? tokenValue : String(tokenValue);
    }
    return null;
  }

  /**
   * Get a specific token value by its path
   */
  getToken(category: string, colorName: string, shade: string): string | null {
    // Navigate to the color group: tokens[category][colorName]
    const categoryData = (this.tokenData as any)[category];
    if (!categoryData) {
      return null;
    }

    const colorGroup = categoryData[colorName];
    if (!colorGroup) {
      return null;
    }

    // Handle simple colors (black, white) as direct tokens
    const directColorValue = this.extractTokenValue(colorGroup);
    if (directColorValue !== null) {
      return directColorValue;
    }

    // Handle complex colors with shades
    return this.extractTokenValue(colorGroup[shade]);
  }

  /**
   * Get all shade values for a specific color
   */
  getShades(category: string, colorName: string): string[] {
    const categoryData = (this.tokenData as any)[category];
    if (!categoryData) {
      return [];
    }

    const colorGroup = categoryData[colorName];

    // Return empty array if color doesn't exist or is a direct token leaf
    if (
      typeof colorGroup !== "object" ||
      (colorGroup && "$value" in (colorGroup as any))
    ) {
      return [];
    }

    return Object.keys(colorGroup);
  }

  /**
   * Get all available token categories
   */
  getCategories(): string[] {
    return Object.keys(this.tokenData);
  }

  /**
   * Get a spacing token value by name
   * Spacing tokens have a scale structure: spacing["4"] = "16px"
   */
  getSpacingToken(tokenName: string): string | null {
    const spacingData = (this.tokenData as any).spacing;
    if (!spacingData) {
      return null;
    }
    return this.extractTokenValue(spacingData[tokenName]);
  }

  /**
   * Get a typography token value by category and name
   * Typography structure: typography[category][tokenName] = value
   * Categories: fontSize, fontFamily, letterSpacing, lineHeight, fontWeight
   */
  getTypographyToken(category: string, tokenName: string): string | null {
    const typographyData = (this.tokenData as any).typography;
    if (!typographyData) {
      return null;
    }
    const categoryData = typographyData[category];
    if (!categoryData) {
      return null;
    }
    return this.extractTokenValue(categoryData[tokenName]);
  }

  /**
   * Get all typography categories
   */
  getTypographyCategories(): string[] {
    const typographyData = (this.tokenData as any).typography;
    if (!typographyData || typeof typographyData !== "object") {
      return [];
    }
    return Object.keys(typographyData);
  }

  /**
   * Get an effects token value by category and name
   * Effects structure: effects[category][tokenName] = value
   * Categories: borderWidth, opacity, blur
   */
  getEffectsToken(category: string, tokenName: string): string | null {
    const effectsData = (this.tokenData as any).effects;
    if (!effectsData) {
      return null;
    }
    const categoryData = effectsData[category];
    if (!categoryData) {
      return null;
    }
    return this.extractTokenValue(categoryData[tokenName]);
  }
}

// Create a single instance of the token registry for use throughout the plugin
const tokenRegistry = new TokenRegistry(TAILWIND_TOKENS);

/**
 * Converts a hex color to Figma's RGB format (values 0-1 instead of 0-255)
 */
function hexToFigmaColor(hexColor: string): RGB | null {
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
function colorDistance(hexColor1: string, hexColor2: string): number {
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

  return (
    Math.pow(redDifference, 2) +
    Math.pow(greenDifference, 2) +
    Math.pow(blueDifference, 2)
  );
}

/**
 * Convert a hex color to its closest Tailwind CSS class name
 * Performs exact match first, then falls back to closest color
 */
function colorToTailwind(
  hexColor: string,
  colorType: "bg" | "text" | "border" = "text",
): string {
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
    if (colorType === "bg") return `bg-${colorName}`;
    if (colorType === "border") return `border-${colorName}`;
    return `text-${colorName}`;
  }

  // Step 2: Find closest matching color
  let minimumDistance = Infinity;
  let closestColorName: string | null = null;

  for (const [mapHexColor, colorName] of Object.entries(colorNameMap)) {
    const distance = colorDistance(normalizedHex, mapHexColor);
    if (distance < minimumDistance) {
      minimumDistance = distance;
      closestColorName = colorName;
    }
  }

  // Step 3: Use closest match if found
  if (closestColorName) {
    if (colorType === "bg") return `bg-${closestColorName}`;
    if (colorType === "border") return `border-${closestColorName}`;
    return `text-${closestColorName}`;
  }

  // Step 4: Fallback to arbitrary value (last resort)
  if (colorType === "bg") return `bg-[${hexColor}]`;
  if (colorType === "border") return `border-[${hexColor}]`;
  return `text-[${hexColor}]`;
}

/**
 * Map Figma alignment to Tailwind justify
 */
function getAlignmentClasses(node: SceneNode): string[] {
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

// === PLUGIN UI (FIGMA MODE) ===
// Open the panel and stream basic selection info to the iframe.
if (figma.editorType === "figma") {
  const compactSize = { width: 380, height: 500 };
  const popoutSize = { width: 760, height: 720 };
  // This key stores custom color tokens in plugin storage.
  const CUSTOM_COLORS_STORAGE_KEY = "codegen.custom.tokens.colors.v1";
  // This key stores custom gradient tokens in plugin storage.
  const CUSTOM_GRADIENTS_STORAGE_KEY = "codegen.custom.tokens.gradients.v1";

  // This object caches custom colors for fast UI sync.
  let customColorsStore: Record<string, string> = {};
  // This object caches custom gradients for fast UI sync.
  type CustomGradientToken = { from: string; to: string; stops?: string[] };
  let customGradientsStore: Record<string, CustomGradientToken> = {};
  // Cache available fonts to avoid repeated API calls.
  let availableFontsCache: Font[] | null = null;

  // Tailwind-compatible candidate families (ordered by preference).
  const tailwindFontFamilyCandidates: Record<string, string[]> = {
    sans: [
      "Inter",
      "Segoe UI",
      "Roboto",
      "Helvetica Neue",
      "Arial",
      "Noto Sans",
      "Helvetica",
    ],
    serif: ["Georgia", "Cambria", "Times New Roman", "Times"],
    mono: [
      "SF Mono",
      "Menlo",
      "Monaco",
      "Consolas",
      "Liberation Mono",
      "Courier New",
      "Roboto Mono",
    ],
  };
  //testing new classroom push
  async function getAvailableFontsCached(): Promise<Font[]> {
    if (!availableFontsCache) {
      availableFontsCache = await figma.listAvailableFontsAsync();
    }
    return availableFontsCache;
  }

  function parseFontStack(fontStack: string): string[] {
    const genericFamilies = new Set([
      "ui-sans-serif",
      "ui-serif",
      "ui-monospace",
      "system-ui",
      "sans-serif",
      "serif",
      "monospace",
      "-apple-system",
      "blinkmacsystemfont",
      "apple color emoji",
      "segoe ui emoji",
      "segoe ui symbol",
      "noto color emoji",
    ]);

    return fontStack
      .split(",")
      .map((part) => part.trim().replace(/^['\"]|['\"]$/g, ""))
      .filter(Boolean)
      .filter((family) => !genericFamilies.has(family.toLowerCase()));
  }

  function resolveFontFromFamilies(
    availableFonts: Font[],
    families: string[],
  ): FontName | null {
    const preferredStyles = ["Regular", "Book", "Roman", "Normal", "Medium"];

    for (const family of families) {
      const matching = availableFonts.filter(
        (font) => font.fontName.family.toLowerCase() === family.toLowerCase(),
      );
      if (matching.length === 0) continue;

      for (const style of preferredStyles) {
        const preferred = matching.find(
          (font) => font.fontName.style.toLowerCase() === style.toLowerCase(),
        );
        if (preferred) {
          return {
            family: preferred.fontName.family,
            style: preferred.fontName.style,
          };
        }
      }

      return {
        family: matching[0].fontName.family,
        style: matching[0].fontName.style,
      };
    }

    return null;
  }

  // This pattern validates full 6-digit hex color strings.
  const hexPattern = /^#([a-f\d]{6})$/i;

  figma.showUI(__uiFiles__.main, compactSize);

  // This function loads custom token data from persistent plugin storage.
  async function loadCustomTokensFromStorage() {
    const colors = await figma.clientStorage.getAsync(
      CUSTOM_COLORS_STORAGE_KEY,
    );
    const gradients = await figma.clientStorage.getAsync(
      CUSTOM_GRADIENTS_STORAGE_KEY,
    );

    customColorsStore =
      colors && typeof colors === "object"
        ? (colors as Record<string, string>)
        : {};
    customGradientsStore = {};
    if (gradients && typeof gradients === "object") {
      Object.entries(gradients as Record<string, any>).forEach(
        ([name, gradientValue]) => {
          if (!gradientValue || typeof gradientValue !== "object") return;

          const rawStops = Array.isArray((gradientValue as any).stops)
            ? ((gradientValue as any).stops as any[])
                .map((stop) => String(stop || "").trim())
                .filter(Boolean)
            : [];

          if (rawStops.length >= 2) {
            customGradientsStore[name] = {
              from: rawStops[0],
              to: rawStops[rawStops.length - 1],
              stops: rawStops,
            };
            return;
          }

          const from = String((gradientValue as any).from || "").trim();
          const to = String((gradientValue as any).to || "").trim();
          if (from && to) {
            customGradientsStore[name] = { from, to };
          }
        },
      );
    }
  }

  // This function posts current custom token data to the UI iframe.
  async function postCustomTokensToUI() {
    const availableFonts = await getAvailableFontsCached();
    const availableFontFamilies = Array.from(
      new Set(
        availableFonts
          .map((font) => font.fontName.family)
          .filter(
            (family) => typeof family === "string" && family.trim().length > 0,
          ),
      ),
    ).sort((a, b) => a.localeCompare(b));

    figma.ui.postMessage({
      type: "custom-tokens-update",
      colors: customColorsStore,
      gradients: customGradientsStore,
      availableFontFamilies,
    });
  }

  // This startup flow loads and sends custom tokens when UI opens.
  void (async () => {
    await loadCustomTokensFromStorage();
    await postCustomTokensToUI();
  })();

  function pushSelectionUpdate(node: SceneNode) {
    const props = extractNodeProperties(node);
    const html = convertNode(node, 0);
    const tailwind = convertNodeTailwind(node, 0);
    const reactTailwind = convertNodeReactTailwind(node, 0);
    figma.ui.postMessage({
      type: "selection-update",
      data: props,
      html,
      tailwind,
      reactTailwind,
    });
  }

  figma.ui.onmessage = async (message) => {
    if (!message || !message.type) return;

    if (message.type === "toggle-popout") {
      const nextSize = message.poppedOut ? popoutSize : compactSize;
      figma.ui.resize(nextSize.width, nextSize.height);
      return;
    }

    if (message.type === "request-custom-tokens") {
      // This branch sends fresh custom token data on UI request.
      await loadCustomTokensFromStorage();
      await postCustomTokensToUI();
      return;
    }

    if (message.type === "save-custom-color-token") {
      // This branch validates and persists a custom color token.
      const tokenName = String(message.name || "")
        .trim()
        .toLowerCase();
      const hexValue = String(message.hex || "")
        .trim()
        .toLowerCase();
      if (!tokenName || !hexPattern.test(hexValue)) {
        figma.notify("Invalid custom color token");
        return;
      }

      customColorsStore[tokenName] = hexValue;
      await figma.clientStorage.setAsync(
        CUSTOM_COLORS_STORAGE_KEY,
        customColorsStore,
      );
      await postCustomTokensToUI();
      figma.notify(`Saved custom color: ${tokenName}`);
      return;
    }

    if (message.type === "save-custom-gradient-token") {
      // This branch validates and persists a custom gradient token.
      const tokenName = String(message.name || "")
        .trim()
        .toLowerCase();
      const stops = Array.isArray(message.stops)
        ? (message.stops as any[])
            .map((stop) => String(stop || "").trim())
            .filter(Boolean)
        : [];
      const from = String(message.from || "").trim();
      const to = String(message.to || "").trim();
      const normalizedStops =
        stops.length >= 2 ? stops : from && to ? [from, to] : [];

      if (!tokenName || normalizedStops.length < 2) {
        figma.notify("Invalid custom gradient token");
        return;
      }

      customGradientsStore[tokenName] = {
        from: normalizedStops[0],
        to: normalizedStops[normalizedStops.length - 1],
        stops: normalizedStops,
      };
      await figma.clientStorage.setAsync(
        CUSTOM_GRADIENTS_STORAGE_KEY,
        customGradientsStore,
      );
      await postCustomTokensToUI();
      figma.notify(`Saved custom gradient: ${tokenName}`);
      return;
    }

    if (message.type === "update-node") {
      const nodeId = message.nodeId as string | undefined;
      const parentId = message.parentId as string | undefined;
      const property = message.property as string | undefined;
      const rawValue = message.value;

      if (!nodeId || !property) return;

      const node = await figma.getNodeByIdAsync(nodeId);
      if (!node || node.type === "DOCUMENT" || node.type === "PAGE") return;

      if ("locked" in node && node.locked) {
        figma.notify("Node is locked");
        return;
      }

      const numberValue = Number(rawValue);

      if (property === "x" && "x" in node && Number.isFinite(numberValue)) {
        node.x = numberValue;
      } else if (
        property === "y" &&
        "y" in node &&
        Number.isFinite(numberValue)
      ) {
        node.y = numberValue;
      } else if (
        property === "width" &&
        "resize" in node &&
        Number.isFinite(numberValue)
      ) {
        const height = "height" in node ? node.height : 0;
        if (numberValue > 0 && height > 0)
          (node as any).resize(numberValue, height);
      } else if (
        property === "height" &&
        "resize" in node &&
        Number.isFinite(numberValue)
      ) {
        const width = "width" in node ? node.width : 0;
        if (numberValue > 0 && width > 0)
          (node as any).resize(width, numberValue);
      } else if (
        property === "rotation" &&
        "rotation" in node &&
        Number.isFinite(numberValue)
      ) {
        (node as any).rotation = numberValue;
      } else if (
        property === "opacity" &&
        "opacity" in node &&
        Number.isFinite(numberValue)
      ) {
        const clamped = Math.max(0, Math.min(1, numberValue));
        (node as any).opacity = clamped;
      } else if (
        property === "cornerRadius" &&
        "cornerRadius" in node &&
        Number.isFinite(numberValue)
      ) {
        (node as any).cornerRadius = numberValue;
      } else if (
        property === "cornerRadius" &&
        "topLeftRadius" in node &&
        typeof rawValue === "object" &&
        rawValue !== null
      ) {
        const { topLeft, topRight, bottomRight, bottomLeft } = rawValue as any;
        if (
          Number.isFinite(topLeft) &&
          Number.isFinite(topRight) &&
          Number.isFinite(bottomRight) &&
          Number.isFinite(bottomLeft)
        ) {
          (node as any).topLeftRadius = topLeft;
          (node as any).topRightRadius = topRight;
          (node as any).bottomRightRadius = bottomRight;
          (node as any).bottomLeftRadius = bottomLeft;
        }
      } else if (
        property === "padding" &&
        Number.isFinite(numberValue) &&
        ("paddingLeft" in node || "padding" in node)
      ) {
        if ("paddingLeft" in node) {
          (node as any).paddingLeft = numberValue;
          (node as any).paddingRight = numberValue;
          (node as any).paddingTop = numberValue;
          (node as any).paddingBottom = numberValue;
        } else if ("padding" in node) {
          (node as any).padding = numberValue;
        }
      } else if (
        property === "padding" &&
        "paddingLeft" in node &&
        typeof rawValue === "object" &&
        rawValue !== null
      ) {
        const { top, right, bottom, left } = rawValue as any;
        if (
          Number.isFinite(top) &&
          Number.isFinite(right) &&
          Number.isFinite(bottom) &&
          Number.isFinite(left)
        ) {
          (node as any).paddingTop = top;
          (node as any).paddingRight = right;
          (node as any).paddingBottom = bottom;
          (node as any).paddingLeft = left;
        }
      } else if (
        property === "itemSpacing" &&
        "itemSpacing" in node &&
        Number.isFinite(numberValue)
      ) {
        (node as any).itemSpacing = numberValue;
      } else if (
        property === "layoutGrow" &&
        "layoutGrow" in node &&
        Number.isFinite(numberValue)
      ) {
        (node as any).layoutGrow = numberValue;
      } else if (property === "layoutAlign" && "layoutAlign" in node) {
        const allowed = ["MIN", "CENTER", "MAX", "STRETCH"];
        if (allowed.includes(String(rawValue).toUpperCase())) {
          (node as any).layoutAlign = String(rawValue).toUpperCase();
        }
      } else if (property === "name") {
        node.name = String(rawValue);
      } else if (property === "fill" && "fills" in node) {
        const color = hexToFigmaColor(String(rawValue));
        if (color) {
          const existing = Array.isArray((node as any).fills)
            ? (node as any).fills[0]
            : null;
          const opacity =
            existing && typeof existing.opacity === "number"
              ? existing.opacity
              : 1;
          (node as any).fills = [{ type: "SOLID", color, opacity }];
        }
      } else if (property === "stroke" && "strokes" in node) {
        const color = hexToFigmaColor(String(rawValue));
        if (color) {
          const existing = Array.isArray((node as any).strokes)
            ? (node as any).strokes[0]
            : null;
          const opacity =
            existing && typeof existing.opacity === "number"
              ? existing.opacity
              : 1;
          (node as any).strokes = [{ type: "SOLID", color, opacity }];
        }
      } else if (
        property === "strokeWeight" &&
        "strokeWeight" in node &&
        Number.isFinite(numberValue)
      ) {
        (node as any).strokeWeight = numberValue;
      } else if (property === "strokeAlign" && "strokeAlign" in node) {
        const allowed = ["INSIDE", "OUTSIDE", "CENTER"];
        if (allowed.includes(String(rawValue).toUpperCase())) {
          (node as any).strokeAlign = String(rawValue).toUpperCase();
        }
      } else if (
        property === "fontSize" &&
        node.type === "TEXT" &&
        Number.isFinite(numberValue)
      ) {
        const textNode = node as TextNode;
        if (textNode.fontName !== figma.mixed) {
          await figma.loadFontAsync(textNode.fontName as FontName);
          textNode.fontSize = numberValue;
        }
      } else if (property === "characters" && node.type === "TEXT") {
        const textNode = node as TextNode;
        if (textNode.fontName !== figma.mixed) {
          await figma.loadFontAsync(textNode.fontName as FontName);
          textNode.characters = String(rawValue);
        }
      }

      if (parentId) {
        const parentNode = await figma.getNodeByIdAsync(parentId);
        if (
          parentNode &&
          parentNode.type !== "DOCUMENT" &&
          parentNode.type !== "PAGE"
        ) {
          pushSelectionUpdate(parentNode as SceneNode);
          return;
        }
      }

      const selected = figma.currentPage.selection[0];
      if (selected) {
        pushSelectionUpdate(selected as SceneNode);
      } else {
        pushSelectionUpdate(node as SceneNode);
      }
      return;
    }

    // Handle token application
    if (message.type === "apply-token") {
      const nodeId = message.nodeId as string | undefined;
      const colorName = message.colorName as string | undefined;
      const shade = message.shade as string | undefined;
      const property = message.property as string | undefined;

      if (!nodeId || !colorName || !shade) return;

      const node = await figma.getNodeByIdAsync(nodeId);
      if (!node) return;

      // Get token hex value from registry
      const hexValue = tokenRegistry.getToken("colors", colorName, shade);
      if (!hexValue) {
        figma.notify("Token not found");
        return;
      }

      // Convert hex to Figma RGB format (0-1 range)
      const figmaColor = hexToFigmaColor(hexValue);
      if (!figmaColor) {
        figma.notify("Invalid color");
        return;
      }

      // Apply based on property type fill
      if (property === "stroke" && "strokes" in node) {
        const strokePaint: SolidPaint = {
          type: "SOLID",
          color: figmaColor,
          opacity: 1,
        };
        (node as any).strokes = [strokePaint];
        node.setPluginData("applied-color-token", `${colorName}/${shade}`);
        node.setPluginData("tailwind-class", `border-${colorName}-${shade}`);
        figma.notify(`Applied stroke color: ${colorName}-${shade}`);
      } else if ("fills" in node) {
        // Default to fill
        (node as any).fills = [
          { type: "SOLID", color: figmaColor, opacity: 1 },
        ];
        node.setPluginData("applied-color-token", `${colorName}/${shade}`);
        node.setPluginData("tailwind-class", `bg-${colorName}-${shade}`);
      }

      // Re-sync UI with fresh data
      pushSelectionUpdate(node as SceneNode);
      return;
    }

    if (message.type === "apply-custom-color") {
      const nodeId = message.nodeId as string | undefined;
      const colorHex = message.colorHex as string | undefined;
      const colorName = (message.colorName as string | undefined) || "custom";
      const property = message.property as string | undefined;

      if (!nodeId || !colorHex) return;

      const node = await figma.getNodeByIdAsync(nodeId);
      if (!node) return;

      const figmaColor = hexToFigmaColor(colorHex);
      if (!figmaColor) {
        figma.notify("Invalid custom color");
        return;
      }

      if (property === "stroke" && "strokes" in node) {
        const strokePaint: SolidPaint = {
          type: "SOLID",
          color: figmaColor,
          opacity: 1,
        };
        (node as any).strokes = [strokePaint];
        node.setPluginData("applied-color-token", `custom/${colorName}`);
        node.setPluginData("tailwind-class", `border-[${colorHex}]`);
        figma.notify(`Applied custom stroke: ${colorName}`);
      } else if ("fills" in node) {
        (node as any).fills = [
          { type: "SOLID", color: figmaColor, opacity: 1 },
        ];
        node.setPluginData("applied-color-token", `custom/${colorName}`);
        node.setPluginData("tailwind-class", `bg-[${colorHex}]`);
        figma.notify(`Applied custom fill: ${colorName}`);
      }

      pushSelectionUpdate(node as SceneNode);
      return;
    }

    // Handle gradient token application (custom colors only)
    if (message.type === "apply-gradient-token") {
      const nodeId = message.nodeId as string | undefined;
      const colors = message.colors as string[] | undefined;

      if (!nodeId || !Array.isArray(colors) || colors.length < 2) {
        figma.notify("Gradient requires at least two colors");
        return;
      }

      const node = await figma.getNodeByIdAsync(nodeId);
      if (!node || !("fills" in node)) return;

      const gradientStops = colors
        .map((colorTokenOrHex, index) => {
          let rgb = hexToFigmaColor(colorTokenOrHex);
          if (!rgb) {
            const lastHyphenIndex = colorTokenOrHex.lastIndexOf("-");
            if (lastHyphenIndex > 0) {
              const colorName = colorTokenOrHex.substring(0, lastHyphenIndex);
              const shade = colorTokenOrHex.substring(lastHyphenIndex + 1);
              const hexValue = tokenRegistry.getToken(
                "colors",
                colorName,
                shade,
              );
              if (hexValue) {
                rgb = hexToFigmaColor(hexValue);
              }
            }
          }

          if (!rgb) return null;
          const position =
            colors.length === 1 ? 0 : index / (colors.length - 1);
          return {
            position,
            color: { ...rgb, a: 1 },
          };
        })
        .filter((stop) => stop !== null);

      if (gradientStops.length < 2) {
        figma.notify("Invalid gradient colors");
        return;
      }

      const gradientPaint: GradientPaint = {
        type: "GRADIENT_LINEAR",
        gradientStops,
        gradientTransform: [
          [1, 0, 0],
          [0, 1, 0],
        ],
      };

      (node as any).fills = [gradientPaint];
      node.setPluginData("applied-gradient-token", "custom");
      figma.notify("Applied gradient");

      pushSelectionUpdate(node as SceneNode);
      return;
    }

    // Handle spacing token application
    if (message.type === "apply-spacing-token") {
      const nodeId = message.nodeId as string | undefined;
      const tokenName = message.tokenName as string | undefined;
      const property = message.property as string | undefined;

      if (!nodeId || !tokenName || !property) return;

      const node = await figma.getNodeByIdAsync(nodeId);
      if (!node || node.type === "DOCUMENT" || node.type === "PAGE") return;

      // Get spacing value from registry using the dedicated spacing method
      const spacingValue = tokenRegistry.getSpacingToken(tokenName);
      if (!spacingValue) {
        figma.notify("Spacing token not found");
        return;
      }

      // Convert "16px" to 16
      const numericValue = parseFloat(spacingValue);
      if (!Number.isFinite(numericValue)) {
        figma.notify("Invalid spacing value");
        return;
      }

      // Apply based on property type
      if (
        property === "padding" &&
        ("paddingLeft" in node || "padding" in node)
      ) {
        if ("paddingLeft" in node) {
          (node as any).paddingLeft = numericValue;
          (node as any).paddingRight = numericValue;
          (node as any).paddingTop = numericValue;
          (node as any).paddingBottom = numericValue;
        } else if ("padding" in node) {
          (node as any).padding = numericValue;
        }
        node.setPluginData("applied-spacing-token", `padding:${tokenName}`);
      } else if (property === "paddingTop" && "paddingTop" in node) {
        (node as any).paddingTop = numericValue;
        node.setPluginData("applied-spacing-token", `paddingTop:${tokenName}`);
      } else if (property === "paddingRight" && "paddingRight" in node) {
        (node as any).paddingRight = numericValue;
        node.setPluginData(
          "applied-spacing-token",
          `paddingRight:${tokenName}`,
        );
      } else if (property === "paddingBottom" && "paddingBottom" in node) {
        (node as any).paddingBottom = numericValue;
        node.setPluginData(
          "applied-spacing-token",
          `paddingBottom:${tokenName}`,
        );
      } else if (property === "paddingLeft" && "paddingLeft" in node) {
        (node as any).paddingLeft = numericValue;
        node.setPluginData("applied-spacing-token", `paddingLeft:${tokenName}`);
      } else if (property === "itemSpacing" && "itemSpacing" in node) {
        (node as any).itemSpacing = numericValue;
        node.setPluginData("applied-spacing-token", `gap:${tokenName}`);
      } else if (property === "width" && "resize" in node) {
        const height = "height" in node ? (node as any).height : 100;
        if (numericValue > 0) {
          (node as any).resize(numericValue, height);
          node.setPluginData("applied-spacing-token", `width:${tokenName}`);
        }
      } else if (property === "height" && "resize" in node) {
        const width = "width" in node ? (node as any).width : 100;
        if (numericValue > 0) {
          (node as any).resize(width, numericValue);
          node.setPluginData("applied-spacing-token", `height:${tokenName}`);
        }
      } else if (property === "cornerRadius" && "cornerRadius" in node) {
        (node as any).cornerRadius = numericValue;
        node.setPluginData("applied-spacing-token", `rounded:${tokenName}`);
      } else if (property === "topLeftRadius" && "topLeftRadius" in node) {
        (node as any).topLeftRadius = numericValue;
        node.setPluginData(
          "applied-spacing-token",
          `topLeftRadius:${tokenName}`,
        );
      } else if (property === "topRightRadius" && "topRightRadius" in node) {
        (node as any).topRightRadius = numericValue;
        node.setPluginData(
          "applied-spacing-token",
          `topRightRadius:${tokenName}`,
        );
      } else if (
        property === "bottomRightRadius" &&
        "bottomRightRadius" in node
      ) {
        (node as any).bottomRightRadius = numericValue;
        node.setPluginData(
          "applied-spacing-token",
          `bottomRightRadius:${tokenName}`,
        );
      } else if (
        property === "bottomLeftRadius" &&
        "bottomLeftRadius" in node
      ) {
        (node as any).bottomLeftRadius = numericValue;
        node.setPluginData(
          "applied-spacing-token",
          `bottomLeftRadius:${tokenName}`,
        );
      } else {
        figma.notify(`Cannot apply spacing to ${property}`);
        return;
      }

      figma.notify(`Applied spacing-${tokenName} to ${property}`);

      // Re-sync UI with fresh data
      pushSelectionUpdate(node as SceneNode);
      return;
    }

    // Handle typography token application
    if (message.type === "apply-typography-token") {
      const nodeId = message.nodeId as string | undefined;
      const category = message.category as string | undefined;
      const tokenName = message.tokenName as string | undefined;
      const requestedFontFamily = String(message.fontFamily || "").trim();

      if (!nodeId || !category || !tokenName) return;

      const node = await figma.getNodeByIdAsync(nodeId);
      if (!node || node.type !== "TEXT") {
        figma.notify("Please select a text node");
        return;
      }

      const textNode = node as TextNode;

      let typographyValue: string | null = null;
      if (category === "fontFamily" && requestedFontFamily) {
        typographyValue = requestedFontFamily;
      } else {
        // Get typography value from registry
        typographyValue = tokenRegistry.getTypographyToken(category, tokenName);
        if (!typographyValue) {
          figma.notify("Typography token not found");
          return;
        }
      }

      // Load font before making changes
      if (textNode.fontName !== figma.mixed) {
        await figma.loadFontAsync(textNode.fontName as FontName);
      }

      // Apply based on category
      if (category === "fontSize") {
        const numericValue = parseFloat(typographyValue);
        if (Number.isFinite(numericValue)) {
          textNode.fontSize = numericValue;
          textNode.setPluginData(
            "applied-typography-token",
            `fontSize:${tokenName}`,
          );
          figma.notify(`Applied font size: ${tokenName}`);
        }
      } else if (category === "letterSpacing") {
        // Convert em to px based on current font size
        const fontSize =
          textNode.fontSize !== figma.mixed ? textNode.fontSize : 16;
        const emValue = parseFloat(typographyValue);
        if (Number.isFinite(emValue)) {
          textNode.letterSpacing = {
            value: emValue * fontSize,
            unit: "PIXELS",
          };
          textNode.setPluginData(
            "applied-typography-token",
            `letterSpacing:${tokenName}`,
          );
          figma.notify(`Applied letter spacing: ${tokenName}`);
        }
      } else if (category === "lineHeight") {
        const ratio = parseFloat(typographyValue);
        if (Number.isFinite(ratio)) {
          const fontSize =
            textNode.fontSize !== figma.mixed ? textNode.fontSize : 16;
          textNode.lineHeight = { value: ratio * fontSize, unit: "PIXELS" };
          textNode.setPluginData(
            "applied-typography-token",
            `lineHeight:${tokenName}`,
          );
          figma.notify(`Applied line height: ${tokenName}`);
        }
      } else if (category === "fontWeight") {
        // Map weight values to common font style names
        const weightToStyleMap: Record<string, string[]> = {
          "100": ["Thin", "Hairline"],
          "200": ["ExtraLight", "Extra Light", "UltraLight", "Ultra Light"],
          "300": ["Light"],
          "400": ["Regular", "Normal", "Book"],
          "500": ["Medium"],
          "600": ["SemiBold", "Semi Bold", "Semibold", "DemiBold", "Demi Bold"],
          "700": ["Bold"],
          "800": ["ExtraBold", "Extra Bold", "UltraBold", "Ultra Bold"],
          "900": ["Black", "Heavy"],
        };

        const weightValue = typographyValue; // e.g., "400", "700"
        const stylesToTry = weightToStyleMap[weightValue] || ["Regular"];

        if (textNode.fontName !== figma.mixed) {
          const currentFont = textNode.fontName as FontName;
          let fontApplied = false;

          // Try each style variant
          for (const style of stylesToTry) {
            try {
              const newFont = { family: currentFont.family, style: style };
              await figma.loadFontAsync(newFont);
              textNode.fontName = newFont;
              textNode.setPluginData(
                "applied-typography-token",
                `fontWeight:${tokenName}`,
              );
              figma.notify(`Applied font weight: ${tokenName} (${style})`);
              fontApplied = true;
              break;
            } catch (error) {
              // Style not available, try next one
              continue;
            }
          }

          if (!fontApplied) {
            figma.notify(
              `Font weight "${tokenName}" (${weightValue}) not available for ${currentFont.family}`,
            );
          }
        } else {
          figma.notify("Cannot apply font weight to mixed font selection");
        }
      } else if (category === "fontFamily") {
        const availableFonts = await getAvailableFontsCached();
        const tokenStackFamilies = parseFontStack(typographyValue);
        const defaultFamilies = tailwindFontFamilyCandidates[tokenName] || [];
        const candidateFamilies = [
          ...defaultFamilies,
          ...tokenStackFamilies.filter(
            (family) =>
              !defaultFamilies.some(
                (defaultFamily) =>
                  defaultFamily.toLowerCase() === family.toLowerCase(),
              ),
          ),
        ];

        const resolvedFont = resolveFontFromFamilies(
          availableFonts,
          candidateFamilies,
        );

        if (resolvedFont) {
          await figma.loadFontAsync(resolvedFont);
          textNode.fontName = resolvedFont;
          textNode.setPluginData(
            "applied-typography-token",
            `fontFamily:${tokenName}`,
          );
          figma.notify(`Applied font: ${resolvedFont.family}`);
        } else {
          figma.notify(
            `No Tailwind-compatible ${tokenName} font is available in Figma on this machine.`,
          );
        }
      }

      // Re-sync UI with fresh data
      pushSelectionUpdate(textNode as SceneNode);
      return;
    }

    // Handle effects token application (borderWidth, opacity, blur, shadow)
    if (message.type === "apply-effects-token") {
      const nodeId = message.nodeId as string | undefined;
      const category = message.category as string | undefined;
      const tokenName = message.tokenName as string | undefined;
      const strokePosition = message.strokePosition as string | undefined;
      const blurType = message.blurType as string | undefined;

      if (!nodeId || !category || !tokenName) return;

      const node = await figma.getNodeByIdAsync(nodeId);
      if (!node || node.type === "DOCUMENT" || node.type === "PAGE") return;

      // Get effects value from registry
      const effectsValue = tokenRegistry.getEffectsToken(category, tokenName);
      if (!effectsValue) {
        figma.notify("Effects token not found");
        return;
      }

      // Apply based on category
      if (category === "borderWidth" && "strokes" in node) {
        const numericValue = parseFloat(effectsValue);
        if (Number.isFinite(numericValue)) {
          (node as any).strokeWeight = numericValue;

          // Apply stroke position if specified
          if (
            strokePosition &&
            ["CENTER", "INSIDE", "OUTSIDE"].includes(strokePosition)
          ) {
            (node as any).strokeAlign = strokePosition;
          }

          node.setPluginData(
            "applied-effects-token",
            `borderWidth:${tokenName}`,
          );
          const posInfo = strokePosition ? ` (${strokePosition})` : "";
          figma.notify(`Applied border width: ${tokenName}${posInfo}`);
        }
      } else if (category === "opacity") {
        const numericValue = parseFloat(effectsValue);
        if (Number.isFinite(numericValue)) {
          (node as any).opacity = numericValue;
          node.setPluginData("applied-effects-token", `opacity:${tokenName}`);
          figma.notify(`Applied opacity: ${tokenName}`);
        }
      } else if (category === "blur" && "effects" in node) {
        const numericValue = parseFloat(effectsValue);
        if (Number.isFinite(numericValue)) {
          const existingEffects = Array.isArray((node as any).effects)
            ? (node as any).effects
            : [];

          const blurEffectType =
            blurType === "BACKGROUND_BLUR" ? "BACKGROUND_BLUR" : "LAYER_BLUR";

          // Remove existing blur effects
          const nonBlurEffects = existingEffects.filter((effect: any) => {
            return (
              effect.type !== "LAYER_BLUR" && effect.type !== "BACKGROUND_BLUR"
            );
          });

          // Add new blur effect if value > 0
          if (numericValue > 0) {
            (node as any).effects = [
              ...nonBlurEffects,
              {
                type: blurEffectType,
                radius: numericValue,
                visible: true,
              },
            ];
          } else {
            (node as any).effects = nonBlurEffects;
          }

          node.setPluginData(
            "applied-effects-token",
            `blur:${tokenName}:${blurEffectType}`,
          );
          figma.notify(
            `Applied ${blurEffectType === "BACKGROUND_BLUR" ? "background" : "layer"} blur: ${tokenName}`,
          );
        }
      } else if (category === "shadow" && "effects" in node) {
        const existingEffects = Array.isArray((node as any).effects)
          ? (node as any).effects
          : [];

        const nonShadowEffects = existingEffects.filter((effect: any) => {
          return (
            effect.type !== "DROP_SHADOW" && effect.type !== "INNER_SHADOW"
          );
        });

        const shadowEffects = shadowEffectsFromToken(tokenName);
        if (!shadowEffects) {
          figma.notify(`Unknown shadow token: ${tokenName}`);
          return;
        }

        (node as any).effects = [...nonShadowEffects, ...shadowEffects];
        node.setPluginData("applied-effects-token", `shadow:${tokenName}`);
        figma.notify(`Applied shadow: ${tokenName}`);
      } else {
        figma.notify(`Cannot apply ${category} to this node type`);
        return;
      }

      // Re-sync UI with fresh data
      pushSelectionUpdate(node as SceneNode);
      return;
    }
  };

  figma.on("selectionchange", () => {
    const node = figma.currentPage.selection[0];

    if (!node) {
      figma.ui.postMessage({ type: "no-selection" });
      return;
    }

    pushSelectionUpdate(node);
  });
}

// === INDENT HELPER ===
// Two-space indentation for generated HTML
function indent(level: number): string {
  return "  ".repeat(level);
}

// === FILL HELPERS ===
// solid fill as #rrggbb or null if none
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

// === STROKE HELPERS ===
// solid stroke as { color, width, opacity } or null
function getStroke(
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
function getPaddingCSS(node: SceneNode): string {
  if (!("padding" in node)) return "";

  const padding = (node as any).padding;
  if (!padding) return "";

  // Check padding object
  if (typeof padding === "object" && padding !== null) {
    const top = padding.top || 0;
    const right = padding.right || 0;
    const bottom = padding.bottom || 0;
    const left = padding.left || 0;

    // all equal - single value
    if (top === right && right === bottom && bottom === left) {
      return ` padding:${top}px;`;
    }

    // individual sides
    return ` padding:${top}px ${right}px ${bottom}px ${left}px;`;
  }

  // If number -  uniform padding
  if (typeof padding === "number") {
    return ` padding:${padding}px;`;
  }

  return "";
}

// === CORNER RADIUS HELPER ===
// Handle both uniform and mixed corner radius values
function getBorderRadiusCSS(node: SceneNode): string {
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

// === AUTO-LAYOUT TAILWIND HELPER ===
// Generate flex and gap classes for auto-layout frames
function getAutoLayoutTailwind(node: SceneNode): string[] {
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

// === AUTO-LAYOUT CSS HELPER ===
// Generate flex and gap CSS for auto-layout frames
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

// === FONT WEIGHT & STYLE HELPER ===
// Extract font weight and style from fontName
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

// === OPACITY HELPER ===
// Extract opacity from node
function getOpacityCSS(node: SceneNode): string {
  if (!("opacity" in node)) return "";
  const opacity = (node as any).opacity;
  if (opacity !== undefined && opacity !== null && opacity < 1) {
    return ` opacity:${opacity};`;
  }
  return "";
}

// === SHADOW HELPER ===
// Extract box shadows and drop shadows
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

// === INLINE CSS BUILDER ===
// Size, position, fill, stroke, rotation, radius as style text.
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

// === TAG PICKER ===
// Text nodes become <p>, everything else becomes <div>.
function getTag(node: SceneNode): string {
  return node.type === "TEXT" ? "p" : "div";
}

// === HTML CONVERTER ===
// Turn Figma nodes into plain HTML with inline styles.
function convertNode(
  node: SceneNode,
  level: number = 0,
  parent?: SceneNode,
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
    parent,
  )}"></${htmlTag}>\n`;
}

function convertTextNodeHTML(
  node: TextNode,
  htmlTag: string,
  level: number,
  parent?: SceneNode,
): string {
  let cssText = `width:${node.width}px; height:${node.height}px;`;

  // Check parent flex layout
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

  // Add line height
  if ("lineHeight" in node) {
    const lineHeight = (node as any).lineHeight;
    if (lineHeight && typeof lineHeight === "object" && "value" in lineHeight) {
      cssText += ` line-height:${lineHeight.value}${lineHeight.unit || "px"};`;
    }
  }

  // Add letter spacing
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
  parent?: SceneNode,
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
    level,
  )}<${htmlTag} class="frame" style="${cssText}">\n${childrenHtml}${indent(
    level,
  )}</${htmlTag}>\n`;
}

// === TAILWIND CONVERTER ===
// Turn Figma nodes into HTML that uses Tailwind utility classes.
function convertNodeTailwind(
  node: SceneNode,
  level: number = 0,
  parent?: SceneNode,
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
  parent?: SceneNode,
): string {
  const classList: string[] = [];

  // layer name as class
  if (node.name) {
    classList.push(nameToClass(node.name, `node-${node.id}`));
  }

  // Width and height
  const _size = nodeSize(node as any);
  // Width
  if (_size.width === "fill") {
    classList.push("w-full");
  } else if (_size.width === null) {
    classList.push("w-auto");
  } else {
    classList.push(pxToSize(_size.width as number, "w"));
  }
  // Height
  if (_size.height === "fill") {
    classList.push("h-full");
  } else if (_size.height === null) {
    classList.push("h-auto");
  } else {
    classList.push(pxToSize(_size.height as number, "h"));
  }

  // Background color
  const fill = getFillColor(node);
  if (fill) classList.push(colorToTailwind(fill, "bg"));

  // Check parent flex container
  const isParentFlex =
    parent && "layoutMode" in parent && (parent as any).layoutMode !== "NONE";
  if ("x" in node && "y" in node && !isParentFlex) {
    classList.push("absolute");
    classList.push(pxToPosition(node.x, "left"));
    classList.push(pxToPosition(node.y, "top"));
  }

  // Border radius
  if ("cornerRadius" in node) {
    const radiusClass = radiusToTailwind((node as any).cornerRadius);
    if (radiusClass) classList.push(radiusClass);
  }

  // Stroke/Border
  const stroke = getStroke(node);
  if (stroke) {
    if (stroke.position === "OUTSIDE") {
      const ringWidth = findClosest(stroke.width, borderWidthMap);
      if (ringWidth) classList.push(`ring-${ringWidth}`);
      else classList.push(`ring-[${stroke.width}px]`);
      const ringColor = colorToTailwind(stroke.color, "border").replace(
        /^border-/,
        "ring-",
      );
      classList.push(ringColor);
      if (stroke.opacity < 1) {
        const op = opacityToTailwind(stroke.opacity);
        if (op) classList.push(`ring-opacity-${op}`);
      }
    } else {
      classList.push(borderWidthToTailwind(stroke.width));
      classList.push(colorToTailwind(stroke.color, "border"));
      if (stroke.opacity < 1) {
        const op = opacityToTailwind(stroke.opacity);
        if (op) classList.push(`border-opacity-${op}`);
      }
      if (stroke.position === "INSIDE") {
        classList.push("stroke-inside");
      }
    }
  }

  // Layout grow / self alignment for auto-layout children
  if ((node as any).layoutGrow && (node as any).layoutGrow > 0) {
    classList.push("flex-1");
  }
  if ((node as any).layoutAlign) {
    const la = (node as any).layoutAlign;
    if (la === "MIN") classList.push("self-start");
    else if (la === "CENTER") classList.push("self-center");
    else if (la === "MAX") classList.push("self-end");
  }

  const shadowClass = effectShadowToTailwind(node);
  if (shadowClass) classList.push(shadowClass);

  return `${indent(level)}<${htmlTag} class="${classList
    .filter(Boolean)
    .join(" ")}"></${htmlTag}>\n`;
}

function convertTextNodeTailwind(
  node: TextNode,
  htmlTag: string,
  level: number,
  parent?: SceneNode,
) {
  const textClasses: string[] = [];

  if (node.name) {
    textClasses.push(nameToClass(node.name, `node-${node.id}`));
  }

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
      const lineHeightClass = pxToLineHeight(lineHeight.value, fontSize);
      if (lineHeightClass) textClasses.push(lineHeightClass);
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
      const letterSpacingClass = pxToLetterSpacing(
        letterSpacing.value,
        fontSize,
      );
      if (letterSpacingClass) textClasses.push(letterSpacingClass);
    }
  }

  // Opacity
  if ("opacity" in node) {
    const opacity = (node as any).opacity;
    if (opacity !== undefined && opacity < 1) {
      const opacityVal = opacityToTailwind(opacity);
      if (opacityVal) textClasses.push(`opacity-${opacityVal}`);
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
  parent?: SceneNode,
): string {
  const classList: string[] = [];

  if (node.name) {
    classList.push(nameToClass(node.name, `node-${node.id}`));
  }

  // Width and height
  const _size = nodeSize(node as any);
  if (_size.width === "fill") classList.push("w-full");
  else if (_size.width === null) classList.push("w-auto");
  else classList.push(pxToSize(_size.width as number, "w"));

  if (_size.height === "fill") classList.push("h-full");
  else if (_size.height === null) classList.push("h-auto");
  else classList.push(pxToSize(_size.height as number, "h"));

  // Positioning
  const isParentFlex =
    parent && "layoutMode" in parent && (parent as any).layoutMode !== "NONE";
  if ("x" in node && "y" in node && !isParentFlex) {
    classList.push("absolute");
    classList.push(pxToPosition(node.x, "left"));
    classList.push(pxToPosition(node.y, "top"));
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
    if (stroke.position === "OUTSIDE") {
      const ringWidth = findClosest(stroke.width, borderWidthMap);
      if (ringWidth) classList.push(`ring-${ringWidth}`);
      else classList.push(`ring-[${stroke.width}px]`);
      const ringColor = colorToTailwind(stroke.color, "border").replace(
        /^border-/,
        "ring-",
      );
      classList.push(ringColor);
      if (stroke.opacity < 1) {
        const op = opacityToTailwind(stroke.opacity);
        if (op) classList.push(`ring-opacity-${op}`);
      }
    } else {
      classList.push(borderWidthToTailwind(stroke.width));
      classList.push(colorToTailwind(stroke.color, "border"));
      if (stroke.opacity < 1) {
        const op = opacityToTailwind(stroke.opacity);
        if (op) classList.push(`border-opacity-${op}`);
      }
      if (stroke.position === "INSIDE") classList.push("stroke-inside");
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

  const shadowClass = effectShadowToTailwind(node);
  if (shadowClass) classList.push(shadowClass);

  let childrenHtml = "";
  for (const child of node.children) {
    childrenHtml += convertNodeTailwind(child, level + 1, node);
  }

  return `${indent(level)}<${htmlTag} class="${classList
    .filter(Boolean)
    .join(" ")}">\n${childrenHtml}${indent(level)}</${htmlTag}>\n`;
}

function convertNodeReactTailwind(node: SceneNode, level: number = 0): string {
  const tailwindHtml = convertNodeTailwind(node, level);
  return toReactTailwindComponent(tailwindHtml);
}

// === PROPERTY EXTRACTOR FOR UI ===
/* eslint-disable @typescript-eslint/no-explicit-any */
function getCommonRadius(node: SceneNode) {
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
  // corner radius - numeric fields
  out.cornerRadius = getCommonRadius(node);
  if ("padding" in node) out.padding = (node as any).padding;
  if ("gap" in node) out.gap = (node as any).gap;
  if ("itemSpacing" in node) out.itemSpacing = (node as any).itemSpacing;
  if ("layoutMode" in node) out.layoutMode = (node as any).layoutMode;
  if ("layoutGrow" in node) out.layoutGrow = (node as any).layoutGrow;
  if ("layoutAlign" in node) out.layoutAlign = (node as any).layoutAlign;

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
    if ((node as any).strokeAlign) out.strokeAlign = (node as any).strokeAlign;
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

// === CODEGEN MODE ===
// When Dev Mode asks, return HTML or Tailwind snippets for the selection.
if (figma.editorType === "dev" && figma.mode === "codegen") {
  figma.codegen.on("generate", ({ node, language }) => {
    if (!node) {
      return [
        {
          title: "HTML",
          language: "HTML",
          code: "<!-- No selection -->",
        },
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

    if (language === "REACT_TAILWIND") {
      return [
        {
          title: "React Tailwind",
          language: "JAVASCRIPT",
          code: convertNodeReactTailwind(node, 0),
        },
      ];
    }

    return [{ title: "HTML", language: "HTML", code: convertNode(node, 0) }];
  });
} else {
  // Allow editor UI to stay open
}
