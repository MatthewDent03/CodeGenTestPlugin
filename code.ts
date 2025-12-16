// ======================================================
// PLUGIN UI - Shows the plugin window in Figma
// Displays info about the selected element
// Updates every time you select something new
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
// FORMATTING HELPERS - Makes the generated HTML code look nice
// indent: Adds spaces to indent nested HTML tags
// ======================================================
function indent(level: number): string {
  return "  ".repeat(level);
}

// ======================================================
// COLOR HELPERS - Turns Figma colors into CSS colors
// rgbToHex: Changes RGB numbers into hex codes like #ff0000
// getFillColor: Gets the background color from an element
// getStroke: Gets the border color and thickness
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
// CSS BUILDER - Creates CSS styles for any element
// Sets size, position, colors, borders, rotation, and rounded corners
// Elements not in flexbox get absolute positioning
// ======================================================
function buildCSS(
  node: SceneNode,
  parent?: SceneNode,
  inFlex: boolean = false
): string {
  let css = `width:${node.width}px; height:${node.height}px;`;

  // Absolute positioning for non-flex layouts (margins control spacing)
  if (!inFlex && "x" in node && "y" in node) {
    css += ` position:absolute;`;
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
// MARGIN HELPERS - Figures out spacing between elements and their containers
// Used to position elements with margins instead of left/top values
// Returns 0 for flex layouts (they use gap and padding instead)
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
// MAIN CONVERTER - Decides which converter to use for each element
// Sends text to text converter, flex boxes to flex converter, etc.
// ======================================================
function convertNode(
  node: SceneNode,
  level: number = 0,
  parent?: SceneNode,
  inFlex: boolean = false
): string {
  const tag = node.type === "TEXT" ? "p" : "div";

  // Text node
  if (node.type === "TEXT") {
    return convertTextNode(node as TextNode, tag, level, parent, inFlex);
  }

  // Children nodes
  if ("children" in node && node.children.length > 0) {
    if (node.type === "FRAME" && (node as FrameNode).layoutMode !== "NONE") {
      // Flex container for auto-layout
      return convertFrameFlex(node as FrameNode, tag, level, parent);
    } else {
      // Absolute or grouped container
      return convertFrameAbsolute(
        node as FrameNode,
        tag,
        level,
        parent,
        inFlex
      );
    }
  }

  const css = buildCSS(node, parent, inFlex);
  return `${indent(level)}<${tag} style="${css}"></${tag}>\n`;
}

// ======================================================
// TEXT CONVERTER - Turns Figma text into HTML paragraph tags
// Converts text properties like size, color, font, and alignment to CSS
// ======================================================
function convertTextNode(
  node: TextNode,
  tag: string,
  level: number,
  parent?: SceneNode,
  inFlex: boolean = false
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

  const alignmentMap: Record<string, string> = {
    CENTER: "center",
    RIGHT: "right",
    LEFT: "left",
  };
  const textAlignment = alignmentMap[node.textAlignHorizontal] || "left";
  css += ` text-align:${textAlignment};`;

  return `${indent(level)}<${tag} style="${css}">${node.characters}</${tag}>\n`;
}

// ======================================================
// ABSOLUTE LAYOUT CONVERTER - Handles containers with positioned elements
// Calculates and adds margins to position child elements
// Used for regular frames and groups (not auto-layout)
// ======================================================
function convertFrameAbsolute(
  node: FrameNode,
  tag: string,
  level: number,
  parent?: SceneNode,
  inFlex: boolean = false
): string {
  const css = buildCSS(node, parent, inFlex);
  let childrenHtml = "";
  for (const child of node.children) {
    // Compute margins relative to this absolute container
    const margins = computeMargins(child, node);
    // Generate child HTML first
    let childHtml = convertNode(child, level + 1, node, inFlex);
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
// FLEX LAYOUT CONVERTER - Handles auto-layout containers
// Turns Figma auto-layout settings into CSS flexbox code
// Sets direction, wrapping, spacing, padding, and alignment
// ======================================================
function convertFrameFlex(
  node: FrameNode,
  tag: string,
  level: number,
  parent?: SceneNode
): string {
  // Map flex direction from Figma layoutMode
  const baseDirection = node.layoutMode === "HORIZONTAL" ? "row" : "column";
  const reversed =
    (node as any).primaryAxisDirection === "REVERSE" ||
    (node as any).layoutReverse === true;
  const direction = reversed ? `${baseDirection}-reverse` : baseDirection;

  // Map wrap from Figma layoutWrap property
  const wrapMap: Record<string, string> = {
    WRAP: "wrap",
    NO_WRAP: "nowrap",
  };
  const wrap = wrapMap[node.layoutWrap] || "nowrap";

  // Flex-wrap (omit when nowrap)
  const wrapCss = wrap === "nowrap" ? "" : ` flex-wrap:${wrap};`;

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

  // Extract gap and padding values (default to 0 if not set)
  const gapValue = node.itemSpacing ?? 0;
  const paddingLeft = node.paddingLeft ?? 0;
  const paddingRight = node.paddingRight ?? 0;
  const paddingTop = node.paddingTop ?? 0;
  const paddingBottom = node.paddingBottom ?? 0;

  const gapCss =
    node.primaryAxisAlignItems === "SPACE_BETWEEN" ? "" : ` gap:${gapValue}px;`;
  const alignContentCss =
    wrap === "nowrap" ? "" : ` align-content:${alignContent};`;
  const css = `display:flex; flex-direction:${direction};${wrapCss} justify-content:${justify}; align-items:${align};${alignContentCss}${gapCss} padding:${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px; width:${node.width}px; height:${node.height}px; position:relative;`;

  let childrenHtml = "";
  for (const child of node.children) {
    childrenHtml += convertNode(child, level + 1, node, true);
  }

  return `${indent(level)}<${tag} style="${css}">\n${childrenHtml}${indent(
    level
  )}</${tag}>\n`;
}

// ======================================================
// PROPERTY EXTRACTOR - Grabs all info from selected Figma elements
// Shows this info in the plugin panel
// Goes through all child elements and collects their properties too
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

  // Auto-layout / Flex properties (only if frame uses auto-layout)
  if (node.type === "FRAME") {
    const frame = node as FrameNode;
    if ("layoutMode" in frame) {
      out.layoutMode = frame.layoutMode;
      // Only include layout properties if using auto-layout (not NONE)
      if (frame.layoutMode !== "NONE") {
        if ("layoutWrap" in frame) out.layoutWrap = frame.layoutWrap;
        if ("itemSpacing" in frame) out.itemSpacing = frame.itemSpacing;
        if ("paddingLeft" in frame) out.paddingLeft = frame.paddingLeft;
        if ("paddingRight" in frame) out.paddingRight = frame.paddingRight;
        if ("paddingTop" in frame) out.paddingTop = frame.paddingTop;
        if ("paddingBottom" in frame) out.paddingBottom = frame.paddingBottom;
      }
    }
  }

  return out;
}

// ======================================================
// TAILWIND CLASS BUILDER - Creates Tailwind classes for any element
// Converts sizes, colors, borders, and rotation into Tailwind format
// Uses brackets [value] for exact pixel values
// ======================================================
function buildTailwindClasses(
  node: SceneNode,
  parent?: SceneNode,
  inFlex: boolean = false
): string {
  let classes: string[] = [];

  // Dimensions
  classes.push(`w-[${node.width}px]`);
  classes.push(`h-[${node.height}px]`);

  // Positioning
  if (!inFlex && "x" in node && "y" in node) {
    classes.push("absolute");
  }

  // Fill color
  const fill = getFillColor(node);
  if (fill) {
    classes.push(`bg-[${fill}]`);
  }

  // Stroke
  const stroke = getStroke(node);
  if (stroke) {
    classes.push(`border`);
    classes.push(`border-[${stroke.width}px]`);
    classes.push(`border-[${stroke.color}]`);
  }

  // Rotation
  if ("rotation" in node && node.rotation !== 0) {
    const rotationDeg = -node.rotation;
    // Tailwind arbitrary rotate needs transform + origin
    classes.push(
      "transform",
      "origin-left",
      "origin-top",
      `rotate-[${rotationDeg}deg]`
    );
  }

  // Border radius
  if ("cornerRadius" in node && typeof node.cornerRadius === "number") {
    classes.push(`rounded-[${node.cornerRadius}px]`);
  }

  return classes.join(" ");
}

// ======================================================
// TAILWIND CONVERTER - Decides which Tailwind converter to use
// Sends text to text converter, flex boxes to flex converter, etc.
// Main starting point for creating Tailwind HTML
// ======================================================
function convertNodeTailwind(
  node: SceneNode,
  level: number = 0,
  parent?: SceneNode,
  inFlex: boolean = false
): string {
  const tag = node.type === "TEXT" ? "p" : "div";

  // Text node
  if (node.type === "TEXT") {
    return convertTextNodeTailwind(
      node as TextNode,
      tag,
      level,
      parent,
      inFlex
    );
  }

  // Children nodes
  if ("children" in node && node.children.length > 0) {
    if (node.type === "FRAME" && (node as FrameNode).layoutMode !== "NONE") {
      // Flex container for auto-layout
      return convertFrameFlexTailwind(node as FrameNode, tag, level, parent);
    } else {
      // Absolute or grouped container
      return convertFrameAbsoluteTailwind(
        node as FrameNode,
        tag,
        level,
        parent,
        inFlex
      );
    }
  }

  const classes = buildTailwindClasses(node, parent, inFlex);
  return `${indent(level)}<${tag} class="${classes}"></${tag}>\n`;
}

// ======================================================
// TAILWIND TEXT CONVERTER - Turns Figma text into HTML with Tailwind classes
// Converts size, color, font, and alignment to Tailwind classes
// Uses simple font names like font-sans, font-serif when possible
// ======================================================
function convertTextNodeTailwind(
  node: TextNode,
  tag: string,
  level: number,
  parent?: SceneNode,
  inFlex: boolean = false
): string {
  let classes: string[] = [];

  // Dimensions
  classes.push(`w-[${node.width}px]`);
  classes.push(`h-[${node.height}px]`);

  // Positioning
  if (!inFlex) {
    classes.push("absolute");
  }

  // Text color
  const fill = getFillColor(node);
  if (fill) {
    classes.push(`text-[${fill}]`);
  }

  // Font size
  if (typeof node.fontSize === "number") {
    classes.push(`text-[${node.fontSize}px]`);
  }

  // Font family
  if (node.fontName !== figma.mixed) {
    const fontFamily = (node.fontName as FontName).family;
    // Map common font families to Tailwind
    const fontMap: Record<string, string> = {
      Inter: "font-sans",
      Arial: "font-sans",
      "Times New Roman": "font-serif",
      Georgia: "font-serif",
      Courier: "font-mono",
      Consolas: "font-mono",
    };
    if (fontMap[fontFamily]) {
      classes.push(fontMap[fontFamily]);
    }
  }

  // Text alignment
  const alignmentMap: Record<string, string> = {
    CENTER: "text-center",
    RIGHT: "text-right",
    LEFT: "text-left",
  };
  const textAlignment = alignmentMap[node.textAlignHorizontal] || "text-left";
  classes.push(textAlignment);

  return `${indent(level)}<${tag} class="${classes.join(" ")}">${
    node.characters
  }</${tag}>\n`;
}

// ======================================================
// TAILWIND ABSOLUTE CONVERTER - Handles positioned elements with Tailwind
// Calculates and adds margin classes to position child elements
// Used for regular frames and groups (not auto-layout)
// ======================================================
function convertFrameAbsoluteTailwind(
  node: FrameNode,
  tag: string,
  level: number,
  parent?: SceneNode,
  inFlex: boolean = false
): string {
  const classes = buildTailwindClasses(node, parent, inFlex);
  let childrenHtml = "";
  for (const child of node.children) {
    const margins = computeMargins(child, node);
    let childHtml = convertNodeTailwind(child, level + 1, node, inFlex);
    // Inject margin Tailwind classes
    const marginClasses = `mt-[${margins.top}px] mr-[${margins.right}px] mb-[${margins.bottom}px] ml-[${margins.left}px]`;
    const classIndex = childHtml.indexOf('class="');
    if (classIndex !== -1) {
      const beforeClass = childHtml.slice(0, classIndex + 7); // include class="
      const afterClass = childHtml.slice(classIndex + 7);
      childHtml = beforeClass + marginClasses + " " + afterClass;
    }
    childrenHtml += childHtml;
  }
  return `${indent(level)}<${tag} class="${classes}">\n${childrenHtml}${indent(
    level
  )}</${tag}>\n`;
}

// ======================================================
// TAILWIND FLEX CONVERTER - Handles auto-layout with Tailwind classes
// Turns Figma auto-layout into Tailwind flex classes
// Sets direction, wrapping, spacing, padding, and alignment
// ======================================================
function convertFrameFlexTailwind(
  node: FrameNode,
  tag: string,
  level: number,
  parent?: SceneNode
): string {
  let classes: string[] = [];
  classes.push("flex");

  // Flex direction
  const isRow = node.layoutMode === "HORIZONTAL";
  const reversed =
    (node as any).primaryAxisDirection === "REVERSE" ||
    (node as any).layoutReverse === true;
  const directionClass = isRow
    ? reversed
      ? "flex-row-reverse"
      : "flex-row"
    : reversed
    ? "flex-col-reverse"
    : "flex-col";
  classes.push(directionClass);

  // Wrap
  const wrapMap: Record<string, string> = {
    WRAP: "flex-wrap",
    NO_WRAP: "flex-nowrap",
  };
  const wrap = wrapMap[node.layoutWrap] || "flex-nowrap";
  classes.push(wrap);

  // Justify content (primary axis)
  const justifyMap: Record<string, string> = {
    CENTER: "justify-center",
    MAX: "justify-end",
    SPACE_BETWEEN: "justify-between",
    MIN: "justify-start",
  };
  const justify = justifyMap[node.primaryAxisAlignItems] || "justify-start";
  classes.push(justify);

  // Align items (cross axis)
  const alignMap: Record<string, string> = {
    CENTER: "items-center",
    MAX: "items-end",
    MIN: "items-start",
  };
  const align = alignMap[node.counterAxisAlignItems] || "items-stretch";
  classes.push(align);

  // Align content (only when wrapping)
  const alignContentValueMap: Record<string, string> = {
    CENTER: "center",
    SPACE_BETWEEN: "space-between",
    MAX: "flex-end",
    MIN: "flex-start",
    STRETCH: "stretch",
    AUTO: "normal",
  };
  const counterAxisAlignContentValue = (node as any).counterAxisAlignContent;
  const alignContentValue =
    alignContentValueMap[counterAxisAlignContentValue] || "normal";
  if (wrap !== "flex-nowrap") {
    const alignContentClassMap: Record<string, string> = {
      center: "content-center",
      "space-between": "content-between",
      "flex-end": "content-end",
      "flex-start": "content-start",
      stretch: "content-stretch",
    };
    const alignContentClass = alignContentClassMap[alignContentValue];
    if (alignContentClass) {
      classes.push(alignContentClass);
    } else {
      classes.push(`[align-content:${alignContentValue}]`);
    }
  }

  // Gap
  const gapValue = node.itemSpacing ?? 0;
  if (node.primaryAxisAlignItems !== "SPACE_BETWEEN" && gapValue > 0) {
    classes.push(`gap-[${gapValue}px]`);
  }

  // Padding
  const paddingLeft = node.paddingLeft ?? 0;
  const paddingRight = node.paddingRight ?? 0;
  const paddingTop = node.paddingTop ?? 0;
  const paddingBottom = node.paddingBottom ?? 0;
  if (paddingLeft > 0) classes.push(`pl-[${paddingLeft}px]`);
  if (paddingRight > 0) classes.push(`pr-[${paddingRight}px]`);
  if (paddingTop > 0) classes.push(`pt-[${paddingTop}px]`);
  if (paddingBottom > 0) classes.push(`pb-[${paddingBottom}px]`);

  // Dimensions
  classes.push(`w-[${node.width}px]`);
  classes.push(`h-[${node.height}px]`);
  classes.push("relative");

  let childrenHtml = "";
  for (const child of node.children) {
    childrenHtml += convertNodeTailwind(child, level + 1, node, true);
  }

  return `${indent(level)}<${tag} class="${classes.join(
    " "
  )}">\n${childrenHtml}${indent(level)}</${tag}>\n`;
}

// ======================================================
// CODE GENERATOR - Creates HTML code in dev mode
// Generates two versions: one with inline CSS, one with Tailwind classes
// Shows up when you inspect elements in Figma dev mode
// ======================================================
if (figma.editorType === "dev" && figma.mode === "codegen") {
  figma.codegen.on("generate", ({ node, language }) => {
    if (!node)
      return [
        { title: "HTML", language: "HTML", code: "<!-- No selection -->" },
      ];

    return [
      {
        title: "HTML (Inline CSS)",
        language: "HTML",
        code: convertNode(node),
      },
      {
        title: "HTML (Tailwind CSS)",
        language: "HTML",
        code: convertNodeTailwind(node),
      },
    ];
  });
}
