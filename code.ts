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
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  return `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
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
    if (isRoot) {
      css += ` position:relative; left:0px; top:0px;`;
    } else {
      // Root children should use raw x/y; deeper descendants relative to parent
      const useRelative = !!parent && !isChildOfRoot;
      const left =
        useRelative && "x" in parent ? node.x - (parent as any).x : node.x;
      const top =
        useRelative && "y" in parent ? node.y - (parent as any).y : node.y;
      css += ` position:absolute; left:${left}px; top:${top}px;`;
    }
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
    const useRelative = !!parent && !isChildOfRoot;
    const left =
      useRelative && "x" in parent ? node.x - (parent as any).x : node.x;
    const top =
      useRelative && "y" in parent ? node.y - (parent as any).y : node.y;
    css += ` position:absolute; left:${left}px; top:${top}px;`;
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
    childrenHtml += convertNode(
      child,
      level + 1,
      node,
      inFlex,
      childIsChildOfRoot,
      false
    );
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

  // Justify-content maps Figma primaryAxisAlignItems
  let justify = "flex-start";
  switch (node.primaryAxisAlignItems) {
    case "CENTER":
      justify = "center";
      break;
    case "MAX":
      justify = "flex-end";
      break;
    case "SPACE_BETWEEN":
      justify = "space-between";
      break;
    default:
      justify = "flex-start";
  }

  // Align-items maps Figma counterAxisAlignItems
  let align = "stretch";
  switch (node.counterAxisAlignItems) {
    case "CENTER":
      align = "center";
      break;
    case "MAX":
      align = "flex-end";
      break;
    case "MIN":
      align = "flex-start";
      break;
    default:
      align = "stretch";
  }

  // Align-content for multi-line distribution when wrapping
  let alignContent = "normal";
  if ("counterAxisAlignContent" in node) {
    const cac = (node as any).counterAxisAlignContent;
    switch (cac) {
      case "CENTER":
        alignContent = "center";
        break;
      case "SPACE_BETWEEN":
        alignContent = "space-between";
        break;
      case "MAX":
        alignContent = "flex-end";
        break;
      case "MIN":
        alignContent = "flex-start";
        break;
      case "STRETCH":
        alignContent = "stretch";
        break;
      case "AUTO":
        alignContent = "normal";
        break;
      default:
        alignContent = "normal";
    }
  }

  // Gap and padding
  const gapValue = typeof node.itemSpacing === "number" ? node.itemSpacing : 0;
  const pL = typeof node.paddingLeft === "number" ? node.paddingLeft : 0;
  const pR = typeof node.paddingRight === "number" ? node.paddingRight : 0;
  const pT = typeof node.paddingTop === "number" ? node.paddingTop : 0;
  const pB = typeof node.paddingBottom === "number" ? node.paddingBottom : 0;

  // Positioning of the flex container itself: use root-aware rules
  let containerPos = "";
  if ("x" in node && "y" in node) {
    if (isRoot) {
      containerPos = ` position:relative; left:0px; top:0px;`;
    } else {
      const useRelative = !!parent && !isChildOfRoot;
      const left =
        useRelative && parent && "x" in parent
          ? node.x - (parent as any).x
          : node.x;
      const top =
        useRelative && parent && "y" in parent
          ? node.y - (parent as any).y
          : node.y;
      containerPos = ` position:relative; left:${left}px; top:${top}px;`;
    }
  }

  const gapCss =
    node.primaryAxisAlignItems === "SPACE_BETWEEN" ? "" : ` gap:${gapValue}px;`;
  const alignContentCss =
    wrap === "nowrap" ? "" : ` align-content:${alignContent};`;
  const css = `display:flex;${flexFlow} flex-direction:${direction}; flex-wrap:${wrap}; justify-content:${justify}; align-items:${align};${alignContentCss}${gapCss} padding:${pT}px ${pR}px ${pB}px ${pL}px; width:${node.width}px; height:${node.height}px;${containerPos}`;

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
    const t = node as TextNode;
    if (typeof t.fontSize === "number") out.fontSize = t.fontSize;
    if (t.fontName !== figma.mixed) out.fontName = t.fontName as FontName;
    out.characters = t.characters;
    out.textAlignHorizontal = t.textAlignHorizontal;
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
