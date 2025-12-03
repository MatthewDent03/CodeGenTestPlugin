// ======================================================
// SHOW UI ONLY IN PLUGIN MODE
// Initialize UI and post selection updates to the iframe.
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
// Return two-space indentation for the given level.
// ======================================================
function indent(level: number): string {
  return "  ".repeat(level);
}

// ======================================================
// COMPUTE MARGINS HELPER
// Compute top/left/right/bottom (px) of `node` relative to `parent`.
// ======================================================
function computeMargins(node: SceneNode, parent: SceneNode) {
  // assume both node and parent have x/y/width/height where applicable
  const top = "y" in node && "y" in parent ? node.y - parent.y : 0;
  const left = "x" in node && "x" in parent ? node.x - parent.x : 0;
  const right =
    "width" in parent && "x" in node && "x" in parent
      ? parent.width - (node.x - parent.x + (node as any).width)
      : 0;
  const bottom =
    "height" in parent && "y" in node && "y" in parent
      ? parent.height - (node.y - parent.y + (node as any).height)
      : 0;
  return { top, left, right, bottom };
}

// ======================================================
// GET FILL COLOR
// Return first solid fill as `#rrggbb` or null.
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
// GET BORDER
// Return first solid stroke as { color, width } or null.
// ======================================================
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

// ======================================================
// RAW CSS BUILDER
// Build inline CSS for a node (geometry, fill, stroke, rotation).
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

  if ("cornerRadius" in node && typeof node.cornerRadius === "number") {
    cssText += ` border-radius:${node.cornerRadius}px;`;
  }

  // Add margin relative to parent if available
  if (parent && "x" in parent && "y" in parent) {
    const m = computeMargins(node, parent);
    cssText += ` margin-top:${m.top}px; margin-left:${m.left}px; margin-right:${m.right}px; margin-bottom:${m.bottom}px;`;
  }

  return cssText;
}

// ======================================================
// SELECT TAG
// Map TEXT -> `p`, others -> `div`.
// ======================================================
function getTag(node: SceneNode): string {
  return node.type === "TEXT" ? "p" : "div";
}

// ======================================================
// HTML CONVERTER
// Emit HTML with inline CSS; simple styling only.
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
  let cssText = `width:${node.width}px; height:${node.height}px; position:absolute; left:${node.x}px; top:${node.y}px;`;

  const fill = getFillColor(node);
  if (fill) cssText += ` color:${fill};`;

  if (typeof node.fontSize === "number")
    cssText += ` font-size:${node.fontSize}px;`;

  if (node.fontName !== figma.mixed) {
    const font = node.fontName as FontName;
    cssText += ` font-family:'${font.family}';`;
  }

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

  // Add margin relative to parent
  if (parent && "x" in parent && "y" in parent) {
    const m = computeMargins(node as SceneNode, parent);
    cssText += ` margin-top:${m.top}px; margin-left:${m.left}px; margin-right:${m.right}px; margin-bottom:${m.bottom}px;`;
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

  // Add margin relative to parent
  if (parent && "x" in parent && "y" in parent) {
    const m = computeMargins(node as SceneNode, parent);
    cssText += ` margin-top:${m.top}px; margin-left:${m.left}px; margin-right:${m.right}px; margin-bottom:${m.bottom}px;`;
  }

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
// TAILWIND CONVERTER (with margin)
// Emit Tailwind utility classes.
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
  const widthClass = `w-[${node.width}px]`;
  const heightClass = `h-[${node.height}px]`;

  const fill = getFillColor(node);
  const stroke = getStroke(node);

  const classList = [widthClass, heightClass];

  if (fill) classList.push(`bg-[${fill}]`);

  if ("x" in node && "y" in node) {
    classList.push("absolute", `left-[${node.x}px]`, `top-[${node.y}px]`);
  }

  if ("cornerRadius" in node && !Number.isNaN(node.cornerRadius)) {
    classList.push(`rounded-[${String(node.cornerRadius)}px]`);
  }

  if (stroke) {
    classList.push(`border-[${stroke.width}px]`);
    classList.push(`border-[${stroke.color}]`);
  }

  // Margin relative to parent
  if (parent) {
    const m = computeMargins(node, parent);
    classList.push(`mt-[${m.top}px]`);
    classList.push(`ml-[${m.left}px]`);
    classList.push(`mr-[${m.right}px]`);
    classList.push(`mb-[${m.bottom}px]`);
  }

  return `${indent(level)}<${htmlTag} class="${classList.join(
    " "
  )}"></${htmlTag}>\n`;
}

function convertTextNodeTailwind(
  node: TextNode,
  htmlTag: string,
  level: number,
  parent?: SceneNode
) {
  const textClasses: string[] = [];

  const fill = getFillColor(node);
  if (fill) textClasses.push(`text-[${fill}]`);

  if (typeof node.fontSize === "number") {
    textClasses.push(`text-[${node.fontSize}px]`);
  }

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

  // Add margin classes relative to parent when available
  if (parent) {
    const m = computeMargins(node as SceneNode, parent);
    textClasses.push(
      `mt-[${m.top}px]`,
      `ml-[${m.left}px]`,
      `mr-[${m.right}px]`,
      `mb-[${m.bottom}px]`
    );
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
) {
  const classList = [`w-[${node.width}px]`, `h-[${node.height}px]`];

  if ("x" in node && "y" in node) {
    classList.push("absolute", `left-[${node.x}px]`, `top-[${node.y}px]`);
  } else {
    classList.push("relative");
  }

  const fill = getFillColor(node);
  if (fill) classList.push(`bg-[${fill}]`);

  // Margin relative to parent
  if (parent) {
    const m = computeMargins(node, parent);
    classList.push(`mt-[${m.top}px]`);
    classList.push(`ml-[${m.left}px]`);
    classList.push(`mr-[${m.right}px]`);
    classList.push(`mb-[${m.bottom}px]`);
  }

  let childrenHtml = "";
  for (const child of node.children) {
    childrenHtml += convertNodeTailwind(child, level + 1, node);
  }

  return `${indent(level)}<${htmlTag} class="${classList.join(
    " "
  )}">\n${childrenHtml}${indent(level)}</${htmlTag}>\n`;
}

// ======================================================
// PROPERTY EXTRACTOR FOR UI (with margin)
/* eslint-disable @typescript-eslint/no-explicit-any */
function extractNodeProperties(node: SceneNode) {
  const data: any = {
    id: node.id,
    name: node.name,
    type: node.type,
    width: node.width,
    height: node.height,
    x: "x" in node ? node.x : null,
    y: "y" in node ? node.y : null,
  };

  if ("fills" in node && Array.isArray(node.fills) && node.fills.length > 0) {
    const f = node.fills[0];
    if (f.type === "SOLID") {
      data.fill = f.color;
    }
  }

  if ("strokes" in node && node.strokes.length > 0) {
    const s = node.strokes[0];
    if (s.type === "SOLID") {
      data.stroke = {
        width: (node as any).strokeWeight,
        color: s.color,
      };
    }
  }

  if ("children" in node) {
    data.children = node.children.map((child) => {
      const childData: any = {
        id: child.id,
        type: child.type,
        name: child.name,
      };

      // Calculate margin relative to parent
      if ("x" in child && "y" in child) {
        childData.margin = {
          top: child.y - node.y,
          left: child.x - node.x,
          right: node.width - (child.x - node.x + (child as any).width),
          bottom: node.height - (child.y - node.y + (child as any).height),
        };
      }

      return childData;
    });
  }

  return data;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// ======================================================
// CODEGEN MODE
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
