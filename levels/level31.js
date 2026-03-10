// ── Уровень 31 ──────────────────────────────────────────────────
LEVELS.push({
  cols: 9, rows: 6,
  time: 300,
  walls: [
    { color: 'cyan', dir: 'top', col: 0, cells: 3 },
    { color: 'green', dir: 'top', col: 3, cells: 3 },
    { color: 'red', dir: 'top', col: 6, cells: 3 },
    { color: 'purple', dir: 'bottom', col: 0, cells: 3 },
    { color: 'blue', dir: 'bottom', col: 6, cells: 3 },
    { color: 'yellow', dir: 'right', row: 4, cells: 2 },
    { color: 'yellow', dir: 'right', row: 0, cells: 3 },
  ],
  blocks: [
    { shape: '1x1', col: 4, row: 3 },
  ],
  figures: [
    { shape: '2x2', color: '#4caf50', col: 2, row: 0, outlineColor: '#c84bdf' },
    { shape: 'mini_J', color: '#f44336', col: 5, row: 0 },
    { shape: 'L', color: '#ffc107', col: 7, row: 0, outlineColor: '#29b6f6' },
    { shape: 'S', color: '#1976d2', col: 1, row: 3 },
    { shape: '1x1', color: '#4caf50', col: 8, row: 5 },
    { shape: 'mini_L', color: '#1976d2', col: 6, row: 4, outlineColor: '#f44336', axis: 'y' },
    { shape: '1x4', color: '#29b6f6', col: 0, row: 1, outlineColor: '#c84bdf', axis: 'y' },
    { shape: '2x1', color: '#1976d2', col: 3, row: 5, outlineColor: '#ffc107', axis: 'x' },
    { shape: '2x1', color: '#c84bdf', col: 0, row: 5, outlineColor: '#1976d2', axis: 'x' },
  ],
});