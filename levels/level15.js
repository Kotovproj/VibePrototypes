// ── Уровень 9 ──────────────────────────────────────────────────
LEVELS.push({
  cols: 6, rows: 6,
  time: 200,
  walls: [
    { color: 'yellow', dir: 'top', col: 3, cells: 3 },
    { color: 'green', dir: 'bottom', col: 0, cells: 2 },
    { color: 'red', dir: 'bottom', col: 2, cells: 2 },
    { color: 'cyan', dir: 'bottom', col: 4, cells: 2 },
    { color: 'orange', dir: 'left', row: 4, cells: 1 },
    { color: 'purple', dir: 'right', row: 0, cells: 3 },
  ],
  figures: [
    { shape: '2x2', color: '#ffc107', col: 0, row: 0 },
    { shape: '2x2', color: '#29b6f6', col: 2, row: 0 },
    { shape: '1x3', color: '#c84bdf', col: 4, row: 0 },
    { shape: '1x3', color: '#c84bdf', col: 0, row: 2 },
    { shape: '3x1', color: '#ff9800', col: 3, row: 5 },
    { shape: '2x1', color: '#29b6f6', col: 0, row: 5 },
    { shape: '1x1', color: '#f44336', col: 5, row: 4 },
    { shape: 'mini_L', color: '#4caf50', col: 3, row: 3 },
    { shape: '1x2', color: '#4caf50', col: 5, row: 2 },
    { shape: '1x2', color: '#f44336', col: 5, row: 0 },
  ],
});