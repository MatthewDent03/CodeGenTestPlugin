// ======================================================
// INDENT HELPER
// ======================================================
function indent(level: number): string {
  return "  ".repeat(level);
}

// ======================================================
// COLOR (FILL)
// ======================================================
function getFillColor(node: SceneNode): string | null {
  if ("fills" in node && Array.isArray(node.fills) && node.fills.length > 0) {
    const fillPaint = node.fills[0];
    if (fillPaint.type === "SOLID") {
      const r = Math.round(fillPaint.color.r * 255);
      const g = Math.round(fillPaint.color.g * 255);
      const b = Math.round(fillPaint.color.b * 255);
      return `#${r.toString(16).padStart(2, "0")}${g
        .toString(16)
        .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
    }
  }
  return null;
}

// ======================================================
// BORDER (STROKE)
// ======================================================
function getStroke(node: SceneNode): { color: string; width: number } | null {
  if (
    "strokes" in node &&
    Array.isArray(node.strokes) &&
    node.strokes.length > 0
  ) {
    const strokePaint = node.strokes[0] as SolidPaint;

    if (strokePaint.type === "SOLID") {
      const r = Math.round(strokePaint.color.r * 255);
      const g = Math.round(strokePaint.color.g * 255);
      const b = Math.round(strokePaint.color.b * 255);
      const hexColor = `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`;
      const width = (node as any).strokeWeight || 1;
      return { color: hexColor, width };
    }
  }
  return null;
}

// ======================================================
// BUILD RAW CSS STYLES
// ======================================================
function buildCSS(node: SceneNode): string {
  let css = "";

  css += `width:${node.width}px;`;
  css += ` height:${node.height}px;`;

  if ("x" in node && "y" in node) {
    css += " position:absolute;";
    css += ` left:${node.x}px; top:${node.y}px;`;
  }

  const fillColor = getFillColor(node);
  if (fillColor) css += ` background:${fillColor};`;

  const stroke = getStroke(node);
  if (stroke) css += ` border:${stroke.width}px solid ${stroke.color};`;

  if (
    "rotation" in node &&
    typeof node.rotation === "number" &&
    node.rotation !== 0
  ) {
    css += ` transform:rotate(${-node.rotation}deg); transform-origin:left top;`;
  }

  if (
    "cornerRadius" in node &&
    typeof node.cornerRadius === "number" &&
    node.cornerRadius > 0
  ) {
    css += ` border-radius:${node.cornerRadius}px;`;
  }

  return css;
}

// ======================================================
// SELECT HTML TAG (DIV or P)
// ======================================================
function getTag(node: SceneNode): string {
  return node.type === "TEXT" ? "p" : "div";
}

// ======================================================
// HTML CONVERTER (WITH ABSOLUTE FIX)
// ======================================================
function convertNode(node: SceneNode, level: number = 0): string {
  const tag = getTag(node);

  // --------------------------------------------
  // TEXT NODE
  // --------------------------------------------
  if (node.type === "TEXT") {
    const textNode = node as TextNode;
    const textValue = textNode.characters ?? "";

    let css = "";
    css += `width:${node.width}px; height:${node.height}px; position:absolute;`;
    css += ` left:${Math.round(node.x)}px; top:${Math.round(node.y)}px;`;

    const fillColor = getFillColor(node);
    if (fillColor) css += ` color:${fillColor};`;

    if (typeof textNode.fontSize === "number") {
      css += ` font-size:${textNode.fontSize}px;`;
    }

    if (textNode.fontName !== figma.mixed) {
      const font = textNode.fontName as FontName;
      css += ` font-family:'${font.family}';`;

      if (typeof (textNode as any).fontWeight === "number") {
        css += ` font-weight:${(textNode as any).fontWeight};`;
      }
    }

    switch (textNode.textAlignHorizontal) {
      case "CENTER":
        css += " text-align:center;";
        break;
      case "RIGHT":
        css += " text-align:right;";
        break;
      default:
        css += " text-align:left;";
    }

    return `${indent(level)}<${tag} style="${css}">${textValue}</${tag}>\n`;
  }

  // --------------------------------------------
  // FRAME / CONTAINER (FIXED: NOW ABSOLUTE)
  // --------------------------------------------
  if ("children" in node && node.children.length > 0) {
    let frameCSS = `position:absolute; width:${node.width}px; height:${node.height}px;`;

    frameCSS += ` left:${Math.round(node.x)}px; top:${Math.round(node.y)}px;`;

    const fillColor = getFillColor(node);
    if (fillColor) frameCSS += ` background:${fillColor};`;

    const stroke = getStroke(node);
    if (stroke) frameCSS += ` border:${stroke.width}px solid ${stroke.color};`;

    const frame = node as any;

    if (frame.paddingTop) frameCSS += ` padding-top:${frame.paddingTop}px;`;
    if (frame.paddingBottom)
      frameCSS += ` padding-bottom:${frame.paddingBottom}px;`;
    if (frame.paddingLeft) frameCSS += ` padding-left:${frame.paddingLeft}px;`;
    if (frame.paddingRight)
      frameCSS += ` padding-right:${frame.paddingRight}px;`;
    if (frame.itemSpacing) frameCSS += ` gap:${frame.itemSpacing}px;`;

    let childHTML = "";
    for (const child of node.children) {
      childHTML += convertNode(child as SceneNode, level + 1);
    }

    return (
      `${indent(level)}<${tag} class="frame" style="${frameCSS}">\n` +
      childHTML +
      `${indent(level)}</${tag}>\n`
    );
  }

  // --------------------------------------------
  // SIMPLE RECTANGLE / SHAPE
  // --------------------------------------------
  return `${indent(level)}<${tag} class="item" style="${buildCSS(
    node
  )}"></${tag}>\n`;
}

