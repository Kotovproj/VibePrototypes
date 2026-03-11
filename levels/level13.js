// ── Уровень 13 ──────────────────────────────────────────────────
LEVELS.push({
  cols: 7, rows: 10,
  time: 250,
  walls: [
    { color: 'cyan', dir: 'top', col: 0, cells: 3 },
    { color: 'green', dir: 'top', col: 4, cells: 3 },
    { color: 'purple', dir: 'left', row: 0, cells: 2 },
    { color: 'purple', dir: 'left', row: 7, cells: 2 },
    { color: 'red', dir: 'right', row: 0, cells: 2 },
    { color: 'orange', dir: 'right', row: 7, cells: 2 },
    { color: 'green', dir: 'bottom', col: 0, cells: 3 },
    { color: 'purple', dir: 'bottom', col: 4, cells: 3 },
  ],
  figures: [
    { shape: '3x2', color: '#f44336', col: 0, row: 2 },
    { shape: '1x4', color: '#c84bdf', col: 3, row: 0 },
    { shape: '1x2', color: '#c84bdf', col: 3, row: 4 },
    { shape: '3x2', color: '#29b6f6', col: 4, row: 2 },
    { shape: '1x3', color: '#4caf50', col: 2, row: 4 },
    { shape: '3x3', color: '#4caf50', col: 4, row: 4 },
    { shape: '1x2', color: '#29b6f6', col: 0, row: 4 },
    { shape: '1x4', color: '#29b6f6', col: 0, row: 6 },
    { shape: 'T', color: '#4caf50', col: 1, row: 7 },
    { shape: '2x1', color: '#4caf50', col: 4, row: 7 },
    { shape: '3x1', color: '#ff9800', col: 1, row: 9, axis: 'x' },
    { shape: '3x2', color: '#ff5fa2', col: 4, row: 0 },
  ],
});