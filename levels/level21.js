// ── Уровень 9 ──────────────────────────────────────────────────
LEVELS.push({
  cols: 6, rows: 8,
  time: 300,
  walls: [
    { color: 'red', dir: 'top', col: 2, cells: 2 },
    { color: 'pink', dir: 'bottom', col: 2, cells: 2 },
    { color: 'yellow', dir: 'left', row: 3, cells: 2 },
    { color: 'blue', dir: 'right', row: 3, cells: 2 },
  ],
  blocks: [
    { shape: '1x1', col: 0, row: 0 },
    { shape: '1x1', col: 5, row: 0 },
    { shape: '1x1', col: 0, row: 7 },
    { shape: '1x1', col: 5, row: 7 },
    { shape: '1x1', col: 0, row: 1 },
    { shape: '1x1', col: 5, row: 1 },
    { shape: '1x1', col: 5, row: 6 },
    { shape: '1x1', col: 4, row: 7 },
  ],
  figures: [
    { shape: '2x1', color: '#1976d2', col: 1, row: 4 },
    { shape: '2x1', color: '#ff5fa2', col: 3, row: 4 },
    { shape: 'J', color: '#f44336', col: 4, row: 3 },
    { shape: 'Z', color: '#1976d2', col: 0, row: 6 },
    { shape: '2x2', color: '#f44336', col: 1, row: 1 },
    { shape: 'J', color: '#f44336', col: 3, row: 0, outlineColor: '#ff5fa2' },
    { shape: 'mini_L', color: '#ff5fa2', col: 3, row: 5, outlineColor: '#ffc107' },
  ],
});