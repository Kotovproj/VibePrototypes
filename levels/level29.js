// ── Уровень 29 ──────────────────────────────────────────────────
LEVELS.push({
  cols: 7, rows: 7,
  time: 260,
  walls: [
    { color: 'cyan', dir: 'top', col: 3, cells: 2 },
    { color: 'purple', dir: 'top', col: 5, cells: 2 },
    { color: 'green', dir: 'left', row: 1, cells: 3 },
    { color: 'yellow', dir: 'left', row: 4, cells: 2 },
    { color: 'red', dir: 'right', row: 0, cells: 2 },
    { color: 'blue', dir: 'right', row: 3, cells: 3 },
    { color: 'purple', dir: 'bottom', col: 0, cells: 2 },
    { color: 'yellow', dir: 'bottom', col: 5, cells: 2 },
    { color: 'orange', dir: 'top', col: 0, cells: 2 },
  ],
  blocks: [
    { shape: '1x1', col: 3, row: 3 },
    { shape: '1x1', col: 3, row: 4 },
  ],
  figures: [
    { shape: '2x2', color: '#29b6f6', col: 0, row: 3, outlineColor: '#ffc107' },
    { shape: '1x3', color: '#ffc107', col: 6, row: 4, outlineColor: '#c84bdf', axis: 'y' },
    { shape: 'L', color: '#ff9800', col: 0, row: 0, outlineColor: '#ffc107' },
    { shape: '2x1', color: '#c84bdf', col: 1, row: 6, outlineColor: '#ffc107', axis: 'x' },
    { shape: '1x1', color: '#29b6f6', col: 4, row: 6, axis: 'y' },
    { shape: 'mini_L', color: '#c84bdf', col: 5, row: 0, outlineColor: '#ffc107' },
    { shape: 'mini_J', color: '#ffc107', col: 4, row: 5, outlineColor: '#29b6f6' },
    { shape: 'S', color: '#f44336', col: 2, row: 0, outlineColor: '#ffc107' },
    { shape: 'Z', color: '#1976d2', col: 4, row: 2, outlineColor: '#4caf50' },
  ],
});