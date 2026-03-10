// ── Уровень 26 ──────────────────────────────────────────────────
LEVELS.push({
  cols: 5, rows: 6,
  time: 220,
  walls: [
    { color: 'purple', dir: 'top', col: 0, cells: 2 },
    { color: 'cyan', dir: 'top', col: 2, cells: 2 },
    { color: 'orange', dir: 'right', row: 0, cells: 2 },
    { color: 'green', dir: 'right', row: 2, cells: 2 },
    { color: 'yellow', dir: 'bottom', col: 0, cells: 2 },
    { color: 'red', dir: 'bottom', col: 2, cells: 3 },
    { color: 'blue', dir: 'left', row: 0, cells: 2 },
  ],
  blocks: [
    { shape: '1x1', col: 2, row: 2 },
    { shape: '1x1', col: 2, row: 3 },
  ],
  figures: [
    { shape: 'mini_J', color: '#4caf50', col: 0, row: 3, outlineColor: '#c84bdf' },
    { shape: '2x2', color: '#f44336', col: 3, row: 2, outlineColor: '#29b6f6' },
    { shape: '1x1', color: '#1976d2', col: 4, row: 5 },
    { shape: '2x1', color: '#c84bdf', col: 0, row: 5, axis: 'y' },
    { shape: '1x2', color: '#29b6f6', col: 3, row: 0, outlineColor: '#f44336', axis: 'y' },
    { shape: '1x1', color: '#c84bdf', col: 2, row: 5, outlineColor: '#29b6f6' },
    { shape: '2x1', color: '#29b6f6', col: 1, row: 0, outlineColor: '#ff9800' },
    { shape: 'mini_L', color: '#ffc107', col: 0, row: 0, outlineColor: '#f44336' },
  ],
});