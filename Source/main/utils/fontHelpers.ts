export function parseFontStack(fontStack: string): string[] {
  const genericFamilies = new Set([
    "ui-sans-serif",
    "ui-serif",
    "ui-monospace",
    "system-ui",
    "sans-serif",
    "serif",
    "monospace",
    "-apple-system",
    "blinkmacsystemfont",
    "apple color emoji",
    "segoe ui emoji",
    "segoe ui symbol",
    "noto color emoji",
  ]);

  return fontStack
    .split(",")
    .map((part) => part.trim().replace(/^['"]|['"]$/g, ""))
    .filter(Boolean)
    .filter((family) => !genericFamilies.has(family.toLowerCase()));
}

export function resolveFontFromFamilies(
  availableFonts: Font[],
  families: string[],
): FontName | null {
  const preferredStyles = ["Regular", "Book", "Roman", "Normal", "Medium"];

  for (const family of families) {
    const matching = availableFonts.filter(
      (font) => font.fontName.family.toLowerCase() === family.toLowerCase(),
    );
    if (matching.length === 0) continue;

    for (const style of preferredStyles) {
      const preferred = matching.find(
        (font) => font.fontName.style.toLowerCase() === style.toLowerCase(),
      );
      if (preferred) {
        return {
          family: preferred.fontName.family,
          style: preferred.fontName.style,
        };
      }
    }

    return {
      family: matching[0].fontName.family,
      style: matching[0].fontName.style,
    };
  }

  return null;
}