// ======================================================
// TAILWIND CONVERTER (ALREADY WORKING CORRECTLY)
// ======================================================
function convertNodeTailwind(node: SceneNode, level: number = 0): string {
  const tag = getTag(node);
  const widthClass = `w-[${node.width}px]`;
  const heightClass = `h-[${node.height}px]`;

  const fillColor = getFillColor(node);
  const classList = [widthClass, heightClass];

  if (fillColor) classList.push(`bg-[${fillColor}]`);

  if ("x" in node && "y" in node) {
    classList.push("absolute");
    classList.push(`left-[${Math.round(node.x)}px]`);
    classList.push(`top-[${Math.round(node.y)}px]`);
  }

  if ("rotation" in node && node.rotation !== 0) {
    classList.push(`rotate-[${-node.rotation}deg]`);
    classList.push("origin-top-left");
  }

  if (
    "cornerRadius" in node &&
    typeof node.cornerRadius === "number" &&
    node.cornerRadius > 0
  ) {
    classList.push(`rounded-[${node.cornerRadius}px]`);
  }

  const stroke = getStroke(node);
  if (stroke) {
    classList.push(`border-[${stroke.width}px]`);
    classList.push(`border-[${stroke.color}]`);
  }

  // --------------------------------------------
  // TEXT NODE
  // --------------------------------------------
  if (node.type === "TEXT") {
    const textNode = node as TextNode;
    const textValue = textNode.characters ?? "";

    const filteredClasses = classList.filter((c) => !c.startsWith("bg-"));

    if (fillColor) filteredClasses.push(`text-[${fillColor}]`);

    if (typeof textNode.fontSize === "number") {
      filteredClasses.push(`text-[${textNode.fontSize}px]`);
    }

    if (textNode.fontName !== figma.mixed) {
      const font = textNode.fontName as FontName;
      filteredClasses.push(`font-['${font.family}']`);
    }

    if (typeof (textNode as any).fontWeight === "number") {
      filteredClasses.push(`font-[${(textNode as any).fontWeight}]`);
    }

    switch (textNode.textAlignHorizontal) {
      case "CENTER":
        filteredClasses.push("text-center");
        break;
      case "RIGHT":
        filteredClasses.push("text-right");
        break;
      default:
        filteredClasses.push("text-left");
    }

    return `${indent(level)}<${tag} class="${filteredClasses.join(
      " "
    )}">${textValue}</${tag}>\n`;
  }

  // --------------------------------------------
  // FRAME / GROUP
  // --------------------------------------------
  if ("children" in node && node.children.length > 0) {
    const containerClasses = [];

    containerClasses.push(widthClass, heightClass);

    if ("x" in node && "y" in node) {
      containerClasses.push("absolute");
      containerClasses.push(`left-[${Math.round(node.x)}px]`);
      containerClasses.push(`top-[${Math.round(node.y)}px]`);
    } else {
      containerClasses.push("relative");
    }

    if (fillColor) containerClasses.push(`bg-[${fillColor}]`);

    const frame = node as any;

    if (frame.paddingTop) containerClasses.push(`pt-[${frame.paddingTop}px]`);
    if (frame.paddingBottom)
      containerClasses.push(`pb-[${frame.paddingBottom}px]`);
    if (frame.paddingLeft) containerClasses.push(`pl-[${frame.paddingLeft}px]`);
    if (frame.paddingRight)
      containerClasses.push(`pr-[${frame.paddingRight}px]`);

    if (frame.itemSpacing)
      containerClasses.push(`gap-[${frame.itemSpacing}px]`);

    let innerHTML = "";
    for (const child of node.children) {
      innerHTML += convertNodeTailwind(child as SceneNode, level + 1);
    }

    return (
      `${indent(level)}<${tag} class="${containerClasses.join(" ")}">\n` +
      innerHTML +
      `${indent(level)}</${tag}>\n`
    );
  }

  return `${indent(level)}<${tag} class="${classList.join(" ")}"></${tag}>\n`;
}

// ======================================================
// CODEGEN HANDLER
// ======================================================
if (figma.editorType === "dev" && figma.mode === "codegen") {
  figma.codegen.on("generate", ({ node, language }) => {
    if (!node) {
      return [
        { title: "HTML", language: "HTML", code: "<!-- No layer selected -->" },
      ];
    }

    if (language === "HTML") {
      return [
        {
          title: "HTML",
          language: "HTML",
          code: convertNode(node as SceneNode, 0),
        },
      ];
    }

    if (language === "TAILWIND_HTML") {
      return [
        {
          title: "Tailwind HTML",
          language: "HTML",
          code: convertNodeTailwind(node as SceneNode, 0),
        },
      ];
    }

    return [
      {
        title: "HTML",
        language: "HTML",
        code: convertNode(node as SceneNode, 0),
      },
    ];
  });
} else {
  figma.closePlugin();
}
