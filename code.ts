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
    figma.ui.postMessage({ type: "selection-update", data: props });
  });
}

// ======================================================
// INDENT HELPER
// ======================================================
function indent(level: number): string {
  return "  ".repeat(level);
}

// ======================================================
// COLOR & BORDER HELPERS
// ======================================================
function rgbToHex(color: RGB): string {
  const red = Math.round(color.r * 255);
  const green = Math.round(color.g * 255);
  const blue = Math.round(color.b * 255);
  return `#${red.toString(16).padStart(2, "0")}${green
    .toString(16)
    .padStart(2, "0")}${blue.toString(16).padStart(2, "0")}`;
}

function getFillColor(node: SceneNode): string | null {
  if ("fills" in node && Array.isArray(node.fills) && node.fills.length > 0) {
    const paint = node.fills[0];
    if (paint.type === "SOLID") return rgbToHex(paint.color);
  }
  return null;
}

function getStroke(node: SceneNode): { color: string; width: number } | null {
  if ("strokes" in node && Array.isArray(node.strokes) && node.strokes.length) {
    const paint = node.strokes[0];
    if (paint.type === "SOLID") {
      return {
        color: rgbToHex(paint.color),
        width: (node as any).strokeWeight || 1,
      };
    }
  }
  return null;
}

