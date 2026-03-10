// ── Уровень 1 ──────────────────────────────────────────────────
LEVELS.push({
  cols: 6, rows: 7,
  time: 200,
  walls: [
    { color: 'cyan', dir: 'top' },
    { color: 'purple', dir: 'bottom', col: 0 },
  ],
  figures: [
    { shape: '3x4', color: '#c84bdf', col: 0, row: 2 },
    { shape: '3x4', color: '#29b6f6', col: 3, row: 1 },
  ],
});