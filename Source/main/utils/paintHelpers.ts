export function applySolidColor(
  node: SceneNode,
  property: "fill" | "stroke" | undefined,
  color: RGB,
  opacity: number = 1,
): "fill" | "stroke" | null {
  if (property === "stroke" && "strokes" in node) {
    const strokePaint: SolidPaint = {
      type: "SOLID",
      color,
      opacity,
    };
    (node as GeometryMixin).strokes = [strokePaint];
    return "stroke";
  }

  if ("fills" in node) {
    const fillPaint: SolidPaint = {
      type: "SOLID",
      color,
      opacity,
    };
    (node as GeometryMixin).fills = [fillPaint];
    return "fill";
  }

  return null;
}
