// Converts a Figma solid fill (RGB values from 0–1) into a CSS hex colour (#rrggbb)
function getFillColor(node: SceneNode): string | null {
  // Check if the node has a "fills" property and that it contains at least one paint object
  if ("fills" in node && Array.isArray(node.fills) && node.fills.length > 0) {
    const fill = node.fills[0]; // Figma puts the first visible paint at index 0

    // Only handle solid colours (ignores gradients, images, ...etc)
    if (fill.type === "SOLID") {
      // Convert Figma RGB values (0–1 floats) into 0–255 integers
      const r = Math.round(fill.color.r * 255);
      const g = Math.round(fill.color.g * 255);
      const b = Math.round(fill.color.b * 255);

      // Convert each colour value to hexadecimal string and ensures 2 characters
      // .toString(16) converts a number to base-16 hex
      // .padStart(2, "0") adds a leading zero if needed (e.g., "0a")
      const hexR = r.toString(16).padStart(2, "0");
      const hexG = g.toString(16).padStart(2, "0");
      const hexB = b.toString(16).padStart(2, "0");

      // Build the final CSS colour format: #rrggbb
      return `#${hexR}${hexG}${hexB}`;
    }
  }

  // If no usable fill exists (no solid paint or no fills), return null
  return null;
}

// Builds an inline CSS string with width, height, background colour, border radius
function buildCSS(node: SceneNode): string {
  let css = "";

  // size from Figma node data
  css += "width:" + node.width + "px;";
  css += " height:" + node.height + "px;";

  // absolute positioning to match figma layout
  if ("x" in node && "y" in node) {
    css += " position:absolute;";
    css += " left:" + node.x + "px;";
    css += " top:" + node.y + "px;";
  }

  // background fill
  const fill = getFillColor(node);
  if (fill) css += " background:" + fill + ";";

  // rotation if exists
  if ("rotation" in node && typeof node.rotation === "number") {
    if (node.rotation !== 0) {
      // flip so the rotation direction matches what figma shows
      css += " transform:rotate(" + -node.rotation + "deg);";
      css += " transform-origin:left top;";
    }
  }

  // rounded corners (rectangles, frames, ...etc)
  if ("cornerRadius" in node && typeof node.cornerRadius === "number") {
    if (node.cornerRadius > 0) {
      css += " border-radius:" + node.cornerRadius + "px;";
    }
  }

  return css;
}

// Determines which HTML tag to use based on Figma node type
function getTag(node: SceneNode): string {
  // TEXT nodes become <p> so they contain readable text content
  if (node.type === "TEXT") return "p";

  // Everything else becomes <div> (frames, groups, rectangles, components, ...etc)
  return "div";
}

// Converts a Figma node into an HTML string with inline CSS
function convertNode(node: SceneNode): string {
  // Decide which HTML element tag to use (from getTag)
  const tag = getTag(node);

  // Build the inline CSS for this element
  const css = buildCSS(node);

  // TEXT NODES
  // These contain readable characters, return a <p> tag with text content
  if (node.type === "TEXT") {
    const text = node.characters ? node.characters : "";
    return "<" + tag + ' style="' + css + '">' + text + "</" + tag + ">\n";
  }

  // NODES WITH CHILDREN (frames, groups, components, ...etc)
  // Convert each child node into HTML as well
  if ("children" in node && node.children.length > 0) {
    let childrenHTML = "";

    // parent container uses position:relative for absolute children
    let frameCSS =
      "position:relative; width:" +
      node.width +
      "px; height:" +
      node.height +
      "px;";

    for (let i = 0; i < node.children.length; i++) {
      const child = convertNode(node.children[i] as SceneNode);
      childrenHTML += child + "\n"; // Adds new line to separate code in generator
    }

    // Wrap the children inside a <div> or <p> if text
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

  // rectangles, shapes, icons
  return "<" + tag + ' class="item" style="' + css + '"></' + tag + ">\n";
}

// Registers the Codegen handler - runs only in Dev Mode - Inspect panel)
if (figma.editorType === "dev" && figma.mode === "codegen") {
  // This callback runs whenever the user selects a node in the Figma editor
  figma.codegen.on("generate", ({ node }) => {
    // If user has no selection, return a placeholder HTML comment
    if (!node) {
      return [
        { title: "HTML", language: "HTML", code: "<!-- No layer selected -->" },
      ];
    }

    // Convert the selected Figma layer/frame into HTML
    const html = convertNode(node as SceneNode);

    // Return the HTML code block to the Dev Mode code panel
    return [{ title: "HTML", language: "HTML", code: html }];
  });
} else {
  // If plugin runs outside Dev Mode, close immediately
  figma.closePlugin();
}
