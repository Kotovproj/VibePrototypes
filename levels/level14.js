// ── Уровень 9 ──────────────────────────────────────────────────
LEVELS.push({
  cols: 5, rows: 7,
  time: 150,
  walls: [
    { color: 'green', dir: 'top', col: 3, cells: 2 },
    { color: 'cyan', dir: 'top', col: 0, cells: 2 },
    { color: 'green', dir: 'bottom', col: 0, cells: 2 },
    { color: 'purple', dir: 'bottom', col: 3, cells: 2 },
    { color: 'purple', dir: 'left', row: 0, cells: 2 },
    { color: 'purple', dir: 'left', row: 5, cells: 2 },
    { color: 'yellow', dir: 'right', row: 5, cells: 2 },
    { color: 'red', dir: 'right', row: 0, cells: 2 },
  ],
  figures: [
    { shape: '1x3', color: '#c84bdf', col: 2, row: 0 },
    { shape: '1x1', color: '#c84bdf', col: 2, row: 3 },
    { shape: '2x1', color: '#29b6f6', col: 3, row: 1 },
    { shape: '2x2', color: '#4caf50', col: 3, row: 2 },
    { shape: '2x1', color: '#f44336', col: 0, row: 1 },
    { shape: '1x2', color: '#4caf50', col: 1, row: 2 },
    { shape: '1x3', color: '#29b6f6', col: 0, row: 4 },
    { shape: '1x1', color: '#29b6f6', col: 0, row: 3 },
    { shape: '1x1', color: '#4caf50', col: 3, row: 4 },
    { shape: 'mini_L', color: '#4caf50', col: 1, row: 4 },
    { shape: '2x1', color: '#ffc107', col: 1, row: 6 },
  ],
});