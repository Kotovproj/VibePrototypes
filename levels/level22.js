// ── Уровень 1 ──────────────────────────────────────────────────
LEVELS.push({
  cols: 6, rows: 8,
  time: 300,
  walls: [
    { color: 'cyan', dir: 'top', col: 2, cells: 4 },
    { color: 'green', dir: 'left', row: 2, cells: 3 },
  ],
  blocks: [
    { shape: '1x1', col: 0, row: 0 },
    { shape: '1x1', col: 0, row: 1 },
  ],
  figures: [
    { shape: '3x2', color: '#4caf50', col: 0, row: 5, outlineColor: '#29b6f6' },
    { shape: '3x3', color: '#29b6f6', col: 3, row: 0, outlineColor: '#4caf50' },
    { shape: 'Z', color: '#4caf50', col: 0, row: 3, outlineColor: '#29b6f6' },
    { shape: 'mini_J', color: '#29b6f6', col: 1, row: 2 },
  ],
});