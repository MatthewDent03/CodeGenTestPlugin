function escapeJsxText(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/{/g, "&#123;")
        .replace(/}/g, "&#125;");
}
export function toReactTailwindComponent(tailwindHtml) {
    const normalized = tailwindHtml
        .replace(/\bclass=/g, "className=")
        .replace(/>([^<]*)</g, (_match, textContent) => {
        return `>${escapeJsxText(textContent)}<`;
    })
        .trimEnd();
    const indentedBody = normalized
        .split("\n")
        .map((line) => (line.length > 0 ? `      ${line}` : line))
        .join("\n");
    return `export default function GeneratedComponent() {\n  return (\n${indentedBody}\n  );\n}\n`;
}
