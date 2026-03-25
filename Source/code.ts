import { toReactTailwindComponent } from "./main/codegen/reactTailwind";
import { findClosest } from "./main/utils/findClosest";
import { nameToClass } from "./main/utils/nameToClass";
import {
  pxToSize,
  pxToFontSize,
  pxToLineHeight,
  pxToLetterSpacing,
  pxToSpacing,
  pxToPosition,
} from "./main/converters/tailwindConverters";
import {
  paddingToTailwind,
  radiusToTailwind,
  borderWidthToTailwind,
  opacityToTailwind,
  colorToTailwind as formatColorToTailwind,
} from "./main/formatters/tailwindFormatters";
import { hexToFigmaColor, colorDistance } from "./main/utils/colorHelpers";
import {
  indent,
  getFillColor,
  getStroke,
  getPaddingCSS,
  getBorderRadiusCSS,
  getFlexGapCSS,
  getOpacityCSS,
  getShadowCSS,
} from "./main/utils/cssHelpers";
import {
  getFontWeightAndStyle,
  getAlignmentClasses,
  getWrappingClasses,
  layoutModeToTailwind,
} from "./main/utils/layoutHelpers";
import {
  effectShadowToTailwind,
  shadowEffectsFromToken,
} from "./main/utils/effectsHelpers";
import {
  nodeSize,
  getTag,
  extractNodeProperties,
} from "./main/utils/nodeProperties";
import { tailwindColorMap } from "./main/tokens/tailwindColorMap";
import { tokenRegistry } from "./main/tokens/tailwindTokenRegistry";

// === Border width mapping ===
const borderWidthMap: Record<number, string> = {
  1: "1",
  2: "2",
  4: "4",
  8: "8",
};

/**
 * Convert a hex color to its closest Tailwind CSS class name
 * Performs exact match first, then falls back to closest color
 */
function colorToTailwind(
  hexColor: string,
  colorType: "bg" | "text" | "border" = "text",
): string {
  return formatColorToTailwind(
    hexColor,
    tailwindColorMap,
    colorDistance,
    colorType,
  );
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
