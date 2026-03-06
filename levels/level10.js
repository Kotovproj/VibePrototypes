// ── Уровень 10: по скриншоту ─────────────────────────────────────────
LEVELS.push({
  cols: 6, rows: 6,
  time: 50,
  walls: [
    { color: 'purple', dir: 'top',    col: 0, cells: 3 },
    { color: 'red',    dir: 'top',    col: 3, cells: 3 },
    { color: 'green',  dir: 'left',   row: 2, cells: 2 },
    { color: 'green',  dir: 'right',  row: 2, cells: 2 },
    { color: 'blue',   dir: 'bottom', col: 0, cells: 2 },
    { color: 'yellow', dir: 'bottom', col: 4, cells: 2 },
  ],
  figures: [
    { shape: 'mini_J', color: '#4caf50', col: 0, row: 0 },
    { shape: '3x1',    color: '#c84bdf', col: 3, row: 0 },
    { shape: '1x3',    color: '#1e88e5', col: 5, row: 1 },

    { shape: '1x4',    color: '#ffc107', col: 0, row: 2 },
    { shape: '3x1',    color: '#4caf50', col: 1, row: 2, axis: 'x' },
    { shape: '1x2',    color: '#1e88e5', col: 4, row: 2 },
    { shape: '3x1',    color: '#388e3c', col: 1, row: 3 },

    { shape: '1x2',    color: '#c84bdf', col: 4, row: 4 },
    { shape: '3x1',    color: '#f44336', col: 1, row: 5 },
  ],
});
