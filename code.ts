// =======================
// INDENT HELPER
// =======================
function indent(level: number): string {
  return "  ".repeat(level);
}

// =======================
// COLOR (FILL)
// =======================
function getFillColor(node: SceneNode): string | null {
  if ("fills" in node && Array.isArray(node.fills) && node.fills.length > 0) {
    const fill = node.fills[0];
    if (fill.type === "SOLID") {
      const r = Math.round(fill.color.r * 255);
      const g = Math.round(fill.color.g * 255);
      const b = Math.round(fill.color.b * 255);
      const hexR = r.toString(16).padStart(2, "0");
      const hexG = g.toString(16).padStart(2, "0");
      const hexB = b.toString(16).padStart(2, "0");
      return `#${hexR}${hexG}${hexB}`;
    }
  }
  return null;
}

// =======================
// BORDER (STROKE)
// =======================
function getStroke(node: SceneNode): { color: string; width: number } | null {
  if (
    "strokes" in node &&
    Array.isArray(node.strokes) &&
    node.strokes.length > 0
  ) {
    const s = node.strokes[0] as SolidPaint;
    if (s.type === "SOLID") {
      const r = Math.round(s.color.r * 255);
      const g = Math.round(s.color.g * 255);
      const b = Math.round(s.color.b * 255);
      const color = `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`;
      const width = (node as any).strokeWeight || 1;
      return { color, width };
    }
  }
  return null;
}

// =======================
// BUILD RAW CSS
// =======================
function buildCSS(node: SceneNode): string {
  let css = "";
  css += "width:" + node.width + "px;";
  css += " height:" + node.height + "px;";

  if ("x" in node && "y" in node) {
    css += " position:absolute;";
    css += " left:" + node.x + "px;";
    css += " top:" + node.y + "px;";
  }

  const fill = getFillColor(node);
  if (fill) css += " background:" + fill + ";";

  const stroke = getStroke(node);
  if (stroke) css += ` border:${stroke.width}px solid ${stroke.color};`;

  if (
    "rotation" in node &&
    typeof node.rotation === "number" &&
    node.rotation !== 0
  ) {
    css += " transform:rotate(" + -node.rotation + "deg);";
    css += " transform-origin:left top;";
  }

  if (
    "cornerRadius" in node &&
    typeof node.cornerRadius === "number" &&
    node.cornerRadius > 0
  ) {
    css += " border-radius:" + node.cornerRadius + "px;";
  }

  return css;
}

// =======================
// HTML TAG SELECTOR
// =======================
function getTag(node: SceneNode): string {
  return node.type === "TEXT" ? "p" : "div";
}

// =======================
// HTML CONVERTER (INDENTED)
// =======================
function convertNode(node: SceneNode, level: number = 0): string {
  const tag = getTag(node);

  // TEXT NODE
  if (node.type === "TEXT") {
    const t = node as TextNode;
    const text = t.characters ?? "";

    let css = "";
    css += "width:" + node.width + "px;";
    css += " height:" + node.height + "px;";
    css += " position:absolute;";
    css += " left:" + Math.round(node.x) + "px;";
    css += " top:" + Math.round(node.y) + "px;";

    const fill = getFillColor(node);
    if (fill) css += " color:" + fill + ";";

    if (typeof t.fontSize === "number") css += ` font-size:${t.fontSize}px;`;

    const font = t.fontName;
    if (font !== figma.mixed) {
      css += ` font-family:"${font.family}";`;
      if (typeof (t as any).fontWeight === "number") {
        css += ` font-weight:${(t as any).fontWeight};`;
      }
    }

    switch (t.textAlignHorizontal) {
      case "CENTER":
        css += " text-align:center;";
        break;
      case "RIGHT":
        css += " text-align:right;";
        break;
      default:
        css += " text-align:left;";
    }

    return `${indent(level)}<${tag} style="${css}">${text}</${tag}>\n`;
  }

  // FRAME / GROUP (HAS CHILDREN)
  if ("children" in node && node.children.length > 0) {
    let frameCSS =
      "position:relative; width:" +
      node.width +
      "px; height:" +
      node.height +
      "px;";

    const fill = getFillColor(node);
    if (fill) frameCSS += ` background:${fill};`;

    const stroke = getStroke(node);
    if (stroke) frameCSS += ` border:${stroke.width}px solid ${stroke.color};`;

    const n = node as any;
    if (n.paddingTop) frameCSS += ` padding-top:${n.paddingTop}px;`;
    if (n.paddingBottom) frameCSS += ` padding-bottom:${n.paddingBottom}px;`;
    if (n.paddingLeft) frameCSS += ` padding-left:${n.paddingLeft}px;`;
    if (n.paddingRight) frameCSS += ` padding-right:${n.paddingRight}px;`;
    if (n.itemSpacing) frameCSS += ` gap:${n.itemSpacing}px;`;

    let childrenHTML = "";
    for (const child of node.children) {
      childrenHTML += convertNode(child as SceneNode, level + 1);
    }

    return (
      `${indent(level)}<${tag} class="frame" style="${frameCSS}">\n` +
      childrenHTML +
      `${indent(level)}</${tag}>\n`
    );
  }

  // BASIC NODE
  return `${indent(level)}<${tag} class="item" style="${buildCSS(
    node
  )}"></${tag}>\n`;
}

