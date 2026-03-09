// ── Уровень 19 ──────────────────────────────────────────────────
LEVELS.push({
  cols: 5, rows: 7,
  time: 160,
  walls: [
    { color: 'red', dir: 'top', col: 2, cells: 1 },
    { color: 'purple', dir: 'top', col: 3, cells: 2 },
    { color: 'green', dir: 'bottom', col: 0, cells: 2 },
    { color: 'orange', dir: 'bottom', col: 2, cells: 1 },
    { color: 'yellow', dir: 'bottom', col: 3, cells: 2 },
    { color: 'blue', dir: 'left', row: 0, cells: 2 },
    { color: 'yellow', dir: 'left', row: 3, cells: 2 },
  ],
  figures: [
    { shape: 'mini_J', color: '#c84bdf', col: 3, row: 5 },
    { shape: 'L', color: '#4caf50', col: 0, row: 4, outlineColor: '#dca717' },
    { shape: 'L', color: '#ffc107', col: 1, row: 1 },
    { shape: 'T', color: '#ffc107', col: 2, row: 2, outlineColor: '#1f76c7' },
    { shape: 'mini_L', color: '#c84bdf', col: 3, row: 0, outlineColor: '#49a34e' },
    { shape: '2x1', color: '#ffc107', col: 1, row: 0 },
    { shape: '1x2', color: '#ff9800', col: 0, row: 0 },
  ],
});