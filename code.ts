// ======================================================
// SHOW UI ONLY IN PLUGIN MODE
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
// ======================================================
function indent(level: number): string {
  return "  ".repeat(level);
}

// ======================================================
// GET FILL COLOR
// ======================================================
function getFillColor(node: SceneNode): string | null {
  if ("fills" in node && Array.isArray(node.fills) && node.fills.length > 0) {
    const paint = node.fills[0];
    if (paint.type === "SOLID") {
      const r = Math.round(paint.color.r * 255);
      const g = Math.round(paint.color.g * 255);
      const b = Math.round(paint.color.b * 255);
      return `#${r.toString(16).padStart(2, "0")}${g
        .toString(16)
        .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
    }
  }
  return null;
}

// ======================================================
// GET BORDER
// ======================================================
function getStroke(node: SceneNode): { color: string; width: number } | null {
  if ("strokes" in node && node.strokes.length > 0) {
    const paint = node.strokes[0];
    if (paint.type === "SOLID") {
      const r = Math.round(paint.color.r * 255);
      const g = Math.round(paint.color.g * 255);
      const b = Math.round(paint.color.b * 255);
      return {
        color: `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`,
        width: (node as any).strokeWeight || 1,
      };
    }
  }
  return null;
}

// ======================================================
// RAW CSS BUILDER
// ======================================================
function buildCSS(node: SceneNode): string {
  let css = `width:${node.width}px; height:${node.height}px;`;

  if ("x" in node && "y" in node) {
    css += ` position:absolute; left:${node.x}px; top:${node.y}px;`;
  }

  const fill = getFillColor(node);
  if (fill) css += ` background:${fill};`;

  const stroke = getStroke(node);
  if (stroke) css += ` border:${stroke.width}px solid ${stroke.color};`;

  if ("rotation" in node && node.rotation !== 0) {
    css += ` transform:rotate(${-node.rotation}deg); transform-origin:left top;`;
  }

  if ("cornerRadius" in node && typeof node.cornerRadius === "number") {
    css += ` border-radius:${node.cornerRadius}px;`;
  }

  return css;
}

// ======================================================
// SELECT TAG
// ======================================================
function getTag(node: SceneNode): string {
  return node.type === "TEXT" ? "p" : "div";
}

// ======================================================
// HTML CONVERTER
// ======================================================
function convertNode(node: SceneNode, level: number = 0): string {
  const tag = getTag(node);

  if (node.type === "TEXT") {
    return convertTextNodeHTML(node as TextNode, tag, level);
  }

  if ("children" in node && node.children.length > 0) {
    return convertFrameHTML(node as FrameNode, tag, level);
  }

  return `${indent(level)}<${tag} style="${buildCSS(node)}"></${tag}>\n`;
}

function convertTextNodeHTML(
  node: TextNode,
  tag: string,
  level: number
): string {
  let css = `width:${node.width}px; height:${node.height}px; position:absolute; left:${node.x}px; top:${node.y}px;`;

  const fill = getFillColor(node);
  if (fill) css += ` color:${fill};`;

  if (typeof node.fontSize === "number")
    css += ` font-size:${node.fontSize}px;`;

  if (node.fontName !== figma.mixed) {
    const font = node.fontName as FontName;
    css += ` font-family:'${font.family}';`;
  }

  switch (node.textAlignHorizontal) {
    case "CENTER":
      css += " text-align:center;";
      break;
    case "RIGHT":
      css += " text-align:right;";
      break;
    default:
      css += " text-align:left;";
  }

  return `${indent(level)}<${tag} style="${css}">${node.characters}</${tag}>\n`;
}

function convertFrameHTML(node: FrameNode, tag: string, level: number): string {
  let css = `position:absolute; width:${node.width}px; height:${node.height}px; left:${node.x}px; top:${node.y}px;`;

  const fill = getFillColor(node);
  if (fill) css += ` background:${fill};`;

  const stroke = getStroke(node);
  if (stroke) css += ` border:${stroke.width}px solid ${stroke.color};`;

  let childrenHTML = "";
  for (const child of node.children) {
    childrenHTML += convertNode(child, level + 1);
  }

  return `${indent(
    level
  )}<${tag} class="frame" style="${css}">\n${childrenHTML}${indent(
    level
  )}</${tag}>\n`;
}

// ======================================================
// TAILWIND CONVERTER
// ======================================================
function convertNodeTailwind(node: SceneNode, level: number = 0): string {
  const tag = getTag(node);

  if (node.type === "TEXT") {
    return convertTextNodeTailwind(node as TextNode, tag, level);
  }

  if ("children" in node && node.children.length > 0) {
    return convertFrameTailwind(node as FrameNode, tag, level);
  }

  return convertShapeTailwind(node, tag, level);
}

function convertShapeTailwind(
  node: SceneNode,
  tag: string,
  level: number
): string {
  const widthClass = `w-[${node.width}px]`;
  const heightClass = `h-[${node.height}px]`;

  const fill = getFillColor(node);
  const stroke = getStroke(node);

  const classes = [widthClass, heightClass];

  if (fill) classes.push(`bg-[${fill}]`);

  if ("x" in node && "y" in node) {
    classes.push("absolute", `left-[${node.x}px]`, `top-[${node.y}px]`);
  }

  if ("cornerRadius" in node && !Number.isNaN(node.cornerRadius)) {
    classes.push(`rounded-[${String(node.cornerRadius)}px]`);
  }

  if (stroke) {
    classes.push(`border-[${stroke.width}px]`);
    classes.push(`border-[${stroke.color}]`);
  }

  return `${indent(level)}<${tag} class="${classes.join(" ")}"></${tag}>\n`;
}

function convertTextNodeTailwind(node: TextNode, tag: string, level: number) {
  const base = convertShapeTailwind(node, tag, level);
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

  return `${indent(level)}<${tag} class="${textClasses.join(" ")}">${
    node.characters
  }</${tag}>\n`;
}

function convertFrameTailwind(node: FrameNode, tag: string, level: number) {
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

  return `${indent(level)}<${tag} class="${classes.join(
    " "
  )}">\n${childrenHTML}${indent(level)}</${tag}>\n`;
}

// ======================================================
// PROPERTY EXTRACTOR FOR UI
// ======================================================
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
    data.children = node.children.map((child) => ({
      id: child.id,
      type: child.type,
      name: child.name,
    }));
  }

  return data;
}

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