// ======================================================
// BUILD CSS FOR NODE
// ======================================================
function buildCSS(
  node: SceneNode,
  parent?: SceneNode,
  inFlex: boolean = false,
  isChildOfRoot: boolean = false,
  isRoot: boolean = false
): string {
  let css = `width:${node.width}px; height:${node.height}px;`;

  // Absolute positioning for non-flex. If a parent is provided,
  // use coordinates relative to the parent for nested elements.
  if (!inFlex && "x" in node && "y" in node) {
    // Use margin-based layout: only set position, do not emit left/top
    css += isRoot ? ` position:absolute;` : ` position:absolute;`;
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
// MARGIN HELPERS (absolute layouts)
// ======================================================
function computeMargins(node: SceneNode, parent: SceneNode) {
  // For auto-layout parents, spacing is modeled via padding and gap.
  if ("layoutMode" in parent && (parent as FrameNode).layoutMode !== "NONE") {
    return { top: 0, left: 0, right: 0, bottom: 0 };
  }
  if (parent.type === "FRAME") {
    return computeMarginsWithFrame(node, parent);
  } else {
    return computeMarginsNotFrame(node, parent);
  }
}

function computeMarginsWithFrame(node: SceneNode, parent: SceneNode) {
  const top = (node as any).y ?? 0;
  const left = (node as any).x ?? 0;
  const right = (parent as any).width - (node as any).width - left;
  const bottom = (parent as any).height - (node as any).height - top;
  return { top, left, right, bottom };
}

function computeMarginsNotFrame(node: SceneNode, parent: SceneNode) {
  const top = ((node as any).y ?? 0) - ((parent as any).y ?? 0);
  const left = ((node as any).x ?? 0) - ((parent as any).x ?? 0);
  const right = (parent as any).width - (left + (node as any).width);
  const bottom = (parent as any).height - (top + (node as any).height);
  return { top, left, right, bottom };
}

// ======================================================
// NODE TO HTML CONVERTER
// ======================================================
function getTag(node: SceneNode): string {
  return node.type === "TEXT" ? "p" : "div";
}

function convertNode(
  node: SceneNode,
  level: number = 0,
  parent?: SceneNode,
  inFlex: boolean = false,
  isChildOfRoot: boolean = false,
  isRoot: boolean = false
): string {
  const tag = getTag(node);

  // Text node
  if (node.type === "TEXT") {
    return convertTextNode(
      node as TextNode,
      tag,
      level,
      parent,
      inFlex,
      isChildOfRoot
    );
  }

  // Children nodes
  if ("children" in node && node.children.length > 0) {
    if (node.type === "FRAME" && (node as FrameNode).layoutMode !== "NONE") {
      // Flex container for auto-layout
      return convertFrameFlex(
        node as FrameNode,
        tag,
        level,
        parent,
        isChildOfRoot
      );
    } else {
      // Absolute or grouped container
      return convertFrameAbsolute(
        node as FrameNode,
        tag,
        level,
        parent,
        inFlex,
        isChildOfRoot
      );
    }
  }

  const css = buildCSS(node, parent, inFlex, isChildOfRoot, isRoot);
  return `${indent(level)}<${tag} style="${css}"></${tag}>\n`;
}

// ======================================================
// TEXT NODE CONVERTER
// ======================================================
function convertTextNode(
  node: TextNode,
  tag: string,
  level: number,
  parent?: SceneNode,
  inFlex: boolean = false,
  isChildOfRoot: boolean = false
): string {
  let css = `width:${node.width}px; height:${node.height}px;`;
  if (!inFlex) {
    // Margin-based layout: keep position without left/top
    css += ` position:absolute;`;
  }

  const fill = getFillColor(node);
  if (fill) css += ` color:${fill};`;
  if (typeof node.fontSize === "number")
    css += ` font-size:${node.fontSize}px;`;
  if (node.fontName !== figma.mixed)
    css += ` font-family:'${(node.fontName as FontName).family}';`;

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

// ======================================================
// ABSOLUTE / NON-FLEX FRAME CONVERTER
// ======================================================
function convertFrameAbsolute(
  node: FrameNode,
  tag: string,
  level: number,
  parent?: SceneNode,
  inFlex: boolean = false,
  isChildOfRoot: boolean = false,
  isRoot: boolean = false
): string {
  const css = buildCSS(node, parent, inFlex, isChildOfRoot, isRoot);
  let childrenHtml = "";
  for (const child of node.children) {
    // If this node is the root of the conversion (no parent passed to it),
    // then its direct children are children of root.
    const childIsChildOfRoot = parent == null;
    // Compute margins relative to this absolute container
    const margins = computeMargins(child, node);
    // Generate child HTML first
    let childHtml = convertNode(
      child,
      level + 1,
      node,
      inFlex,
      childIsChildOfRoot,
      false
    );
    // Inject margin into the child's style attribute for absolute layouts
    const marginInjection = `margin:${margins.top}px ${margins.right}px ${margins.bottom}px ${margins.left}px; `;
    const styleIndex = childHtml.indexOf('style="');
    if (styleIndex !== -1) {
      const beforeStyle = childHtml.slice(0, styleIndex + 7); // include style="
      let afterStyle = childHtml.slice(styleIndex + 7);
      // Remove absolute left/top so margins control spacing
      afterStyle = afterStyle.replace(/left:\s*[-\d.]+px;\s*/gi, "");
      afterStyle = afterStyle.replace(/top:\s*[-\d.]+px;\s*/gi, "");
      childHtml = beforeStyle + marginInjection + afterStyle;
    }
    childrenHtml += childHtml;
  }
  return `${indent(level)}<${tag} style="${css}">\n${childrenHtml}${indent(
    level
  )}</${tag}>\n`;
}

// ======================================================
// FLEX / AUTO-LAYOUT FRAME CONVERTER
// ======================================================
function convertFrameFlex(
  node: FrameNode,
  tag: string,
  level: number,
  parent?: SceneNode,
  isChildOfRoot: boolean = false,
  isRoot: boolean = false
): string {
  const baseDirection = node.layoutMode === "HORIZONTAL" ? "row" : "column";
  const reversed =
    (node as any).primaryAxisDirection === "REVERSE" ||
    (node as any).layoutReverse === true;
  const direction = reversed ? `${baseDirection}-reverse` : baseDirection;

  // Wrap mapping from Figma's layoutWrap property
  let wrap = "nowrap";
  if ("layoutWrap" in node) {
    const figmaWrap = node.layoutWrap;
    if (figmaWrap === "WRAP") {
      wrap = "wrap";
    } else if (figmaWrap === "NO_WRAP") {
      wrap = "nowrap";
    }
    // Note: Figma doesn't have WRAP_REVERSE, but keeping for completeness
    if ((node as any).layoutWrap === "WRAP_REVERSE") {
      wrap = "wrap-reverse";
    }
  }

  // Flex-flow combines direction and wrap
  const flexFlow = wrap !== "nowrap" ? ` flex-flow:${wrap};` : "";

  // Map Figma alignment properties to CSS values
  const justifyMap: Record<string, string> = {
    CENTER: "center",
    MAX: "flex-end",
    SPACE_BETWEEN: "space-between",
    MIN: "flex-start",
  };
  const justify = justifyMap[node.primaryAxisAlignItems] || "flex-start";

  const alignMap: Record<string, string> = {
    CENTER: "center",
    MAX: "flex-end",
    MIN: "flex-start",
  };
  const align = alignMap[node.counterAxisAlignItems] || "stretch";

  const alignContentMap: Record<string, string> = {
    CENTER: "center",
    SPACE_BETWEEN: "space-between",
    MAX: "flex-end",
    MIN: "flex-start",
    STRETCH: "stretch",
    AUTO: "normal",
  };
  const counterAxisAlignContentValue = (node as any).counterAxisAlignContent;
  const alignContent =
    alignContentMap[counterAxisAlignContentValue] || "normal";

  // Gap and padding
  const gapValue = typeof node.itemSpacing === "number" ? node.itemSpacing : 0;
  const paddingLeft =
    typeof node.paddingLeft === "number" ? node.paddingLeft : 0;
  const paddingRight =
    typeof node.paddingRight === "number" ? node.paddingRight : 0;
  const paddingTop = typeof node.paddingTop === "number" ? node.paddingTop : 0;
  const paddingBottom =
    typeof node.paddingBottom === "number" ? node.paddingBottom : 0;

  // Positioning of the flex container itself: use root-aware rules
  let containerPos = "";
  if ("x" in node && "y" in node) {
    if (isRoot) {
      containerPos = ` position:relative;`;
    } else {
      // Margin-based layout for flex containers: no left/top
      containerPos = ` position:relative;`;
    }
  }

  const gapCss =
    node.primaryAxisAlignItems === "SPACE_BETWEEN" ? "" : ` gap:${gapValue}px;`;
  const alignContentCss =
    wrap === "nowrap" ? "" : ` align-content:${alignContent};`;
  // Omit flex-wrap when flex-flow already includes it
  const wrapCss = wrap === "nowrap" || flexFlow ? "" : ` flex-wrap:${wrap};`;
  const css = `display:flex;${flexFlow} flex-direction:${direction};${wrapCss} justify-content:${justify}; align-items:${align};${alignContentCss}${gapCss} padding:${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px; width:${node.width}px; height:${node.height}px;${containerPos}`;

  let childrenHtml = "";
  for (const child of node.children) {
    const childIsChildOfRoot = parent == null;
    childrenHtml += convertNode(
      child,
      level + 1,
      node,
      true,
      childIsChildOfRoot,
      false
    );
  }

  return `${indent(level)}<${tag} style="${css}">\n${childrenHtml}${indent(
    level
  )}</${tag}>\n`;
}

// ======================================================
// EXTRACT NODE PROPERTIES
// ======================================================
function extractNodeProperties(node: SceneNode): any {
  const out: any = { id: node.id, name: node.name, type: node.type };
  if ("width" in node) out.width = node.width;
  if ("height" in node) out.height = node.height;
  if ("x" in node) out.x = node.x;
  if ("y" in node) out.y = node.y;
  if ("rotation" in node) out.rotation = node.rotation;
  if ("cornerRadius" in node) out.cornerRadius = node.cornerRadius;

  if (node.type === "TEXT") {
    const textNode = node as TextNode;
    if (typeof textNode.fontSize === "number") out.fontSize = textNode.fontSize;
    if (textNode.fontName !== figma.mixed)
      out.fontName = textNode.fontName as FontName;
    out.characters = textNode.characters;
    out.textAlignHorizontal = textNode.textAlignHorizontal;
  }

  if ("fills" in node) {
    out.fills = Array.isArray(node.fills)
      ? node.fills.map((f) => ({ ...f }))
      : node.fills;
    const singleFill = getFillColor(node);
    if (singleFill) out.fill = singleFill;
  }

  if ("strokes" in node) {
    out.strokes = Array.isArray(node.strokes)
      ? node.strokes.map((s) => ({ ...s }))
      : node.strokes;
    if ((node as any).strokeWeight)
      out.strokeWeight = (node as any).strokeWeight;
    const firstStroke = getStroke(node);
    if (firstStroke) out.stroke = firstStroke;
  }

  if ("children" in node) {
    out.children = node.children.map((child) => extractNodeProperties(child));
  }

  // Auto-layout / Flex properties
  if (node.type === "FRAME") {
    const frame = node as FrameNode;
    if ("layoutMode" in frame) out.layoutMode = frame.layoutMode;
    if ("layoutWrap" in frame) out.layoutWrap = frame.layoutWrap;
    if ("primaryAxisAlignItems" in frame)
      out.primaryAxisAlignItems = frame.primaryAxisAlignItems;
    if ("counterAxisAlignItems" in frame)
      out.counterAxisAlignItems = frame.counterAxisAlignItems;
    if ("counterAxisAlignContent" in frame)
      out.counterAxisAlignContent = (frame as any).counterAxisAlignContent;
    if ("primaryAxisSizingMode" in frame)
      out.primaryAxisSizingMode = frame.primaryAxisSizingMode;
    if ("counterAxisSizingMode" in frame)
      out.counterAxisSizingMode = (frame as any).counterAxisSizingMode;
    if ("itemSpacing" in frame) out.itemSpacing = frame.itemSpacing;
    if ("paddingLeft" in frame) out.paddingLeft = frame.paddingLeft;
    if ("paddingRight" in frame) out.paddingRight = frame.paddingRight;
    if ("paddingTop" in frame) out.paddingTop = frame.paddingTop;
    if ("paddingBottom" in frame) out.paddingBottom = frame.paddingBottom;
  }

  return out;
}

// ======================================================
// CODEGEN MODE
// ======================================================
if (figma.editorType === "dev" && figma.mode === "codegen") {
  figma.codegen.on("generate", ({ node, language }) => {
    if (!node)
      return [
        { title: "HTML", language: "HTML", code: "<!-- No selection -->" },
      ];

    return [
      {
        title: "HTML",
        language: "HTML",
        code: convertNode(node, 0, undefined, false, false, true),
      },
    ];
  });
}
