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
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    "2xl": "40px",
    "3xl": "48px",
    "4xl": "64px",
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

// Converts all raw Tailwind tokens to W3C Design Token Format
export const TAILWIND_TOKENS = toW3CTokens(RAW_TAILWIND_TOKENS);

/**
 * TokenRegistry manages access to design tokens
 */
export class TokenRegistry {
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
export const tokenRegistry = new TokenRegistry(TAILWIND_TOKENS);
