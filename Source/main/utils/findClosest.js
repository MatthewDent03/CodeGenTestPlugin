export function findClosest(value, map, tolerance = 2) {
    const keys = Object.keys(map)
        .map(Number)
        .sort((a, b) => a - b);
    if (keys.length === 0)
        return null;
    // 1. Exact match
    if (map[value])
        return map[value];
    // 2. Within range
    for (const key of keys) {
        if (Math.abs(key - value) <= tolerance) {
            return map[key];
        }
    }
    // 3. Closest match
    let closest = keys[0];
    for (const key of keys) {
        if (Math.abs(key - value) < Math.abs(closest - value)) {
            closest = key;
        }
    }
    return map[closest] || null;
}