// =======================
// TAILWIND CONVERTER (INDENTED)
// =======================
function convertNodeTailwind(node: SceneNode, level: number = 0): string {
  const tag = getTag(node);

  const width = `w-[${node.width}px]`;
  const height = `h-[${node.height}px]`;

  const fill = getFillColor(node);
  const list = [width, height];

  if (fill) list.push(`bg-[${fill}]`);

  if ("x" in node && "y" in node) {
    list.push("absolute");
    list.push(`left-[${Math.round(node.x)}px]`);
    list.push(`top-[${Math.round(node.y)}px]`);
  }

  if ("rotation" in node && node.rotation !== 0) {
    list.push(`rotate-[${-node.rotation}deg]`);
    list.push("origin-top-left");
  }

  if (
    "cornerRadius" in node &&
    typeof node.cornerRadius === "number" &&
    node.cornerRadius > 0
  ) {
    list.push(`rounded-[${node.cornerRadius}px]`);
  }

  const stroke = getStroke(node);
  if (stroke) {
    list.push(`border-[${stroke.width}px]`);
    list.push(`border-[${stroke.color}]`);
  }

  // TEXT NODE
  if (node.type === "TEXT") {
    const t = node as TextNode;
    const text = t.characters ?? "";

    const filtered = list.filter((c) => !c.startsWith("bg-"));
    if (fill) filtered.push(`text-[${fill}]`);

    if (typeof t.fontSize === "number") filtered.push(`text-[${t.fontSize}px]`);

    if (t.fontName !== figma.mixed) {
      const f = t.fontName as FontName;
      filtered.push(`font-["${f.family}"]`);
    }

    if (typeof (t as any).fontWeight === "number") {
      filtered.push(`font-[${(t as any).fontWeight}]`);
    }

    switch (t.textAlignHorizontal) {
      case "CENTER":
        filtered.push("text-center");
        break;
      case "RIGHT":
        filtered.push("text-right");
        break;
      default:
        filtered.push("text-left");
    }

    return `${indent(level)}<${tag} class="${filtered.join(
      " "
    )}">${text}</${tag}>\n`;
  }

  // CONTAINER WITH CHILDREN
  if ("children" in node && node.children.length > 0) {
    const container = ["relative", width, height];
    if (fill) container.push(`bg-[${fill}]`);

    const n = node as any;
    if (n.paddingTop) container.push(`pt-[${n.paddingTop}px]`);
    if (n.paddingBottom) container.push(`pb-[${n.paddingBottom}px]`);
    if (n.paddingLeft) container.push(`pl-[${n.paddingLeft}px]`);
    if (n.paddingRight) container.push(`pr-[${n.paddingRight}px]`);
    if (n.itemSpacing) container.push(`gap-[${n.itemSpacing}px]`);

    let childrenHTML = "";
    for (const child of node.children) {
      childrenHTML += convertNodeTailwind(child as SceneNode, level + 1);
    }

    return (
      `${indent(level)}<${tag} class="${container.join(" ")}">\n` +
      childrenHTML +
      `${indent(level)}</${tag}>\n`
    );
  }

  // BASIC NODE
  return `${indent(level)}<${tag} class="${list.join(" ")}"></${tag}>\n`;
}

// =======================
// CODEGEN: HTML + TAILWIND HTML
// =======================
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
          language: "HTML", // must be HTML
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
