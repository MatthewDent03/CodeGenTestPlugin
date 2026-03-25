import { findClosest } from "./findClosest";

// === Shadow radius mapping ===
const shadowRadiusMap: Record<number, string> = {
  0: "none",
  2: "sm",
  3: "",
  6: "md",
  10: "lg",
  15: "xl",
  25: "2xl",
};

export function effectShadowToTailwind(node: SceneNode): string {
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

export function shadowEffectsFromToken(tokenName: string): any[] | null {
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
        spread: -4,
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
