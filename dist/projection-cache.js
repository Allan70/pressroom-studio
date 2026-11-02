// Keep one geometry set per print side; texture and guide edits reuse it.
export class ProjectionCache {
  entries = new Map();
  get(side, key, build) {
    const previous = this.entries.get(side);
    if (previous?.key === key) return previous.geometries;
    const geometries = build();
    previous?.geometries.forEach(geometry => geometry.dispose());
    this.entries.set(side, {key, geometries});
    return geometries;
  }
  clear() {
    for (const {geometries} of this.entries.values()) {
      geometries.forEach(geometry => geometry.dispose());
    }
    this.entries.clear();
  }
}
