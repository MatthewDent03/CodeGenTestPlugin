// --------------------------------------------------------------
// SHOW UI ONLY WHEN RUNNING AS A NORMAL PLUGIN (not codegen)
// --------------------------------------------------------------
if (figma.editorType === "figma") {
  // Load ui.html with a fixed window size
  figma.showUI(__uiFiles__.main, { width: 320, height: 400 });

  // Listen for selection changes inside the canvas
  figma.on("selectionchange", () => {
    const node = figma.currentPage.selection[0];

    // Nothing selected - tell the UI
    if (!node) {
      figma.ui.postMessage({ type: "no-selection" });
      return;
    }

    // Extract readable properties and send to UI
    const props = extractNodeProperties(node);
    figma.ui.postMessage({
      type: "selection-update",
      data: props,
    });
  });
}

// --------------------------------------------------------------
// UI MESSAGE HANDLER (selection commands, set-fill, etc.)
// --------------------------------------------------------------
function hexToRgbNormalized(hex: string) {
  const cleaned = hex.replace("#", "");
  const red = parseInt(cleaned.slice(0, 2), 16) / 255;
  const green = parseInt(cleaned.slice(2, 4), 16) / 255;
  const blue = parseInt(cleaned.slice(4, 6), 16) / 255;
  return { r: red, g: green, b: blue };
}

figma.ui.onmessage = async (message) => {
  if (!message || typeof message.type !== "string") return;

  if (
    message.type === "set-fill" &&
    typeof message.id === "string" &&
    typeof message.color === "string"
  ) {
    try {
      const node = (await figma.getNodeByIdAsync(message.id)) as SceneNode;
      if (!node) throw new Error("Node not found");

      // Only support setting a single SOLID fill (hex only, no alpha)
      const rgb = hexToRgbNormalized(message.color);
      const paint: SolidPaint = { type: "SOLID", color: rgb } as SolidPaint;

      if ("fills" in node) {
        (node as any).fills = [paint];
      } else {
        throw new Error("Node does not support fills");
      }

      // Select and scroll into view so the user sees the change
      figma.currentPage.selection = [node];
      figma.viewport.scrollAndZoomIntoView([node]);

      // Confirm back to UI
      figma.ui.postMessage({
        type: "set-fill-done",
        id: message.id,
        color: message.color,
      });
    } catch (err) {
      figma.ui.postMessage({
        type: "error",
        message: (err as Error).message || "set-fill failed",
      });
    }
  }
};

// --------------------------------------------------------------
// SIMPLE INDENT FUNCTION FOR HTML OUTPUT
// --------------------------------------------------------------
function indent(level: number): string {
  return "  ".repeat(level);
}

// --------------------------------------------------------------
// EXTRACT FIRST FILL COLOR (SOLID ONLY)
// Returns hex value or null
// --------------------------------------------------------------
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

// --------------------------------------------------------------
// EXTRACT FIRST STROKE (SOLID ONLY)
// Returns border width + hex color or null
// --------------------------------------------------------------
function getStroke(node: SceneNode): { color: string; width: number } | null {
  if ("strokes" in node && node.strokes.length > 0) {
    const paint = node.strokes[0];
    if (paint.type === "SOLID") {
      const red = Math.round(paint.color.r * 255);
      const green = Math.round(paint.color.g * 255);
      const blue = Math.round(paint.color.b * 255);
      return {
        color: `#${red.toString(16)}${green.toString(16)}${blue.toString(16)}`,
        width: (node as any).strokeWeight || 1,
      };
    }
  }
  return null;
}

// --------------------------------------------------------------
// BUILD INLINE CSS FOR BASIC SHAPES/FRAMES
// --------------------------------------------------------------
function buildCSS(node: SceneNode): string {
  let cssText = `width:${node.width}px; height:${node.height}px;`;

  // Absolute position
  if ("x" in node && "y" in node) {
    cssText += ` position:absolute; left:${node.x}px; top:${node.y}px;`;
  }

  // Background
  const fill = getFillColor(node);
  if (fill) cssText += ` background:${fill};`;

  // Border
  const stroke = getStroke(node);
  if (stroke) cssText += ` border:${stroke.width}px solid ${stroke.color};`;

  // Rotation
  if ("rotation" in node && node.rotation !== 0) {
    cssText += ` transform:rotate(${-node.rotation}deg); transform-origin:left top;`;
  }

  // Corner radius
  if ("cornerRadius" in node && typeof node.cornerRadius === "number") {
    cssText += ` border-radius:${node.cornerRadius}px;`;
  }

  return cssText;
}

