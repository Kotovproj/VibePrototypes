// ── Уровень 7: стрелочные оси движения (5×7) ─────────────────────────
LEVELS.push({
  cols: 5, rows: 7,
  time: 50,
  walls: [
    { color: 'pink',   dir: 'top',    col: 0, cells: 1 },
    { color: 'purple', dir: 'top',    col: 1, cells: 2 },
    { color: 'cyan',   dir: 'top',    col: 3, cells: 2 },

    { color: 'blue',   dir: 'left',   row: 0, cells: 1 },
    { color: 'cyan',   dir: 'left',   row: 1, cells: 3 },
    { color: 'orange', dir: 'left',   row: 4, cells: 3 },

    { color: 'yellow', dir: 'right',  row: 0, cells: 1 },
    { color: 'orange', dir: 'right',  row: 1, cells: 3 },
    { color: 'blue',   dir: 'right',  row: 4, cells: 3 },

    { color: 'purple', dir: 'bottom', col: 0, cells: 2 },
    { color: 'red',    dir: 'bottom', col: 2, cells: 3 },
  ],
  figures: [
    { shape: '1x1', color: '#1e88e5', col: 1, row: 0, axis: 'x' },
    { shape: '2x1', color: '#ffc107', col: 2, row: 0, axis: 'x' },
    { shape: '1x3', color: '#f44336', col: 4, row: 0, axis: 'y' },
    { shape: '1x3', color: '#c84bdf', col: 1, row: 1, axis: 'y' },
    { shape: '1x2', color: '#ff5fa2', col: 0, row: 2, axis: 'y' },
    { shape: '1x1', color: '#ff9800', col: 2, row: 2 },
    { shape: '2x1', color: '#1976d2', col: 2, row: 3 },
    { shape: '2x2', color: '#ff9800', col: 3, row: 4, axis: 'x' },
    { shape: '1x1', color: '#29b6f6', col: 0, row: 4 },
    { shape: '2x2', color: '#1976d2', col: 1, row: 4 },
  ],
});
