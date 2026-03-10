// ── Уровень 28 ──────────────────────────────────────────────────
LEVELS.push({
  cols: 4, rows: 6,
  time: 180,
  walls: [
    { color: 'cyan', dir: 'top', col: 0, cells: 2 },
    { color: 'purple', dir: 'top', col: 2, cells: 2 },
    { color: 'yellow', dir: 'left', row: 0, cells: 2 },
    { color: 'red', dir: 'right', row: 2, cells: 2 },
    { color: 'green', dir: 'bottom', col: 0, cells: 2 },
    { color: 'blue', dir: 'bottom', col: 3, cells: 1 },
  ],
  figures: [
    { shape: '1x2', color: '#c84bdf', col: 3, row: 0, outlineColor: '#f44336', axis: 'y' },
    { shape: '1x1', color: '#c84bdf', col: 3, row: 2, outlineColor: '#1976d2', axis: 'y' },
    { shape: '2x1', color: '#29b6f6', col: 1, row: 0, outlineColor: '#c84bdf', axis: 'x' },
    { shape: 'mini_J', color: '#4caf50', col: 2, row: 3, outlineColor: '#c84bdf' },
    { shape: 'mini_L', color: '#4caf50', col: 0, row: 4, outlineColor: '#29b6f6' },
    { shape: 'mini_L', color: '#29b6f6', col: 0, row: 0, outlineColor: '#f44336' },
  ],
});