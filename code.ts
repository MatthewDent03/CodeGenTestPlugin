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
// MARGIN HELPERS
// Figure out child margins relative to a parent node.
// ======================================================

function computeMargins(node: SceneNode, parent: SceneNode) {
  if (parent.type === "FRAME") {
    return computeMarginsWithFrame(node, parent);
  } else {
    return computeMarginsNotFrame(node, parent);
  }
}

function computeMarginsWithFrame(node: SceneNode, parent: SceneNode) {
  // node and parent have x/y/width/height
  const top = node.y;
  const left = node.x;
  const right = parent.width - node.width - left;
  const bottom = parent.height - node.height - top;
  const x = { top, left, right, bottom };
  console.log(node, parent, x);
  return x;
}

function computeMarginsNotFrame(node: SceneNode, parent: SceneNode) {
  // node and parent have x/y/width/height
  const top = node.y - parent.y;
  const left = node.x - parent.x;
  const right = parent.width - (node.x - parent.x + node.width);
  const bottom = parent.height - (node.y - parent.y + node.height);
  return { top, left, right, bottom };
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
// solid stroke as { color, width } or null
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
// INLINE CSS BUILDER
// Size, position, fill, stroke, rotation, radius, margins as style text.
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
    const margin = computeMargins(node, parent);
    cssText += ` margin-top:${margin.top}px; margin-left:${margin.left}px; margin-right:${margin.right}px; margin-bottom:${margin.bottom}px;`;
  }

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
// TAILWIND CONVERTER (WITH MARGINS)
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
    const margin = computeMargins(node, parent);
    classList.push(`mt-[${margin.top}px]`);
    classList.push(`ml-[${margin.left}px]`);
    classList.push(`mr-[${margin.right}px]`);
    classList.push(`mb-[${margin.bottom}px]`);
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
    const margin = computeMargins(node as SceneNode, parent);
    textClasses.push(
      `mt-[${margin.top}px]`,
      `ml-[${margin.left}px]`,
      `mr-[${margin.right}px]`,
      `mb-[${margin.bottom}px]`
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
    const margin = computeMargins(node, parent);
    classList.push(`mt-[${margin.top}px]`);
    classList.push(`ml-[${margin.left}px]`);
    classList.push(`mr-[${margin.right}px]`);
    classList.push(`mb-[${margin.bottom}px]`);
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
// PROPERTY EXTRACTOR FOR UI (WITH MARGINS)
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

  // Children: include computed margin
  if ("children" in node) {
    out.children = (node as any).children.map((child: SceneNode) => {
      const childOut: any = extractNodeProperties(child as SceneNode);
      // compute margin relative to this node
      if ("x" in child && "y" in child && "x" in node && "y" in node) {
        const m = computeMargins(child as SceneNode, node as SceneNode);
        childOut.margin = m;
      }
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
