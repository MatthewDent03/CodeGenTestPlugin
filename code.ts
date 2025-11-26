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
  const widthClass = "w-[" + node.width + "px]";
  const heightClass = "h-[" + node.height + "px]";
  let backgroundClass = "";
  const fill = getFillColor(node);
  if (fill) {
    backgroundClass = "bg-[" + fill + "]";
  }

  const classList = [widthClass, heightClass];
  if (backgroundClass) classList.push(backgroundClass);

  if ("x" in node && "y" in node) {
    classList.push("absolute");
    const positionedNode = node as SceneNode & { x: number; y: number };
    classList.push("left-[" + Math.round(positionedNode.x) + "px]");
    classList.push("top-[" + Math.round(positionedNode.y) + "px]");
  }

  if ("rotation" in node) {
    const rotationNode = node as SceneNode & { rotation?: number };
    if (
      typeof rotationNode.rotation === "number" &&
      rotationNode.rotation !== 0
    ) {
      const angle = -rotationNode.rotation;
      classList.push("rotate-[" + angle + "deg]");
      classList.push("origin-top-left");
    }
  }

  if ("cornerRadius" in node) {
    const cornerNode = node as SceneNode & { cornerRadius?: number };
    if (
      typeof cornerNode.cornerRadius === "number" &&
      cornerNode.cornerRadius > 0
    ) {
      classList.push("rounded-[" + cornerNode.cornerRadius + "px]");
    }
  }

  if (node.type === "TEXT") {
    const textNode = node as TextNode;
    const text = textNode.characters ? textNode.characters : "";
    // Remove background classes for text nodes and add text color instead
    // `className` represents each individual Tailwind class string in the list
    const filteredClasses = classList.filter(
      (className) => !className.startsWith("bg-")
    );
    const textFill = getFillColor(node);
    if (textFill) {
      filteredClasses.push(`text-[${textFill}]`);
    }
    return `<${tag} class="${filteredClasses.join(" ")}">${text}</${tag}>`;
  }

  if ("children" in node && node.children.length > 0) {
    let childrenHTML = "";
    for (let i = 0; i < node.children.length; i++) {
      childrenHTML += convertNodeTailwind(node.children[i] as SceneNode) + "\n";
    }
    const containerClasses = ["relative", widthClass, heightClass];
    if (backgroundClass) containerClasses.push(backgroundClass);
    return `<${tag} class="${containerClasses.join(
      " "
    )}">\n${childrenHTML}</${tag}>`;
  }

  return `<${tag} class="${classList.join(" ")}"></${tag}>`;
}

if (figma.editorType === "dev" && figma.mode === "codegen") {
  figma.codegen.on("generate", ({ node, language }) => {
    if (!node) {
      return [
        {
          title: "HTML",
          language: "HTML",
          code: "<!-- No layer selected -->",
        },
      ];
    }

    // User selected standard HTML in the dropdown
    if (language === "HTML") {
      return [
        {
          title: "HTML",
          language: "HTML", // valid language
          code: convertNode(node as SceneNode),
        },
      ];
    }

    // User selected "Tailwind HTML" from manifest dropdown
    if (language === "TAILWIND_HTML") {
      return [
        {
          title: "Tailwind HTML",
          language: "HTML", // MUST be HTML, cannot be TAILWIND
          code: convertNodeTailwind(node as SceneNode),
        },
      ];
    }

    // fallback
    return [
      {
        title: "HTML",
        language: "HTML",
        code: convertNode(node as SceneNode),
      },
    ];
  });
} else {
  figma.closePlugin();
}