// --------------------------------------------------------------
// DECIDE HTML TAG BASED ON NODE TYPE
// --------------------------------------------------------------
function getTag(node: SceneNode): string {
  return node.type === "TEXT" ? "p" : "div";
}

// --------------------------------------------------------------
// CONVERT NODE TO HTML
// --------------------------------------------------------------
function convertNode(node: SceneNode, level: number = 0): string {
  const htmlTag = getTag(node);

  if (node.type === "TEXT") {
    return convertTextNodeHTML(node as TextNode, htmlTag, level);
  }

  if ("children" in node && node.children.length > 0) {
    return convertFrameHTML(node as FrameNode, htmlTag, level);
  }

  // shape (rectangle, line, etc.)
  return `${indent(level)}<${htmlTag} style="${buildCSS(
    node
  )}"></${htmlTag}>\n`;
}

// --------------------------------------------------------------
// TEXT NODE to HTML <p>
// --------------------------------------------------------------
function convertTextNodeHTML(
  node: TextNode,
  htmlTag: string,
  level: number
): string {
  let cssText = `width:${node.width}px; height:${node.height}px; position:absolute; left:${node.x}px; top:${node.y}px;`;

  // Fill color
  const fill = getFillColor(node);
  if (fill) cssText += ` color:${fill};`;

  // Font size
  if (typeof node.fontSize === "number")
    cssText += ` font-size:${node.fontSize}px;`;

  // Font family
  if (node.fontName !== figma.mixed) {
    const font = node.fontName as FontName;
    cssText += ` font-family:'${font.family}';`;
  }

  // Text alignment
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

// --------------------------------------------------------------
// FRAME to HTML <div> WITH CHILDREN
// --------------------------------------------------------------
function convertFrameHTML(
  node: FrameNode,
  htmlTag: string,
  level: number
): string {
  let cssText = `position:absolute; width:${node.width}px; height:${node.height}px; left:${node.x}px; top:${node.y}px;`;

  const fill = getFillColor(node);
  if (fill) cssText += ` background:${fill};`;

  const stroke = getStroke(node);
  if (stroke) cssText += ` border:${stroke.width}px solid ${stroke.color};`;

  // Render all children under this frame
  let childrenHTML = "";
  for (const child of node.children) {
    childrenHTML += convertNode(child, level + 1);
  }

  return `${indent(
    level
  )}<${htmlTag} class="frame" style="${cssText}">\n${childrenHTML}${indent(
    level
  )}</${htmlTag}>\n`;
}

// --------------------------------------------------------------
// TAILWIND CONVERTER
// --------------------------------------------------------------
function convertNodeTailwind(node: SceneNode, level: number = 0): string {
  const htmlTag = getTag(node);

  if (node.type === "TEXT") {
    return convertTextNodeTailwind(node as TextNode, htmlTag, level);
  }

  if ("children" in node && node.children.length > 0) {
    return convertFrameTailwind(node as FrameNode, htmlTag, level);
  }

  return convertShapeTailwind(node, htmlTag, level);
}

// --------------------------------------------------------------
// SHAPE - Tailwind <div>
// --------------------------------------------------------------
function convertShapeTailwind(
  node: SceneNode,
  htmlTag: string,
  level: number
): string {
  const width = `w-[${node.width}px]`;
  const height = `h-[${node.height}px]`;

  const fill = getFillColor(node);
  const stroke = getStroke(node);

  const classes = [width, height];

  if (fill) classes.push(`bg-[${fill}]`);

  if ("x" in node && "y" in node) {
    classes.push("absolute", `left-[${node.x}px]`, `top-[${node.y}px]`);
  }

  if ("cornerRadius" in node && !Number.isNaN(node.cornerRadius)) {
    classes.push(`rounded-[${String(node.cornerRadius)}px]`);
  }

  if (stroke) {
    classes.push(`border-[${stroke.width}px]`, `border-[${stroke.color}]`);
  }

  return `${indent(level)}<${htmlTag} class="${classes.join(
    " "
  )}"></${htmlTag}>\n`;
}

// --------------------------------------------------------------
// TEXT NODE - Tailwind
// --------------------------------------------------------------
function convertTextNodeTailwind(
  node: TextNode,
  htmlTag: string,
  level: number
) {
  const textClasses: string[] = [];

  const fill = getFillColor(node);
  if (fill) textClasses.push(`text-[${fill}]`);

  if (typeof node.fontSize === "number")
    textClasses.push(`text-[${node.fontSize}px]`);

  if (node.fontName !== figma.mixed) {
    const font = node.fontName as FontName;
    textClasses.push(`font-['${font.family}']`);
  }

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

// --------------------------------------------------------------
// FRAME - Tailwind
// --------------------------------------------------------------
function convertFrameTailwind(node: FrameNode, htmlTag: string, level: number) {
  const classes = [`w-[${node.width}px]`, `h-[${node.height}px]`];

  if ("x" in node && "y" in node) {
    classes.push("absolute", `left-[${node.x}px]`, `top-[${node.y}px]`);
  } else {
    classes.push("relative");
  }

  const fill = getFillColor(node);
  if (fill) classes.push(`bg-[${fill}]`);

  let childrenHTML = "";
  for (const child of node.children) {
    childrenHTML += convertNodeTailwind(child, level + 1);
  }

  return `${indent(level)}<${htmlTag} class="${classes.join(
    " "
  )}">\n${childrenHTML}${indent(level)}</${htmlTag}>\n`;
}

// --------------------------------------------------------------
// EXTRACT PROPERTIES FOR UI PANEL
// --------------------------------------------------------------
/* eslint-disable @typescript-eslint/no-explicit-any */
function extractNodeProperties(node: SceneNode) {
  const data: Record<string, any> = {
    id: node.id,
    name: node.name,
    type: node.type,
    width: typeof node.width === "number" ? node.width : null,
    height: typeof node.height === "number" ? node.height : null,
    x:
      "x" in node && typeof (node as any).x === "number"
        ? (node as any).x
        : null,
    y:
      "y" in node && typeof (node as any).y === "number"
        ? (node as any).y
        : null,
    rotation:
      "rotation" in node && typeof (node as any).rotation === "number"
        ? (node as any).rotation
        : 0,
  };

  // fills -> normalized hex or null
  if (
    "fills" in node &&
    Array.isArray((node as any).fills) &&
    (node as any).fills.length > 0
  ) {
    const paint = (node as any).fills[0];
    if (paint && paint.type === "SOLID" && paint.color) {
      const red = Math.round(paint.color.r * 255);
      const green = Math.round(paint.color.g * 255);
      const blue = Math.round(paint.color.b * 255);
      data.fill = `#${red.toString(16).padStart(2, "0")}${green
        .toString(16)
        .padStart(2, "0")}${blue.toString(16).padStart(2, "0")}`;
    } else {
      data.fill = null;
    }
  }

  // If the node itself had no fill (GROUPs commonly don't), try to
  // infer a background from its children (heuristic: first child with a SOLID fill)
  if (
    (typeof data.fill === "undefined" || data.fill === null) &&
    "children" in node &&
    Array.isArray((node as any).children) &&
    node.children.length > 0
  ) {
    for (const child of node.children) {
      const childFill = getFillColor(child as SceneNode);
      if (childFill) {
        data.fill = childFill; // use first found child fill as a fallback
        break;
      }
    }
  }

  // Text-specific
  if (node.type === "TEXT") {
    const textNode = node as TextNode;
    data.characters = textNode.characters;
    data.fontSize =
      typeof textNode.fontSize === "number" ? textNode.fontSize : null;
    if (textNode.fontName !== figma.mixed) {
      const font = textNode.fontName as FontName;
      data.fontFamily = font.family;
      data.fontStyle = font.style;
    }
    data.textAlignHorizontal = textNode.textAlignHorizontal || null;
  }

  // children list (just IDs+names for the UI)
  if ("children" in node && Array.isArray((node as any).children)) {
    data.children = node.children.map((child) => ({
      id: child.id,
      name: child.name,
      type: child.type,
      // optionally include width/height/x/y if you want nested details:
      width: (child as any).width ?? null,
      height: (child as any).height ?? null,
      x: (child as any).x ?? null,
      y: (child as any).y ?? null,
      // include child's fill (null if none) so UI can inspect child fills
      fill: getFillColor(child as SceneNode),
    }));
  } else {
    data.children = [];
  }

  return data;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// --------------------------------------------------------------
// CODEGEN MODE — RETURN HTML OR TAILWIND
// --------------------------------------------------------------
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

    // Default fallback
    return [{ title: "HTML", language: "HTML", code: convertNode(node, 0) }];
  });
}
