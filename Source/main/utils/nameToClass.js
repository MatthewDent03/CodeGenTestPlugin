export function nameToClass(name, fallback) {
    const trimmed = (name || "").trim();
    const slug = trimmed
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    return slug || fallback;
}
