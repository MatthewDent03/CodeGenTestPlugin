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
  if ("rotation" in node && typeof node.rotation === "number") {
    if (node.rotation !== 0) {
      css += " transform:rotate(" + -node.rotation + "deg);";
      css += " transform-origin:left top;";
    }
  }
  if ("cornerRadius" in node && typeof node.cornerRadius === "number") {
    if (node.cornerRadius > 0) {
      css += " border-radius:" + node.cornerRadius + "px;";
    }
  }
  return css;
}

function getTag(node: SceneNode): string {
  if (node.type === "TEXT") return "p";
  return "div";
}

function convertNode(node: SceneNode): string {
  const tag = getTag(node);
  const css = buildCSS(node);

  if (node.type === "TEXT") {
    const tnode = node as TextNode;
    const text = tnode.characters ? tnode.characters : "";
    const fill = getFillColor(node);
    let textCss = "";
    textCss += "width:" + node.width + "px;";
    textCss += " height:" + node.height + "px;";
    if ("x" in node && "y" in node) {
      textCss += " position:absolute;";
      textCss += " left:" + Math.round(node.x) + "px;";
      textCss += " top:" + Math.round(node.y) + "px;";
    }
    if (fill) {
      textCss += " color:" + fill + ";";
    }
    return `<${tag} style="${textCss}">${text}</${tag}>\n`;
  }

  if ("children" in node && node.children.length > 0) {
    let childrenHTML = "";
    const frameCSS =
      "position:relative; width:" +
      node.width +
      "px; height:" +
      node.height +
      "px;";

    for (let i = 0; i < node.children.length; i++) {
      const child = convertNode(node.children[i] as SceneNode);
      childrenHTML += child + "\n";
    }

    return (
      "<" +
      tag +
      ' class="frame" style="' +
      frameCSS +
      '">' +
      "\n" +
      childrenHTML +
      "</" +
      tag +
      ">\n"
    );
  }

  return "<" + tag + ' class="item" style="' + css + '"></' + tag + ">\n";
}

function convertNodeTailwind(node: SceneNode): string {
  const tag = getTag(node);
  const w = "w-[" + node.width + "px]";
  const h = "h-[" + node.height + "px]";
  let bg = "";
  const fill = getFillColor(node);
  if (fill) {
    bg = "bg-[" + fill + "]";
  }

  const classes = [w, h];
  if (bg) classes.push(bg);

  if ("x" in node && "y" in node) {
    classes.push("absolute");
    const pos = node as SceneNode & { x: number; y: number };
    classes.push("left-[" + Math.round(pos.x) + "px]");
    classes.push("top-[" + Math.round(pos.y) + "px]");
  }

  if ("rotation" in node) {
    const rnode = node as SceneNode & { rotation?: number };
    if (typeof rnode.rotation === "number" && rnode.rotation !== 0) {
      const angle = -rnode.rotation;
      classes.push("rotate-[" + angle + "deg]");
      classes.push("origin-top-left");
    }
  }

  if ("cornerRadius" in node) {
    const crnode = node as SceneNode & { cornerRadius?: number };
    if (typeof crnode.cornerRadius === "number" && crnode.cornerRadius > 0) {
      classes.push("rounded-[" + crnode.cornerRadius + "px]");
    }
  }

  if (node.type === "TEXT") {
    const tnode = node as TextNode;
    const text = tnode.characters ? tnode.characters : "";
    const filtered = classes.filter((c) => !c.startsWith("bg-"));
    const fill = getFillColor(node);
    if (fill) {
      filtered.push(`text-[${fill}]`);
    }
    return `<${tag} class="${filtered.join(" ")}">${text}</${tag}>`;
  }

  if ("children" in node && node.children.length > 0) {
    let childrenHTML = "";
    for (let i = 0; i < node.children.length; i++) {
      childrenHTML += convertNodeTailwind(node.children[i] as SceneNode) + "\n";
    }
    const containerClasses = ["relative", w, h];
    if (bg) containerClasses.push(bg);
    return `<${tag} class="${containerClasses.join(
      " "
    )}">\n${childrenHTML}</${tag}>`;
  }

  return `<${tag} class="${classes.join(" ")}"></${tag}>`;
}

if (figma.editorType === "dev" && figma.mode === "codegen") {
  figma.codegen.on("generate", ({ node }) => {
    if (!node) {
      return [
        { title: "HTML", language: "HTML", code: "<!-- No layer selected -->" },
      ];
    }
    const html = convertNode(node as SceneNode);
    return [
      {
        title: "HTML",
        language: "HTML",
        code: html,
      },
      {
        title: "Tailwind HTML",
        language: "HTML",
        code: convertNodeTailwind(node as SceneNode),
      },
    ];
  });
} else {
  figma.closePlugin();
}
